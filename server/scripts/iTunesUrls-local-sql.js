// Run options:
// $ CREATE_TABLES=true   NODE_ENV=dev nohup node iTunesUrls-local-sql.js 2>&1 >> output_local1.log &
// $ IMPORT_TABLES=true   NODE_ENV=dev nohup node iTunesUrls-local-sql.js 2>&1 >> output_local2.log &
// $ FIX_CATEGORIES=true  NODE_ENV=dev nohup node iTunesUrls-local-sql.js 2>&1 >> output_local3.log &
// $ RUN_IMPORT=true      NODE_ENV=dev nohup node iTunesUrls-local-sql.js 2>&1 >> output_local4.log &
// $ SET_TEST_FEED=delete NODE_ENV=dev       node iTunesUrls-local-sql.js
// $ SET_TEST_FEED=reset  NODE_ENV=dev       node iTunesUrls-local-sql.js

const request = require('request');
const cheerio = require('cheerio');
const nodeUrl = require('url');
const fs = require('fs');
const moment = require('moment');
const Sequelize = require('sequelize');
const firebase = require('firebase-admin');
const serviceAccount = require('../../serviceAccountKey.json');
const database = require('../../database/index');
const {podcastCategories} = require('./utils')('iTunes-local-sql.js');
firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: 'https://soundwise-a8e6f.firebaseio.com',
});
const db_original = new Sequelize('soundwise', 'root', '111', {
  dialect: 'postgres',
  port: 5432,
  logging: false,
});
const db = new Sequelize('soundwise_local_sql', 'root', '111', {
  dialect: 'postgres',
  port: 5432,
  logging: false,
});
const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();
const {getFeed} = require('./parseFeed.js');

const setTestFeed = async () => {
  // return getFeed('http://download.omroep.nl/avro/podcast/klassiek/zoc/rssZOC.xml', async (err, results) => {
  //   debugger;
  // });
  const feedUrl = 'download.omroep.nl/avro/podcast/klassiek/zoc/rsszoc.xml';
  const podcastTitle = 'Het Zondagochtend Concert';
  const podcasts = await database.ImportedFeed.findAll({where: {feedUrl}});
  if (!podcasts.length) {
    console.log(`Error: test podcast wasn't obtained`);
    return process.exit();
  }
  const soundcastId = podcasts[0].soundcastId;
  const episodes = await database.Episode.findAll({
    where: {soundcastId},
  });
  if (!episodes.length) {
    console.log(`Error: test podcast episodes weren't obtained`);
    return process.exit();
  }

  if (process.env.SET_TEST_FEED === 'delete') {
    console.log(`Deleting test feed ${soundcastId}`);

    await database.PodcasterEmail.destroy({where: {podcastTitle}});
    await firebase
      .database()
      .ref(`soundcasts/${soundcastId}`)
      .remove();
    await database.ImportedFeed.destroy({where: {soundcastId}});
    for (const episode of episodes) {
      await firebase
        .database()
        .ref(`episodes/${episode.episodeId}`)
        .remove();
    }
    await database.Episode.destroy({where: {soundcastId}});
    await database.Category.destroy({where: {soundcastId}});
    await database.Soundcast.destroy({where: {soundcastId}});
  }

  if (process.env.SET_TEST_FEED === 'reset') {
    console.log(`Resetting test feed ${soundcastId}`);

    const publisherEmail = 'null'; // set test email
    const userId = 'Soundcast_userId_iTunesUrls';
    const publisherId = '1500000000000p'; // unused test publisherId

    await database.PodcasterEmail.update(
      {publisherEmail},
      {where: {podcastTitle}}
    );
    await firebase
      .database()
      .ref(`soundcasts/${soundcastId}/publisherEmail`)
      .set(publisherEmail);
    await database.ImportedFeed.update(
      {claimed: false, userId, publisherId},
      {where: {soundcastId}}
    );
    for (const episode of episodes) {
      await firebase
        .database()
        .ref(`episodes/${episode.episodeId}/publisherID`)
        .set(publisherId);
      await firebase
        .database()
        .ref(`episodes/${episode.episodeId}/creatorID`)
        .set(userId);
    }
    await database.Episode.update({publisherId}, {where: {soundcastId}});
    await database.Soundcast.update({publisherId}, {where: {soundcastId}});
  }

  process.exit();
};
if (process.env.SET_TEST_FEED) {
  setTestFeed();
  return;
}

