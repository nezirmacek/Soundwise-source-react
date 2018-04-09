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
const nodeUrl = require('url');

const urlTestFeed = "https://mysoundwise.com/rss/1508293913676s";

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
//   // console.log('metadata: ', metadata);
//   console.log('email: ', metadata['itunes:owner']);
//   console.log('feedItems: ', feedItems[0]);
// });

const feedUrls = {};

// client gives a feed url. Server needs to create a new soundcast from it and populate the soundcast and its episodes with information from the feed
module.exports.parseFeed = async (req, res) => {
  const { feedUrl, submitCode, resend, importFeedUrl } = req.body;
  if (!feedUrl) {
    return res.status(400).send(`Error: empty feedUrl field`);
  }
  const urlParsed = nodeUrl.parse(feedUrl.trim().toLowerCase());
  const url = urlParsed.host + urlParsed.pathname;

  if (feedUrls[url]) { // requested url already been stored in memory feedUrls object
    const { metadata, publisherEmail, verificationCode } = feedUrls[url];
    if (submitCode) {
      if (submitCode === verificationCode) {
        feedUrls[url].verified = true;
        res.send('Success_code');
      } else {
        res.status(400).send(`Error: incorrect verfication code`);
      }
    } else {
      if (resend) {
        sendVerificationMail(publisherEmail, metadata.title, verificationCode);
        res.send('Success_resend');
      } else if (importFeedUrl) {
        runFeedImport(req, res, url);
      } else {
        res.json({ imageUrl: metadata.image.url, publisherEmail });
      }
    }
  } else {
    // 1. Search for the podcast title under 'importedFeeds' node in our firebase db
    const podcastObj = await firebase.database().ref('importedFeeds')
                               .orderByChild('feedUrl').equalTo(url).once('value');
    const podcasts = podcastObj.val();
    if (podcasts) { // return: { 1522801382898s: {...} } or null
      const soundcastId = Object.keys(podcasts)[0]; // take first
      const podcast = podcasts[soundcastId];
      if (!podcast.claimed) {
        // if the feed has already been imported but it hasn't been "claimed", then we don't need to call the runFeedImport function after user signs up. We just need to assign the feed's soundcast id and its publisher id to the user.
        if (importFeedUrl) {
          const { publisherId, userId } = req.body;
          firebase.database().ref(`users/${userId}/soundcasts_managed/${soundcastId}`).set(true);
          firebase.database().ref(`publishers/${publisherId}/administrators/${userId}`).set(true);
          firebase.database().ref(`users/${userId}/publisherID`).set(publisherId)
        } else {
          res.json({ notClaimed: true, imageUrl: podcast.imageURL });
        }
      } else {
        // If the feed has already been claimed, that means it's already associated with a existing active publisher on Soundwise. In that case, we need to return an error to client, which says "This feed is already on Soundwise. If you think this is a mistake, please contact support." The user submission process should continue only if the feed is NOT already imported, or if it's imported but not 'claimed'. That's why we need to move the checking step to before the submission of verification code.
        res.status(400).send('Error: This feed is already on Soundwise. If you think this is a mistake, please contact support.');
      }
    } else { // feed url wasn't imported
      getFeed(feedUrl, async (err, results) => {
        if (err) {
          return res.status(400).send(`Error: ${err}`);
        }
        const { metadata, feedItems } = results;
        const verificationCode = Date.now().toString().slice(-4);
        const publisherEmail = metadata['itunes:owner']['itunes:email']['#']
                            || metadata['rss:managingeditor']['email'] || null;
        if (!publisherEmail) {
          // if publisherEmail cannot be found, need to end the progress, because we won't be able to verify that the user owns the feed
          return res.status(400).send("Error: Cannot find podcast owner's email in the feed. Please update your podcast feed to include an owner email and submit again!");
        }
        feedUrls[url] = { // set in-memory object
          metadata,
          feedItems,
          publisherEmail,
          verificationCode,
          originalUrl: feedUrl,
        };
        sendVerificationMail(publisherEmail, metadata.title, verificationCode);
        res.json({ imageUrl: metadata.image.url, publisherEmail });
      });
    }
  }

  function sendVerificationMail(to, soundcastTitle, verificationCode) {
    // console.log(verificationCode);
    sgMail.send({
      to, from: 'support@mysoundwise.com',
      subject: 'Your confirmation code for Soundwise',
      html: `<p>Hello,</p><p>Here's your code to verify that you are the publisher of ${soundcastTitle}:</p><p style="font-size:24px; letter-spacing: 2px;"><strong>${verificationCode}</strong></p><p>Folks at Soundwise</p>`,
    });
  }
} // parseFeed

