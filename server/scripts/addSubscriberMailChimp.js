'use strict';
var Mailchimp = require('mailchimp-api-v3')

module.exports.addSubscriberMailChimp = (req, res) => {

  // Just in case the client does not send the first or last names
  // As the endpoint could be called from mobile too.
  let firstName = req.body.user.firstName ? req.body.user.firstName : '';
  let lastName = req.body.user.lastName ? req.body.user.lastName : '';
  let email = req.body.user.email;

  if(req.body.apiKey != '') {
    var mailchimp = new Mailchimp(req.body.apiKey);

    mailchimp.post(`/lists/${req.body.listId}/members`, {
      email_address : email,
      status : 'subscribed',
      merge_fields : {
        FNAME: firstName,
        LNAME: lastName
      }
    })
    .then(function(results) {
      res.sendStatus(200);
    })
    .catch(function (err) {
      res.sendStatus(404);
    })
  } else {
    res.sendStatus(404);
  }
};
