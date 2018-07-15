const request = require('request');
const cheerio = require('cheerio');
const firebase = require('firebase-admin');
const nodeUrl = require('url');
const moment = require('moment');
const serviceAccount = require('../../serviceAccountKey.json');
firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: 'https://soundwise-a8e6f.firebaseio.com',
});
const { getFeed, runFeedImport } = require('./parseFeed.js');

const podcastIds = {};

function loadPodcasts($) {
  // Get each podcast’s iTunes url link (href of the <a> tags) from the podcast lists
  // in each of the html files (we can use cheerio.js to do this)
  const podcasts = Array.from($('#selectedcontent a'));
  for (const podcast of podcasts) {
    // obtaining id from href; example:
    //  'https://itunes.apple.com/us/podcast/idn-onair/id302962930?mt=2' > 302962930
    const id = Number(podcast.attribs.href.split('/').pop().split('?')[0].replace('id', ''));
    if (Number.isNaN(id)) {
      console.log(`Error: iTunesUrls.js NaN ${id} ${podcast.attribs.href}`);
    } else {
      podcastIds[id] = true; // save unique id
    }
  }
}

function logError(err) {
  console.log(`Error: iTunesUrls.js ${err}`);
  process.exit();
}

async function runImport(links) {
  // links = [links[0]]; // Test first
  for (const link of links) {
    console.log(`Loading link ${link}`);
    await new Promise(resolve => request.get(link, async (err, res, body) => {
      if (err) {
        return logError(`request.get link ${link} ${err}`);
      }
      const $ = cheerio.load(body);
      loadPodcasts($); // load links from main page

      // LETTERS
      const letters = Array.from($('#selectedgenre > .list.alpha > li > a')); // 26 letters + '#'
      if (letters.length !== 27) {
        console.log(`Error: iTunesUrls.js wrong letters length ${letters.length}`);
        return process.exit();
      }
      for (const letter of letters) {
      // for (const letter of letters.slice(0, 1)) { // Test letter A
        const href = letter.attribs.href;
        process.stdout.write(`Loading letter ${letter.children[0].data}: 1`);
        await new Promise(resolve => request.get(href, async (err, res, body) => {
          if (err) {
            return logError(`request.get letter ${href} ${err}`);
          }

          // NUMBERS
          const $ = cheerio.load(body);
          loadPodcasts($); // first page loading
          const pages = Array.from($('#selectedgenre > .list.paginate').first().find('li > a'));
          if (pages.length) { // have pagination
            for (const page of pages) { // page numbers
              if (page.children[0].data !== '1' && page.children[0].data !== 'Next') {
                process.stdout.write(',' + page.children[0].data);
                const href = page.attribs.href;
                await new Promise(resolve => request.get(href, async (err, res, body) => {
                  if (err) {
                    return logError(`request.get page ${href} ${err}`);
                  }
                  loadPodcasts(cheerio.load(body));
                  resolve();
                }));
              }
            }
          }
          process.stdout.write(`\n`); // new line
          resolve();
        }));
      }
      resolve();
    }));
  }
  console.log(`Obtained ${Object.keys(podcastIds).length} podcast ids`);

  // const ids = Object.keys(podcastIds);
  const ids = [Object.keys(podcastIds)[0]]; // Test first
  for (const itunesId of ids) {
    await new Promise(resolve => {
      request.get(`https://itunes.apple.com/lookup?id=${itunesId}&entity=podcast`, (err, res, body) => {
        if (err) {
          return logError(`request.get lookup ${itunesId} ${err}`);
        }
        try {
          const feedUrl = JSON.parse(body).results[0].feedUrl;
          const urlParsed = nodeUrl.parse(feedUrl.trim().toLowerCase());
          const url = urlParsed.host + urlParsed.pathname; // use url as a key
          // Send request to feedUrl, and parse the feed data
          console.log(`getFeed request ${itunesId} ${feedUrl}`)
          getFeed(feedUrl, async (err, results) => {
            if (err) {
              return logError(`getFeed obtaining feed ${feedUrl} ${err}`);
            }
            const { metadata, feedItems } = results;
            const itunesEmail = metadata['itunes:owner'] // same block as in parseFeed.js
                             && metadata['itunes:owner']['itunes:email']
                             && metadata['itunes:owner']['itunes:email']['#'];
            const managingEmail = metadata['rss:managingeditor']
                               && metadata['rss:managingeditor']['email'];
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
            let newPublisher = {
              name: publisherName,
              unAssigned: true, // this publisher hasn't been claimed by any user
              imageUrl: metadata.image.url,
              email: publisherEmail,
              soundcasts: [soundcastObj] // [{id of the new soundcast: true}]
            };

            await firebase.database().ref(`publishers/${publisherId}`).set(newPublisher);

            const req = { body: { // mock req object
              publisherId, publisherName, userId: 'Soundcast_userId_iTunesUrls',
            }};
            const res = { // mock res object
              send: msg => console.log(`iTunesUrls resObject ${msg}`),
              status: status => ({
                send: msg => console.log(`iTunesUrls resObject ${status} ${msg}`)
              })
            };
            // since the imported podcasts don't have an active Soundwise user associated with it, we'll need to set verified = false under the soundcast node. also please set published = false.
            const isPublished = false, isVerified = false, isClaimed = false;
            // Save theses podcasts and their episodes as new soundcasts and episodes in our firebase and postgres databases
            // Save the podcasts and feedUrl under the importedFeeds node in firebase
            await runFeedImport(req, res, url, feedObj,
                                isPublished, isVerified, isClaimed, null, itunesId, soundcastId);
            resolve();
          });
        } catch(err) {
          return logError(`catch ${body} ${err}`);
        }
      });
    });
  } // for itunesId of ids
}

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
  'https://itunes.apple.com/us/genre/podcasts-technology-tech-news/id1448?mt=2'
];

runImport(links);
