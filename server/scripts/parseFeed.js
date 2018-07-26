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

const request = require('request');
// const requestPromise = require('request-promise');
const path = require('path');
const fs = require('fs');
const ffmpeg = require('./ffmpeg');
const FeedParser = require('feedparser');
const firebase = require('firebase-admin');
const database = require('../../database/index');
const moment = require('moment');
const sgMail = require('@sendgrid/mail');
const nodeUrl = require('url');
const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();
const {logErr, podcastCategories} = require('./utils')('parseFeed.js');

// // Test the getFeed function:
// setTimeout(() =>
//   const urlTestFeed = "https://mysoundwise.com/rss/1508293913676s";
//   getFeed (urlTestFeed, function (err, results) {
//     const {metadata, feedItems} = results;
//     // console.log('metadata: ', metadata);
//     console.log('email: ', metadata['itunes:owner']);
//     console.log('feedItems: ', feedItems[0]);
//   });
// , 1000);

// function to parse a given feed url:
function getFeed(urlfeed, callback) {
  try {
    var req = request(urlfeed, {timeout: 20000}); // timeout 20 sec
  } catch (err) {
    return callback(err);
  }
  var feedparser = new FeedParser();
  var feedItems = [];
  var metadata = '';
  req.on('response', function(response) {
    var stream = this;
    if (response.statusCode == 200) {
      stream.pipe(feedparser);
    } else {
      callback('getFeed: wrong response status: ' + response.statusCode);
    }
  });
  req.on('error', function(err) {
    console.log('getFeed: err.message == ' + err.message);
    callback(err);
  });
  feedparser.on('meta', function(meta) {
    metadata = meta;
    // console.log('metadata: ', meta);
  });
  feedparser.on('readable', function() {
    try {
      var item = this.read(),
        flnew;
      if (item !== null) {
        //2/9/17 by DW
        feedItems.push(item);
      }
    } catch (err) {
      console.log('getFeed: err.message == ' + err.message);
      callback(err);
    }
  });
  feedparser.on('end', function() {
    callback(undefined, {metadata, feedItems});
  });
  feedparser.on('error', function(err) {
    console.log('getFeed: err.message == ' + err.message);
    callback(err);
  });
}

const feedUrls = {}; // in-memory cache object for obtained (but not imported to db) feeds

// client gives a feed url. Server needs to create a new soundcast from it and populate the soundcast and its episodes with information from the feed
async function parseFeed(req, res) {
  const {feedUrl, submitCode, resend, importFeedUrl} = req.body;
  if (!feedUrl) {
    return res.status(400).send(`Error: empty feedUrl field`);
  }
  const urlParsed = nodeUrl.parse(feedUrl.trim().toLowerCase());
  const url = urlParsed.host + urlParsed.path; // use url as a key

  if (!feedUrls[url]) {
    // wasn't obtained
    // 1. Search for the podcast
    const podcasts = await database.ImportedFeed.findAll({
      where: {feedUrl: url},
    });
    if (podcasts.length) {
      const podcast = podcasts[0]; // take first
      if (!podcast.claimed) {
        // if the feed has already been imported but it hasn't been "claimed", then we don't need to call the runFeedImport function after user signs up. We just need to assign the feed's soundcast id and its publisher id to the user.
        if (importFeedUrl) {
          const {publisherId, userId} = req.body;
          firebase
            .database()
            .ref(`users/${userId}/soundcasts_managed/${podcast.soundcastId}`)
            .set(true);
          firebase
            .database()
            .ref(`publishers/${publisherId}/administrators/${userId}`)
            .set(true);
          firebase
            .database()
            .ref(`users/${userId}/publisherID`)
            .set(publisherId);
        } else {
          res.json({imageUrl: podcast.imageURL, notClaimed: true});
        }
      } else {
        // If the feed has already been claimed, that means it's already associated with a existing active publisher on Soundwise. In that case, we need to return an error to client, which says "This feed is already on Soundwise. If you think this is a mistake, please contact support." The user submission process should continue only if the feed is NOT already imported, or if it's imported but not 'claimed'. That's why we need to move the checking step to before the submission of verification code.
        res
          .status(400)
          .send(
            'Error: This feed is already on Soundwise. If you think this is a mistake, please contact support.'
          );
      }
    } else {
      // feed url wasn't imported
      getFeed(feedUrl, async (err, results) => {
        if (err) {
          return res.status(400).send(`Error: obtaining feed ${err}`);
        }
        const {metadata, feedItems} = results;
        const verificationCode = Date.now()
          .toString()
          .slice(-4);
        console.log('verificationCode: ', verificationCode);
        const itunesEmail =
          metadata['itunes:owner'] &&
          metadata['itunes:owner']['itunes:email'] &&
          metadata['itunes:owner']['itunes:email']['#'];
        const managingEmail =
          metadata['rss:managingeditor'] &&
          metadata['rss:managingeditor']['email'];
        const publisherEmail = itunesEmail || managingEmail || null;
        if (!publisherEmail) {
          // if publisherEmail cannot be found, need to end the progress, because we won't be able to verify that the user owns the feed
          return res
            .status(400)
            .send(
              "Error: Cannot find podcast owner's email in the feed. Please update your podcast feed to include an owner email and submit again!"
            );
        }
        feedUrls[url] = {
          // set in-memory object
          metadata,
          feedItems,
          publisherEmail,
          verificationCode,
          originalUrl: feedUrl,
        };
        sendVerificationMail(publisherEmail, metadata.title, verificationCode);
        res.json({imageUrl: metadata.image.url, publisherEmail});
      });
    }
    return;
  } // if feedUrls[url] empty

  const {metadata, publisherEmail, verificationCode} = feedUrls[url];
  if (submitCode) {
    // check verification code
    if (submitCode === verificationCode) {
      feedUrls[url].verified = true;
      res.send('Success_code');
    } else {
      res.status(400).send(`Error: incorrect verfication code`);
    }
    return;
  }
  if (resend) {
    sendVerificationMail(publisherEmail, metadata.title, verificationCode);
    return res.send('Success_resend');
  }
  if (importFeedUrl) {
    return runFeedImport(req, res, url, feedUrls[url], true, true, true, () => {
      delete feedUrls[url];
      res.send('Success_import');
    });
  }
  res.json({imageUrl: metadata.image.url, publisherEmail});
} // parseFeed

