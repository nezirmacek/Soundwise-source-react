require('dotenv').config()
var express = require('express')
var handlePayment = require('./server/payment.js').handlePayment

var bodyParser = require('body-parser')
var path = require('path')


//------------Express server-------------------
var app = express()
app.use(bodyParser.json())

// app.use(require('prerender-node').set('prerenderToken', 'XJx822Y4hyTUV1mn6z9k'))

app.use(require('prerendercloud')).set('prerenderToken', 'dXMtd2VzdC0yOjE2MDE0OTIyLTk5MTgtNGY1Yi1hOTQwLTY1MDI2MzYyYTRlNQ.dE2HiZLJmqwNG0aJsAcWqmZHt_iAsV2tcIQQbvs2zPI')

app.use(express.static(__dirname + '/client'))
// app.use('/scripts', express.static(__dirname + '/node_modules'))


//let front end handle all page routing except the initial page
app.get('*', function (request, response){
  response.sendFile(path.resolve(__dirname+'/client/index.html'))
})

app.post('/api/charge', handlePayment)

app.listen((process.env.PORT || 8080), function() {
  console.log('listening on port: ', process.env.PORT || 8080)
})


// some random comment to see if git updates
