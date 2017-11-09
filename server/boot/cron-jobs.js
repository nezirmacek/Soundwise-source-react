/**
 * Created by developer on 09.11.17.
 */
'use strict';
var schedule = require('node-schedule');
var moment = require('moment');
var firebase = require('firebase');

var config = require('../../config').config;

module.exports = function(app) {
	// init firebase
	firebase.initializeApp(config);
	
	var j = schedule.scheduleJob('10 * * * * *', function(){ // TODO: need to set up schedule
		// need to pay money for every publisher for all transactions for the last month (-15 days os delay)
		const Transaction = app.models.Transaction;
		const Payout = app.models.Payout;
		
		firebase.database().ref('publishers').once('value')
			.then(publishersSnapshot => {
				if (publishersSnapshot.val()) {
					const _publishersObj = publishersSnapshot.val();
					for (let publisherId in _publishersObj) {
						if (_publishersObj.hasOwnProperty(publisherId)) {
							// first find charges
							Transaction.find({
								where: {
									publisherId,
									date: {
										between: [
											moment().subtract(15, 'days').subtract(1, 'months').format('YYYY-MM-DD'),
											moment().subtract(15, 'days').format('YYYY-MM-DD')
										]
									},
									type: 'charge'
								}
							})
								.then(transactions => {
									if (transactions.length) {
										// console.log('>>>>>>>>>>transactions', transactions);
										
									}
								})
						}
					}
				}
			})
			.catch(err => {
				console.log('ERROR get publishers for payouts: ', err);
			})
	});
};