const createTables = async () => {
  console.log('Creating tables');
  try {
    await db.query(`DROP TABLE "publishers_firebase"`);
    await db.query(`DROP TABLE "soundcasts_firebase"`);
    await db.query(`DROP TABLE "PodcasterEmails"`);
    await db.query(`DROP TABLE "Categories"`);
    await db.query(`DROP TABLE "importedFeeds_firebase"`);
    await db.query(`DROP TABLE "Soundcasts"`);
    await db.query(`DROP TABLE "episodes_firebase"`);
    await db.query(`DROP TABLE "Episodes"`);
  } catch (err) {}
  try {
    await db.query(`CREATE TABLE "publishers_firebase" (
      "publisherId"    TEXT PRIMARY KEY      NOT NULL,
      "name"           TEXT                  NOT NULL,
      "unAssigned"     TEXT                  NOT NULL,
      "imageUrl"       TEXT                          ,
      "email"          TEXT                  NOT NULL,
      "soundcasts"     TEXT                  NOT NULL
    )`);
    await db.query(`CREATE TABLE "soundcasts_firebase" (
      "soundcastId"          TEXT PRIMARY KEY      NOT NULL,
      "title"                TEXT                  NOT NULL,
      "publisherEmail"       TEXT                  NOT NULL,
      "creatorID"            TEXT                  NOT NULL,
      "publisherID"          TEXT                  NOT NULL,
      "publisherName"        TEXT                  NOT NULL,
      "short_description"    TEXT                  NOT NULL,
      "imageURL"             TEXT                  NOT NULL,
      "hostName"             TEXT                  NOT NULL,
      "last_update"          TEXT                  NOT NULL,
      "fromParsedFeed"       TEXT                  NOT NULL,
      "forSale"              TEXT                  NOT NULL,
      "landingPage"          TEXT                  NOT NULL,
      "prices"               TEXT                  NOT NULL,
      "published"            TEXT                  NOT NULL,
      "verified"             TEXT                  NOT NULL,
      "showSubscriberCount"  TEXT                  NOT NULL,
      "showTimeStamps"       TEXT                  NOT NULL,
      "hostImageURL"         TEXT                  NOT NULL
    )`);
    await db.query(`CREATE TABLE "PodcasterEmails" (
      "publisherEmail" TEXT                  NOT NULL,
      "podcastTitle"   TEXT                  NOT NULL,
      "last_update"    TEXT                  NOT NULL
    )`);
    await db.query(`CREATE TABLE "Categories" (
      "name"           TEXT                  NOT NULL,
      "soundcastId"    TEXT                  NOT NULL
    )`);
    await db.query(`CREATE TABLE "importedFeeds_firebase" (
      "soundcastId"    TEXT PRIMARY KEY      NOT NULL,
      "published"      TEXT                  NOT NULL,
      "title"          TEXT                  NOT NULL,
      "feedUrl"        TEXT                  NOT NULL,
      "originalUrl"    TEXT                  NOT NULL,
      "imageURL"       TEXT                  NOT NULL,
      "updated"        TEXT                  NOT NULL,
      "publisherId"    TEXT                  NOT NULL,
      "userId"         TEXT                  NOT NULL,
      "claimed"        TEXT                  NOT NULL,
      "itunesId"       TEXT
    )`);
    await db.query(`CREATE TABLE "Soundcasts" (
      "soundcastId"    TEXT PRIMARY KEY      NOT NULL,
      "title"          TEXT                  NOT NULL,
      "publisherId"    TEXT                  NOT NULL
    )`);
    await db.query(`CREATE TABLE "episodes_firebase" (
      "episodeId"      TEXT PRIMARY KEY      NOT NULL,
      "title"          TEXT                  NOT NULL,
      "coverArtUrl"    TEXT                  NOT NULL,
      "creatorID"      TEXT                  NOT NULL,
      "date_created"   TEXT                  NOT NULL,
      "description"    TEXT                  NOT NULL,
      "duration"       TEXT                  NOT NULL,
      "id3Tagged"      TEXT                  NOT NULL,
      "index"          TEXT                  NOT NULL,
      "isPublished"    TEXT                  NOT NULL,
      "publicEpisode"  TEXT                  NOT NULL,
      "publisherID"    TEXT                  NOT NULL,
      "soundcastID"    TEXT                  NOT NULL,
      "url"            TEXT                  NOT NULL
    )`);
    await db.query(`CREATE TABLE "Episodes" (
      "episodeId"      TEXT PRIMARY KEY      NOT NULL,
      "soundcastId"    TEXT                  NOT NULL,
      "publisherId"    TEXT                  NOT NULL,
      "title"          TEXT                  NOT NULL,
      "soundcastTitle" TEXT                  NOT NULL
    )`);
    await db.query(
      `CREATE INDEX "idx_publisher_f"       ON "publishers_firebase"("publisherId")`
    );
    await db.query(
      `CREATE INDEX "idx_soundcast_f"       ON "soundcasts_firebase"("soundcastId")`
    );
    await db.query(
      `CREATE INDEX "idx_soundcast_f_pubid" ON "soundcasts_firebase"("publisherID")`
    );
    await db.query(
      `CREATE INDEX "idx_podcaster"         ON "PodcasterEmails"("publisherEmail")`
    );
    await db.query(
      `CREATE INDEX "idx_categories"        ON "Categories"("name")`
    );
    await db.query(
      `CREATE INDEX "idx_categories_scid"   ON "Categories"("soundcastId")`
    );
    await db.query(
      `CREATE INDEX "idx_imported_f_scid"   ON "importedFeeds_firebase"("soundcastId")`
    );
    await db.query(
      `CREATE INDEX "idx_imported_f_pubid"  ON "importedFeeds_firebase"("publisherId")`
    );
    await db.query(
      `CREATE INDEX "idx_imported_f_ourl"   ON "importedFeeds_firebase"("originalUrl")`
    );
    await db.query(
      `CREATE INDEX "idx_soundcasts"        ON "Soundcasts"("soundcastId")`
    );
    await db.query(
      `CREATE INDEX "idx_soundcasts_pubid"  ON "Soundcasts"("publisherId")`
    );
    await db.query(
      `CREATE INDEX "idx_episodes_f"        ON "episodes_firebase"("episodeId")`
    );
    await db.query(
      `CREATE INDEX "idx_episodes_f_pubid"  ON "episodes_firebase"("publisherID")`
    );
    await db.query(
      `CREATE INDEX "idx_episodes_f_scid"   ON "episodes_firebase"("soundcastID")`
    );
    await db.query(
      `CREATE INDEX "idx_episodes"          ON "Episodes"("episodeId")`
    );
    await db.query(
      `CREATE INDEX "idx_episodes_pubid"    ON "Episodes"("publisherId")`
    );
    await db.query(
      `CREATE INDEX "idx_episodes_scid"     ON "Episodes"("soundcastId")`
    );

    console.log('Done');
  } catch (err) {
    logErr(err);
  }
  process.exit();
};
if (process.env.CREATE_TABLES) {
  createTables();
  return;
}

