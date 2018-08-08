'use strict';

var moment = require('moment');
var firebase = require('firebase-admin');
const convertToRaw = require('draft-js').convertToRaw;

const sendInvite = async (req, res) => {
  const { inviteeArr, soundcastId, invitation } = req.body;
  inviteeArr.map(async email => {
    let _email = email
      .replace(/\./g, '(dot)')
      .trim()
      .toLowerCase();
    if (_email) {
      await firebase
        .database()
        .ref(`soundcasts/${soundcastId}/invited/${_email}`)
        .set(moment().format('X')) //invited listeners are different from subscribers. Subscribers are invited listeners who've accepted the invitation and signed up via mobile app
        .then(() => {
          firebase
            .auth()
            .getUserByEmail(_email)
            .then(u => subscibeUser(u.uid, soundcastId))
            .catch(e => addInvitations(soundcastId, _email));
        });
      await firebase
        .database()
        .ref(`soundcasts/${soundcastId}/invitationEmail`)
        .set(JSON.stringify(convertToRaw(invitation)))
        .catch(err => console.log('Error: ===>', err));
    }
  });
  res.send({ status: 'OK' });
};

const addInvitations = (soundcastId, email) => {
  firebase
    .database()
    .ref(`invitations/${email}`)
    .once('value')
    .then(snapshot => {
      if (snapshot.val()) {
        const update = Object.assign(
          {},
          { [soundcastId]: true },
          snapshot.val()
        );
        firebase
          .database()
          .ref(`invitations/${email}`)
          .update(update);
      } else {
        firebase
          .database()
          .ref(`invitations/${email}/${soundcastId}`)
          .set(true);
      }
    });
};

const subscibeUser = (userId, soundcastId) => {
  firebase
    .database()
    .ref(`users/${userId}`)
    .once('value')
    .then(snap => {
      const user = snap.val();
      firebase
        .database()
        .ref(`soundcasts/${soundcastId}/subscribed/${userId}`)
        .set([{ 0: user.token[0] }]);
      firebase
        .database()
        .ref(`users/${userId}/soundcasts/${soundcastId}`)
        .set({
          billingCycle: 'one time',
          current_period_end: '4687857936',
          date_subscribed: moment.format('X'),
          subscribed: true,
        });
    });
};

module.exports = { sendInvite };
