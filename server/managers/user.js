'use strict';
const moment = require('moment');
const firebase = require('firebase-admin');

const getById = id =>
  firebase
    .database()
    .ref(`users/${id}`)
    .once('value')
    .then(snapshot => (snapshot.val() ? snapshot.val() : null));

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

const updateSubscribe = (id, soundcastId, data) =>
  firebase
    .database()
    .ref(`users/${id}/soundcasts/${soundcastId}`)
    .update(data);

const subscribe = (
  userId,
  soundcastId,
  paymentId,
  { currentPeriodEnd, billingCycle, planID }
) => {
  return updateSubscribe(userId, soundcastId, {
    planID: planID,
    subscribed: true,
    paymentID: paymentId,
    billingCycle: billingCycle,
    date_subscribed: moment().format('X'),
    current_period_end: currentPeriodEnd,
  });
};

const unsubscribe = (userId, soundcastId) => {
  return updateSubscribe(userId, soundcastId, {
    subscribed: false,
    current_period_end: moment().format('X'),
  });
};

module.exports = {
  getById,
  create,
  exists,
  update,
  subscribe,
  unsubscribe,
};
