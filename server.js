require('dotenv').config()
var express = require('express')
var handlePayment = require('./server/payment.js').handlePayment

var bodyParser = require('body-parser')
var path = require('path')
// var jwt = require('express-jwt')


//------------Express server-------------------
var app = express()
app.use(bodyParser.json())
app.use(express.static(__dirname + '/client'))
app.use('/scripts', express.static(__dirname + '/node_modules'))

//let front end handle all page routing except the initial page
app.get('*', function (request, response){
  response.sendFile(path.resolve(__dirname+'/client/index.html'))
})

app.listen((process.env.PORT || 8080), function() {
  console.log('listening on port: ', process.env.PORT || 8080)
})

app.post('/api/charge', handlePayment)

