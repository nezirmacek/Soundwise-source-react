'use strict';
var Raven = require('raven');
var sendinblue = require('sendinblue-api');
var sendinBlueApiKey = require('../../config').sendinBlueApiKey;

var parameters = {'apiKey': sendinBlueApiKey, 'timeout': 5000};
var sendinObj = new sendinblue(parameters);
var emailTemplate = require('./helpers/emailTemplate').emailTemplate;

var sgMail = require('@sendgrid/mail');
var sendGridApiKey = require('../../config').sendGridApiKey;
sgMail.setApiKey(sendGridApiKey);

module.exports.sendTransactionalEmails = (req, res) => {
  // console.log('invitees: ', req.body.invitees);
  var content = emailTemplate(req.body.publisherName, req.body.publisherImage, req.body.content);
  var email = req.body.publisherEmail ? req.body.publisherEmail : 'support@mysoundwise.com';
  var name = req.body.publisherName ? req.body.publisherName : 'Soundwise';
  // console.log('req.body.content: ', req.body.content);
  // console.log('compiled content: ', content);
  var _promises = req.body.invitees.map(invitee => {
    // var input = {'to': {[invitee]: ''},
    //   'from': [email, name],
    //   'subject': req.body.subject,
    //   'html': content,
    // };

    // sendinObj.send_email(input, function(err, response) {
    //   if (err) {
    //     console.log('email error: ', err);
    //     Promise.reject(err);
    //   } else {
    //     // console.log('email sent to: ', invitee);
    //     return response;
    //   }
    // });

    var msg = {
      to: invitee,
      from: email,
      subject: req.body.subject,
      html: content,
    };
    sgMail.send(msg)
    .then(res => res)
    .catch(err => {
      Promise.reject(err);
      Raven.captureException(err.toString());
    });
  });

  Promise.all(_promises).then(
    response => {
      // console.log('completed email invitations: ', response);
      res.send(response);
    },
    err => {
      console.log('failed to complete sending email invitations');
      res.send(err);
    }
  );
};

