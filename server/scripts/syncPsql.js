'use strict';

const fs = require('fs');
const firebase = require('firebase-admin');
const database = require('../../database/index');
const Entities = require('html-entities').XmlEntities;

const LOG_ERR = 'logErrs.txt';
const PAGE_SIZE = 10;

const syncSoundcasts = async () => {
  await fs.unlink(LOG_ERR, err => err);

  let next = true;
  let startId = await firebase
    .database()
    .ref('soundcasts')
    .orderByKey()
    .limitToFirst(1)
    .once('value')
    .then(snap => Object.keys(snap.val())[0]);

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
          await removeSpecialChars(key, soundcasts[key]);

          await database.Soundcast.findOne(getFilter(key))
            .then(soundcastData => {
              if (soundcastData) {
                return soundcastData.update(soundcast);
              } else {
                return database.Soundcast.create(soundcast);
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
      });
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
  } = fbSoundcast;

  return {
    soundcastId: key,
    publisherId: publisherID ? publisherID : null,
    title: title ? fixSpecialChars(title) : null,
    imageUrl: imageUrl ? imageUrl : null,
    itunesId: null,
    category: category ? category : null,
    published: published ? published : null,
    landingPage: landingPage ? landingPage : null,
    updateDate: last_update ? last_update : null,
  };
};

const getFilter = id => {
  return { where: { soundcastId: id } };
};

const removeSpecialChars = (key, soundcast) => {
  const { title, short_description, long_description } = soundcast;
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
  if (typeof long_description === 'string') {
    firebase
      .database()
      .ref(`soundcasts/${key}/long_description`)
      .set(fixSpecialChars(long_description));
  }
};

const fixSpecialChars = text => {
  return new Entities().decode(text);
};

const logInFile = text => {
  fs.appendFile(LOG_ERR, text, err => {
    if (err) throw err;
  });
};

const syncMessages = () => {
  const ids = [
    '1509475284817s',
    '1507828113963s',
    '1508785327382s',
    '1510935330009s',
    '1513445399143s',
    '1508293913676s',
    '1505855025645s',
  ];
  ids.forEach(id =>
    firebase
      .database()
      .ref(`soundcasts/${id}/announcements`)
      .once('value')
      .then(snapshots => {
        snapshots.forEach(snapshot => {
          const fbMessage = snapshot.val();
          const message = {
            announcementId: fbMessage.id,
            content: fbMessage.content,
            creatorId: fbMessage.creatorID,
            publisherId: fbMessage.publisherID,
            soundcastId: fbMessage.soundcastID,
            isPublished: fbMessage.isPublished,
          };
          database.Announcement.create(message).catch(e => console.log(e));
        });
      })
  );
};

module.exports = { syncSoundcasts, syncMessages };
