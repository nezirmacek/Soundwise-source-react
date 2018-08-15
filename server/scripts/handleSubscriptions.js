'use strict';

var firebase = require('firebase-admin');
var moment = require('moment');

var stripeKey =
  process.env.NODE_ENV == 'staging'
    ? require('../../stagingConfig').stripe_key
    : require('../../config').stripe_key;

var stripe = require('stripe')(stripeKey);

const unsubscribe = (req, res) => {
  if (req.body.paymentID) {
    delStripesSubscriptions(req.body, res);
  } else {
    freeUnsubsribe(req.body, res);
  }
};

const subscribe = (req, res) => {};

const delStripesSubscriptions = (body, res) => {
  const { paymentID, publisher, publisherID } = body;
  firebase
    .database()
    .ref(`publishers/${publisherID}`)
    .once('value', snapshot => {
      if (paymentID.slice(0, 3) == 'sub') {
        stripe.subscriptions.del(
          paymentID,
          { stripe_account: publisher },
          (err, confirmation) => {
            if (err) {
              res.status(500).send(err);
              return;
            }
            res.send(confirmation);
          }
        );
      } else {
        res.status(200).send({});
      }
    });
};

const freeUnsubsribe = (body, res) => {
  const { userId, soundcastId, publisherID } = body;
  firebase
    .database()
    .ref(`users/${userId}/soundcasts/${soundcastId}/current_period_end`)
    .set(moment().format('X'));

  firebase
    .database()
    .ref(`publishers/${publisherID}/freeSubscribers/${userId}/${soundcastId}`)
    .remove();

  firebase
    .database()
    .ref(`publishers/${publisherID}/freeSubscribers/${userId}`)
    .once('value')
    .then(snapshot => {
      if (!snapshot.val()) {
        firebase
          .database()
          .ref(`publishers/${publisherID}/freeSubscriberCount`)
          .once('value')
          .then(snapshot => {
            if (snapshot.val()) {
              const count = snapshot.val();
              // console.log('free subscriber count: ', count);
              firebase
                .database()
                .ref(`publishers/${publisherID}/freeSubscriberCount`)
                .set(count - 1); // transaction
            }
          });
        res.status(200).send({});
      }
    });
};

const addSoundcastToUser = (charge, soundcast) => {
  const paymentID = charge.id ? charge.id : null;
  const planID = charge.plan ? charge.plan.id : null;
  const billingCycle = soundcast.billingCycle ? soundcast.billingCycle : null;
  const currentPeriodEnd = charge.current_period_end
    ? charge.current_period_end
    : moment()
        .add(100, 'years')
        .format('X');

  const userId = this.state.userId;
  // add soundcast to user
  firebase
    .database()
    .ref(`users/${userId}/soundcasts/${soundcast.soundcastId}`)
    .set({
      subscribed: true,
      paymentID,
      date_subscribed: moment().format('X'),
      current_period_end: currentPeriodEnd,
      billingCycle,
      planID,
    });

  firebase
    .database()
    .ref(`soundcasts/${soundcast.soundcastId}/subscribed/${userId}`)
    .set(moment().format('X'));
};

module.exports = { subscribe, unsubscribe };
