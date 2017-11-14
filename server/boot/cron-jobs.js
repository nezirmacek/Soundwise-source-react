/**
 * Created by developer on 09.11.17.
 */
'use strict';
var schedule = require('node-schedule');
var moment = require('moment');
// var firebase = require('firebase');
var paypal = require('paypal-rest-sdk');

var config = require('../../config').config;
var paypalConfig = require('../../config').paypalConfig;

var stripeFee_fixed = 0.3;
var stripeFee_percent = 0.029;
var soundwiseFee_percent = 0;

module.exports = function (app) {
    // init firebase
    // firebase.initializeApp(config); // uncomment to get publishers from firebase
    paypal.configure(paypalConfig);

    var j = schedule.scheduleJob('* * * 1 * *', function () { // TODO: need to set up schedule
        // need to pay money for every publisher for all transactions for the last month (-15 days os delay)
        const Publisher = app.models.Publisher;
        const Transaction = app.models.Transaction;
        const Payout = app.models.Payout;

        // for paypal
        const sender_batch_id = Math.random().toString(36).substring(9);
        const payoutsObj = {
            sender_batch_header: {
                sender_batch_id: sender_batch_id,
                email_subject: 'You have a payment',
            },
            items: [],
        };

        // for our database
        const _payouts = [];

        // firebase.database().ref('publishers').once('value') // uncomment to get publishers from firebase
        Publisher.find()
            .then(
                // publishersSnapshot => {
                // 	if (publishersSnapshot.val()) {
                // 		const _publishersObj = publishersSnapshot.val();
                publishers => {
                    const _publisherPromises = [];

                    // for (let publisherId in _publishersObj) {
                    // 	if (_publishersObj.hasOwnProperty(publisherId)) {
                    // 		const _publisher = _publishersObj[publisherId];
                    publishers.forEach(_publisher => {
                        const publisherId = _publisher.publisherId;

                        _publisherPromises.push(
                            // first find charges
                            Transaction.find({
                                where: {
                                    publisherId,
                                    date: {
                                        between: [
                                            // be sure it runs at the START of the month
                                            moment().startOf('month').subtract(2, 'months').add(15, 'days').format('YYYY-MM-DD'),
                                            moment().startOf('month').subtract(1, 'months').add(14, 'days').format('YYYY-MM-DD')
                                        ]
                                    },
                                    type: 'charge'
                                }
                            })
                                .then(transactions => {
                                    if (transactions.length) {
                                        let _payoutAmount = 0;
                                        transactions.map(transaction => {
                                            const fees = transaction.amount * (stripeFee_percent + soundwiseFee_percent) + stripeFee_fixed;
                                            _payoutAmount += (+transaction.amount - fees);
                                        });

                                        _payoutAmount = +_payoutAmount.toFixed(2);

                                        payoutsObj.items.push({
                                            recipient_type: 'EMAIL',
                                            amount: {
                                                value: _payoutAmount,
                                                currency: 'USD'
                                            },
                                            receiver: _publisher.paypalEmail || 'dd.yakovenko@gmail.com', // TODO: check field name, remove hardcoded value
                                            note: 'Thank you.',
                                            sender_item_id: publisherId
                                        });

                                        _payouts.push({
                                            batchId: sender_batch_id, //id for the payout batch from paypal that this particular payout belongs to
                                            amount: _payoutAmount,
                                            date: moment().utc().format('YYYY-MM-DD'),
                                            publisherId,
                                            email: _publisher.paypalEmail, //email address used to send paypal payout // TODO: check field name
                                            // payoutId: { type: Sequelize.STRING }, // id for the payout item returned by paypal's webhook event
                                        });
                                    }
                                    return null;
                                })
                        );
                    });
                    // 	}
                    // }

                    // when all payout are generated, send them with paypal
                    Promise.all(_publisherPromises)
                        .then(res => {
                            if (!payoutsObj.items.length) {
                                return;
                            }

                            paypal.payout.create(payoutsObj, function (error, payout) {
                                if (error) {
                                    console.log(error.response);
                                    // throw error;
                                } else {
                                    const _payoutsPromises = [];

                                    _payouts.forEach(_payout => {
                                        const {payout_batch_id} = payout.batch_header;

                                        _payoutsPromises.push(
                                            new Promise((resolve, reject) => {
                                                paypal.payout.get(payout_batch_id, function (error, payout) {
                                                    if (error) {
                                                        console.log(error);
                                                        reject(error);
                                                    } else {
                                                        resolve(payout.items[0].payout_item_id);
                                                    }
                                                });
                                            })
                                                .then(payoutId => {
                                                    _payout.payoutId = payoutId;
                                                    _payout.batchId = payout_batch_id;
                                                    _payout.createdAt = moment().utc().format();
                                                    _payout.updatedAt = moment().utc().format();

                                                    return Payout.create(_payout);
                                                })
                                        );
                                    });

                                    Promise.all(_payoutsPromises)
                                        .then(res => console.log('success create payouts: ', res))
                                        .catch(err => {
                                            console.log('ERROR create payouts: ', err);
                                        });
                                }
                            });
                        })
                        .catch(err => console.log('ERROR payout is canceled: ', err));
                    // 	}
                }
            )
            .catch(err => {
                console.log('ERROR get publishers for payouts: ', err);
            })
    });
};
