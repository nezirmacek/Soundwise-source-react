const moment = require('moment');
const database = require('../../database/index');
const Sequelize = require('sequelize');
const firebase = require('firebase-admin');
const serviceAccount = require('../../serviceAccountKey.json');
firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: 'https://soundwise-a8e6f.firebaseio.com',
});
const localDb = new Sequelize('soundwise_local_sql', 'root', '111', {
  dialect: 'postgres',
  port: 5432,
  logging: false,
});
const { getFeed } = require('./parseFeed.js');

async function run(feeds) {
  const soundcastIds = (await database.db.query(
    `SELECT "soundcastId" FROM "Soundcasts" WHERE "updateDate" IS NULL OR "updateDate"<700000000`))[0]

  const imported = (await database.db.query(
    `SELECT * FROM "ImportedFeeds" WHERE "soundcastId" IN (${
      soundcastIds.map(i => "'" + i.soundcastId + "'").join(',')})`))[0]

  const _imported = imported.slice(1);
  let count = 0
  for (const item of _imported) {
    // const soundcastObj = await firebase.database().ref(`soundcasts/${item.soundcastId}`).once('value')
    // const soundcast = soundcastObj.val() || {}
    // if (soundcast.last_update) {

    // const rows = (await localDb.query(
    //   `SELECT * FROM "soundcasts_firebase" WHERE "soundcastId"='${item.soundcastId}'`))[0]
    // if (rows.length) {

    console.log(`Progress ${count} ${item.soundcastId} ${item.originalUrl}`);
    await new Promise(resolve => {
      getFeed(item.originalUrl, async (err, results) => {
        const { metadata, feedItems } = results;
        let last_update = metadata.date || metadata.pubdate || metadata.pubDate;
        if (!last_update) { // take first episode's date
          const newestEpisode = feedItems[feedItems.length - 1]; // last in array
          last_update = newestEpisode.date || newestEpisode.pubdate || newestEpisode.pubDate;
        }
        if (!last_update || moment(last_update).format('X') === 'Invalid date') {
          // If all three properties are missing, the program should flag an error and it should not be imported. And we need to check the feed manually to see what's happening.
          last_update = moment("2017-01-01T00:00:00.000") // default date
        }
        try {
          await database.Soundcast.update(
            // { updateDate: Number(rows[0].last_update) },
            // { updateDate: Number(soundcast.last_update) },
            { updateDate: Number(moment(last_update).format('X')) },
            { where: { soundcastId: item.soundcastId }}
          )
        } catch(err) {
          console.log(item.soundcastId, err.toString())
        }
        resolve();
      });
    });
    count++
    if (count%10 === 0) {
    }
  }
  
  // const soundcastIds = Object.keys(feeds);
  // for (const soundcastId of soundcastIds) {
  //   const feed = feeds[soundcastId];
  //   const {published, title, feedUrl, originalUrl,
  //          imageURL, updated, publisherId, userId, claimed, itunesId} = feed;
  //   const importedFeedObj = {
  //     soundcastId,
  //     published,
  //     title,
  //     feedUrl,
  //     originalUrl,
  //     imageURL,
  //     updated: Number(updated),
  //     publisherId,
  //     userId,
  //     claimed, // when 'claimed == true', this imported soundcast is managed by the RSS feed owner
  //   };
  //   if (itunesId) {
  //     importedFeedObj.itunesId = itunesId; // store the iTunesID under the importedFeed node
  //   }
  //   if (title.length       > 255) { importedFeedObj.title       =       title.slice(0, 255) }
  //   if (feedUrl.length     > 255) { importedFeedObj.feedUrl     =     feedUrl.slice(0, 255) }
  //   if (imageURL.length    > 255) { importedFeedObj.imageURL    =    imageURL.slice(0, 255) }
  //   if (originalUrl.length > 255) { importedFeedObj.originalUrl = originalUrl.slice(0, 255) }
  //   await database.ImportedFeed.create(importedFeedObj);
  //   await firebase.database().ref(`importedFeeds/${soundcastId}`).remove();
  //   console.log(soundcastId);
  // }
  
  
  // const imported_f_count = (await localDb.query(`SELECT COUNT(*) FROM "importedFeeds_firebase"`))[0][0].count;
  // console.log(`"importedFeeds_firebase" COUNT ${imported_f_count}`)
  // 
  // let i = 0
  // 
  // while (i <= imported_f_count) {
  //   console.log(`Querying "importedFeeds_firebase" OFFSET ${i}`)
  //   const feeds = (await localDb.query(
  //     `SELECT * FROM "importedFeeds_firebase" ORDER BY "soundcastId" OFFSET ${i} LIMIT 10000`))[0];
  //   for (const feed of feeds) {
  //     // TODO
  //   }
  //   i+=10000
  // }
  
}


