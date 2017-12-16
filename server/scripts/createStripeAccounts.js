'use strict';
var stripe_key =  require('../../config').stripe_key;
var request = require('request-promise');
var firebase = require('firebase-admin');

module.exports.createStripeAccount = (req, res) => {
  let formData = {
    client_secret: stripe_key,
    code: req.body.code,
    grant_type: 'authorization_code',
  };
  request.post('https://connect.stripe.com/oauth/token', {form: formData})
  .then(response => {
    firebase.database().ref(`publishers/${req.body.publisherId}/stripe_user_id`).set(JSON.parse(response).stripe_user_id)
    .catch(err => console.log(err));
    res.send(response);
  })
  .catch(error => {
    console.log(error);
    res.send(error);
  });
};
