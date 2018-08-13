'use strict';
var firebase = require('firebase-admin');
const database = require('../../database/index');

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
            messageId: fbMessage.id,
            content: fbMessage.content,
            creatorId: fbMessage.creatorID,
            publisherId: fbMessage.publisherID,
            soundcastId: fbMessage.soundcastID,
            isPublished: fbMessage.isPublished,
          };
          database.Message.create(message).catch(e => console.log(e));
        });
      })
  );
};

module.exports = { syncMessages };