const importTables = async () => {
  // import tables from soundwise_local_sql to firebase/soundwise
  console.log('Importing tables');
  const soundcasts_count = (await db.query(
    `SELECT COUNT(*) FROM "Soundcasts"`
  ))[0][0].count;
  const episodes_count = (await db.query(
    `SELECT COUNT(*) FROM "Episodes"`
  ))[0][0].count;
  const categories_count = (await db.query(
    `SELECT COUNT(*) FROM "Categories"`
  ))[0][0].count;
  const podcaster_count = (await db.query(
    `SELECT COUNT(*) FROM "PodcasterEmails"`
  ))[0][0].count;
  const publishers_f_count = (await db.query(
    `SELECT COUNT(*) FROM "publishers_firebase"`
  ))[0][0].count;
  const soundcasts_f_count = (await db.query(
    `SELECT COUNT(*) FROM "soundcasts_firebase"`
  ))[0][0].count;
  const imported_f_count = (await db.query(
    `SELECT COUNT(*) FROM "importedFeeds_firebase"`
  ))[0][0].count;
  const episodes_f_count = (await db.query(
    `SELECT COUNT(*) FROM "episodes_firebase"`
  ))[0][0].count;
  console.log(`"Soundcasts"             COUNT ${soundcasts_count}`);
  console.log(`"Episodes"               COUNT ${episodes_count}`);
  console.log(`"Categories"             COUNT ${categories_count}`);
  console.log(`"PodcasterEmails"        COUNT ${podcaster_count}`);
  console.log(`"publishers_firebase"    COUNT ${publishers_f_count}`);
  console.log(`"soundcasts_firebase"    COUNT ${soundcasts_f_count}`);
  console.log(`"importedFeeds_firebase" COUNT ${imported_f_count}`);
  console.log(`"episodes_firebase"      COUNT ${episodes_f_count}`);

  let i;

  const date = '2018-01-01 00:00:00.000+00';

  i = 0;
  while (i <= soundcasts_count) {
    console.log(`Querying "Soundcasts" OFFSET ${i}`);
    const soundcasts = (await db.query(
      `SELECT * FROM "Soundcasts" ORDER BY "soundcastId" OFFSET ${i} LIMIT 10000`
    ))[0];
    for (const soundcast of soundcasts) {
      const {soundcastId, title, publisherId} = soundcast;
      await db_original.query(`INSERT INTO "Soundcasts" (
        "soundcastId"    ,  "title"                  , "publisherId"    , "createdAt" , "updatedAt"
      ) VALUES (
        '${soundcastId}' , '${title.slice(
        0,
        255
      )}'  , '${publisherId}' , '${date}'   , '${date}'
      )`);
    }
    i += 10000;
  }

  i = 0;
  while (i <= episodes_count) {
    console.log(`Querying "Episodes" OFFSET ${i}`);
    const episodes = (await db.query(
      `SELECT * FROM "Episodes" ORDER BY "episodeId" OFFSET ${i} LIMIT 30000`
    ))[0];
    for (const episode of episodes) {
      const {
        episodeId,
        soundcastId,
        publisherId,
        title,
        soundcastTitle,
      } = episode;
      await db_original.query(`INSERT INTO "Episodes" (
        "episodeId"                      , "soundcastId"   , "publisherId"   , "title"                 ,
        "soundcastTitle"                 , "createdAt"      , "updatedAt"
      ) VALUES (
        '${episodeId}'                   , '${soundcastId}', '${publisherId}', '${title.slice(
        0,
        255
      )}',
        '${soundcastTitle.slice(0, 255)}', '${date}'       , '${date}'
      )`);
    }
    i += 30000;
  }

  i = 0;
  while (i <= categories_count) {
    console.log(`Querying "Categories" OFFSET ${i}`);
    const categories = (await db.query(
      `SELECT * FROM "Categories" ORDER BY "soundcastId" OFFSET ${i} LIMIT 10000`
    ))[0];
    for (const category of categories) {
      const {name, soundcastId} = category;
      await db_original.query(`INSERT INTO "Categories" (
        "name"                 , "soundcastId"   , "createdAt", "updatedAt"
      ) VALUES (
        '${name.slice(0, 255)}', '${soundcastId}', '${date}'  , '${date}'
      )`);
    }
    i += 10000;
  }

  i = 0;
  while (i <= podcaster_count) {
    console.log(`Querying "PodcasterEmails" OFFSET ${i}`);
    const emails = (await db.query(
      `SELECT * FROM "PodcasterEmails" ORDER BY "publisherEmail" OFFSET ${i} LIMIT 10000`
    ))[0];
    for (const email of emails) {
      const {podcastTitle, publisherEmail, last_update} = email;
      await db_original.query(`INSERT INTO "PodcasterEmails" (
        "podcastTitle"                 , "publisherEmail"                             ,
        "last_update"                  ,   "createdAt"         , "updatedAt"
      ) VALUES (
        '${podcastTitle.slice(0, 255)}', '${(publisherEmail || 'null')
        .slice(0, 255)
        .toLowerCase()}',
        '${last_update}'               ,   '${date}'           , '${date}'
      )`);
    }
    i += 10000;
  }

  i = 0;
  while (i <= publishers_f_count) {
    console.log(`Querying "publishers_firebase" OFFSET ${i}`);
    const publishers = (await db.query(
      `SELECT * FROM "publishers_firebase" ORDER BY "publisherId" OFFSET ${i} LIMIT 10000`
    ))[0];
    for (const publisher of publishers) {
      const {publisherId, name, imageUrl, email, soundcasts} = publisher;
      const newPublisher = {
        name,
        unAssigned: true, // this publisher hasn't been claimed by any user
        imageUrl,
        email: email.toLowerCase(),
        soundcasts: JSON.parse(soundcasts), // [{id of the new soundcast: true}]
      };
      await firebase
        .database()
        .ref(`publishers/${publisherId}`)
        .set(newPublisher);
    }
    i += 10000;
  }

  i = 0;
  while (i <= soundcasts_f_count) {
    console.log(`Querying "soundcasts_firebase" OFFSET ${i}`);
    const soundcasts = (await db.query(
      `SELECT * FROM "soundcasts_firebase" ORDER BY "soundcastId" OFFSET ${i} LIMIT 10000`
    ))[0];
    for (const soundcast of soundcasts) {
      const {
        soundcastId,
        title,
        publisherEmail,
        creatorID,
        publisherID,
        publisherName,
        short_description,
        imageURL,
        hostName,
        last_update,
        published,
        hostImageURL,
      } = soundcast;
      const newSoundcast = {
        title,
        publisherEmail: (publisherEmail || 'null').toLowerCase(),
        creatorID,
        publisherID,
        publisherName,
        short_description,
        imageURL,
        hostName,
        last_update: Number(last_update),
        fromParsedFeed: true, // this soundcast is imported from a RSS feed
        forSale: false,
        landingPage: true,
        prices: [{billingCycle: 'free', price: 'free'}],
        published: published === 'true', // set this to true from client after ownership is verified
        verified: true, // ownership verification, set to true from client after ownership is verified
        showSubscriberCount: true,
        showTimeStamps: true,
        hostImageURL,
      };
      await firebase
        .database()
        .ref(`soundcasts/${soundcastId}`)
        .set(newSoundcast);
    }
    i += 10000;
  }

  i = 0;
  while (i <= imported_f_count) {
    console.log(`Querying "importedFeeds_firebase" OFFSET ${i}`);
    const feeds = (await db.query(
      `SELECT * FROM "importedFeeds_firebase" ORDER BY "soundcastId" OFFSET ${i} LIMIT 10000`
    ))[0];
    for (const feed of feeds) {
      const {
        soundcastId,
        published,
        title,
        feedUrl,
        originalUrl,
        imageURL,
        updated,
        publisherId,
        userId,
        claimed,
        itunesId,
      } = feed;
      const importedFeedObj = {
        published: published === 'true',
        title,
        feedUrl,
        originalUrl,
        imageURL,
        updated: Number(updated),
        publisherId,
        userId,
        claimed: claimed === 'true', // when 'claimed == true', this imported soundcast is managed by the RSS feed owner
      };
      if (itunesId) {
        importedFeedObj.itunesId = itunesId; // store the iTunesID under the importedFeed node
      }
      await firebase
        .database()
        .ref(`importedFeeds/${soundcastId}`)
        .set(importedFeedObj);
    }
    i += 10000;
  }

  i = 0;
  while (i <= episodes_f_count) {
    console.log(`Querying "episodes_firebase" OFFSET ${i}`);
    const episodes = (await db.query(
      `SELECT * FROM "episodes_firebase" ORDER BY "episodeId" OFFSET ${i} LIMIT 30000`
    ))[0];
    for (const episode of episodes) {
      const {
        episodeId,
        title,
        coverArtUrl,
        creatorID,
        date_created,
        description,
        duration,
        index,
        publisherID,
        soundcastID,
        url,
      } = episode;
      const newEpisode = {
        title,
        coverArtUrl,
        creatorID,
        date_created:
          date_created === 'Invalid date'
            ? Math.floor(Date.now() / 1000)
            : Number(date_created),
        description,
        duration,
        id3Tagged: true,
        index: Number(index),
        isPublished: true,
        publicEpisode: true,
        publisherID,
        soundcastID,
        url,
      };
      await firebase
        .database()
        .ref(`episodes/${episodeId}`)
        .set(newEpisode);
    }
    i += 30000;
  }

  process.exit();
};
if (process.env.IMPORT_TABLES) {
  importTables();
  return;
}

