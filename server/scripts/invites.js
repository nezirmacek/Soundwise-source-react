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
            .database()
            .ref(`invitations/${_email}`)
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
                  .ref(`invitations/${_email}`)
                  .update(update);
              } else {
                firebase
                  .database()
                  .ref(`invitations/${_email}/${soundcastId}`)
                  .set(true);
              }
            });
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

module.exports = { sendInvite };
