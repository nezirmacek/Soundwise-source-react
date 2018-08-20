'use strict';
const firebase = require('firebase-admin');

const create = (email, password) =>
  firebase()
    .auth()
    .createUser({
      email,
      password,
    });

const exists = id =>
  firebase
    .database()
    .ref(`users/${id}`)
    .once('value')
    .then(snapshot => snapshot.exists());

const update = (id, data) =>
  firebase
    .database()
    .ref(`users/${id}`)
    .update(data);

const getId = email =>
  firebase
    .auth()
    .getUserByEmail(email)
    .then(userRecord => userRecord.toJSON().uid)
    .catch(() => null);

module.exports = {
  create,
  exists,
  getId,
  update,
};
