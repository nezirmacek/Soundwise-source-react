'use strict';

// Purpose:
// automatically create and update soundcast and episodes from a podcast user hosted elsewhere. i.e. import user's podcast RSS feed and create soundcast listed on Soundwise from the feed. Also regularly check the feed to see if there're updates.

// How it works:
// 1. user creates a publisher account on Soundwise. But she already has a podcast published on other platforms. So she submits the RSS feed url on client to request backend to create a soundcast from it.
// 2. server takes the feed url, parses the content, creates a soundcast from the feed information, and also creates episodes from the feed items.
// 3. server sends email to the feed owner's email address listed in the feed with a verification code.
// 4. user gets the code, inputs it on front end to prove she's the owner.
// 5. front end assigns the newly created soundcast to the user.
// 6. server checks the feed url every hour to see if there are new episodes. If so, update the soundcast with new episodes.

const request = require ("request");
const FeedParser = require ("feedparser");
const firebase = require('firebase-admin');
const database = require('../../database/index');
const moment = require('moment');
const sgMail = require('@sendgrid/mail');

const urlTestFeed = "http://feeds.feedburner.com/TheAllTurtlesPodcast";

// function to parse a given feed url:
function getFeed (urlfeed, callback) {
  try {
    var req = request (urlfeed);
  } catch(err) {
    return callback(err);
  }
  var feedparser = new FeedParser ();
  var feedItems = [];
  var metadata = '';
  req.on ("response", function (response) {
    var stream = this;
    if (response.statusCode == 200) {
      stream.pipe (feedparser);
    }
  });
  req.on ("error", function (err) {
    console.log ("getFeed: err.message == " + err.message);
  });
  feedparser.on("meta", function (meta) {
    metadata = meta;
    // console.log('metadata: ', meta);
  });
  feedparser.on ("readable", function () {
    try {
      var item = this.read (), flnew;
      if (item !== null) { //2/9/17 by DW
      feedItems.push (item);
      }
    } catch (err) {
      console.log ("getFeed: err.message == " + err.message);
    }
  });
  feedparser.on ("end", function () {
    callback (undefined, {metadata, feedItems});
  });
  feedparser.on ("error", function (err) {
    console.log ("getFeed: err.message == " + err.message);
    callback (err);
  });
}

// Test the getFeed function:

// getFeed (urlTestFeed, function (err, results) {
//   const {metadata, feedItems} = results;
//   if (!err) {
//     console.log(feedItems[0]);
//     for (var i = 0; i < feedItems.length; i++) {
//       console.log(`Item # ${i + 1}:`);
//       console.log(feedItems[i]);
//       }
//     }
// });