const fixCategories = async () => {
  console.log('Fix categories run');
  const imported_feeds_count = (await db_original.query(
    `SELECT COUNT(*) FROM "ImportedFeeds"`
  ))[0][0].count;
  const podcastCategoriesMainIds = Object.keys(podcastCategories);
  const categoriesNames = Object.keys(podcastCategories).map(
    i => podcastCategories[i].name
  ); // main 16 categories ('Arts', 'Comedy', ...)
  let i = 0;
  while (i <= imported_feeds_count) {
    console.log(`Querying "Categories" OFFSET ${i}`);
    const feeds = (await db_original.query(
      `SELECT * FROM "ImportedFeeds" ORDER BY "id" OFFSET ${i} LIMIT 10000`
    ))[0];

    // `SELECT * FROM "Categories" WHERE "name" NOT IN (
    //   'Arts', 'Comedy', 'Education', 'Kids & Family', 'Health',
    //   'TV & Film', 'Music', 'News & Politics', 'Religion & Spirituality',
    //   'Science & Medicine', 'Sports & Recreation', 'Technology', 'Business',
    //   'Games & Hobbies', 'Society & Culture', 'Government & Organizations'
    // ) OFFSET 0 LIMIT 10000`

    for (const feed of feeds) {
      if (!feed.itunesId) {
        continue; // skip
      }

      await database.Soundcast.update(
        {
          published: true,
        },
        {where: {soundcastId: feed.soundcastId}}
      );
      await firebase
        .database()
        .ref(`soundcasts/${feed.soundcastId}/published`)
        .set(true);

      continue;

      console.log('Categories fix');
      const categories = (await db_original.query(
        `SELECT * FROM "Categories" WHERE "soundcastId"='z${feed.soundcastId}'`
      ))[0];
      if (!categories.length) {
        // wasn't imported
        await new Promise(resolve => {
          request.get(
            `https://itunes.apple.com/lookup?id=${
              feed.itunesId
            }&entity=podcast`,
            async (err, res, body) => {
              if (err) {
                console.log(
                  `request.get fixCategories ${feed.soundcastId} ${
                    feed.itunesId
                  } ${err}`
                );
                return resolve();
              }
              let data;
              try {
                data = JSON.parse(body);
              } catch (err) {
                console.log(
                  `JSON.parse error ${feed.soundcastId} ${feed.itunesId}`
                );
              }
              if (
                data &&
                data.results &&
                data.results.length &&
                data.results[0].genreIds
              ) {
                const genreIds = data.results[0].genreIds;
                let newCategories = {};
                for (const genreId of genreIds) {
                  for (const id of podcastCategoriesMainIds) {
                    if (genreId === id) {
                      newCategories[podcastCategories[id].name] = true;
                    } else {
                      // check subCategories
                      const subCategoriesIds = Object.keys(
                        podcastCategories[id].subCategories
                      );
                      if (subCategoriesIds.indexOf(genreId) !== -1) {
                        // contains genreId
                        newCategories[podcastCategories[id].name] = true;
                      }
                    }
                  }
                }
                newCategories = Object.keys(newCategories);
                if (newCategories.length) {
                  // await db_original.query(`DELETE FROM "Categories" WHERE "soundcastId"='${feed.soundcastId}'`)
                  for (const name of newCategories) {
                    await database.Category.create({
                      name,
                      soundcastId: feed.soundcastId,
                    });
                  }
                }
              }
              resolve();
            }
          );
        });
      }
      // if (categoriesNames.indexOf(category.name) !== -1) {
      //   continue
      // }
      // if (categoriesNames.indexOf(category.name.replace('&amp;', '&')) !== -1 ||
      //     categoriesNames.indexOf(category.name.replace('&amp;', '&').replace('&amp;', '&')) !== -1
      // ) {
      //   await database.Category.update({
      //     name: category.name.replace('&amp;', '&').replace('&amp;', '&')
      //   }, { where: { id: category.id}})
      // }
    }
    i += 10000;
  }

  process.exit();
};
if (process.env.FIX_CATEGORIES) {
  fixCategories();
  return;
}

