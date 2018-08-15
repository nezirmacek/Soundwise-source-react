'use strict';
const firebase = require('firebase-admin');

const getById = id =>
  firebase
    .database()
    .ref(`soundcasts/${id}`)
    .once('value')
    .then(snapshot => (snapshot.exists() ? snapshot.val() : null));

const setMailingListName = (soundcastId, mailingListName, mailingListId) =>
  firebase
    .database()
    .ref(`soundcasts/${soundcastId}/${mailingListName}`)
    .set(mailingListId);

module.exports = {
  getById,
  setMailingListName,
};