// client gives a feed url. Server needs to create a new soundcast from it and populate the soundcast and its episodes with information from the feed
module.exports.parseFeed = async (req, res) => {
  const {feedUrl, podcastTitle, publisherId, soundcastId} = req.body;

  // 1. Search for the podcast title under 'importedFeeds' node in our firebase db
  const podcastObj = await firebase.database().ref('importedFeeds')
                             .orderByChild('title').equalTo(podcastTitle).once('value');
  const podcast = podcastObj.val();

  if (podcast) {
    // 2. If podcast is found
    //    - create confirmation code
    //    - send confirmation email
    //    - change to confirmation screen
    return setVerificationCode();
  }

  // 3. If podcast is not found in firebase, make post request
  //    to ‘api/parse_feed’ with the rss feed Url the user
  //    submitted, and a new soundcastId and publisherId
  // 4. server parses the rss feed (server/scripts/parseFeed.js),
  //    create a new soundcast, and associated episodes from the feed information
  // 5. server sends confirmation email to user with the
  //    confirmation code, to verify that the user is the owner of the feed
  getFeed(feedUrl, async (err, results) => {
    if (err) {
      return res.status(400).send(`Error: ${err}`);
    }
    // 1. create a new soundcast from the feed
    const {metadata, feedItems} = results;
    const soundcast = {
      // creatorID: userId,
      // publisherID: publisherId,
      // publisherName,
      fromParsedFeed: true,
      forSale: false,
      landingPage: true,
      prices: [{billingCycle: 'free', price: 'free'}],
      published: false, // set this to true from client after ownership is verified
      verified: false, // ownership verification, set to true from client after ownership is verified
      showSubscriberCount: true,
      showTimeStamps: true,
      subscriberEmailList: '',
      hostImageURL: 'https://s3.amazonaws.com/soundwiseinc/user_profile_pic_placeholder.png'
    };
    const {title, description, author, date, image, categories} = metadata;
    soundcast.title = title;
    soundcast.short_description = description;
    soundcast.imageURL = image.url;
    soundcast.hostName = author || metadata['itunes:author']['#'];
    soundcast.publisherEmail = metadata['itunes:owner']['itunes:email']['#'] || metadata['rss:managingeditor']['email'] || null;
    soundcast.last_update = moment(date).format('x');

    // if publisherEmail cannot be found, need to end the progress, because we won't be able to verify that the user owns the feed
    if(!soundcast.publisherEmail) {
      return res.status(400).send("Error: Cannot find podcast owner's email in the feed. Please update your podcast feed to include an owner email and submit again!");
    }

    // 2. add the new soundcast to firebase and postgreSQL
    // add to firebase
    const soundcastId = `${moment().format('x')}s`;
    await firebase.database().ref(`soundcasts/${soundcastId}`).set(soundcast);
    // 2-a. add to publisher node in firebase
    // await firebase.database().ref(`publishers/${publisherId}/soundcasts/${soundcastId}`).set(true);

    // 2-b. add to importedFeeds node in firebase
    await firebase.database().ref(`importedFeeds/${soundcastId}`)
      .set({
        published: true,
        title,
        feedUrl,
        updated: moment().unix(),
        // publisherId
      });
    // 2-c. add to postgres
    database.Soundcast.findOrCreate({
        where: { soundcastId },
        defaults: {
          soundcastId,
          // publisherId,
          title,
        }
      })
      .then(data => console.log('DB response: ', data))
      .catch(err => console.log('Error: parseFeed.js Soundcast.findOrCreate ', err));

    // 3. create new episodes from feedItems and add episodes to firebase and postgreSQL
    await Promise.all(feedItems.map((item, i) => new Promise (async resolve => {
      const {title, description, summary, data, image, enclosures} = item;
      const episode = {
        title,
        coverArtUrl: image.url || soundcast.imageURL,
        // creatorID: userId,
        date_created: moment(date).format('X'),
        description: description || summary,
        duration: enclosures[0].length,
        id3Tagged: true,
        index: feedItems.length - i,
        isPublished: true,
        publicEpisode: true,
        // publisherID: publisherId,
        soundcastID: soundcastId,
        url: enclosures[0].url,
      };
      const episodeId = `${moment().format('x')}e`;
      // add to episodes node in firebase
      await firebase.database().ref(`episodes/${episodeId}`).set(episode);
      // add to the soundcast
      await firebase.database().ref(`soundcasts/${soundcastId}/episodes/${episodeId}`).set(true);
      //add to postgres
      database.Episode.findOrCreate({
          where: { episodeId },
          defaults: {
            episodeId,
            soundcastId,
            // publisherId: soundcast.publisherID,
            title: episode.title,
            soundcastTitle: soundcast.title,
          }
        })
        .then(data => {
          debugger
        })
        .catch(err => console.log('Error: parseFeed.js Episode.findOrCreate ', err));
    }))); // Promise.all

    // 4. send an email to the feed owner's email address, to confirm that he/she is the owner of the feed
    setVerificationCode(soundcast);
  }); // getFeed

  async function setVerificationCode(soundcast, soundcastId) {
    const verificationCode = (Math.random() + Math.random()).toString().slice(-4);
    sgMail.send({
      to: soundcast.publisherEmail,
      from: 'support@mysoundwise.com',
      subject: 'Your confirmation code for Soundwise',
      html: `<p>Hello,</p><p>Please enter this code on your Soundwise dashboard to confirm you are the publisher of ${soundcast.title}:</p><p><strong>${verificationCode}</strong></p><p>Folks at Soundwise</p>`,
    });
    await firebase.database().ref(`soundcasts/${soundcastId}/verificationCode`).set(verificationCode);
    // 5. respond to front end
    res.send({
      publisherEmail: soundcast.publisherEmail,
      soundcast,
      soundcastId,
      // publisherId,
      verificationCode
    });
  }
}; // parseFeed

// Need to update all the published soundcasts from imported feeds every hour

// 1. go through every item under 'importedFeeds' node in firebase

// 2. for each item, if it's published, parse the feedUrl again, and find feed items that are created after the last time feed was parsed

// 3. create new episodes from the new feed items, and add them to their respective soundcast
      // episode.index for the new episodes should be the number of existing episodes in the soundcast + 1

// 4. repeat the update checking every hour (what's the best way to do this? Assuming the number of feeds that need to be updated will eventually get to around 500,000. Will it be a problem for the server?)
