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
  const customers = createCustomer(req)
  .then(customers => {
    console.log('customers: ', customers);
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
                  metadata: {
                    platformCustomer: customers.platformCustomer,
                  },
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
            metadata: {
              platformCustomer: customers.platformCustomer,
            },
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
  })
  .catch(err => {
    console.log(err);
    return res.status(500).send(err);
  });
};

module.exports.retrieveCustomer = (req, res) => {
  // console.log('stripe_id: ', req);
  stripe.customers.retrieve(
    req.query.stripe_id,
    (err, customer) => {
      if (err) {
        console.log(err);
        return res.status(err.raw.statusCode).send(err.raw.message);
      }
      // console.log('customer: ', customer);
      res.send({customer});
    }
  );
};

module.exports.updateCreditCard = (req, res) => {
  const {source, customer, email} = req.body;
  // console.log('source: ', source);
  if (customer) { // if it's existing customer
    stripe.customers.update(customer, {
      source,
    })
    .then(response => {
      // console.log(response);
      res.send(response);
    })
    .catch(err => {
      console.log('err: ', err);
      return res.status(500).send(err.message);
    });
  } else if (email) { // if it's a new customer
    stripe.customers.create({
      email,
      source,
      description: `platform customer from ${email}`,
    })
    .then(response => {
      res.send(response);
    })
    .catch(err => {
      console.log('err: ', err);
      return res.status(500).send(err.message);
    });
  }
};

function createCustomer(req) {
  return new Promise((resolve, reject) => {
    console.log('req.body.customer: ', req.body.customer);
    if(req.body.customer) { // if customer exists on platform, create token using customer, an then create customer using token on connected account
      stripe.tokens.create({ // create token from platform customer
        customer: req.body.customer,
      }, {
        stripe_account: req.body.stripe_user_id,
      }, (err, token) => {
        if(err) {
          return reject(err);
        }
        stripe.customers.create({
          description: req.body.customer.receipt_email,
          source: token.id,
        }, {
          stripe_account: req.body.stripe_user_id,
        }, (err, customer) => {
          if(err) {
            return reject(err);
          }
          return resolve({
              platformCustomer: req.body.customer,
              connectedCustomer: customer.id,
          });
        });
      });
    } else { // if platform customer doesn't exist
      let platformCustomer;
      stripe.customers.create({ // first create customer on platform
        email: req.body.receipt_email,
        source: req.body.source,
        description: `platform customer from ${req.body.receipt_email}`,
      }, (err, customer) => {
        if (err) {
          console.log(err);
          return reject(err);
        }
        console.log('new platformCustomer: ', customer.id);
        platformCustomer = customer.id;
        stripe.tokens.create({
          customer: customer.id,
        }, {
          stripe_account: req.body.stripe_user_id,
        }, (err, token) => {
          if(err) {
            console.log(err);
            return reject(err);
          }
          console.log('token: ', token.id);
          stripe.customers.create({
            source: token.id,
            description: req.body.receipt_email,
          }, {
            stripe_account: req.body.stripe_user_id,
          }, (err, customer) => {
            if (err) {
              console.log(err);
              return reject(
                {
                  platformCustomer,
                  connectedCustomer: null,
                }
              );
            }
            console.log('customer: ', {
              platformCustomer,
              connectedCustomer: customer.id,
            });
            return resolve(
              {
                platformCustomer,
                connectedCustomer: customer.id,
              }
            );
          });
        });
      });
    }
  });
};




