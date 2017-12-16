var stripe_key =  require('../../config').stripe_key;

var stripe = require('stripe')(stripe_key);

const soundwiseFeePercent = 0;

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
  // first create customer on connected account
  const customers = createCustomer(req);
  stripe.plans.retrieve( // ***** need to confirm the code for retrieving connected plan ??????
    req.body.planID, {
      stripe_account: req.body.stripe_user_id,
    }, (err, plan) => {
      if (err) { // if payment plan doesn't already exist, create a new plan
        let interval_count = 1;
        if (req.body.billingCycle == 'quarterly') {
          interval_count = 3;
        }
        if (req.body.billingCycle == 'annual') {
          interval_count = 12;
        }
        stripe.plans.create({ // create a plan on connected account
          // ***** need to confirm the code for creating connected plan ???????
          amount: Number(req.body.amount).toFixed(),
          interval: 'month',
          interval_count,
          name: req.body.description,
          currency: 'usd',
          id: req.body.planID,
        }, {
          stripe_account: req.body.stripe_user_id,
        }, (err, plan) => {
             if (plan) {
              console.log('new plan created: ', plan);
              stripe.subscriptions.create({
                customer: customers.connectedCustomer,
                application_fee_percent: soundwiseFeePercent,
                items: [
                  {
                    plan: plan.id,
                  },
                ],
              }, {
                stripe_account: req.body.stripe_user_id,
              }, (err, subscription) => {
                if (err) {
                  console.log(err);
                  return res.status(err.raw.statusCode).send(err.raw.message);
                }
                res.send(Object.assign({}, subscription, customers));
              });
             }
        });
      } else {
        stripe.subscriptions.create({
          customer: customers.connectedCustomer,
          application_fee_percent: soundwiseFeePercent,
          items: [
            {
              plan: plan.id,
            },
          ],
        }, {
          stripe_account: req.body.stripe_user_id,
        }, (err, subscription) => {
          if (err) {
            console.log(err);
            return res.status(err.raw.statusCode).send(err.raw.message);
          }
          res.send(Object.assign({}, subscription, customers));
        });
      }
    }
  );
};

const createCustomer = req => {
  if(req.body.customer) { // if customer exists on platform, create token using customer, an then create customer using token on connected account
    stripe.tokens.create({ // create token from platform customer
      customer: req.body.customer,
    }, {
      stripe_account: req.body.stripe_user_id,
    })
    .then(token => { // create connected account customer from token
      stripe.customers.create({
        description: `connected customer from ${req.body.customer}`,
        source: token,
      }, {
        stripe_account: req.body.stripe_user_id,
      }, (err, customer) => {
        if (err) {
          return {
            platformCustomer: req.body.customer,
            connectedCustomer: null,
          };
        }
        return {
          platformCustomer: req.body.customer,
          connectedCustomer: customer,
        };
      });
    });
  } else { // if platform customer doesn't exist
    let platformCustomer;
    stripe.customers.create({ // first create customer on platform
      email: req.body.receipt_email,
      source: req.body.source,
      description: `platfrom customer from ${req.body.receipt_email}`,
    })
    .then(customer => { // then create token from platform customer
      platformCustomer = customer;
      stripe.tokens.create({
        customer: customer,
      }, {
        stripe_account: req.body.stripe_user_id,
      })
      .then(token => { return token; });
    })
    .then(token => { // create connected customer from token
      stripe.customers.create({
        source: token,
        description: `connected customer from ${req.body.customer}`,
      }, {
        stripe_account: req.body.stripe_user_id,
      }, (err, customer) => {
        if (err) {
          return {
            platformCustomer,
            connectedCustomer: null,
          };
        }
        return {
          platformCustomer,
          connectedCustomer: customer,
        };
      });
    });
  }
};