async function runFeedImport(req, res, url) {
  const { metadata, feedItems, publisherEmail, verified, originalUrl } = feedUrls[url];
  const { publisherId, userId, publisherName } = req.body;

  if (!verified) {
    return res.status(400).send('Error: not verified');
  }

  // 1. create a new soundcast from the feed
  const {title, description, author, date, image, categories} = metadata;
  const soundcast = {
    title,
    publisherEmail,
    creatorID: userId,
    publisherID: publisherId,
    publisherName,
    short_description: description,
    imageURL: image.url,
    hostName: author || metadata['itunes:author']['#'],
    last_update: moment(date).format('x'),
    fromParsedFeed: true, // this soundcast is imported from a RSS feed
    forSale: false,
    landingPage: true,
    prices: [{billingCycle: 'free', price: 'free'}],
    published: false, // set this to true from client after ownership is verified
    verified: false, // ownership verification, set to true from client after ownership is verified
    showSubscriberCount: true,
    showTimeStamps: true,
    hostImageURL: 'https://s3.amazonaws.com/soundwiseinc/user_profile_pic_placeholder.png'
  };

  // 2. add the new soundcast to firebase and postgreSQL
  // add to firebase
  const soundcastId = `${moment().format('x')}s`;
  await firebase.database().ref(`soundcasts/${soundcastId}`).set(soundcast);
  // 2-a. add to publisher node in firebase
  await firebase.database().ref(`publishers/${publisherId}/soundcasts/${soundcastId}`).set(true);

  // 2-b. add to importedFeeds node in firebase
  await firebase.database().ref(`importedFeeds/${soundcastId}`)
    .set({
      published: true,
      title,
      feedUrl: url,
      originalUrl,
      imageURL: image.url,
      updated: moment().unix(),
      publisherId,
      userId,
      claimed: true, // when 'claimed == true', this imported soundcast is manged by the RSS feed owner
    });
  // 2-c. add to postgres
  database.Soundcast.findOrCreate({
      where: { soundcastId },
      defaults: {
        soundcastId,
        publisherId,
        title,
      }
    })
    .then(data => console.log('DB response: ', data))
    .catch(err => console.log('Error: parseFeed.js Soundcast.findOrCreate ', err));

  // 3. create new episodes from feedItems and add episodes to firebase and postgreSQL
  await Promise.all(feedItems.map((item, i) => new Promise (async resolve => {
    addFeedEpisode(item, userId, publisherId, soundcastId, soundcast, date, i, resolve);
  }))); // Promise.all

  firebase.database().ref(`users/${userId}/soundcasts_managed/${soundcastId}`).set(true);
  firebase.database().ref(`publishers/${publisherId}/administrators/${userId}`).set(true);
  firebase.database().ref(`soundcasts/${soundcastId}/published`).set(true);
  firebase.database().ref(`soundcasts/${soundcastId}/verified`).set(true);

  delete feedUrls[url];
  res.send('Success_import');
} // runFeedImport

async function addFeedEpisode(item, userId, publisherId, soundcastId, soundcast, date, i, resolve) {
    const {title, description, summary, date, image, enclosures} = item;
    const episode = {
      title,
      coverArtUrl: image.url || soundcast.imageURL,
      creatorID: userId,
      date_created: moment(date).format('X'),
      description: description || summary,
      duration: enclosures[0].length,
      id3Tagged: true,
      index: i + 1,
      isPublished: true,
      publicEpisode: true,
      publisherID: publisherId,
      soundcastID: soundcastId,
      url: enclosures[0].url,
    };
    const episodeId = `${moment().format('x')}e`;
    // add to episodes node in firebase
    await firebase.database().ref(`episodes/${episodeId}`).set(episode);
    // add to the soundcast
    await firebase.database().ref(`soundcasts/${soundcastId}/episodes/${episodeId}`).set(true);
    // add to postgres
    database.Episode.findOrCreate({
        where: { episodeId },
        defaults: {
          episodeId,
          soundcastId,
          publisherId,
          title: episode.title,
          soundcastTitle: soundcast.title,
        }
      })
      .then(data => {
        // console.log('parseFeed.js findOrCreate then');
      })
      .catch(err => console.log('Error: parseFeed.js Episode.findOrCreate ', err));

    resolve && resolve();
}


// Need to update all the published soundcasts from imported feeds every hour
async function feedInterval() {
  // await firebase.database().ref('importedFeeds/1523160250142s').remove();
  // 1. go through every item under 'importedFeeds' node in firebase
  const podcastObj = await firebase.database().ref('importedFeeds').once('value');
  const podcasts = podcastObj.val();
  const ids = Object.keys(podcasts || {});
  ids.forEach(soundcastId => {
    const item = podcasts[soundcastId];
    // 2. for each item, if it's published, parse the feedUrl again,
    //    and find feed items that are created after the last time feed was parsed
    if (item.published) {
      getFeed(item.originalUrl, async (err, results) => {
        if (err) {
          return console.log(`Error: feedInterval getFeed ${err}`);
        }
        const { metadata, feedItems } = results;
        results.feedItems.forEach(i => {
          i.pub_date = Number(moment(i.pubdate || i.pubDate).format('X'));
        });
        results.feedItems.sort((a, b) => a.pub_date - b.pub_date); // older first
        results.feedItems.forEach((feed, i) => {
          if (feed.pub_date && feed.pub_date > item.updated) {
            // 3. create new episodes from the new feed items, and add them to their respective soundcast
            //    *episode.index for the new episodes should be the number of existing episodes
            //     in the  soundcast + 1
            const soundcast = {};
            soundcast.imageURL = metadata && metadata.image && metadata.image.url;
            soundcast.title = metadata && metadata.title;
            addFeedEpisode(feed, item.userId, item.publisherId, soundcastId, soundcast, metadata.date, i);
          }
        });
      });
    }
  });
  // 4. repeat the update checking every hour (what's the best way to do this? Assuming the number of feeds that need to be updated will eventually get to around 500,000. Will it be a problem for the server?)
  setTimeout(feedInterval, 3600*1000); // hour
}
setTimeout(feedInterval, 30*1000); // 30 seconds after app starts