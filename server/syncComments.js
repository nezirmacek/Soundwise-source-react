'use strict';

const fs = require('fs');
const firebase = require('firebase-admin');
const database = require('../database');
var serviceAccount =
  process.env.NODE_ENV == 'staging'
    ? require('../stagingServiceAccountKey')
    : require('../serviceAccountKey.json');

const LOG_ERR = 'logErrsComments.txt';

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: 'https://soundwise-testbase.firebaseio.com',
});

const syncMessages = async () => {
  console.log('start');
  const comments = (await firebase
    .database()
    .ref('comments')
    .once('value')).val();
  const keys = Object.keys(comments);
  for (const key of keys) {
    const fbComment = comments[key];
    const comment = {
      commentId: key,
      userId: fbComment.userID || fbComment.userId || null,
      content: fbComment.content,
      parentId: fbComment.parentId || fbComment.parentID || null,
      episodeId: fbComment.episodeID || null,
      soundcastId: fbComment.soundcastId || fbComment.soundcastID || null,
      announcementId:
        fbComment.announcementId || fbComment.announcementID || null,
      timeStamp: fbComment.timestamp,
    };
    await database.Comment.create(comment)
      .then(data => console.log(data.dataValues))
      .catch(e => {
        console.log(e);
        logInFile(`ID: ${key}\nERROR: ${e}\n\n`);
      });
  }
  console.log('finish');
};

const logInFile = text => {
  fs.appendFile(LOG_ERR, text, err => {
    if (err) throw err;
  });
};

syncMessages();
