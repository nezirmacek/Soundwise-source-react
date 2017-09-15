var stripe_key =  require('../../config').stripe_key;

var stripe = require('stripe')(stripe_key);

module.exports.handlePayment = (req, res) => {
// create customer: to be used in real version
  if (!req.body.customer) {
      stripe.customers.create({
        email: req.body.receipt_email,
        source: req.body.source,
      })
      .then(customer => {
        return stripe.charges.create({
            amount: req.body.amount,
            currency: 'usd',
            customer: customer.id,
            description: req.body.description,
            statement_descriptor: req.body.statement_descriptor,
          }, (err, charge) => {
            if (err) {
              console.log(err);
              return res.status(err.raw.statusCode).send(err.raw.message);
            }
            res.send(charge);
          });
      });
  } else {
      console.log('customer: ', req.body.customer);
        stripe.charges.create({
          amount: req.body.amount,
          currency: 'usd',
          customer: req.body.customer,
          description: req.body.description,
          statement_descriptor: req.body.statement_descriptor,
        }, (err, charge) => {
          if (err) {
            console.log(err);
            return res.status(err.raw.statusCode).send(err.raw.message);
          }
          res.send(charge);
        });
  }
};

module.exports.handleRecurringPayment = (req, res) => {
  stripe.plans.retrieve(
    req.body.planID,
    (err, plan) => {
      if (err) { // if payment plan doesn't already exist, create a new plan
        let interval_count = 1;
        if (req.body.billingCycle == 'quarterly') {
          interval_count = 3;
        }
        if (req.body.billingCycle == 'annual') {
          interval_count = 12;
        }
        stripe.plans.create({
          amount: req.body.amount,
          interval: 'month',
          interval_count,
          name: req.body.description,
          currency: 'usd',
          id: req.body.planID,
        }, (err, plan) => {
             if (plan) {
              console.log('new plan created: ', plan);
              if(req.body.customer) { // if customer's stripe id already exists, sign this customer up for the plan
                stripe.subscriptions.create({
                  customer: req.body.customer,
                  items: [
                    {
                      plan: plan.id,
                    },
                  ],
                }, (err, subscription) => {
                  if (err) {
                    console.log(err);
                    return res.status(err.raw.statusCode).send(err.raw.message);
                  }
                  res.send(subscription);
                });
              } else { // if customer doesn't exist, create customer and then charge
                stripe.customers.create({
                    email: req.body.receipt_email,
                    source: req.body.source,
                  }, (err, customer) => {
                        stripe.subscriptions.create({
                          customer: customer.id,
                          items: [
                            {
                              plan: plan.id,
                            },
                          ],
                        }, (err, subscription) => {
                          if (err) {
                            console.log(err);
                            return res.status(err.raw.statusCode).send(err.raw.message);
                          }
                          res.send(subscription);
                        });
                });
              }
             }
        });
      }

      if(req.body.customer) { // if customer's stripe id already exists, sign this customer up for the plan
        stripe.subscriptions.create({
          customer: req.body.customer,
          items: [
            {
              plan: plan.id,
            },
          ],
        }, (err, subscription) => {
          if (err) {
            console.log(err);
            return res.status(err.raw.statusCode).send(err.raw.message);
          }
          res.send(subscription);
        });
      } else { // if customer doesn't exist, create customer and then charge
        console.log('email from frontend: ', req.body.receipt_email);
        stripe.customers.create({
            email: req.body.receipt_email,
            source: req.body.source,
          }, (err, customer) => {
                if(err) {
                  console.log('error: ', err);
                }
                console.log('customer: ', customer);
                stripe.subscriptions.create({
                  customer: customer.id,
                  items: [
                    {
                      plan: plan.id,
                    },
                  ],
                }, (err, subscription) => {
                  if (err) {
                    console.log(err);
                    return res.status(err.raw.statusCode).send(err.raw.message);
                  }
                  res.send(subscription);
                });
        });
      }
    }
  );
};


