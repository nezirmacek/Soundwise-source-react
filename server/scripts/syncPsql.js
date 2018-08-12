'use strict';
const fs = require('fs');

var firebase = require('firebase-admin');
const database = require('../../database/index');

const LOG_ERR = 'logErrs.txt';
const PAGE_SIZE = 10;

const syncSoundcasts = async () => {
  await fs.unlink(LOG_ERR, err => err);

  let next = true;
  let startId = '1502366385413s';

  const lastId = await firebase
    .database()
    .ref('soundcasts')
    .orderByKey()
    .limitToLast(1)
    .once('value')
    .then(snap => Object.keys(snap.val())[0]);

  while (next) {
    await firebase
      .database()
      .ref('soundcasts')
      .orderByKey()
      .startAt(startId)
      .limitToFirst(PAGE_SIZE)
      .once('value')
      .then(snaps => {
        const soundcasts = snaps.val();
        const keys = Object.keys(snaps.val());
        keys.forEach(async (key, i) => {
          next = key !== lastId;
          if (i === 0) {
            return;
          } else if (i === keys.length - 1) {
            startId = key;
          }
          let soundcastObj = soundcasts[key];
          await database.Soundcast.findOne({
            where: {soundcastId: key},
          })
            .then(soundcastData => {
              if (soundcastData) {
                console.log('update id: ', key);
                return soundcastData.update(soundcastObj);
              } else {
                console.log('create id: ', key);
                return database.Soundcast.create(soundcastObj);
              }
            })
            .then(res => res)
            .catch(err => logInFile(`soundcastId: ${key}\nErr: ${err}\n\n`));
        });
      });
  }
};

const logInFile = text => {
  fs.appendFile(LOG_ERR, text, err => {
    if (err) throw err;
    console.log('Update log');
  });
};

module.exports = {syncSoundcasts};
