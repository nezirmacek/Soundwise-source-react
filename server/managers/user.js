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

const setSubscribe = (
  userId,
  soundcastId,
  paymentId,
  subscribtion,
  { currentPeriodEnd, billingCycle, planID }
) => {
  const now = moment().format('X');
  return updateSubscribe(
    userId,
    soundcastId,
    subscribtion
      ? {
          [`/current_period_end`]: now,
          [`/subscribed`]: subscribtion,
          [`/paymentID`]: paymentId,
          [`/date_subscribed`]: now,
          [`/current_period_end`]: currentPeriodEnd,
          [`/billingCycle`]: billingCycle,
          [`/planID`]: planID,
        }
      : {
          [`/current_period_end`]: now,
          [`/subscribed`]: subscribtion,
        }
  );
};
module.exports = {
  getById,
  create,
  exists,
  update,
  setSubscribe,
};
