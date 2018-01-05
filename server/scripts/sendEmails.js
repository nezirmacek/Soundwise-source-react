'use strict';
var Raven = require('raven');
// var sendinblue = require('sendinblue-api');
// var sendinBlueApiKey = require('../../config').sendinBlueApiKey;
var firebase = require("firebase-admin");

// var parameters = {'apiKey': sendinBlueApiKey, 'timeout': 5000};
// var sendinObj = new sendinblue(parameters);
var emailTemplate = require('./helpers/emailTemplate').emailTemplate;
var marketingEmailTemplate = require('./helpers/marketingEmailTemplate').marketingEmailTemplate;

var sgMail = require('@sendgrid/mail');
var sendGridApiKey = require('../../config').sendGridApiKey;
sgMail.setApiKey(sendGridApiKey);
var client = require('@sendgrid/client');
client.setApiKey(sendGridApiKey);

const sendTransactionalEmails = (req, res) => {
  var content = emailTemplate(req.body.publisherName, req.body.publisherImage, req.body.content);
  var email = req.body.publisherEmail ? req.body.publisherEmail : 'support@mysoundwise.com';
  var name = req.body.publisherName ? req.body.publisherName : 'Soundwise';
  // console.log('req.body.content: ', req.body.content);
  // console.log('compiled content: ', content);
  var _promises = req.body.invitees.map(invitee => {
    var msg = {
      to: invitee,
      from: email,
      subject: req.body.subject,
      html: content,
    };
    return sgMail.send(msg)
    .then(response => {
      return response;
    })
    .catch(err => {
      console.log(err.toString());
      Promise.reject(err);
      Raven.captureException(err.toString());
    });
  });

  Promise.all(_promises).then(
    response => {
      console.log('completed email invitations.');
      res.send(response);
    },
    err => {
      console.log('failed to complete sending email invitations');
      res.status(400).send(err.message);
    }
  );
};

const addToEmailList = (req, res) => {
  // req.body: {soundcastId: [string], emailListId: [number], emailAddressArr: [array]}
  const {soundcastId, emailListId, emailAddressArr} = req.body;
  let recipients;
  const emails = emailAddressArr.map(email => {
    return {
      email,
    };
  });
  const options = {
    method: 'POST',
    url: '/v3/contactdb/recipients',
    body: emails,
  };
  client.request(options)
  .then(([response, body]) => {
    // console.log(response.body);
    recipients = body.persisted_recipients; // array of recipient IDs
    if (emailListId) { // if list already exists, add recipients to list
      const data = {
        method: 'POST',
        url: `/v3/contactdb/lists/${emailListId}/recipients`,
        body: recipients,
      };
      client.request(data)
      .then(([response, body]) => {
        res.status(200).send({emailListId});
      })
      .catch(err => {
        console.log('error: ', err.message);
        res.status(400).send(err.message);
      });
    } else { // if list doesn't exist, create list and then add recipients
      let listId;
      const data1 = {
        method: 'POST',
        url: '/v3/contactdb/lists',
        body: {'name': `${soundcastId}-list`},
      };
      // console.log('data1: ', data1);
      client.request(data1)
      .then(([response, body]) => {
        listId = body.id;
        console.log('listId: ', listId);
        return listId;
      })
      .then(listId => {
        const data2 = {
          method: 'POST',
          url: `/v3/contactdb/lists/${listId}/recipients`,
          body: recipients,
        };
        client.request(data2)
        .then(([response, body]) => { // save listId in firebase
          firebase.database().ref(`soundcasts/${soundcastId}/emailListId`)
          .set(listId);
        })
        .then(() => {
          res.status(200).send({emailListId: listId});
        })
        .catch(err => {
          console.log('error: ', err.message);
          res.status(400).send(err.message);
        });
      })
      .catch(err => {
        console.log('error: ', err.message);
        res.status(400).send(err.message);
      });
    }
  });
};

const deleteFromEmailList = (req, res) => {
  // req.body: {emails: [array], emailListId: [string]}
  const promises = req.body.emails.map(email => {
    const request = {};
    const queryParams = {
      'email': email,
    };
    request.qs = queryParams;
    request.method = 'GET';
    request.url = '/v3/contactdb/recipients/search';
    return client.request(request)
            .then(([response, body]) => {
              const id = body.recipients[0].id;
              client.request({
                method: 'DELETE',
                url: `/v3/contactdb/lists/${req.body.emailListId}/recipients/${id}`,
              });
            })
            .catch(err => {
              Promise.reject(err);
            });
  });
  Promise.all(promises)
  .then(() => {
    res.status(200).send({});
  })
  .catch(err => {
    res.status(400).send(err.message);
  });
};

const sendMarketingEmails = (req, res) => {
  // req.body: {publisherName: [string], publisherImage: [string], content: [string], publisherEmail: [string], subject: [string], listIds: [array of strings], unsubscribeGroup: [number]}
  // console.log('req.body: ', req.body);
  var content = emailTemplate(req.body.publisherName, req.body.publisherImage, req.body.content);
  var email = req.body.publisherEmail ? req.body.publisherEmail : 'support@mysoundwise.com';
  var content = marketingEmailTemplate(req.body.publisherName, req.body.publisherImage, req.body.content);

  const requestBody = {
    title: req.body.subject.slice(0, 100),
    subject: req.body.subject,
    list_ids: req.body.listIds, // array
    html_content: content,
    suppression_group_id: req.body.unsubscribeGroup,
    status: 'Draft',
    sender_id: 204129,
  };
  const options = {
    method: 'POST',
    url: '/v3/campaigns',
    body: requestBody,
  };
  client.request(options)
  .then(([response, body]) => {
    const campaignId = body.id;
    // console.log('response body: ', body);
    client.request({
      method: 'POST',
      url: `/v3/campaigns/${campaignId}/schedules/now`,
    })
    .then(([response, body]) => {
      res.status(200).send({campaignId});
    })
    .catch(err => {
      console.log('error sending campaign: ', err.message);
      res.status(400).send(err.message);
    });
  })
  .catch(err => {
    console.log('error creating campaign: ', err.message);
    res.status(400).send(err.message);
  });
};

module.exports = {
  sendTransactionalEmails,
  addToEmailList,
  deleteFromEmailList,
  sendMarketingEmails,
};
