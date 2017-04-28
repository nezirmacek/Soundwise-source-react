var stripe_key =  require('../config').stripe_key

var stripe = require('stripe')(stripe_key)

module.exports.handlePayment = (req, res) => {
// create customer: to be used in real version

  if(!req.body.customer) {
      stripe.customers.create({
        email: req.body.receipt_email,
        source: req.body.source
      })
      .then(customer => {
        return stripe.charges.create({
            amount: req.body.amount,
            currency: 'usd',
            customer: customer.id,
            description: req.body.description,
            statement_descriptor: 'Soundwise Audio Course'
          }, (err, charge) => {
            if(err) {
              console.log(err)
              return res.status(err.raw.statusCode).send(err.raw.message)
            }
            res.send(charge)
          })
      })
  } else {
      console.log('customer: ', req.body.customer)
        stripe.charges.create({
          amount: req.body.amount,
          currency: 'usd',
          customer: req.body.customer,
          description: req.body.description,
          statement_descriptor: 'Soundwise Audio Course'
        }, (err, charge) => {
          if(err) {
            console.log(err)
            return res.status(err.raw.statusCode).send(err.raw.message)
          }
          res.send(charge)
        })
  }

// create single charge:
      // stripe.charges.create(req.body, (err, charge) => {
      //    if(err) {
      //      console.log(err)
      //      return res.status(err.raw.statusCode).send(err.raw.message)
      //    }
      //    res.send(charge)
      //  })

}

