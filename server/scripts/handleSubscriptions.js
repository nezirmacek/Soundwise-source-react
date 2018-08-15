'use strict';

var admin = require('firebase-admin');

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
  const { paymentID, publisher } = body;
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
};

const freeUnsubsribe = (body, res) => {
  res.status(200).send({});
};

module.exports = { subscribe, unsubscribe };
