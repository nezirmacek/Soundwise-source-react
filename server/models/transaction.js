'use strict';
const moment = require('moment');
var stripe_key = require('../../config').stripe_key;
var stripe = require('stripe')(stripe_key);
var admin = require("firebase-admin");
const sendinblue = require('sendinblue-api');
const sendinBlueApiKey = require('../../config').sendinBlueApiKey;

module.exports = function(Transaction) {
  Transaction.handleStripeWebhookEvent = function(data, cb) {
        // When recording to database, the soundcast id and publisher id come from the 'plan id' data returned from stripe.
        // because the format of 'plan id' is publisherID-soundcastID-soundcast title-billingCycle-price.
    console.log('handleStripeWebhookEvent post request body: ', data);

        // let _body = {
        // 	"id": "evt_1BMIZGH62wlr1FFaa0Lymsmi",
        // 	"object": "event",
        // 	"api_version": "2017-04-06",
        // 	"created": 1510243670,
        // 	"data": {
        // 		"object": {
        // 			"id": "in_1BMIZEH62wlr1FFa65J8GKsO",
        // 			"object": "invoice",
        // 			"amount_due": 515,
        // 			"application_fee": null,
        // 			"attempt_count": 0,
        // 			"attempted": true,
        // 			"billing": "charge_automatically",
        // 			"charge": "ch_1BMIZEH62wlr1FFaBxGs2aGd",
        // 			"closed": true,
        // 			"currency": "usd",
        // 			"customer": "cus_Bjm7lqBvULh8VF",
        // 			"date": 1510243668,
        // 			"description": null,
        // 			"discount": null,
        // 			"ending_balance": 0,
        // 			"forgiven": false,
        // 			"lines": {
        // 				"object": "list",
        // 				"data": [
        // 					{
        // 						"id": "sub_Bjm7lDpCIO9S6s",
        // 						"object": "line_item",
        // 						"amount": 515,
        // 						"currency": "usd",
        // 						"description": null,
        // 						"discountable": true,
        // 						"livemode": true,
        // 						"metadata": {},
        // 						"period": {
        // 							"start": 1510243668,
        // 							"end": 1512835668
        // 						},
        // 						"plan": {
        // 							"id": "1503002103690p-1503691618714s-Founders Nextdoor-monthly-5",
        // 							"object": "plan",
        // 							"amount": 515,
        // 							"created": 1510243666,
        // 							"currency": "usd",
        // 							"interval": "month",
        // 							"interval_count": 1,
        // 							"livemode": true,
        // 							"metadata": {},
        // 							"name": "Founders Nextdoor: Monthly subscription",
        // 							"statement_descriptor": null,
        // 							"trial_period_days": null
        // 						},
        // 						"proration": false,
        // 						"quantity": 1,
        // 						"subscription": null,
        // 						"subscription_item": "si_1BMIZEH62wlr1FFabl12IHEK",
        // 						"type": "subscription"
        // 					}
        // 				],
        // 				"has_more": false,
        // 				"total_count": 1,
        // 				"url": "/v1/invoices/in_1BMIZEH62wlr1FFa65J8GKsO/lines"
        // 			},
        // 			"livemode": true,
        // 			"metadata": {},
        // 			"next_payment_attempt": null,
        // 			"number": "efa4702232-0001",
        // 			"paid": true,
        // 			"period_end": 1510243668,
        // 			"period_start": 1510243668,
        // 			"receipt_number": "2743-3745",
        // 			"starting_balance": 0,
        // 			"statement_descriptor": null,
        // 			"subscription": "sub_Bjm7lDpCIO9S6s",
        // 			"subtotal": 515,
        // 			"tax": null,
        // 			"tax_percent": null,
        // 			"total": 515,
        // 			"webhooks_delivered_at": null
        // 		}
        // 	},
        // 	"livemode": true,
        // 	"pending_webhooks": 2,
        // 	"request": "req_ofehLEd21SaMIm",
        // 	"type": "invoice.payment_succeeded"
        // };

    const _transactions = [];
    const _transactionsPromises = [];
    const _errors = [];

        // need to handle only 2 types of events
    switch (data.type) {
        case 'invoice.payment_succeeded':

            if (data.data.object.lines.data[0].period.end) {
                const customer = data.data.object.customer;
                const db = admin.database();
                const ref = db.ref('users');
                ref.orderByChild('stripe_id').equalTo(customer)
                  .on('value', snapshot => {
                    const userId = snapshot.key;
                    db.ref(`users/${userId}/soundcasts`).orderByChild('planID').equalTo(data.data.object.lines.data[0].plan.id)
                      .on('value', snapshot => {
                        const soundcast = snapshot.key;
                        db.ref(`users/${userId}/soundcasts/${soundcast}/current_period_end`)
                          .set(data.data.object.lines.data[0].period.end);
                        console.log('subscription renewed');
                      });
                  });
            }

            data.data.object.lines.data.forEach((line, i) => {
                const _transactionData = line.plan.id.split('-');

                const _transaction = {
                    transactionId: `${data.id}-${i}`,
                    invoiceId: data.data.object.id,
                    chargeId: data.data.object.charge,
                    type: 'charge',
                    amount: line.amount / 100,
                    date: moment(data.data.object.date * 1000).format('YYYY-MM-DD'),
                    publisherId: _transactionData[0],
                    soundcastId: _transactionData[1],
                    customer: data.data.object.customer, // listener's stripe id
                    paymentId: line.plan.id, // id for the payment plan, only present if it's a subscription
                    createdAt: moment().utc().format(),
                    updatedAt: moment().utc().format(),
                };

                console.log('Try to create transaction: ', _transaction);
                _transactions.push(_transaction);
                _transactionsPromises.push(
                    Transaction.create(_transaction)
                        .catch(err => {
                            _errors.push(_transaction);
                            Promise.reject(err);
                        })
                );
            });

            createTransactions(Transaction, _transactionsPromises, _transactions, cb);

            break;
        case 'charge.refunded':
            data.data.object.refunds.data.forEach((refund, i) => {
                Transaction.find({where: {chargeId: refund.charge}})
                    .then(res => {
                        const publisherId = (res.length && res[0].publisherId) || null;
                        const soundcastId = (res.length && res[0].soundcastId) || null;

                        const _transaction = {
                            transactionId: `${data.id}-${i}`,
                            invoiceId: null,
                            chargeId: data.data.object.id,
                            refundId: refund.id,
                            type: 'refund',
                            amount: refund.amount / 100,
                            date: moment(data.data.object.created * 1000).format('YYYY-MM-DD'),
                            publisherId,
                            soundcastId,
                            customer: data.data.object.customer, // listener's stripe id
                            paymentId: refund.id,
                            refund_date: moment(refund.created * 1000).format('YYYY-MM-DD'),
                            createdAt: moment().utc().format(),
                            updatedAt: moment().utc().format(),
                        };

                        console.log('try to create refund: ', _transaction);
                        _transactions.push(_transaction);
                        _transactionsPromises.push(
                            Transaction.create(_transaction)
                                .catch(err => {
                                    _errors.push(_transaction);
                                    Promise.reject(err);
                                })
                        );
                    })
                    .then(() => {
                        createTransactions(Transaction, _transactionsPromises, _transactions, cb);
                    });
            });

            break;
        case 'invoice.payment_failed':
          const parameters = {'apiKey': sendinBlueApiKey, 'timeout': 5000};
          const sendinObj = new sendinblue(parameters);
          const input = {'to': {['natasha@mysoundwise.com']: 'Natasha Che'},
            'from': ['support@mysoundwise.com', 'Soundwise'],
            'subject': `Payment failed for invoice #${data.data.object.id}`,
            'html': `<p>Webhook notice from Stripe:</p>
              <div>${data}</div>`,
          };

          sendinObj.send_email(input, function(err, response) {
            if (err) {
              console.log('email admin error: ', err);
              return cb(null, {});
            } else {
              // console.log('email sent to: ', invitee);
              return cb(null, {});
            }
          });
          break;
        default:
            cb(null, {});
    }
  };
  Transaction.remoteMethod(
        'handleStripeWebhookEvent',
        {
            http: {path: '/handleStripeWebhookEvent', verb: 'post', status: 200, errorStatus: 400},
            description: ['handle stripe webhook events'],
            notes: 'it accepts stripe event data',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}, required: true},
            returns: {type: 'array', root: true}
        }
  );

  Transaction.handleOnetimeCharge = function(req, cb) {
        if (!req.customer) { //if customer id does not exist yet, create a customer first and then make the charge
            stripe.customers.create({
                email: req.receipt_email,
                source: req.source,
            })
                .then(customer => {
                    const data = Object.assign({}, req, {customer: customer.id});
                    return createCharge(Transaction, data, cb);
                });
        } else { // if customer id is in the reqest body, create a charge using the existing customer id
            console.log('customer: ', req.customer);
            createCharge(Transaction, req, cb);
        }
  };

  Transaction.remoteMethod(
        'handleOnetimeCharge',
        {
            http: {path: '/handleOnetimeCharge', verb: 'post', status: 200, errorStatus: 400},
            description: ['handle one time charges'],
            notes: 'it accepts post request from frontend',
            accepts: {arg: 'req', type: 'object', http: {source: 'body'}, required: true},
            returns: {arg: 'res', type: 'object', http: {source: 'body'}, required: true}
        }
  );
};

