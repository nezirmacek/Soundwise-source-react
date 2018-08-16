'use strict';
const moment = require('moment');
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

const addSubscribedUser = (soundcastId, userId) =>
  firebase
    .database()
    .ref(`soundcasts/${soundcastId}/subscribed/${userId}`)
    .set(moment().format('X'));

const removeSubscribedUser = (soundcastId, userId) =>
  firebase
    .database()
    .ref(`soundcasts/${soundcastId}/subscribed/${userId}`)
    .remove();

module.exports = {
  getById,
  setMailingListName,
  addSubscribedUser,
  removeSubscribedUser,
};
