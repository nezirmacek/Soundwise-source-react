'use strict';

const fs = require('fs');
const firebase = require('firebase-admin');
const database = require('../database');
const {soundcastManager} = require('./managers');
var serviceAccount =
  process.env.NODE_ENV == 'staging'
    ? require('../stagingServiceAccountKey')
    : require('../serviceAccountKey.json');

const LOG_ERR = 'logErrsLikes.txt';

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: 'https://soundwise-testbase.firebaseio.com',
});

const syncLikes = async () => {
  const soundcastsIds = [
    '1509475284817s',
    '1507828113963s',
    '1508785327382s',
    '1510935330009s',
    '1513445399143s',
    '1508293913676s',
    '1505855025645s',
    '1531419211997s',
    '1531441638240s',
    '1531459034687s',
    '1531496828981s',
    '1531502612113s',
  ];
  console.log('start');
  for (const soundcastId of soundcastsIds) {
    const soundcast = await soundcastManager.getById(soundcastId);
    if (!soundcast) return;
    if (soundcast.episodes) {
      const episodesIds = Object.keys(soundcast.episodes);
      for (const episodeId of episodesIds) {
        const likes = await firebase
          .database()
          .ref(`episodes/${episodeId}/likes`)
          .once('value');
        if (likes.val()) {
          const usersIds = Object.keys(likes.val());
          for (const userId of usersIds) {
            const like = {
              likeId: `${userId}-${episodeId}`,
              episodeId: episodeId,
              userId: userId,
              soundcastId: soundcastId,
              timeStamp: likes.val()[userId],
            };
            database.Like.create(like)
              .then(data => console.log(data.dataValues))
              .catch(e =>
                logInFile(`ID: ${userId}-${episodeId}\nERROR: ${e}\n\n`)
              );
          }
        }
      }
    }
  }
  console.log('finish');
};

const logInFile = text => {
  fs.appendFile(LOG_ERR, text, err => {
    if (err) throw err;
  });
};

syncLikes();
