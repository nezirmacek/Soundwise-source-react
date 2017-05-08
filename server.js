require('dotenv').config()
var express = require('express')
var handlePayment = require('./server/payment.js').handlePayment
var handleEmailSignup = require('./server/emailSignup.js').handleEmailSignup
var handleReferral = require('./server/emailSignup.js').handleReferral

var bodyParser = require('body-parser')
var path = require('path')

// var request = require('request-promise')

//------------Express server-------------------
var app = express()
app.use(bodyParser.json())

// var prerendercloud = require('prerendercloud')

app.use(require('prerender-node').set('prerenderToken', 'XJx822Y4hyTUV1mn6z9k').set('protocol', 'https'))

//************* prerender.cloud *****************
// prerendercloud.set('prerenderToken', 'dXMtd2VzdC0yOjE2MDE0OTIyLTk5MTgtNGY1Yi1hOTQwLTY1MDI2MzYyYTRlNQ.dE2HiZLJmqwNG0aJsAcWqmZHt_iAsV2tcIQQbvs2zPI')
// prerendercloud.set('enableMiddlewareCache', true)
// prerendercloud.set('middlewareCacheMaxAge', 1000 * 60 * 3) // 3 minutes
// app.use(prerendercloud)
//****************************

app.use(express.static(__dirname + '/client'))
// app.use('/scripts', express.static(__dirname + '/node_modules'))


//let front end handle all page routing except the initial page
app.get('*', function (request, response){
  response.sendFile(path.resolve(__dirname+'/client/index.html'))
})

app.post('/api/charge', handlePayment)
app.post('/api/email_signup', handleEmailSignup)
app.post('/api/referral', handleReferral)

app.listen((process.env.PORT || 8080), function() {
  console.log('listening on port: ', process.env.PORT || 8080)
})

// const options = {
//   method: 'POST',
//   uri: 'https://us7.api.mailchimp.com/3.0/lists/027913fec2/members',
//   auth: {
//     user: 'soundwise',
//     pass: '8ef33347b5ca183fa94a22e6b7302842-us7'
//   },
//   body: {
//     "email_address": "natasha@natashache.com",
//     "status": "subscribed",
//     "merge_fields": {
//         "FNAME": "Natasha",
//         "LNAME": "Che",
//         "MMERGE3": 116
//     }
//   },
//   json: true
// }

// request(options)
//   .then(function (res) {
//     console.log('mailchimp success: ')
//   })
//   .catch(function (err) {
//     console.log('mailchimp failed: ', err)
//   })

// some random comment to see if git updates
