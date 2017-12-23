'use strict';

var sendinblue = require('sendinblue-api');
var sendinBlueApiKey = require('../../config').sendinBlueApiKey;

var parameters = {'apiKey': sendinBlueApiKey, 'timeout': 5000};
var sendinObj = new sendinblue(parameters);
var emailTemplate = require('./helpers/emailTemplate').emailTemplate;

module.exports.sendListenerInvites = (req, res) => {
  // console.log('invitees: ', req.body.invitees);
  var content = emailTemplate(req.body.publisherName, req.body.publisherImage, req.body.content);
  // console.log('req.body.content: ', req.body.content);
  // console.log('compiled content: ', content);
  var _promises = req.body.invitees.map(invitee => {
    var input = {'to': {[invitee]: ''},
      'from': ['support@mysoundwise.com', 'Soundwise'],
      'subject': req.body.subject,
      'html': content,
    };

    sendinObj.send_email(input, function(err, response) {
      if (err) {
        console.log('email error: ', err);
        Promise.reject(err);
      } else {
        // console.log('email sent to: ', invitee);
        return response;
      }
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

