// step 1: retrieve all transaction data for previous month from database.
// step 2: loop through transactions data, compile an object of publisher IDs with total payout amount to each publisher.
// step 3: retrieve paypal email for each publisher from firebase.
// step 4: create one batch payout for each publisher.
// step 5: set up webhook to listen to batch payout success/failure events.
// step 6: write payout data into Payouts table when a batch payout succeeds; send an email to alert administrator if a batch payout fails.

'use strict';
var schedule = require('node-schedule');
var moment = require('moment');
// var firebase = require('firebase');
var paypal = require('paypal-rest-sdk');
var firebase = require('firebase-admin');

var paypalConfig = require('../../config').paypalConfig;

var stripeFeeFixed = 0.3;
var stripeFeePercent = 0.029;
var soundwiseFeePercent = 0;

// module.exports = function(app) {
//   paypal.configure(paypalConfig);

//   var j = schedule.scheduleJob('0 0 10 1 * *', function() {
//     const periodBegin = moment().startOf('month').subtract(2, 'months')
//       .add(15, 'days').format('YYYY-MM-DD');
//     const periodEnd = moment().startOf('month').subtract(1, 'months')
//       .add(14, 'days').format('YYYY-MM-DD');
//     const Transaction = app.models.Transaction;
//     // ************** step 1
//     const publishersObj = {};
//     Transaction.find({
//       where: {
//         date: {
//           between: [
//             // be sure it runs at the START of the month
//             periodBegin,
//             periodEnd,
//           ],
//         },
//       },
//     })
//     .then(transactions => {
//       if (transactions.length > 0) {
//         // ************** step 2
//         transactions.map(transaction => {
//           const fees = transaction.amount * (stripeFeePercent +
//             soundwiseFeePercent) + stripeFeeFixed;
//           if (!publishersObj[transaction.publisherId]) {
//             publishersObj[transaction.publisherId] = {
//               payoutAmount: transaction.type == 'charge' ?
//                (+transaction.amount - fees) : - (+transaction.amount - fees),
//             };
//           } else {
//             publishersObj[transaction.publisherId].payoutAmount +=
//              transaction.type == 'charge' ? (+transaction.amount - fees) :
//               - (+transaction.amount - fees);
//           }
//         });

//         const publishersArr = [];
//         let publisherObj;
//         for (let publisherId in publishersObj) {
//           publisherObj = publishersObj[publisherId];
//           publisherObj.id = publisherId;
//           publishersArr.push(publisherObj);
//         }

//         // ************** step 3
//         const getPaypalEmailPromises = publishersArr.map((publisher, i) => {
//           return firebase.database().ref(`publishers/${publisher.id}/
//             paypalEmail`)
//             .once('value').then(paypalEmailSnapshot => {
//               if (paypalEmailSnapshot.val()) {
//                 publishersArr[i].paypalEmail = paypalEmailSnapshot.val();
//               }
//             })
//             .then(res => res, err => console.log(err));
//         });

//         Promise.all(getPaypalEmailPromises)
//         .then(res => {
//           console.log('payal emails retrieved');
//         })
//         .catch(err => console.log('paypal email retrieval error: ', err));

//         // publisherObj = {id, paypalEmail, amount}
//         // ************** step 4
//         const payoutItemsArr = [];
//         publishersArr.forEach(publisherObj => {
//           if (publisherObj.amount > 0) {
//             payoutItemsArr.push({
//               recipient_type: 'EMAIL',
//               amount: {
//                 value: publisherObj.amount,
//                 currency: 'USD',
//               },
//               receiver: publisherObj.paypalEmail,
//               note: 'Thank you.',
//               sender_item_id: publisherObj.id, //publisherID
//             });
//           }
//         });

//         // create payout
//         const senderBatchId = Math.random().toString(36).substring(9);
//         const payoutObj = {
//           sender_batch_header: {
//             sender_batch_id: senderBatchId,
//             email_subject: `You received a payment from Soundiwse for
//             ${periodBegin} - ${periodEnd}`,
//           },
//           items: payoutItemsArr,
//         };
//         paypal.payout.create(payoutObj, function(error, payout) {
//           if (error) {
//             console.log(error);
//           } else {
//             console.log('payout response: ', payout);
//           }
//         });
//       }
//     });
//   });
// };