function sendVerificationMail(to, soundcastTitle, verificationCode) {
  // console.log(verificationCode); return; // uncomment to test
  sgMail.send({
    to,
    from: 'support@mysoundwise.com',
    subject: 'Your confirmation code for Soundwise',
    html: `<p>Hello,</p><p>Here's your code to verify that you are the publisher of ${soundcastTitle}:</p><p style="font-size:24px; letter-spacing: 2px;"><strong>${verificationCode}</strong></p><p>Folks at Soundwise</p>`,
  });
}

async function runFeedImport(
  req,
  res,
  url,
  feedObj,
  isPublished,
  isVerified,
  isClaimed,
  callback,
  itunesId,
  soundcastId
) {
  const {metadata, publisherEmail, verified, originalUrl} = feedObj;
  const {publisherId, userId, publisherName} = req.body;

  let feedItems = feedObj.feedItems;

  if (!verified) {
    // verificationCode checked
    return res.status(400).send('Error: not verified');
  }

  feedItems.sort((a, b) => {
    // sort feedItems by date or pubdate or pubDate
    return (
      (a.date || a.pubdate || a.pubDate) - (b.date || b.pubdate || b.pubDate)
    );
  });

  if (feedItems.length > 100) {
    // if a feed has more than 100 items, let's only import the most recent 100 episodes
    feedItems = feedItems.slice(-100);
  }

  let last_update = metadata.date || metadata.pubdate || metadata.pubDate;
  if (!last_update) {
    // take first episode's date
    const newestEpisode = feedItems[feedItems.length - 1]; // last in array
    last_update =
      newestEpisode.date || newestEpisode.pubdate || newestEpisode.pubDate;
  }
  if (!last_update || moment(last_update).format('X') === 'Invalid date') {
    // If all three properties are missing, the program should flag an error and it should not be imported. And we need to check the feed manually to see what's happening.
    logErr(`can't obtain last_update ${originalUrl}`);
    return;
  }
  if (feedItems.some(i => !i.enclosures || !i.enclosures.length)) {
    // have empty enclosures
    // If enclosures is empty, we shouldn't import the item.
    // We should only import items that have an audio file in enclosures.
    logErr(`empty enclosures array ${originalUrl}`);
    return;
  }

  // 1. create a new soundcast from the feed
  const {title, description, author, image} = metadata;
  const soundcast = {
    title,
    publisherEmail,
    creatorID: userId,
    publisherID: publisherId,
    publisherName,
    short_description: entities.decode(description),
    imageURL: image.url,
    hostName:
      (metadata['itunes:author'] && metadata['itunes:author']['#']) || author,
    last_update: moment(last_update).format('X'),
    fromParsedFeed: true, // this soundcast is imported from a RSS feed
    forSale: false,
    landingPage: true,
    prices: [{billingCycle: 'free', price: 'free'}],
    published: isPublished, // set this to true from client after ownership is verified
    verified: true, // ownership verification, set to true from client after ownership is verified
    showSubscriberCount: true,
    showTimeStamps: true,
    hostImageURL:
      'https://s3.amazonaws.com/soundwiseinc/user_profile_pic_placeholder.png',
  };

  // 2. add the new soundcast to firebase and postgreSQL
  // add to firebase
  if (!soundcastId) {
    soundcastId = `${moment().format('x')}s`;
  }
  await firebase
    .database()
    .ref(`soundcasts/${soundcastId}`)
    .set(soundcast);

  // store the publisher's email address in a separate table in the database,
  // for podcasts that are "active", i.e. has been updated in the last year
  const yearAgo = moment()
    .subtract(1, 'years')
    .unix();
  if (moment(last_update).unix() > yearAgo) {
    // updated in the last year
    try {
      await database.PodcasterEmail.create({
        podcastTitle: title,
        publisherEmail,
        last_update: moment(last_update).format('X'),
      });
    } catch (err) {
      logErr(`PodcasterEmail create ${err}`);
    }
  }

  const categoriesNames = Object.keys(podcastCategories).map(
    i => podcastCategories[i].name
  ); // main 16 categories ('Arts', 'Comedy', ...)
  // save the podcast's iTunes category under the importedFeeds node and under the soundcast node
  // This should be similar to the upload setup on the /dashboard/add_episode page
  const categories = metadata['itunes:category'];
  if (categories && categories.length) {
    for (const category of categories) {
      let name;
      if (category && category['@'] && category['@'].text) {
        if (categoriesNames.indexOf(category['@'].text) !== -1) {
          name = category['@'].text;
        }
        const subcategory = category['itunes:category'];
        if (subcategory && subcategory['@'] && subcategory['@'].text) {
          // have subcategory
          if (categoriesNames.indexOf(subcategory['@'].text) !== -1) {
            name = subcategory['@'].text;
          }
        }
      }
      if (name) {
        try {
          await database.Category.create({name, soundcastId});
        } catch (err) {
          logErr(`Category create ${err}`);
        }
      }
    }
  }

  // 2-a. add to publisher node in firebase
  await firebase
    .database()
    .ref(`publishers/${publisherId}/soundcasts/${soundcastId}`)
    .set(true);

  // 2-b. add to importedFeeds node in firebase
  const importedFeedObj = {
    soundcastId,
    published: isPublished,
    title,
    feedUrl: url,
    originalUrl,
    imageURL: image.url,
    updated: Number(moment().unix()),
    publisherId,
    userId,
    // category, // TODO
    claimed: isClaimed, // when 'claimed == true', this imported soundcast is managed by the RSS feed owner
  };

  const postgresSoundcast = {
    soundcastId,
    publisherId,
    title,
  };

  if (itunesId) {
    importedFeedObj.itunesId = itunesId; // store the iTunesID under the importedFeed node
    postgresSoundcast.itunesId = itunesId;
  }
  if (title.length > 255) {
    importedFeedObj.title = title.slice(0, 255);
  }
  if (url.length > 255) {
    importedFeedObj.feedUrl = url.slice(0, 255);
  }
  if (image.url.length > 255) {
    importedFeedObj.imageURL = image.url.slice(0, 255);
  }
  if (originalUrl.length > 255) {
    importedFeedObj.originalUrl = originalUrl.slice(0, 255);
  }
  await database.ImportedFeed.create(importedFeedObj);

  // 2-c. add to postgres
  database.Soundcast.findOrCreate({
    where: {soundcastId},
    defaults: postgresSoundcast,
  })
    .then(async data => {
      // console.log('DB response: ', data);
      // 3. create new episodes from feedItems and add episodes to firebase and postgreSQL
      let i = 0;
      for (const item of feedItems) {
        await addFeedEpisode(
          item,
          userId,
          publisherId,
          soundcastId,
          soundcast,
          metadata,
          i
        );
        i++;
      }
      firebase
        .database()
        .ref(`users/${userId}/soundcasts_managed/${soundcastId}`)
        .set(true);
      firebase
        .database()
        .ref(`publishers/${publisherId}/administrators/${userId}`)
        .set(true);
      firebase
        .database()
        .ref(`soundcasts/${soundcastId}/published`)
        .set(isPublished);
      firebase
        .database()
        .ref(`soundcasts/${soundcastId}/verified`)
        .set(isVerified);
      callback && callback();
    })
    .catch(err => logErr(`Soundcast.findOrCreate ${err}`, res));
} // runFeedImport

