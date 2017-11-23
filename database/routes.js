'use strict';

const database = require('./index');

module.exports = (app) => {
	app.post('/api/user', (req, res) => {
		database.User.findOrCreate({
			where: {userId: req.body.userId},
			defaults: req.body,
		})
            .then(data => {
				console.log('data: ', data);
				res.send(data);
			})
			.catch(err => { res.status(500).send(err); });
	});

	app.post('/api/episode', (req, res) => {
		database.Episode.findOrCreate({
			where: {episodeId: req.body.episodeId},
			defaults: req.body
		})
			.then(data => {
				console.log('response: ', data);
				res.send(data);
			})
			.catch(err => {
				console.log('error: ', err);
				res.status(500).send(err);
			});
	});

	// app.post('/api/soundcast', (req, res) => {
	// 	database.Soundcast.findOrCreate({
	// 		where: {soundcastId: req.body.soundcastId},
	// 		defaults: req.body
	// 	})
	// 		.then(data => res.send(data))
	// 		.catch(err => { res.status(500).send(err); });
	// });

	app.post('/api/soundcast', (req, res) => {
		database.Soundcast.findOne({
			where: {soundcastId: req.body.soundcastId}
		})
		.then(obj => {
			if(obj) {
				return obj.update({
									publisherId: req.body.publisherId,
									title: req.body.title
								});
			} else {
				return database.Soundcast.create(req.body);
			}
		})
		.then(data => { res.send(data); })
		.catch(err => { res.status(500).send(err); });
	});

	app.post('/api/listening_session', (req, res) => {
		const data = Object.assign({}, req.body, {date: new Date(req.body.date)});
		database.ListeningSession.create(req.body)
			.then(data => { res.send(data); })
			.catch(err => {
				console.log(err);
				res.status(500).send(err);
			});
	});

	app.get('/api/stats_by_user', (req, res) => {
		// console.log('req.query: ', req.query);
		database.ListeningSession.findAll({
			where: {
				userId: req.query.userId,
				date: {
					$gte: new Date(req.query.startDate),
					$lte: new Date(req.query.endDate),
				},
			},
			order: [
				['date', 'ASC'],
			],
		})
			.then(data => {
				res.send(data);
			})
			.catch(err => { res.status(500).send(err); });
	});

	app.get('/api/stats_by_user_publisher', (req, res) => {
		database.ListeningSession.findAll({
			where: {
				userId: req.query.userId,
				publisherId: req.query.publisherId,
				date: {
					$gte: new Date(req.query.startDate),
					$lte: new Date(req.query.endDate),
				},
			},
			order: [
				['date', 'ASC'],
			],
		})
			.then(data => {
				console.log('data sent: ', data);
				res.send(data);
			})
			.catch(err => { res.status(500).send(err); });
	});

	app.get('/api/stats_by_episode', (req, res) => {
		database.ListeningSession.findAll({
			where: {
				episodeId: req.query.episodeId,
				date: {
					$gte: new Date(req.query.startDate),
					$lte: new Date(req.query.endDate),
				},
			},
			order: [
				['date', 'ASC'],
			],
		})
			.then(data => res.send(data))
			.catch(err => { res.status(500).send(err); });
	});

	app.get('/api/stats_by_soundcast', (req, res) => {

		database.ListeningSession.findAll({
			where: {
				soundcastId: req.query.soundcastId,
				date: {
					$gte: new Date(req.query.startDate),
					$lte: new Date(req.query.endDate),
				},
			},
			order: [
				['date', 'ASC'],
			],
		})
			.then(data => res.send(data))
			.catch(err => {
				console.log(err);
			  res.status(500).send(err);
			});
	});

	app.get('/api/stats_by_user_episode', (req, res) => {
		database.ListeningSession.findAll({
			where: {
				userId: req.query.userId,
				episodeId: req.query.episodeId,
				date: {
					$gte: new Date(req.query.startDate),
					$lte: new Date(req.query.endDate),
				},
			},
			order: [
				['date', 'ASC'],
			],
		})
			.then(data => res.send(data))
			.catch(err => { res.status(500).send(err); });
	});
};
