'use strict';
const firebase = require('firebase-admin');

const getUserInvitations = email =>
  firebase
    .database()
    .ref(`invitations/${email}`)
    .orderByValue()
    .equalTo(true)
    .once('value')
    .then(snapshot => (snapshot.exists() ? snapshot.val() : []));

module.exports = {
  getUserInvitations,
};