if (!process.env.RUN_IMPORT) {
  console.log('No correct prefix was found, exiting');
  return process.exit();
}

console.log('Running import script');

const podcastIds = {};

function loadPodcasts($) {
  // Get each podcast’s iTunes url link (href of the <a> tags) from the podcast lists
  // in each of the html files (we can use cheerio.js to do this)
  const podcasts = Array.from($('#selectedcontent a'));
  for (const podcast of podcasts) {
    // obtaining id from href; example:
    //  'https://itunes.apple.com/us/podcast/idn-onair/id302962930?mt=2' > 302962930
    const id = Number(
      podcast.attribs.href
        .split('/')
        .pop()
        .split('?')[0]
        .replace('id', '')
    );
    if (Number.isNaN(id)) {
      console.log(
        `Error: iTunesUrls-local-sql.js NaN ${id} ${podcast.attribs.href}`
      );
    } else {
      podcastIds[id] = true; // save unique id
    }
  }
}

fs.writeFileSync(`errors`, ''); // clear errors log file

const logError = err => {
  console.log(`Error: iTunesUrls-local-sql.js ${err}`);
  fs.appendFileSync(`errors`, `Error: iTunesUrls-local-sql.js ${err}\n`);
  // process.exit();
};
const logErr = logError; // replace utils' logErr
const prep = _string => entities.encode(_string); // prepare string

async function runImport(links) {
  let ids = [];

  try {
    ids = JSON.parse(fs.readFileSync('podcastIds').toString()); // ids cache file
  } catch (err) {}

  // links = [links[0]]; // Test first
  for (const link of links) {
    if (ids.length) {
      console.log(`Loaded podcastIds file ${ids.length}`); // ids cache file
      break;
    }
    console.log(`Loading link ${link}`);
    await new Promise(resolve =>
      request.get(link, async (err, res, body) => {
        if (err) {
          return logError(`request.get link ${link} ${err}`);
        }
        const $ = cheerio.load(body);
        loadPodcasts($); // load links from main page

        // LETTERS
        const letters = Array.from($('#selectedgenre > .list.alpha > li > a')); // 26 letters + '#'
        if (letters.length !== 27) {
          return logError(`wrong letters length ${letters.length}`);
        }
        for (const letter of letters) {
          // for (const letter of letters.slice(0, 1)) { // Test letter A
          const href = letter.attribs.href;
          process.stdout.write(`Loading letter ${letter.children[0].data}: 1`);
          await new Promise(resolve =>
            request.get(href, async (err, res, body) => {
              if (err) {
                return logError(`request.get letter ${href} ${err}`);
              }

              // NUMBERS
              const $ = cheerio.load(body);
              loadPodcasts($); // first page loading
              const pages = Array.from(
                $('#selectedgenre > .list.paginate')
                  .first()
                  .find('li > a')
              );
              if (pages.length) {
                // have pagination
                for (const page of pages) {
                  // page numbers
                  if (
                    page.children[0].data !== '1' &&
                    page.children[0].data !== 'Next'
                  ) {
                    process.stdout.write(',' + page.children[0].data);
                    const href = page.attribs.href;
                    await new Promise(resolve =>
                      request.get(href, async (err, res, body) => {
                        if (err) {
                          return logError(`request.get page ${href} ${err}`);
                        }
                        loadPodcasts(cheerio.load(body));
                        resolve();
                      })
                    );
                  }
                }
              }
              process.stdout.write(`\n`); // new line
              resolve();
            })
          );
        }
        resolve();
      })
    );
  }
  console.log(`Obtained ${Object.keys(podcastIds).length} podcast ids`); // 415528

  if (Object.keys(podcastIds).length) {
    ids = Object.keys(podcastIds);
    console.log('Saving podcastIds file');
    fs.writeFileSync('podcastIds', JSON.stringify(ids)); // ids cache file
  }

  let j = 0;
  for (const itunesId of ids) {
    j++;
    // if (j <= 398737) { continue } // skip ids
    await new Promise(resolve => {
      request.get(
        `https://itunes.apple.com/lookup?id=${itunesId}&entity=podcast`,
        async (err, res, body) => {
          if (err) {
            logError(`request.get lookup ${itunesId} ${err}`);
            return resolve();
          }
          try {
            const feedUrl = JSON.parse(body).results[0].feedUrl; // originalUrl

            const rowExist = await db.query(
              `SELECT 1 FROM "importedFeeds_firebase" WHERE "originalUrl"='${feedUrl}' LIMIT 1`
            );
            if (rowExist[0].length) {
              return resolve(); // skip already imported
            }

            const urlParsed = nodeUrl.parse(feedUrl.trim().toLowerCase());
            const url = urlParsed.host + urlParsed.pathname; // use url as a key
            // Send request to feedUrl, and parse the feed data
            console.log(
              `getFeed request [${j}/${ids.length}] ${itunesId} ${feedUrl}`
            );
            getFeed(feedUrl, async (err, results) => {
              if (err) {
                logError(`getFeed obtaining feed ${feedUrl} ${err}`);
                return resolve();
              }
              const {metadata, feedItems} = results;
              const itunesEmail =
                metadata['itunes:owner'] && // same block as in parseFeed.js
                metadata['itunes:owner']['itunes:email'] &&
                metadata['itunes:owner']['itunes:email']['#'];
              const managingEmail =
                metadata['rss:managingeditor'] &&
                metadata['rss:managingeditor']['email'];
              const publisherEmail = itunesEmail || managingEmail || null;

              const feedObj = {
                metadata,
                feedItems,
                publisherEmail,
                verified: true,
                originalUrl: feedUrl,
              };

              // Since these new soundcasts don’t have publishers/users they are associated with, we need to create a new publisher for each of them:
              const soundcastId = `${moment().format('x')}s`;
              const publisherId = `${moment().format('x')}p`;
              const soundcastObj = {};
              soundcastObj[soundcastId] = true;
              const publisherName = metadata.title; // name(?) TODO check
              try {
                let newPublisher = {
                  name: publisherName,
                  unAssigned: true, // this publisher hasn't been claimed by any user
                  imageUrl: metadata.image.url,
                  email: publisherEmail,
                  soundcasts: [soundcastObj], // [{id of the new soundcast: true}]
                };
                // await firebase.database().ref(`publishers/${publisherId}`).set(newPublisher);
                await db.query(`INSERT INTO "publishers_firebase" (
                "publisherId"       , "name"                 , "unAssigned", "imageUrl",
                "email"             , "soundcasts"
              ) VALUES (
                '${publisherId}'   , '${prep(publisherName)}', 'true'      , '${
                  metadata.image.url
                }',
                '${publisherEmail}', '${JSON.stringify([soundcastObj])}'
              )`);

                const req = {
                  body: {
                    // mock req object
                    publisherId,
                    publisherName,
                    userId: 'Soundcast_userId_iTunesUrls',
                  },
                };
                const res = {
                  // mock res object
                  send: msg => console.log(`iTunesUrls resObject ${msg}`),
                  status: status => ({
                    send: msg =>
                      console.log(`iTunesUrls resObject ${status} ${msg}`),
                  }),
                };
                // since the imported podcasts don't have an active Soundwise user associated with it, we'll need to set verified = false under the soundcast node. also please set published = false.
                const isPublished = false,
                  isVerified = false,
                  isClaimed = false;
                // Save theses podcasts and their episodes as new soundcasts and episodes in our firebase and postgres databases
                // Save the podcasts and feedUrl under the importedFeeds node in firebase
                await runFeedImport(
                  req,
                  res,
                  url,
                  feedObj,
                  isPublished,
                  isVerified,
                  isClaimed,
                  null,
                  itunesId,
                  soundcastId
                );
              } catch (err) {
                logErr(`publishers_firebase ${feedUrl} ${err}`);
              }
              resolve();
            });
          } catch (err) {
            logError(`catch ${body} ${err}`);
            resolve();
          }
        }
      );
    });
  } // for itunesId of ids
}

