'use strict';

const fs = require('fs');
const firebase = require('firebase-admin');
const moment = require('moment');
const database = require('../database');
var serviceAccount = require('../serviceAccountKey');

const LOG_ERR = 'logErrsMessages.txt';

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: `https://${
    process.env.NODE_ENV === 'production'
      ? 'soundwise-a8e6f'
      : 'soundwise-testbase'
  }.firebaseio.com`,
});

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
      .then(async snapshots => {
        // console.log(snapshots.val());
        if (!snapshots.val()) {
          return;
        }
        const messages = snapshots.val();
        // console.log(messages);
        const keys = Object.keys(messages);
        for (const key of keys) {
          if (messages[key]) {
            const fbMessage = messages[key];
            console.log(fbMessage);
            const {
              content,
              creatorID,
              publisherID,
              soundcastID,
              isPublished,
              date_created,
            } = fbMessage;
            const message = {
              announcementId: key,
              content: content,
              creatorId: creatorID,
              publisherId: publisherID,
              soundcastId: soundcastID,
              isPublished: isPublished ? isPublished : false,
              createdAt: moment
                .unix(date_created)
                .format('YYYY-MM-DD HH:mm:ss Z'),
            };
            await database.Announcement.create(message)
              .then(data => console.log(data.dataValues))
              .catch(e => {
                console.log(e);
                logInFile(`ID: ${key}\nERROR: ${e}\n\n`);
              });
          }
        }
      })
  );
  console.log('finish');
};

const logInFile = text => {
  fs.appendFile(LOG_ERR, text, err => {
    if (err) throw err;
  });
};

syncMessages();
