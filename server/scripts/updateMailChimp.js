'use strict';
var Mailchimp = require('mailchimp-api-v3')
var firebase = require('firebase-admin');

module.exports.updateMailChimp = (req, res) => {
  if(req.body.apiKey != '') {
    var mailchimp = new Mailchimp(req.body.apiKey);
    mailchimp.get('/lists')
    .then(function(results) {
      var emailList = results.lists.map((list) => {
          return ({
            id: list.id,
            name: list.name
          })
      })

      var mailChimp = {
        apiKey : req.body.apiKey,
        list : emailList
      }      
      
      firebase
      .database()
      .ref(`publishers/${req.body.publisherId}`)
      .update({mailChimp: mailChimp})
      .then(() => {
        res.sendStatus(200);
      }) 
    }) 
    .catch(function (err) {
      console.log("Failure getting the mailchimp lists ", err);
      res.sendStatus(404);
    })  
  }
};
