/**
 * Created by developer on 09.11.17.
 */
var app = require('../server');
var moment = require('moment');

const Transaction = app.models.Transaction;
const Publisher = app.models.Publisher;

const _transactions = [
	// this should be paid
	{
		transactionId: moment().format('x')+'t', //'charge' or 'refund' id from stripe
		invoiceId: 'invoiceId1', //only present if the charge is associated with a subscription invoice
		chargeId: 'ch_123123',
		type: 'charge', // 'charge' or 'refund'
		amount: 2,
		date: moment().subtract(20, 'days').format('YYYY-MM-DD'),
		publisherId: '1503002103690p',
		soundcastId: '1503691618714s',
		customer: 'customer1', // listener's stripe id
		paymentId: 'monthly payment plan 2', // id for the payment plan, only present if it's a subscription
		createdAt: moment().utc().format(),
		updatedAt: moment().utc().format(),
	},
	// this is old
	{
		transactionId: moment().format('x')+'t', //'charge' or 'refund' id from stripe
		invoiceId: 'invoiceId2', //only present if the charge is associated with a subscription invoice
		chargeId: 'ch_123124',
		type: 'charge', // 'charge' or 'refund'
		amount: 4,
		date: moment().subtract(60, 'days').format('YYYY-MM-DD'),
		publisherId: '1503002103690p',
		soundcastId: '1503691618714s',
		customer: 'customer1', // listener's stripe id
		paymentId: 'monthly payment plan 2', // id for the payment plan, only present if it's a subscription
		createdAt: moment().utc().format(),
		updatedAt: moment().utc().format(),
	},
	// this shouldn't be paid because of refund
	{
		transactionId: moment().format('x')+'t', //'charge' or 'refund' id from stripe
		invoiceId: 'invoiceId3', //only present if the charge is associated with a subscription invoice
		chargeId: 'ch_123125',
		type: 'charge', // 'charge' or 'refund'
		amount: 3,
		date: moment().subtract(20, 'days').format('YYYY-MM-DD'),
		publisherId: '1503002103690p',
		soundcastId: '1505855025645s',
		customer: 'customer2', // listener's stripe id
		paymentId: 'monthly payment plan 3', // id for the payment plan, only present if it's a subscription
		createdAt: moment().utc().format(),
		updatedAt: moment().utc().format(),
	},
	// this is refund
	{
		transactionId: moment().format('x')+'t', //'charge' or 'refund' id from stripe
		invoiceId: 'invoiceId4', //only present if the charge is associated with a subscription invoice
		chargeId: 'ch_123126',
		type: 'refund', // 'charge' or 'refund'
		amount: 3,
		date: moment().subtract(20, 'days').format('YYYY-MM-DD'),
		publisherId: '1503002103690p',
		soundcastId: '1505855025645s',
		customer: 'customer2', // listener's stripe id
		paymentId: 'monthly payment plan 3', // id for the payment plan, only present if it's a subscription
		createdAt: moment().utc().format(),
		updatedAt: moment().utc().format(),
	},
];

_transactions.map(transaction => {
	Transaction.create(transaction)
		.then(res => console.log('success save transaction'))
		.catch(err => console.log('ERROR save transaction: ', err));
});

const _publishers = [
	{
		publisherId: '1503002103690p',
		name: 'Soundwise',
		paypalEmail: '208@1.com',
		createdAt: moment().utc().format(),
		updatedAt: moment().utc().format(),
	}
];

_publishers.map(publisher => {
	Publisher.create(publisher)
		.then(res => console.log('success save publisher'))
		.catch(err => console.log('ERROR save publisher: ', err));
});