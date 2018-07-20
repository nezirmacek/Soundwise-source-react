// step 1: retrieve all transaction data for previous month from database.
// step 2: loop through transactions data, compile an object of publisher IDs with total payout amount to each publisher.
// step 3: retrieve paypal email for each publisher from firebase.
// step 4: create one batch payout for each publisher.
// step 5: set up webhook to listen to batch payout success/failure events.
// step 6: write payout data into Payouts table when a batch payout succeeds; send an email to alert administrator if a batch payout fails.

'use strict';
var schedule = require('node-schedule');
var moment = require('moment');
var paypal = require('paypal-rest-sdk');
var firebase = require('firebase-admin');
const sendinblue = require('sendinblue-api');
const database = require('../../database/index');
const sendinBlueApiKey = require('../../config').sendinBlueApiKey;

const parameters = {'apiKey': sendinBlueApiKey, 'timeout': 5000};
const sendinObj = new sendinblue(parameters);
var paypalConfig = require('../../config').paypalConfig;

var stripeFeeFixed = 0.3;
var stripeFeePercent = 0.029;
var soundwiseFeePercent = 0;

module.exports = function(app) {
  paypal.configure(paypalConfig);

  var rankSoundcasts = schedule.scheduleJob('* * 1 * * 1', function() {
    const currentDate = Date.now();
    let soundcastsListens = [];
    let maxListnes = 0;
    database.Soundcast.findAll().then(soundcasts => {
      const promises = soundcasts.map(soundcast => {
        return database.ListeningSession
          .count({where: {soundcastId: soundcast.soundcastId}})
          .then(countListnes => {
            maxListnes = maxListnes < countListnes ? countListnes : maxListnes;
            soundcastsListens.push(
              {
                id: soundcast.soundcastId,
                countListnes: countListnes,
                updateDate: soundcast.updateDate || new Date(soundcast.updatedAt).getTime(),
              }
            );
          });
      });
      Promise.all(promises).then(() => {
        soundcastsListens.forEach(soundcast => {
          const rank = (soundcast.countListnes / maxListnes > 0.1 ?
            (soundcast.countListnes / maxListnes - 0.1) : 0) +
            soundcast.updateDate / currentDate * 0.1;
          firebase.database().ref(`soundcasts/${soundcast.id}/rank`).set(rank.toFixed(4));
        });
      });
    });
  });

  var detectSubscriptionsExpiration = schedule.scheduleJob('* * 23 * * *', function() {
    console.log('job2');
    const currentDate = Date.now();
    let users = [];
    firebase.database().ref('users').once('value').then(snapshots => {
      snapshots.forEach(snapshot => {
        if (snapshot) {
          const user =  Object.assign({id: snapshot.key}, snapshot.val());
          if (user.soundcasts) {
            Object.keys(user.soundcasts).forEach(key => {
              const soundcast = user.soundcasts[key];
              if (soundcast.current_period_end < currentDate && soundcast.billingCycle !== 'free') {
                if (soundcast.billingCycle && soundcast.subscribed) {
                  firebase.database().ref(`users/${user.id}/soundcasts/${key}/subscribed`).set(false);
                  firebase.database().ref(`soundcasts/${key}/subscribed/${user.id}`).remove();
                }
              }
            });
          }
        }
      });
    });
  });
};
