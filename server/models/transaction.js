'use strict';
const moment = require('moment');

module.exports = function(Transaction) {
	Transaction.handleStripeWebhookEvent = function(data, cb) {
		//When recording to database, the soundcast id and publisher id come from the 'plan id' data returned from stripe.
		//because the format of 'plan id' is publisherID-soundcastID-soundcast title-billingCycle-price.
		console.log('request body: ', data);
		
		// let _body = {
		// 	"created": 1326853478,
		// 	"livemode": false,
		// 	"id": "evt_00000000000000",
		// 	"type": "invoice.payment_succeeded",
		// 	"object": "event",
		// 	"request": null,
		// 	"pending_webhooks": 1,
		// 	"api_version": "2017-08-15",
		// 	"data": {
		// 		"object": {
		// 			"id": "in_00000000000000",
		// 			"object": "invoice",
		// 			"amount_due": 2000,
		// 			"application_fee": null,
		// 			"attempt_count": 1,
		// 			"attempted": true,
		// 			"billing": "charge_automatically",
		// 			"charge": "_00000000000000",
		// 			"closed": true,
		// 			"currency": "usd",
		// 			"customer": "cus_00000000000000",
		// 			"date": 1479552851,
		// 			"description": null,
		// 			"discount": null,
		// 			"ending_balance": 0,
		// 			"forgiven": false,
		// 			"lines": {
		// 				"data": [
		// 					{
		// 						"id": "sub_7kS1lODzhN8cWx",
		// 						"object": "line_item",
		// 						"amount": 2000,
		// 						"currency": "usd",
		// 						"description": null,
		// 						"discountable": true,
		// 						"livemode": true,
		// 						"metadata": {},
		// 						"period": {
		// 							"start": 1482144844,
		// 							"end": 1484823244
		// 						},
		// 						"plan": {
		// 							"id": "pt_renew_01",
		// 							"object": "plan",
		// 							"amount": 99,
		// 							"created": 1474890258,
		// 							"currency": "usd",
		// 							"interval": "month",
		// 							"interval_count": 1,
		// 							"livemode": false,
		// 							"metadata": {},
		// 							"name": "pt_renew_01",
		// 							"statement_descriptor": null,
		// 							"trial_period_days": null
		// 						},
		// 						"proration": false,
		// 						"quantity": 1,
		// 						"subscription": null,
		// 						"subscription_item": "si_18RxUBHsaYKYxSMRW7wW8dhm",
		// 						"type": "subscription"
		// 					}
		// 				],
		// 				"has_more": false,
		// 				"object": "list",
		// 				"url": "/v1/invoices/in_19HWU3HsaYKYxSMRjyb5BanT/lines"
		// 			},
		// 			"livemode": false,
		// 			"metadata": {},
		// 			"next_payment_attempt": null,
		// 			"paid": true,
		// 			"period_end": 1479552844,
		// 			"period_start": 1476874444,
		// 			"receipt_number": null,
		// 			"starting_balance": 0,
		// 			"statement_descriptor": null,
		// 			"subscription": "sub_00000000000000",
		// 			"subtotal": 2000,
		// 			"tax": null,
		// 			"tax_percent": null,
		// 			"total": 2000,
		// 			"webhooks_delivered_at": 1479552851
		// 		}
		// 	}
		// };
		
		// need to handle only 2 types of events
		switch (data.type) {
			case 'invoice.payment_succeeded':
				const _transactions = [];
				const _transactionsPromises = [];
				const _errors = [];
				data.data.object.lines.data.map((line, i) => {
					const _transactionData = line.plan.id.split('-');
					
					const _transaction = {
						transactionId: `${data.id}-${i}`, //'charge' or 'refund' id from stripe
						invoiceId: data.data.object.id,
						type: 'charge',
						amount: line.amount / 100,
						date: moment(data.data.object.date * 1000).format('YYYY-MM-DD'),
						publisherId: _transactionData[0],
						soundcastId: _transactionData[1],
						customer: data.data.object.customer, // listener's stripe id
						paymentId: line.plan.id, // id for the payment plan, only present if it's a subscription
						createdAt: moment().utc().format(),
						updatedAt: moment().utc().format(),
					};
					console.log('Try to create transaction: ', _transaction);
					_transactions.push(_transaction);
					_transactionsPromises.push(
						Transaction.create(_transaction)
							.catch(err => {
								_errors.push(_transaction);
								Promise.reject(err);
							})
					);
				});
				Promise.all(_transactionsPromises)
					.then(res => {
						console.log('success create transactions: ', res);
						cb(null, res);
					})
					.catch(err => {
						console.log('ERROR create transactions: ', err);
						// need to delete all created transactions
						_transactions.map(transaction => {
							// TODO: need to find transactions with errors and just remove transactions without errors
							Transaction.find({where: {transactionId: transaction.transactionId}})
								.then(res => {
									if (res.length) {
										const intervalHandler = setInterval(() => {
											Transaction.destroyById(transaction.transactionId, err => {
												if (!err) {
													clearInterval(intervalHandler);
												}
											});
										}, 3600000); // try every hours until success
									}
								});
						});
						cb(err);
					});
				break;
			case 'charge.refunded':
				cb(null, {});
				break;
			default:
				cb(null, {});
		}
	};
	Transaction.remoteMethod(
		'handleStripeWebhookEvent',
		{
			http: {path: '/handleStripeWebhookEvent', verb: 'post', status: 200, errorStatus: 400},
			description: ['handle stripe webhook events'],
			notes: 'it accepts stripe event data',
			accepts: {arg: 'data', type: 'object', http: { source: 'body' }, required: true},
			returns: {type: 'array', root: true}
		}
	);
};