async function addFeedEpisode(
  item,
  userId,
  publisherId,
  soundcastId,
  soundcast,
  metadata,
  i
) {
  const {title, description, summary, date, image, enclosures} = item;
  let duration = null;
  if (item['itunes:duration'] && item['itunes:duration']['#']) {
    // duration not empty
    duration = item['itunes:duration']['#'].toString(); // '323' (seconds) or '14:23'
    if (duration.includes(':')) {
      if (duration.split(':').length === 2) {
        duration = '0:' + duration; // '14:23' > '0:14:23'
      }
      duration = moment.duration(duration).asSeconds(); // '0:14:23' > 863 (number)
    } else {
      duration = Number(duration);
    }
  }

  /* // obtain duration by loading original file with ffmpeg - skip by now
  await new Promise(resolve => {
    const url = enclosures[0].url;
    requestPromise.get({ encoding: null, url }).then(async body => {
      const filePath = `/tmp/parse_feed_${Math.random().toString().slice(2) + path.extname(url)}`;
      fs.writeFile(filePath, body, err => {
        if (err) {
          return logErr(`Error: cannot write tmp audio file ${url} ${filePath}`, null, resolve);
        }
        (new ffmpeg(filePath)).then(file => { // resize itunes image
          if (file && file.metadata && file.metadata.duration) {
            duration = file.metadata.duration.seconds;
          } else {
            logErr(`empty file.metadata ${url}`);
          }
          fs.unlink(filePath, err => 0); // remove file
          resolve();
        }, err => logErr(`ffmpeg unable to parse file ${url} ${filePath} ${err}`, null, resolve));
      });
    }).catch(err => logErr(`unable to obtain image ${err}`, null, resolve));
  });
  */

  const date_created = moment(date || metadata.date).format('X');
  const episode = {
    title,
    coverArtUrl: image.url || soundcast.imageURL,
    creatorID: userId,
    date_created:
      date_created === 'Invalid date'
        ? Math.floor(Date.now() / 1000)
        : Number(date_created),
    description:
      (description && entities.decode(description)) ||
      (summary && entities.decode(summary)),
    duration,
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
  await firebase
    .database()
    .ref(`episodes/${episodeId}`)
    .set(episode);
  // add to the soundcast
  await firebase
    .database()
    .ref(`soundcasts/${soundcastId}/episodes/${episodeId}`)
    .set(true);
  // add to postgres
  database.Episode.findOrCreate({
    where: {episodeId},
    defaults: {
      episodeId,
      soundcastId,
      publisherId,
      title: episode.title,
      soundcastTitle: soundcast.title,
    },
  })
    .then(data => {
      // console.log('parseFeed.js findOrCreate then');
    })
    .catch(err => logErr(`Episode.findOrCreate ${err}`));
}

// Need to update all the published soundcasts from imported feeds every hour
async function feedInterval() {
  // 1. go through every row under 'ImportedFeed' table
  const imported_f_count = await database.ImportedFeed.count();
  let offset = 0;
  while (offset <= imported_f_count) {
    const podcasts = await database.ImportedFeed.findAll({
      order: [['soundcastId', 'ASC']],
      offset,
      limit: 3000, // step
    });
    for (const item of podcasts) {
      await new Promise(resolve => {
        const {soundcastId} = item;
        // 2. for each item, if it's published, parse the feedUrl again,
        //    and find feed items that are created after the last time feed was parsed
        if (item.published) {
          getFeed(item.originalUrl, async (err, results) => {
            if (err) {
              logErr(`feedInterval getFeed ${err}`);
              return resolve();
            }
            const soundcastObj = await firebase
              .database()
              .ref(`soundcasts/${soundcastId}`)
              .once('value');
            const soundcastVal = soundcastObj.val();
            let i = Object.keys(soundcastVal.episodes).length; // episodes count
            const {metadata} = results;
            const {userId, publisherId} = item;

            results.feedItems.sort((a, b) => {
              // sort feedItems by date or pubdate or pubDate
              return (
                (a.date || a.pubdate || a.pubDate) -
                (b.date || b.pubdate || b.pubDate)
              );
            });

            for (const feed of results.feedItems) {
              const pub_date = Number(
                moment(feed.pubdate || feed.pubDate).format('X')
              );
              if (pub_date && pub_date > item.updated) {
                // 3. create new episodes from the new feed items, and add them to their respective soundcast
                //    *episode.index for the new episodes should be the number of existing episodes
                //     in the  soundcast + 1
                const soundcast = {};
                soundcast.imageURL =
                  metadata && metadata.image && metadata.image.url;
                soundcast.title = metadata && metadata.title;
                await addFeedEpisode(
                  feed,
                  userId,
                  publisherId,
                  soundcastId,
                  soundcast,
                  metadata,
                  i
                );
                i++;
                item.updated = pub_date;
                await item.save();
              }
            }
            resolve();
          });
        } else {
          resolve();
        }
      });
    }
    offset += 3000; // step
  }

  // 4. repeat the update checking every hour (what's the best way to do this? Assuming the number of feeds that need to be updated will eventually get to around 500,000. Will it be a problem for the server?)
  setTimeout(feedInterval, 3600 * 1000); // hour
}

if (process.env.NODE_ENV !== 'dev') {
  console.log('Starting feedInterval');
  setTimeout(feedInterval, 30 * 1000); // 30 seconds after app starts
}

module.exports = {getFeed, parseFeed, runFeedImport};
