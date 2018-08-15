'use strict';
const firebase = require('firebase-admin');

const incrementFreeSubscriberCount = publisherID =>
  firebase
    .database()
    .ref(`publishers/${publisherID}/freeSubscriberCount`)
    .transaction(count => count + 1);

module.exports = {
  incrementFreeSubscriberCount,
};
