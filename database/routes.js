'use strict';

const database = require('./index');

module.exports = (app) => {
  app.post('/api/user', (req, res) => {
    database.User.findOrCreate({
      where: {userId: req.body.userId},
      defaults: req.body,
    })
    .then(data => { res.send(data); });
  });

  app.post('/api/episode', (req, res) => {
    database.Episode.findOrCreate({
      where: {episodeId: req.body.episodeId},
      defaults: req.body,
    })
    .then(data => { res.send(data); });
  });

  app.post('/api/soundcast', (req, res) => {
    database.Soundcast.findOrCreate({
      where: {soundcastId: req.body.soundcastId},
      defaults: req.body,
    })
    .then(data => res.send(data));
  });

  app.post('/api/listeningSession', (req, res) => {
    database.ListeningSession.create(req.body)
    .then(data => { res.send(data); });
  });

  app.get('/api/stats_by_user', (req, res) => {
    database.ListeningSession.findAll({where: {
      userId: req.body.userId,
      date: {$between: [req.body.startDate, req.body.endDate]},
    }})
    .then(data => res.send(data));
  });

  app.get('/api/stats_by_episode', (req, res) => {
    database.ListeningSession.findAll({where: {
      episodeId: req.body.episodeId,
      date: {$between: [req.body.startDate, req.body.endDate]},
    }})
    .then(data => res.send(data));
  });

  app.get('/api/stats_by_soundcast', (req, res) => {
    database.ListeningSession.findAll({where: {
      soundcastId: req.body.soundcastId,
      date: {$between: [req.body.startDate, req.body.endDate]},
    }})
    .then(data => res.send(data));
  });
};
