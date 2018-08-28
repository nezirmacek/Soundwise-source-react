'use strict';

const fs = require('fs');
const firebase = require('firebase-admin');
const database = require('../database');
const _ = require('lodash');
const htmlEntities = require('html-entities').XmlEntities;
const { soundcastRepository } = require('./repositories');
const { soundcastManager } = require('./managers');
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

const importedPublisherId = '000123456789p';

const syncSoundcasts = async () => {
  await fs.unlink(LOG_ERR, err => err);
  console.log('start');
  let next = true;

  await firebase
    .database()
    .ref(`publishers/${importedPublisherId}`)
    .set({
      email: 'random@mail.coi',
      imageUrl: 'http://cms.ipressroom.com.s3.amazonaws.com/115/...',
      name: 'Online Podcast',
      unAssigned: true,
    });

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
      let soundcast = getSoundcastForPsql(key, soundcasts[key]);
      soundcast = handleImpotedSoundcast(key, soundcast)
        .then(() => console.log('end handle impoted soundcast'))
        .catch(e => logInFile(e));

      const soundcastData = await soundcastRepository.get(key);
      if (soundcastData) {
        await updateSoundcast(soundcast, key);
      } else {
        await createSoundcast(soundcast);
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

const handleImpotedSoundcast = async (key, soundcast) => {
  const importedSoundcast = await database.ImportedFeed.findOne(
    getFilter(key)
  ).catch(e => logInFile(e));
  if (importedSoundcast) {
    const importedSoundcastId = importedSoundcast.dataValues.soundcastId;
    await soundcastManager.update(key, { verified: false });

    const episodesData = await database.Episode.findAll(
      getFilter(importedSoundcastId)
    ).catch(e => logInFile(e));
    if (episodesData) {
      let updateEpisodes = {};
      for (const episodeData of episodesData) {
        const episodeId = episodeData.dataValues.episodeId;
        Object.assign(updateEpisodes, { [episodeId]: true });
      }
      await firebase
        .database()
        .ref(`soundcasts/${importedSoundcastId}/episodes`)
        .update(updateEpisodes)
        .then(() => console.log('updateEpisodes: ', updateEpisodes))
        .catch(e => logInFile(e));
    }
    const fixedSoundcast = await removeSpecialChars(key, soundcast);
    return fixedSoundcast;
  } else {
    return soundcast;
  }
};

const updateSoundcast = (soundcast, key) =>
  soundcastRepository
    .update(soundcast, key)
    .then(data => {
      console.log('updated soundcast with id: ', key);
      console.log('data', data);
      console.log('soundcast', soundcast, '\n');
    })
    .catch(error => {
      logInFile(`soundcastId: ${key}\nerr: ${error}\n\n`);
      console.log(error);
    });

const createSoundcast = (soundcast, key) =>
  soundcastRepository
    .create(soundcast)
    .then(data => {
      console.log('created soundcast with id: ', key);
      console.log('data', data.dataValues, '\n');
    })
    .catch(error => {
      logInFile(`soundcastId: ${key}\nerr: ${error}\n\n`);
      console.log(error);
    });

const removeSpecialChars = (key, soundcast) => {
  const { title, short_description } = soundcast;

  const fixedText = {
    title: fixSpecialChars(title),
    short_description: fixSpecialChars(short_description),
  };
  firebase
    .database()
    .ref(`soundcasts/${key}`)
    .update(fixedText)
    .then(() => console.log('fixedSoundcast', fixedSoundcast))
    .catch(e => logInFile(e));

  const fixedSoundcast = Object.assign({}, soundcast, {
    title: fixedText.title,
    publisherId: importedPublisherId,
  });
  return fixedSoundcast;
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
