// step 1: retrieve all transaction data for previous month from database.
// step 2: loop through transactions data, compile an object of publisher IDs with total payout amount to each publisher.
// step 3: retrieve paypal email for each publisher from firebase.
// step 4: create one batch payout for each publisher.
// step 5: set up webhook to listen to batch payout success/failure events.
// step 6: write payout data into Payouts table when a batch payout succeeds; send an email to alert administrator if a batch payout fails.

'use strict';
const schedule = require('node-schedule');
const firebase = require('firebase-admin');
const moment = require('moment');
const database = require('../../database/index');

module.exports = function(app) {
  var rankSoundcasts = schedule.scheduleJob('* * 1 * * 1', function() {
    const currentDate = moment().format('X');
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
    const usersRef = firebase.database().ref('/users');
    let currentDate = moment().format('X');
    firebase.database().ref('/users').once('value', snapshotArray => {
      snapshotArray.forEach(snapshot => {
        const userId = snapshot.key;
        const tokenId = snapshot.val().token ? snapshot.val().token[0] : null;
        const soundcasts = snapshot.val().soundcasts;
        if (userId != 'undefined' && soundcasts) {
          Object.keys(soundcasts).forEach(key => {
            if (key != 'undefined') {
              const soundcast = soundcasts[key];
              if (Number(soundcast.current_period_end) < currentDate && soundcast.subscribed) {
                if (soundcast.billingCicle != 'free') {
                  firebase.database().ref(`users/${userId}/soundcasts/${key}/subscribed`).set(true);
                  if (tokenId) {
                    firebase.database().ref(`soundcasts/${key}/subscribed/${userId}`).set({'0': tokenId});
                  } else {
                    firebase.database().ref(`soundcasts/${key}/subscribed/${userId}`).set(soundcast.date_subscribed);
                  }
                }
              }
            }
          });
        }
      });
    });
  });
};
