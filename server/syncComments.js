'use strict';

const fs = require('fs');
const firebase = require('firebase-admin');
const database = require('../database');
const moment = require('moment');
var serviceAccount = require('../serviceAccountKey');

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
    if (fbComment) {
      if (fbComment.children) {
        const childKeys = Object.keys(fbComment.children);
        for (const childKey of childKeys) {
          const childComment = (await firebase
            .database()
            .ref(`comments/${childKey}`)
            .once('value')).val();
          if (childComment) {
            const comment = getCommentForPsql(childKey, childComment, key);
            const isExist = await database.Comment.findById(comment.commentId);
            console.log('isExist:', !!isExist);
            if (!!isExist) {
              console.log('update');
              console.log('comment', comment);
              await database.Comment.update(comment, {
                where: { commentId: childKey },
              })
                .then(data => console.log(data + '\n'))
                .catch(e => {
                  console.log('ERROR' + e + '\n');
                  logInFile(`ID: ${key}\nERROR: ${e}\n\n`);
                });
            } else {
              if (comment) {
                console.log('create');
                console.log('comment', comment);
                await database.Comment.create(comment)
                  .then(data => console.log('data', data.dataValues + '\n'))
                  .catch(e => {
                    console.log('ERROR' + e + '\n\n');
                    logInFile(`ID: ${key}\nERROR: ${e}\n`);
                  });
              }
            }
          }
        }
      } else {
        const comment = getCommentForPsql(key, fbComment);
        const isExist = await database.Comment.findById(comment.commentId);
        console.log('isExist:', !!isExist);
        if (!!isExist) {
          console.log('update');
          console.log('comment', comment);
          await database.Comment.update(comment, { where: { commentId: key } })
            .then(data => console.log(data + '\n'))
            .catch(e => {
              console.log('ERROR' + e + '\n');
              logInFile(`ID: ${key}\nERROR: ${e}\n\n`);
            });
        } else {
          if (comment) {
            console.log('create');
            console.log('comment', comment);
            await database.Comment.create(comment)
              .then(data => console.log('data', data.dataValues + '\n'))
              .catch(e => {
                console.log('ERROR' + e + '\n');
                logInFile(`ID: ${key}\nERROR: ${e}\n\n`);
              });
          }
        }
      }
    }
  }
  console.log('finish');
};

const getCommentForPsql = (key, fbComment, parent) => {
  const comment = {
    commentId: key,
    userId: fbComment.userID || fbComment.userId || null,
    content: fbComment.content,
    parentId: parent ? parent : fbComment.parentID || fbComment.parentId,
    episodeId: fbComment.episodeID || null,
    soundcastId: fbComment.soundcastId || fbComment.soundcastID || null,
    announcementId:
      fbComment.announcementId || fbComment.announcementID || null,
    timeStamp: fbComment.timestamp || fbComment.timeStamp || null,
    createdAt: moment.unix(fbComment.timestamp).format('YYYY-MM-DD HH:mm:ss Z'),
  };
  return comment;
};
const logInFile = text => {
  fs.appendFile(LOG_ERR, text, err => {
    if (err) throw err;
  });
};

syncMessages();
