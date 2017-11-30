'use strict';

const moment = require('moment');
const sendinblue = require('sendinblue-api');
const sendinBlueApiKey = require('../../config').sendinBlueApiKey;

module.exports = function(Payout) {
  Payout.handlePaypalWebhookEvents = function(data, cb) {
    console.log('request body: ', data);

    switch (data.event_type) {
      case 'PAYMENT.PAYOUTS-ITEM.SUCCEEDED':
        // write payout date to Payout table
        if (data.resource.payout_item_id) {
          const payout = {
            batchId: data.resource.payout_batch_id,
            amount: data.resource.payout_item.amount,
            date: data.create_time,
            publisherId: data.resource.payout_item.sender_item_id,
            email: data.resource.payout_item.receiver,
            payoutId: data.resource.payout_item_id,
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
      case 'PAYMENT.PAYOUTS-ITEM.FAILED':
        // aleart administrator that payout failed
        emailAdmin(data, cb);
        break;
      case 'PAYMENT.PAYOUTS-ITEM.BLOCKED':
        emailAdmin(data, cb);
        break;
      case 'PAYMENT.PAYOUTS-ITEM.DENIED':
        emailAdmin(data, cb);
        break;
      case 'PAYMENT.PAYOUTS-ITEM.UNCLAIMED':
        emailAdmin(data, cb);
        break;
      default:
        return cb(null, {});
    }
  };

  Payout.remoteMethod(
    'handlePaypalWebhookEvents',
    {
      http: {
        path: '/handlePaypalWebhookEvents',
        verb: 'post',
        status: 200,
        errorStatus: 400,
      },
      description: ['handle stripe webhook events'],
      notes: 'it accepts stripe event data',
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
    'subject': `There is a problem with payout item
      ${data.resource.payout_item_id}`,
    'html': `<p>Webhook notice from Paypal:</p>
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
