'use strict';
const fs = require('fs');

var moment = require('moment');
var firebase = require('firebase-admin');
const database = require('../../database/index');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const syncSoundcasts = async () => {
  const pageSize = 10;

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
      .limitToFirst(pageSize)
      .once('value')
      .then(snaps => {
        const keys = Object.keys(snaps.val());
        keys.forEach((key, i) => {
          next = key !== lastId;
          if (i === 0) {
            return;
          } else if (i === keys.length - 1) {
            startId = key;
          }
          soundcastObj = {};
          database.Soundcast.findOne({
            where: { soundcastId: key },
          })
            .then(soundcastData => {
              if (soundcastData) {
                return soundcastData.update(soundcastObj);
              } else {
                return database.Soundcast.create(soundcastObj);
              }
            })
            .catch(err => logInFile(`soundcastId: ${key}\n Err: ${err}`));
        });
      });
  }
};

const logInFile = text => {
  fs.writeFile('logErr.txt', text, err => {
    if (err) throw err;
    console.log('Save log');
  });
};

module.exports = { syncSoundcasts };
