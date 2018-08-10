'use strict';
var firebase = require('firebase-admin');
const database = require('../../database/index');

const syncMessages = () => {
  const ids = [
    '1503002147022s',
    '1503093293340s',
    '1505855025645s',
    '15232423442s',
  ]; //
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
