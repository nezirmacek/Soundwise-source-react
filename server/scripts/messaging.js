'use strict';
var admin = require('firebase-admin');

module.exports.sendNotification = (req, res) => {
  var registrationTokens = req.body.registrationTokens;
  var payload = req.body.payload;
  var options = {
    priority: 'high',
  };
  console.log('registrationTokens==> ', registrationTokens);
  console.log('payload==> ', payload);
  admin
    .messaging()
    .sendToDevice(registrationTokens, payload, options)
    .then(function(response) {
      // See the MessagingDevicesResponse reference documentation for
      // the contents of response.
      console.log('Successfully sent message:', response);
      res.send(response);
    })
    .catch(function(error) {
      console.log('Error sending message:', error);
      res.status(500).send(error);
    });
};
