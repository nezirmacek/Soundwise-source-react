'use strict';

const fs = require('fs');
const firebase = require('firebase-admin');
const database = require('../database');
var serviceAccount =
  process.env.NODE_ENV == 'staging'
    ? require('../stagingServiceAccountKey')
    : require('../serviceAccountKey.json');

const LOG_ERR = 'logErrsMessages.txt';

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: 'https://soundwise-testbase.firebaseio.com',
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
      .then(snapshots => {
        snapshots.forEach(snapshot => {
          const fbMessage = snapshot.val();
          const message = {
            announcementId: snapshot.key,
            content: fbMessage.content,
            creatorId: fbMessage.creatorID,
            publisherId: fbMessage.publisherID,
            soundcastId: fbMessage.soundcastID,
            isPublished: fbMessage.isPublished,
          };
          database.Announcement.create(message)
            .then(data => console.log(data.dataValues))
            .catch(e => logInFile(`ID: ${snapshot.key}\nERROR: ${e}\n\n`));
        });
      })
  );
};

const logInFile = text => {
  fs.appendFile(LOG_ERR, text, err => {
    if (err) throw err;
  });
};

syncMessages();
