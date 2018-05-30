'use strict';

// handle payments, renewal and cancellation for pro and plus plans on Soundwise

var stripe_key =  require('../../config').stripe_key;
var stripe = require('stripe')(stripe_key);
const firebase = require('firebase-admin');
const sgMail = require('@sendgrid/mail');
const sendGridApiKey = require('../../config').sendGridApiKey;
sgMail.setApiKey(sendGridApiKey);
const database = require('../../database/index');

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
            if (req.body.trialPeriod) {
              options.trial_period_days = req.body.trialPeriod;
            }
            if (req.body.metadata) {
              options.metadata.promoCode = req.body.metadata.promoCode;
            }
            if (req.body.referredBy) {
              options.metadata.referredBy = req.body.referredBy;
            }
            if (req.body.refererPublisherId) {
              options.metadata.refererPublisherId = req.body.refererPublisherId;
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
        // customer: 'cus_B2k4GMj8KtSkGs',
        items: [{plan: req.body.plan}],
        metadata: {
          publisherID: req.body.publisherID,
        },
      };
      if (req.body.coupon) {
        options.coupon = req.body.coupon;
      }
      if (req.body.trialPeriod) {
        options.trial_period_days = req.body.trialPeriod;
      }
      if (req.body.metadata) {
        options.metadata.promoCode = req.body.metadata.promoCode;
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
    const data = req.body.data.object.lines.data[0];
    const current_period_end = data.period.end;
    const publisherId = data.metadata.publisherID;
    if (current_period_end) {
      firebase.database().ref(`publishers/${publisherId}/current_period_end`)
      .set(current_period_end);
      res.send({});
    }

    const chargeAmount = data.amount;
    if (!chargeAmount) {
      return // skip if no charge amount
    }

    let subscriptionPlanName;
    if (data.plan.product === 'prod_CIfFqhoS2m4xaN') {
      subscriptionPlanName = 'Soundwise Plus Annual Subscription';
    } else if (data.plan.product === 'prod_CIfGFWSDY3ktD8') {
      subscriptionPlanName = 'Soundwise Pro Monthly Subscription';
    } else if (data.plan.product === 'prod_CIfDGkLuKCaFs5') {
      subscriptionPlanName = 'Soundwise Plus Monthly Subscription';
    } else if (data.plan.product === 'prod_CIfHWeFWKcVKyh') {
      subscriptionPlanName = 'Soundwise Pro Annual Subscription';
    } else {
      console.log(`Error: renewSubscription unknown plan product ${data.plan.product}`);
    }

    const newCharge = {
      publisherId,
      stripeCustomerId: req.body.data.object.customer,
      subscriptionPlanName,
      subscriptionPlanId: data.plan.product,
      subscriptionId: req.body.data.object.subscription,
      chargeId: req.body.data.object.charge,
      chargeAmount: data.amount, // in cents, example 3600
      coupon: data.metadata.coupon || null,
      referredBy: data.metadata.referredBy || null,
    }

    // check if there is referredBy property in the subscription's metadata
    if (data.metadata.referredBy) {
      const amountTransfer = data.amount * 0.971 - 30; // - 2.9% - $0.3 stripe fee
      stripe.transfers.create({
        amount: amountTransfer,
        currency: 'usd',
        destination: data.metadata.referredBy,
        transfer_group: 'affiliateGroup' // optional
      }, (err, transfer) => {
        if (err) {
          return console.log(`Error: renewSubscription stripe.transfers.create ${err}`);
        }
        database.Transfers.create({
          affiliateId: data.metadata.refererPublisherId,
          affiliateStripeAccountId: data.metadata.referredBy,
          subscriptionId: req.body.data.object.subscription,
          chargeId: req.body.data.object.charge,
          amountCharge: data.amount,
          amountTransfer,
        });
      });
    }

    database.PlatformCharges.create(newCharge);
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
