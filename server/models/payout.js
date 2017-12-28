'use strict';

const firebase = require('firebase-admin');
const moment = require('moment');
const sendinblue = require('sendinblue-api');
const sendinBlueApiKey = require('../../config').sendinBlueApiKey;

module.exports = function(Payout) {
  Payout.handlePayoutWebhookEvents = function(data, cb) {
    console.log('handlePayoutWebhookEvents request body: ', data);
    const ref = firebase.database().ref('publishers');
    let publisherId = null;
    ref.orderByChild('stripe_user_id').equalTo(data.account).on('value', (snapshot) => {
      snapshot.forEach(data => {
        publisherId = data.key;
      });
      if (publisherId) {
        switch (data.type) {
          case 'payout.paid':
            // write payout date to Payout table
            if (data.data.object.id) {
              const payout = {
                batchId: data.data.object.id,
                amount: data.data.object.amount,
                date: data.data.object.arrival_date,
                publisherId,
                email: snapshot.val()[publisherId].email ? snapshot.val()[publisherId].email : snapshot.val()[publisherId].paypalEmail,
                payoutId: data.data.object.id,
                createdAt: moment().utc().format(),
                updatedAt: moment().utc().format(),
              };
              console.log('new payout data: ', payout);

              Payout.create(payout)
              .then(res => {
                return cb(null, res);
              })
              .catch(err => {
                return cb(err);
              });
            }
            break;
          case 'payout.failed':
            // aleart administrator that payout failed
            emailAdmin(Object.assign({}, data, {publisherId}), cb);
            break;
          default:
            return cb(null, {});
        }
      }
    });
  };

  Payout.remoteMethod(
    'handlePayoutWebhookEvents',
    {
      http: {
        path: '/handlePayoutWebhookEvents',
        verb: 'post',
        status: 200,
        errorStatus: 400,
      },
      description: ['handle payout webhook events from stripe'],
      notes: 'it accepts payout event data',
      accepts: {
        arg: 'data',
        type: 'object',
        http: {source: 'body'},
        required: true,
      },
      returns: {type: 'object', root: true},
    }
  );
};

function emailAdmin(data, cb) {
  const parameters = {'apiKey': sendinBlueApiKey, 'timeout': 5000};
  const sendinObj = new sendinblue(parameters);
  const input = {'to': {['natasha@mysoundwise.com']: 'Natasha Che'},
    'from': ['support@mysoundwise.com', 'Soundwise'],
    'subject': `There is a problem with payout
    ${data.data.object.id} for ${data.publisherId}`,
    'html': `<p>Webhook notice from Stripe:</p>
      <div>${JSON.stringify(data)}</div>`,
  };

  sendinObj.send_email(input, function(err, response) {
    if (err) {
      console.log('email admin error: ', err);
      return cb(null, {});
    } else {
      // console.log('email sent to: ', invitee);
      return cb(null, {});
    }
  });
};