var feeds = {
  "1523249614006s" : {
    "claimed" : true,
    "feedUrl" : "www.trevisbailey.com/feed/podcast",
    "imageURL" : "https://www.trevisbailey.org/wp-content/uploads/2018/03/COVER.jpg",
    "originalUrl" : "https://www.trevisbailey.com/feed/podcast",
    "published" : true,
    "publisherId" : "1523249586194p",
    "title" : "Brand New Life",
    "updated" : 1530775402,
    "userId" : "3P3lv3gCKxQBE7SXP7ZFPdRrKBn1"
  },
  "1523723031832s" : {
    "claimed" : true,
    "feedUrl" : "escapepod.org/feed/",
    "imageURL" : "http://escapepod.org/wp-content/uploads/2018/04/iTunes_EscapePod.jpg",
    "originalUrl" : "http://escapepod.org/feed/",
    "published" : false,
    "publisherId" : "Soundcast_publisherId_iTunesUrls",
    "title" : "Escape Pod",
    "updated" : 1523723055,
    "userId" : "Soundcast_userId_iTunesUrls"
  },
  "1523723720698s" : {
    "claimed" : true,
    "feedUrl" : "escapepod.org/feed/",
    "imageURL" : "http://escapepod.org/wp-content/uploads/2018/04/iTunes_EscapePod.jpg",
    "originalUrl" : "http://escapepod.org/feed/",
    "published" : false,
    "publisherId" : "Soundcast_publisherId_iTunesUrls",
    "title" : "Escape Pod",
    "updated" : 1523723721,
    "userId" : "Soundcast_userId_iTunesUrls"
  },
  "1523724967661s" : {
    "claimed" : true,
    "feedUrl" : "www.npr.org/rss/podcast.php",
    "imageURL" : "https://media.npr.org/images/podcasts/primary/icon_381444908-6388a4123207c734918f15c97de6d49ae634f820.jpg?s=200",
    "originalUrl" : "https://www.npr.org/rss/podcast.php?id=381444908",
    "published" : false,
    "publisherId" : "Soundcast_publisherId_iTunesUrls",
    "title" : "Fresh Air",
    "updated" : 1523724968,
    "userId" : "Soundcast_userId_iTunesUrls"
  },
  "1526352033868s" : {
    "claimed" : false,
    "feedUrl" : "escapepod.org/feed/",
    "imageURL" : "http://escapepod.org/wp-content/uploads/2018/04/iTunes_EscapePod.jpg",
    "itunesId" : "73329293",
    "originalUrl" : "http://escapepod.org/feed/",
    "published" : false,
    "publisherId" : "1526352033870p",
    "title" : "Escape Pod",
    "updated" : 1526352097,
    "userId" : "Soundcast_userId_iTunesUrls"
  },
  "1526415872495s" : {
    "claimed" : true,
    "feedUrl" : "feed.pippa.io/public/shows/5ac99d250c3456504c56d1b8",
    "imageURL" : "https://assets.pippa.io/shows/5ac99d250c3456504c56d1b8/1525226635526-c3dd96f3ff54c4044cbe477753fe8397.jpeg",
    "originalUrl" : "https://feed.pippa.io/public/shows/5ac99d250c3456504c56d1b8",
    "published" : true,
    "publisherId" : "1526405797353p",
    "title" : "Save Your Sanity",
    "updated" : 1530987568,
    "userId" : "MZawIa9SsHgaax7uN1BMEMyRZxs2"
  },
  "1526417286015s" : {
    "claimed" : true,
    "feedUrl" : "feed.pippa.io/public/shows/5ac9a352ef7a4c2376786ec9",
    "imageURL" : "https://assets.pippa.io/shows/5ac9a352ef7a4c2376786ec9/1524613969107-75a4e673309e75018f80875690cef0af.jpeg",
    "originalUrl" : "https://feed.pippa.io/public/shows/5ac9a352ef7a4c2376786ec9",
    "published" : true,
    "publisherId" : "1526405797353p",
    "title" : "Emotional Savvy: The Relationship Help Show",
    "updated" : 1531264699,
    "userId" : "MZawIa9SsHgaax7uN1BMEMyRZxs2"
  },
  "1526419124736s" : {
    "claimed" : true,
    "feedUrl" : "thebravefilespodcast.libsyn.com/rss",
    "imageURL" : "http://static.libsyn.com/p/assets/8/c/2/e/8c2ea12c77e16a68/HEATHER_VICKERY_PODCASTCOVER.jpg",
    "originalUrl" : "http://thebravefilespodcast.libsyn.com/rss",
    "published" : true,
    "publisherId" : "1526413880112p",
    "title" : "The Brave Files",
    "updated" : 1530749816,
    "userId" : "iP2V78sRzkMI2dYvIkzIcEqq9G43"
  },
  "1526437274070s" : {
    "claimed" : true,
    "feedUrl" : "anchor.fm/s/3ae0cd8/podcast/rss",
    "imageURL" : "https://s3-us-west-2.amazonaws.com/anchor-generated-image-bank/staging/podcast_uploaded_nologo/517382/517382-1525742175060-c537e1898e30e.jpg",
    "originalUrl" : "https://anchor.fm/s/3ae0cd8/podcast/rss",
    "published" : true,
    "publisherId" : "1526437219223p",
    "title" : "The Backpocket Podcast",
    "updated" : 1531130400,
    "userId" : "9sVzaGp65iZLu6y1o4BSWg1qoh72"
  },
  "1526565309526s" : {
    "claimed" : true,
    "feedUrl" : "feeds.soundcloud.com/users/soundcloud:users:412842819/sounds.rss",
    "imageURL" : "http://i1.sndcdn.com/avatars-000412607226-xo82wv-original.jpg",
    "originalUrl" : "http://feeds.soundcloud.com/users/soundcloud:users:412842819/sounds.rss",
    "published" : true,
    "publisherId" : "1526565317242p",
    "title" : "Messy Podcast",
    "updated" : 1529422431,
    "userId" : "milKwMYX60QdtQUEimlHwhqyAbD2"
  },
  "1526800098617s" : {
    "claimed" : false,
    "feedUrl" : "escapepod.org/feed/",
    "imageURL" : "http://escapepod.org/wp-content/uploads/2018/04/iTunes_EscapePod.jpg",
    "itunesId" : "73329293",
    "originalUrl" : "http://escapepod.org/feed/",
    "published" : false,
    "publisherId" : "1526800098619p",
    "title" : "Escape Pod",
    "updated" : 1526800191,
    "userId" : "Soundcast_userId_iTunesUrls"
  },
  "1526800567994s" : {
    "claimed" : false,
    "feedUrl" : "escapepod.org/feed/",
    "imageURL" : "http://escapepod.org/wp-content/uploads/2018/04/iTunes_EscapePod.jpg",
    "itunesId" : "73329293",
    "originalUrl" : "http://escapepod.org/feed/",
    "published" : false,
    "publisherId" : "1526800567996p",
    "title" : "Escape Pod",
    "updated" : 1526800571,
    "userId" : "Soundcast_userId_iTunesUrls"
  },
  "1526800713941s" : {
    "claimed" : false,
    "feedUrl" : "escapepod.org/feed/",
    "imageURL" : "http://escapepod.org/wp-content/uploads/2018/04/iTunes_EscapePod.jpg",
    "itunesId" : "73329293",
    "originalUrl" : "http://escapepod.org/feed/",
    "published" : false,
    "publisherId" : "1526800713942p",
    "title" : "Escape Pod",
    "updated" : 1526800717,
    "userId" : "Soundcast_userId_iTunesUrls"
  },
  "1527058721533s" : {
    "claimed" : true,
    "feedUrl" : "feeds.soundcloud.com/users/soundcloud:users:48224779/sounds.rss",
    "imageURL" : "http://i1.sndcdn.com/avatars-000435680007-r0a8x1-original.jpg",
    "originalUrl" : "http://feeds.soundcloud.com/users/soundcloud:users:48224779/sounds.rss",
    "published" : true,
    "publisherId" : "1527058745836p",
    "title" : "Poetically Correct",
    "updated" : 1527070771,
    "userId" : "9fQCNucPGYSfrXMBASqc46X6cP92"
  },
  "1527180954127s" : {
    "claimed" : true,
    "feedUrl" : "whyillnevermakeit.podbean.com/feed/",
    "imageURL" : "http://deow9bq0xqvbj.cloudfront.net/image-logo/2484780/27503214_365694240570179_7696364606544465338_o.jpg",
    "originalUrl" : "https://whyillnevermakeit.podbean.com/feed/",
    "published" : true,
    "publisherId" : "1527180959224p",
    "title" : "Why I'll Never Make It",
    "updated" : 1529902800,
    "userId" : "l18uzgyptBe7HRwy7z1tt0Vklpo1"
  },
  "1527646397043s" : {
    "claimed" : true,
    "feedUrl" : "murderwasthecase.podbean.com/feed/",
    "imageURL" : "http://deow9bq0xqvbj.cloudfront.net/image-logo/2309877/newlogo_1400.jpg",
    "originalUrl" : "https://murderwasthecase.podbean.com/feed/",
    "published" : true,
    "publisherId" : "1527646436190p",
    "title" : "Murder Was The Case",
    "updated" : 1530454341,
    "userId" : "UAzzrKFtgiWMgEqlRI884RPyGGK2"
  },
  "1528836504029s" : {
    "claimed" : true,
    "feedUrl" : "feed.pippa.io/public/shows/5ad3cd47c51eb4310908e823",
    "imageURL" : "https://assets.pippa.io/shows/5ad3cd47c51eb4310908e823/show-cover.jpg",
    "originalUrl" : "https://feed.pippa.io/public/shows/5ad3cd47c51eb4310908e823",
    "published" : true,
    "publisherId" : "1528836449410p",
    "title" : "The Art of Giving a Damn with Michelle Shaeffer",
    "updated" : 1529956936,
    "userId" : "lLUi6w3ZSMeeHyKAOPnq6BgDs8B3"
  },
  "1528841632831s" : {
    "claimed" : true,
    "feedUrl" : "feeds.soundcloud.com/users/soundcloud:users:276750325/sounds.rss",
    "imageURL" : "http://i1.sndcdn.com/avatars-000298798442-cgplc3-original.jpg",
    "originalUrl" : "http://feeds.soundcloud.com/users/soundcloud:users:276750325/sounds.rss",
    "published" : true,
    "publisherId" : "1528841669543p",
    "title" : "Dem Black Mamas",
    "updated" : 1530556682,
    "userId" : "XpTRpLG61cQqYhn7pVHM7sWZ0gq2"
  },
  "1528841806636s" : {
    "claimed" : true,
    "feedUrl" : "spiritualentrepreneur.libsyn.com/rss",
    "imageURL" : "http://static.libsyn.com/p/assets/d/e/c/a/decafd8155f47170/Final_Artwork_Updated.001.jpeg",
    "originalUrl" : "http://spiritualentrepreneur.libsyn.com/rss",
    "published" : true,
    "publisherId" : "1528841777775p",
    "title" : "Spiritual Entrepreneur",
    "updated" : 1530928803,
    "userId" : "BzZt1N2mfoX30QNzfA07UMHbHJX2"
  },
  "1529347003263s" : {
    "claimed" : true,
    "feedUrl" : "bbsradio.com/dare-to-dream-show-feed.xml",
    "imageURL" : "https://bbsradio.com/sites/default/files/bbs_radio_talk_shows/feed-image-6-24-17/dare-to-dream-feed.jpg",
    "originalUrl" : "http://bbsradio.com/dare-to-dream-show-feed.xml",
    "published" : true,
    "publisherId" : "1529347050293p",
    "title" : "Dare To Dream with Debbi Dachinger",
    "updated" : 1530792415,
    "userId" : "ZNGOSJ6kX3gFgd7nPXJHb4KCKPl1"
  }
}


run(feeds);