////////////////////////////////////////////////////////////////
// parseFeed version to use with iTunes-local-sql.js
//
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
  const hostImageURL =
    'https://s3.amazonaws.com/soundwiseinc/user_profile_pic_placeholder.png';
  const hostName =
    (metadata['itunes:author'] && metadata['itunes:author']['#']) || author;
  const _last_update = moment(last_update).format('X');
  let soundcast;
  try {
    soundcast = {
      title,
      publisherEmail,
      creatorID: userId,
      publisherID: publisherId,
      publisherName,
      short_description: entities.decode(description),
      imageURL: image.url,
      hostName,
      last_update: _last_update,
      fromParsedFeed: true, // this soundcast is imported from a RSS feed
      forSale: false,
      landingPage: true,
      prices: [{billingCycle: 'free', price: 'free'}],
      published: isPublished, // set this to true from client after ownership is verified
      verified: true, // ownership verification, set to true from client after ownership is verified
      showSubscriberCount: true,
      showTimeStamps: true,
      hostImageURL,
    };

    // 2. add the new soundcast to firebase and postgreSQL
    // add to firebase
    if (!soundcastId) {
      soundcastId = `${moment().format('x')}s`;
    }
    // await firebase.database().ref(`soundcasts/${soundcastId}`).set(soundcast);
    const prices = JSON.stringify([{billingCycle: 'free', price: 'free'}]);
    await db.query(`INSERT INTO "soundcasts_firebase" (
      "soundcastId"           ,
      "title"                 , "publisherEmail"           , "creatorID"   , "publisherID"        ,
      "publisherName"         , "short_description"        , "imageURL"    , "hostName"           ,
      "last_update"           , "fromParsedFeed"           , "forSale"     , "landingPage"        ,
      "prices"                , "published"                , "verified"    , "showSubscriberCount",
      "showTimeStamps"        , "hostImageURL"
    ) VALUES (
      '${soundcastId}'        ,
      '${prep(title)}'        , '${prep(
      publisherEmail
    )}'  , '${userId}'   , '${publisherId}'     ,
      '${prep(publisherName)}', '${prep(description)}'     , '${
      image.url
    }', '${prep(hostName)}'  ,
      '${_last_update}'       , 'true'                     , 'false'       , 'true'               ,
      '${prices}'             , '${isPublished}'           , 'true'        , 'true'               ,
      'true'                  , '${prep(hostImageURL)}'
    )`);
  } catch (err) {
    logErr(`soundcasts_firebase ${originalUrl} ${err}`);
  }

  // store the publisher's email address in a separate table in the database,
  // for podcasts that are "active", i.e. has been updated in the last year
  const yearAgo = moment()
    .subtract(111, 'years')
    .unix();
  if (moment(last_update).unix() > yearAgo) {
    // updated in the last year
    try {
      // await database.PodcasterEmail.create({
      //   podcastTitle: title,
      //   publisherEmail,
      //   last_update: moment(last_update).format('X')
      // });
      await db.query(`INSERT INTO "PodcasterEmails" (
        "podcastTitle"    , "publisherEmail"          , "last_update"
      ) VALUES (
        '${prep(title)}'  , '${prep(publisherEmail)}' , '${moment(
        last_update
      ).format('X')}'
      )`);
    } catch (err) {
      logErr(`PodcasterEmail ${originalUrl} ${err}`);
    }
  }


  // TODO old version - sync (if needed) with parseFeed.js
  return console.log(`Error: old categories import`);
  /*
  // save the podcast's iTunes category under the importedFeeds node and under the soundcast node
  // This should be similar to the upload setup on the /dashboard/add_episode page
  const categories = metadata['itunes:category'];
  if (categories && categories.length) {
    for (const category of categories) {
      if (category && category['@'] && category['@'].text) {
        let name = category['@'].text;
        const subcategory = category['itunes:category'];
        if (subcategory && subcategory['@'] && subcategory['@'].text) {
          // have subcategory
          name = subcategory['@'].text;
        }
        try {
          // await database.Category.create({ name, soundcastId });
          await db.query(`INSERT INTO "Categories" (
            "name"         , "soundcastId"
          ) VALUES (
            '${prep(name)}', '${soundcastId}'
          )`);
        } catch (err) {
          logErr(`Category ${originalUrl} ${err}`);
        }
      }
    }
  }
  */


  // 2-a. add to publisher node in firebase
  // await firebase.database().ref(`publishers/${publisherId}/soundcasts/${soundcastId}`).set(true);
  // - may be ignored since we already set it above
  try {
    // 2-b. add to importedFeeds node in firebase
    const importedFeedObj = {
      published: isPublished,
      title,
      feedUrl: url,
      originalUrl,
      imageURL: image.url,
      updated: moment().unix(),
      publisherId,
      userId,
      claimed: isClaimed, // when 'claimed == true', this imported soundcast is managed by the RSS feed owner
    };
    if (itunesId) {
      importedFeedObj.itunesId = itunesId; // store the iTunesID under the importedFeed node
    }
    // await firebase.database().ref(`importedFeeds/${soundcastId}`).set(importedFeedObj);
    await db.query(`INSERT INTO "importedFeeds_firebase" (
      "soundcastId"          , "published"         , "title"          , "feedUrl"  , "originalUrl"   ,
      "imageURL"             , "updated"           , "publisherId"    , "userId"   , "claimed"       ,
      "itunesId"
    ) VALUES (
      '${soundcastId}'       , '${isPublished}'    , '${prep(
      title
    )}' , '${url}'   , '${originalUrl}',
      '${prep(
        image.url
      )}'   , '${moment().unix()}', '${publisherId}' , '${userId}', '${isClaimed}'  ,
      '${itunesId || 'NULL'}'
    )`);
  } catch (err) {
    logErr(`importedFeeds_firebase ${originalUrl} ${err}`);
  }

  // 2-c. add to postgres
  // database.Soundcast.findOrCreate({
  //     where: { soundcastId },
  //     defaults: {
  //       soundcastId,
  //       publisherId,
  //       title,
  //     }
  //   })
  //   .then(async data => {
  //     // console.log('DB response: ', data);
  //     // 3. create new episodes from feedItems and add episodes to firebase and postgreSQL

  try {
    await db.query(`INSERT INTO "Soundcasts" (
      "soundcastId"    ,  "title"         , "publisherId"
    ) VALUES (
      '${soundcastId}' , '${prep(title)}' , '${publisherId}'
    )`);
  } catch (err) {
    logErr(`Soundcasts ${originalUrl} ${err}`);
  }

  let i = 0;
  for (const item of feedItems) {
    await addFeedEpisode(
      item,
      userId,
      publisherId,
      soundcastId,
      soundcast,
      metadata,
      i,
      originalUrl
    );
    i++;
  }

  // TODO implement in importing script:
  //     firebase.database().ref(`users/${userId}/soundcasts_managed/${soundcastId}`).set(true);
  //     firebase.database().ref(`publishers/${publisherId}/administrators/${userId}`).set(true);
  //     firebase.database().ref(`soundcasts/${soundcastId}/published`).set(isPublished);
  //     firebase.database().ref(`soundcasts/${soundcastId}/verified`).set(isVerified);

  //     callback && callback();
  //   })
  //   .catch(err => logErr(`Soundcast.findOrCreate ${err}`, res));
}

