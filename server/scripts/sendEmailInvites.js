'use strict';

var sendinblue = require('sendinblue-api');
var sendinBlueApiKey = require('../../config').sendinBlueApiKey;

var parameters = {'apiKey': sendinBlueApiKey, 'timeout': 5000};
var sendinObj = new sendinblue(parameters);

module.exports.sendListenerInvites = (req, res) => {
  var {invitees, soundcastTitle, adminName} = req.body;

  var _promises = invitees.map(invitee => {
    var input = {'to': {[invitee]: ''},
      'from': ['support@mysoundwise.com', 'Soundwise'],
      'subject': `${adminName} invited you to join ${soundcastTitle} soundcast`,
      'html': `<p>Hi there!</p><p></p><p>This is an invitation for you to join the ${soundcastTitle} soundcast. Start by download the Soundwise app <a href="https://mysoundwise.com">here</a>.</p><p></p><p>The Soundwise Team</p>`,
    };

    sendinObj.send_email(input, function(err, response) {
      if (err) {
        Promise.reject(err);
      } else {
        return response;
      }
    });
  });

  Promise.all(_promises).then(
    response => {
      console.log('completed email invitations');
      res.send(response);
    },
    err => {
      console.log('failed to complete sending email invitations');
      res.send(err);
    }
  );
};

