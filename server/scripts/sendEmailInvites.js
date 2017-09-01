'use strict';

var sendinblue = require('sendinblue-api');
var sendinBlueApiKey = require('../../config').sendinBlueApiKey;

var parameters = {'apiKey': sendinBlueApiKey, 'timeout': 5000};
var sendinObj = new sendinblue(parameters);

module.exports.sendListenerInvites = (req, res) => {
  var _promises = req.body.invitees.map(invitee => {
    var input = {'to': {[invitee]: ''},
      'from': ['support@mysoundwise.com', 'Soundwise'],
      'subject': `${req.body.adminName} invited you to join ${req.body.soundcastTitle} soundcast`,
      'html': `<p>Hi there!</p><p></p><p>This is an invitation for you to join the ${req.body.soundcastTitle} soundcast. Start by download the Soundwise app <a href="https://mysoundwise.com">here</a>.</p><p></p><p>The Soundwise Team</p>`,
    };

    sendinObj.send_email(input, function(err, response) {
      if (err) {
        console.log('email error: ', err);
        Promise.reject(err);
      } else {
        // console.log('email sent: ', response);
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