async function addFeedEpisode(
  item,
  userId,
  publisherId,
  soundcastId,
  soundcast,
  metadata,
  i,
  originalUrl
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

  const episodeId = `${moment().format('x')}e`;
  let episode;
  try {
    const date_created = moment(date || metadata.date).format('X');
    episode = {
      title,
      coverArtUrl: image.url || soundcast.imageURL,
      creatorID: userId,
      date_created,
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
    // add to episodes node in firebase
    // await firebase.database().ref(`episodes/${episodeId}`).set(episode);
    const _description = prep(description || summary);
    await db.query(`INSERT INTO "episodes_firebase" (
      "episodeId"      , "title"          , "coverArtUrl"                       , "creatorID",
      "date_created"   , "description"    , "duration"                          , "id3Tagged",
      "index"          , "isPublished"    , "publicEpisode"                     , "publisherID",
      "soundcastID"    , "url"
    ) VALUES (
      '${episodeId}'   , '${prep(title)}' , '${prep(
      image.url || soundcast.imageURL
    )}', '${userId}',
      '${date_created}', '${_description}', '${duration}'                       ,  '${true}'       ,
      '${i +
        1}'       , '${true}'        ,  '${true}'                          ,  '${publisherId}',
      '${soundcastId}' , '${prep(enclosures[0].url)}'
    )`);
  } catch (err) {
    logErr(`episodes_firebase ${originalUrl} ${err}`);
  }

  // add to the soundcast

  // TODO implement in importing script:
  //  await firebase.database().ref(`soundcasts/${soundcastId}/episodes/${episodeId}`).set(true);

  // add to postgres
  // database.Episode.findOrCreate({
  //     where: { episodeId },
  //     defaults: {
  //       episodeId,
  //       soundcastId,
  //       publisherId,
  //       title: episode.title,
  //       soundcastTitle: soundcast.title,
  //     }
  //   })
  //   .then(data => {
  //     // console.log('parseFeed.js findOrCreate then');
  //   })
  //   .catch(err => logErr(`Episode.findOrCreate ${err}`));

  try {
    await db.query(`INSERT INTO "Episodes" (
      "episodeId"             , "soundcastId"               , "publisherId"   ,
      "title"                 , "soundcastTitle"
    ) VALUES (
      '${episodeId}'          , '${soundcastId}'            , '${publisherId}',
      '${prep(episode.title)}', '${prep(soundcast.title)}'
    )`);
  } catch (err) {
    logErr(`Episodes ${originalUrl} ${err}`);
  }
}
//
////////////////////////////////////////////////////////////////

const links = [
  'https://itunes.apple.com/us/genre/podcasts-arts/id1301?mt=2',
  'https://itunes.apple.com/us/genre/podcasts-arts-design/id1402?mt=2',
  'https://itunes.apple.com/us/genre/podcasts-arts-fashion-beauty/id1459?mt=2',
  'https://itunes.apple.com/us/genre/podcasts-arts-food/id1306?mt=2',
  'https://itunes.apple.com/us/genre/podcasts-arts-literature/id1401?mt=2',
  'https://itunes.apple.com/us/genre/podcasts-arts-performing-arts/id1405?mt=2',
  'https://itunes.apple.com/us/genre/podcasts-arts-visual-arts/id1406?mt=2',
  'https://itunes.apple.com/us/genre/podcasts-business/id1321?mt=2',
  'https://itunes.apple.com/us/genre/podcasts-business-business-news/id1471?mt=2',
  'https://itunes.apple.com/us/genre/podcasts-business-careers/id1410?mt=2',
  'https://itunes.apple.com/us/genre/podcasts-business-investing/id1412?mt=2',
  'https://itunes.apple.com/us/genre/podcasts-business-management-marketing/id1413?mt=2',
  'https://itunes.apple.com/us/genre/podcasts-business-shopping/id1472?mt=2',
  'https://itunes.apple.com/us/genre/podcasts-comedy/id1303?mt=2',
  'https://itunes.apple.com/us/genre/podcasts-education/id1304?mt=2',
  'https://itunes.apple.com/us/genre/podcasts-education-educational-technology/id1468?mt=2',
  'https://itunes.apple.com/us/genre/podcasts-education-higher-education/id1416?mt=2',
  'https://itunes.apple.com/us/genre/podcasts-education-k-12/id1415?mt=2',
  'https://itunes.apple.com/us/genre/podcasts-education-language-courses/id1469?mt=2',
  'https://itunes.apple.com/us/genre/podcasts-education-training/id1470?mt=2',
  'https://itunes.apple.com/us/genre/podcasts-games-hobbies/id1323?mt=2',
  'https://itunes.apple.com/us/genre/podcasts-games-hobbies-automotive/id1454?mt=2',
  'https://itunes.apple.com/us/genre/podcasts-games-hobbies-aviation/id1455?mt=2',
  'https://itunes.apple.com/us/genre/podcasts-games-hobbies-hobbies/id1460?mt=2',
  'https://itunes.apple.com/us/genre/podcasts-games-hobbies-other-games/id1461?mt=2',
  'https://itunes.apple.com/us/genre/podcasts-games-hobbies-video-games/id1404?mt=2',
  'https://itunes.apple.com/us/genre/podcasts-government-organizations/id1325?mt=2',
  'https://itunes.apple.com/us/genre/podcasts-local/id1475?mt=2',
  'https://itunes.apple.com/us/genre/podcasts-national/id1473?mt=2',
  'https://itunes.apple.com/us/genre/podcasts-non-profit/id1476?mt=2',
  'https://itunes.apple.com/us/genre/podcasts-regional/id1474?mt=2',
  'https://itunes.apple.com/us/genre/podcasts-health/id1307?mt=2',
  'https://itunes.apple.com/us/genre/podcasts-health-alternative-health/id1481?mt=2',
  'https://itunes.apple.com/us/genre/podcasts-health-fitness-nutrition/id1417?mt=2',
  'https://itunes.apple.com/us/genre/podcasts-health-self-help/id1420?mt=2',
  'https://itunes.apple.com/us/genre/podcasts-health-sexuality/id1421?mt=2',
  'https://itunes.apple.com/us/genre/podcasts-kids-family/id1305?mt=2',
  'https://itunes.apple.com/us/genre/podcasts-music/id1310?mt=2',
  'https://itunes.apple.com/us/genre/podcasts-news-politics/id1311?mt=2',
  'https://itunes.apple.com/us/genre/podcasts-religion-spirituality/id1314?mt=2',
  'https://itunes.apple.com/us/genre/podcasts-religion-spirituality-buddhism/id1438?mt=2',
  'https://itunes.apple.com/us/genre/podcasts-religion-spirituality-christianity/id1439?mt=2',
  'https://itunes.apple.com/us/genre/podcasts-religion-spirituality-hinduism/id1463?mt=2',
  'https://itunes.apple.com/us/genre/podcasts-religion-spirituality-islam/id1440?mt=2',
  'https://itunes.apple.com/us/genre/podcasts-religion-spirituality-judaism/id1441?mt=2',
  'https://itunes.apple.com/us/genre/podcasts-religion-spirituality-other/id1464?mt=2',
  'https://itunes.apple.com/us/genre/podcasts-religion-spirituality-spirituality/id1444?mt=2',
  'https://itunes.apple.com/us/genre/podcasts-science-medicine/id1315?mt=2',
  'https://itunes.apple.com/us/genre/podcasts-science-medicine-medicine/id1478?mt=2',
  'https://itunes.apple.com/us/genre/podcasts-science-medicine-natural-sciences/id1477?mt=2',
  'https://itunes.apple.com/us/genre/podcasts-science-medicine-social-sciences/id1479?mt=2',
  'https://itunes.apple.com/us/genre/podcasts-society-culture/id1324?mt=2',
  'https://itunes.apple.com/us/genre/podcasts-society-culture-history/id1462?mt=2',
  'https://itunes.apple.com/us/genre/podcasts-society-culture-personal-journals/id1302?mt=2',
  'https://itunes.apple.com/us/genre/podcasts-society-culture-philosophy/id1443?mt=2',
  'https://itunes.apple.com/us/genre/podcasts-society-culture-places-travel/id1320?mt=2',
  'https://itunes.apple.com/us/genre/podcasts-sports-recreation/id1316?mt=2',
  'https://itunes.apple.com/us/genre/podcasts-sports-recreation-amateur/id1467?mt=2',
  'https://itunes.apple.com/us/genre/podcasts-sports-recreation-college-high-school/id1466?mt=2',
  'https://itunes.apple.com/us/genre/podcasts-sports-recreation-outdoor/id1456?mt=2',
  'https://itunes.apple.com/us/genre/podcasts-sports-recreation-professional/id1465?mt=2',
  'https://itunes.apple.com/us/genre/podcasts-tv-film/id1309?mt=2',
  'https://itunes.apple.com/us/genre/podcasts-technology/id1318?mt=2',
  'https://itunes.apple.com/us/genre/podcasts-technology-gadgets/id1446?mt=2',
  'https://itunes.apple.com/us/genre/podcasts-technology-podcasting/id1450?mt=2',
  'https://itunes.apple.com/us/genre/podcasts-technology-software-how-to/id1480?mt=2',
  'https://itunes.apple.com/us/genre/podcasts-technology-tech-news/id1448?mt=2',
];

runImport(links);
