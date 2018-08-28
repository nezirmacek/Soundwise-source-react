'use strict';

const fs = require('fs');
const firebase = require('firebase-admin');
const database = require('../database');
const htmlEntities = require('html-entities').XmlEntities;
const { soundcastRepository } = require('./repositories');
var serviceAccount = require('../serviceAccountKey');

const LOG_ERR = 'logErrsSoundcasts.txt';
const PAGE_SIZE = 100;

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: `https://${
    process.env.NODE_ENV === 'production'
      ? 'soundwise-a8e6f'
      : 'soundwise-testbase'
  }.firebaseio.com`,
});

const syncSoundcasts = async () => {
  await fs.unlink(LOG_ERR, err => err);
  console.log('start');
  let next = true;

  const firstSoundcast = (await firebase
    .database()
    .ref('soundcasts')
    .orderByKey()
    .limitToFirst(1)
    .once('value')).val();
  let startId = Object.keys(firstSoundcast)[0];

  const lastSoundcast = (await firebase
    .database()
    .ref('soundcasts')
    .orderByKey()
    .limitToLast(1)
    .once('value')).val();
  const lastId = Object.keys(lastSoundcast)[0];

  while (next) {
    const soundcasts = (await firebase
      .database()
      .ref('soundcasts')
      .orderByKey()
      .startAt(startId)
      .limitToFirst(PAGE_SIZE)
      .once('value')).val();
    const keys = Object.keys(soundcasts);
    startId = keys[keys.length - 1];
    for (const key of keys) {
      next = key !== lastId;
      const soundcast = getSoundcastForPsql(key, soundcasts[key]);
      const soundcastData = await soundcastRepository.get(key);

      if (soundcastData) {
        await soundcastRepository
          .update(soundcast, key)
          .then(data => {
            console.log(soundcast);
            console.log('updated soundcast with id: ', key);
          })
          .catch(error => {
            logInFile(`soundcastId: ${key}\nerr: ${error}\n\n`);
            console.log(error);
          });
      } else {
        await soundcastRepository
          .create(soundcast)
          .then(data => {
            console.log(data.dataValues);
            console.log('created soundcast with id: ', key);
          })
          .catch(error => {
            logInFile(`soundcastId: ${key}\nerr: ${error}\n\n`);
            console.log(error);
          });
      }
      const importedSoundcast = await database.ImportedFeed.findOne(
        getFilter(key)
      ).catch(e => logInFile(e));
      if (importedSoundcast) {
        const importedSoundcastId = importedSoundcast.dataValues.soundcastId;
        await removeSpecialChars(key, soundcasts[key]);
        await firebase
          .database()
          .ref(`soundcasts/${key}/verified`)
          .set(false);
        const episodesData = await database.Episode.findAll(
          getFilter(importedSoundcastId)
        ).catch(e => logInFile(e));
        for (const episodeData of episodesData) {
          const episodeId = episodeData.dataValues.episodeId;
          console.log('impotedEpisode: ' + episodeId);
          firebase
            .database()
            .ref(`soundcasts/${importedSoundcastId}/episodes/${episodeId}`)
            .set(true);
        }
      }
    }
  }
  console.log('finish');
};

const getSoundcastForPsql = (key, fbSoundcast) => {
  const {
    publisherID,
    title,
    imageURL,
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
    imageUrl: imageURL ? imageURL : null,
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
  return { where: { soundcastId: id } };
};

const removeSpecialChars = (key, soundcast) => {
  const { title, short_description } = soundcast;
  console.log(
    `fixSpecialChars\ntitle: ${title}\ndescription: ${short_description}\n`
  );
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
  console.log(
    `title: ${fixSpecialChars(title)}\ndescription: ${fixSpecialChars(
      short_description
    )}`
  );
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
