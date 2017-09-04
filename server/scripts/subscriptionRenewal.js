'use strict';

var admin = require("firebase-admin");

module.exports.subscriptionRenewal = (req, res) => {
  console.log('req.data: ', req.data);

  if (req.data.object.lines.data[0].period.end) {
    const customer = req.data.object.customer;
    const db = admin.database();
    const ref = db.ref('users');
    ref.orderByChild('stripe_id').equalTo(customer)
      .on('value', snapshot => {
        const userId = snapshot.key;
        db.ref(`users/${userId}/soundcasts`).orderByChild('planID').equalTo(req.data.object.lines.data[0].plan.id)
          .on('value', snapshot => {
            const soundcast = snapshot.key;
            db.ref(`users/${userId}/soundcasts/${soundcast}/current_period_end`)
              .set(req.data.object.lines.data[0].period.end);
          });
      });
    res.status(200).send({});
  }
};