'use strict';
const fs = require('fs');

var moment = require('moment');
var firebase = require('firebase-admin');
const database = require('../../database/index');

const syncSoundcasts = async () => {
  firebase
    .database()
    .ref('soundcasts')
    .limitToFirst(10)
    .once('value')
    .then(snaps => {
      snaps.forEach(snap => {
        console.log('soundcasts', snap.key);
      });
    });
  const text = 'testtexttesttexttesttext\n\ntesttexttesttext\ntexttext';
  fs.writeFile('2pac.txt', text, err => {
    if (err) throw err;
    console.log('Text saved!');
  });
};

module.exports = { syncSoundcasts };