function createTransactions(Transaction, transactionsPromises,
 transactions, cb) {
  Promise.all(transactionsPromises)
    .then(res => {
        console.log('success create transactions: ', res);
        cb(null, res);
    })
    .catch(err => {
        console.log('ERROR create transactions: ', err);
        // need to delete all created transactions
        transactions.map(transaction => {
            // TODO: need to find transactions with errors and just remove transactions without errors
            Transaction.find({where: {transactionId: transaction.transactionId}})
                .then(res => {
                    if (res.length) {
                        const intervalHandler = setInterval(() => {
                            Transaction.destroyById(transaction.transactionId, err => {
                                if (!err) {
                                    clearInterval(intervalHandler);
                                }
                            });
                        }, 3600000); // try every hours until success
                    }
                });
        });
        cb(err);
    });
}

function createCharge(Transaction, data, cb) {
  const {
    amount,
    customer,
    description,
    statement_descriptor,
    publisherID,
    planID,
    soundcastID,
  } = data;

  stripe.charges.create({
        amount,
        currency: 'usd',
        customer,
        description,
        statement_descriptor,
  }, (err, charge) => {
    if (err) {
      console.log(err);
      return cb(err);
    }

    const _transaction = {
        transactionId: `tr_${moment().format('x')}`,
        chargeId: charge.id,
        type: 'charge',
        amount: charge.amount / 100,
        date: moment(charge.created * 1000).format('YYYY-MM-DD'),
        publisherId: publisherID,
        paymentId: planID,
        soundcastId: soundcastID,
        customer, // listener's stripe id
        createdAt: moment().utc().format(),
        updatedAt: moment().utc().format(),
    };

    console.log(_transaction);

    Transaction.create(_transaction)
        .then(() => {
          return cb(null, charge);
        })
        .catch(err => {
          return cb(err);
        });
  });
}
