var stripe_key =  require('../config').stripe_key

var stripe = require('stripe')(stripe_key)

module.exports.handlePayment = (req, res) => {

  stripe.charges.create(req.body, (err, charge) => {
    if(err) {
      console.log(err)
      return res.status(err.raw.statusCode).send(err.raw.message)
    }
    res.send(charge)
  })
}

