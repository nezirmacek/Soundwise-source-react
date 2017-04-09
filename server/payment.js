var stripe_key =  require('../config').stripe_key

var stripe = require('stripe')(stripe_key)

module.exports.handlePayment = (req, res) => {
// create customer: to be used in real version

  // stripe.customers.create({
  //   email: req.receipt_email,
  //   source: req.source
  // })
  // .then(customer => {
  //   return stripe.charges.create({
  //       amount: req.amount,
  //       currency: 'usd',
  //       customer: customer.id,
  //       description: req.description,
  //       statement_descriptor: 'Soundwise Audio Course'
  //     }, (err, charge) => {
  //       if(err) {
  //         console.log(err)
  //         return res.status(err.raw.statusCode).send(err.raw.message)
  //       }
  //       var returnInfo = Object.assign({}, charge, {stripeId: customer.id})
  //       res.send(returnInfo)
  //     })
  // })

// create single charge:
      stripe.charges.create(req.body, (err, charge) => {
         if(err) {
           console.log(err)
           return res.status(err.raw.statusCode).send(err.raw.message)
         }
         res.send(charge)
       })

}

