'use strict';

// handle payments, renewal and cancellation for pro and plus plans on Soundwise

var stripe_key =  require('../../config').stripe_key;
var stripe = require('stripe')(stripe_key);
const firebase = require('firebase-admin');
const sgMail = require('@sendgrid/mail');
const sendGridApiKey = require('../../config').sendGridApiKey;
sgMail.setApiKey(sendGridApiKey);

module.exports.createSubscription = (req, res) => {
  if(!req.body.subscriptionID) { // if subscription doesn't exist, create subscription
    if (!req.body.customer) { // create customer first
          stripe.customers.create({
            email: req.body.receipt_email,
            source: req.body.source,
          })
          .then(customer => {
            const options = {
              customer: customer.id,
              items: [{plan: req.body.plan}],
              metadata: {
                publisherID: req.body.publisherID,
              },
            };
            if (req.body.coupon) {
              options.coupon = req.body.coupon;
            }
            return stripe.subscriptions.create(options)
                  .then(subscription => {
                    res.send(subscription);
                  })
                  .catch(err => {
                    console.log('error creating subscription');
                    res.status(500).send(err.raw.message);
                  });
          })
          .catch(err => {
            console.log('error creating customer');
            res.status(500).send(err.raw.message);
          });
    } else { // if customer already exists
      const options = {
        customer: req.body.customer,
        // customer: 'cus_B2jykv61nWoOcX',
        items: [{plan: req.body.plan}],
        metadata: {
          publisherID: req.body.publisherID,
        },
      };
      if (req.body.coupon) {
        options.coupon = req.body.coupon;
      }
      stripe.subscriptions.create(options)
      .then(subscription => {
        res.send(subscription);
      })
      .catch(err => {
        console.log('error creating subscription');
        console.log(err);
        res.status(500).send(err);
      });
    }
  } else { // if subscription exists, update existing subscription
    const options = {
        items: [{plan: req.body.plan}],
        metadata: {
          publisherID: req.body.publisherID,
        },
    }
    if (req.body.coupon) {
      options.coupon = req.body.coupon;
    }
    stripe.subscriptions.update(req.body.subscriptionID, options)
    .then(subscription => {
      res.send(subscription);
    })
    .catch(err => {
      res.status(500).send(err);
    });
  }
};

module.exports.renewSubscription = (req, res) => {
  if (req.body.type == 'invoice.payment_succeeded') {
    const current_period_end = req.body.data.object.lines.data[0].period.end;
    const publisherID = req.body.data.object.lines.data[0].metadata.publisherID;
    if (current_period_end) {
      firebase.database().ref(`publishers/${publisherID}/current_period_end`)
      .set(current_period_end);
      res.send({});
    }
  } else if (req.body.type == 'invoice.payment_failed') {
    const input = {'to': 'natasha@mysoundwise.com',
      'from': 'support@mysoundwise.com',
      'subject': `Payment failed for invoice #${req.body.data.object.id}`,
      'html': `<p>Webhook notice from Stripe:</p>
        <div>${JSON.stringify(req.body)}</div>`,
    };
    sgMail.send(input);
    res.send({});
  }
};

module.exports.cancelSubscription = (req, res) => {
  const {subscriptionID} = req.body;
  stripe.subscriptions.del(subscriptionID)
  .then(response => {
    res.send(response);
  })
  .catch(err => {
    console.log('error: ', err);
    res.status(500).send(err);
  });
};
