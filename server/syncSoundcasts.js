'use strict';

const fs = require('fs');
const firebase = require('firebase-admin');
const database = require('../database');
const htmlEntities = require('html-entities').XmlEntities;
var serviceAccount = require('../serviceAccountKey');

const LOG_ERR = 'logErrsSoundcasts.txt';
const PAGE_SIZE = 100;

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: 'https://soundwise-a8e6f.firebaseio.com',
});

const syncSoundcasts = async () => {
  await fs.unlink(LOG_ERR, err => err);
  console.log('start');
  let next = true;

  let firstSoundcast = await firebase
    .database()
    .ref('soundcasts')
    .orderByKey()
    .limitToFirst(1)
    .once('value');

  let startId = Object.keys(firstSoundcast.val())[0];

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
          let soundcast = getSoundcastForPsql(key, soundcasts[key]);
          await database.Soundcast.findOne(getFilter(key))
            .then(soundcastData => {
              if (soundcastData) {
                database.Soundcast.update(soundcast, getFilter(key))
                  .then(data => console.log('updated soundcast with id: ', key))
                  .catch(error => console.log(error));
              } else {
                return database.Soundcast.create(soundcast)
                  .then(data => console.log('created soundcast with id: ', key))
                  .catch(error => console.log(error));
              }
            })
            .catch(err => {
              logInFile(
                `soundcastId: ${key}\nerr: ${err}\nsoundcast: ${
                  soundcasts[key].publisherID
                }\n\n`
              );
            });
          const importedSoundcast = await database.ImportedFeed.findOne(
            getFilter(key)
          );
          if (importedSoundcast) {
            await removeSpecialChars(key, soundcasts[key]);
            await firebase
              .database()
              .ref(`soundcasts/${key}/verified`)
              .set(false);
            const episodesData = await database.Episode.findAll(
              getFilter(importedSoundcast.dataValues.soundcastId)
            );
            episodesData.forEach(episode => {
              firebase
                .database()
                .ref(
                  `soundcasts/${
                    importedSoundcast.dataValues.soundcastId
                  }/episodes/${episode.dataValues.episodeId}`
                )
                .set(true);
            });
          }
        });
      })
      .catch(err => logInFile(`err: ${err}`));
  }
};

const getSoundcastForPsql = (key, fbSoundcast) => {
  const {
    publisherID,
    title,
    imageUrl,
    category,
    published,
    landingPage,
    last_update,
    forSale,
    rank,
  } = fbSoundcast;

  return {
    soundcastId: key,
    publisherId: publisherID ? publisherID : null,
    title: title ? fixSpecialChars(title) : null,
    imageUrl: imageUrl ? imageUrl : null,
    itunesId: null,
    forSale: forSale ? forSale : false,
    category: category ? category : null,
    published: published ? published : null,
    landingPage: landingPage ? landingPage : null,
    updateDate: last_update ? last_update : null,
    rank: rank ? rank : null,
  };
};

const getFilter = id => {
  return {where: {soundcastId: id}};
};

const removeSpecialChars = (key, soundcast) => {
  const {title, short_description, long_description} = soundcast;
  if (title) {
    firebase
      .database()
      .ref(`soundcasts/${key}/title`)
      .set(fixSpecialChars(title));
  }
  if (typeof short_description === 'string') {
    firebase
      .database()
      .ref(`soundcasts/${key}/short_description`)
      .set(fixSpecialChars(short_description));
  }
};

const fixSpecialChars = text => {
  return new htmlEntities().decode(text);
};

const logInFile = text => {
  fs.appendFile(LOG_ERR, text, err => {
    if (err) throw err;
  });
};

syncSoundcasts();
