'use strict';
var Mailchimp = require('mailchimp-api-v3')
var firebase = require('firebase-admin');


module.exports.addSubscriberMailChimp = (req, res) => {

  // Just in case the client does not send the first or last names
  // As the endpoint could be called from mobile too.
  let firstName = req.body.user.firstName ? req.body.user.firstName : '';
  let lastName = req.body.user.lastName ? req.body.user.lastName : '';
  let email = req.body.user.email;

  //Lets get the mailChimp API key using the publisherID from firebase.
  firebase
    .database()
    .ref('publishers/' + req.body.publisherId + '/mailChimp')
    .once('value')
    .then(snapshot => {
      
      let mailChimpData = snapshot.val()
      if (mailChimpData == null) {
        //No API ket, just return quietly
        res.sendStatus(200);
      } else {
        let apiKey = mailChimpData.apiKey;
        if(apiKey != '') {
          var mailchimp = new Mailchimp(apiKey);
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
            //We send a 200 if the user is already in the list, nothing to be alarmed of.
            console.log("Error adding user: ", error)
            res.sendStatus(200);
          })
        } else {
          //We send a 404 if the apiKey is not found.
          console.log("Api key not found. ")
          res.sendStatus(404);
        }    
      }
    })
    .catch(function (err) {
      //We send a 404 if the firebase request failed.
      console.log("Firebase request failed. ")
      res.sendStatus(404);
    })  
};
