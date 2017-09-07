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
    console.log('request.body: ', req.body);
    database.Episode.findOrCreate({
      where: {episodeId: req.body.episodeId},
      defaults: req.body,
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

  app.post('/api/soundcast', (req, res) => {
    database.Soundcast.findOrCreate({
      where: {soundcastId: req.body.soundcastId},
      defaults: req.body,
    })
    .then(data => res.send(data))
    .catch(err => { res.status(500).send(err); });
  });

  app.post('/api/listening_session', (req, res) => {
    const data = Object.assign({}, req.body, {date: new Date(req.body.date)});
    database.ListeningSession.create(req.body)
    .then(data => { res.send(data); })
    .catch(err => { res.status(500).send(err); });
  });

  app.get('/api/stats_by_user', (req, res) => {
    console.log('req.query: ', req.query);
    database.ListeningSession.findAll({where: {
      userId: req.query.userId,
      date: {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      },
    }})
    .then(data => {
      console.log('response: ', data);
      res.send(data);
    })
    .catch(err => { res.status(500).send(err); });
  });

  app.get('/api/stats_by_episode', (req, res) => {
    database.ListeningSession.findAll({where: {
      episodeId: req.body.episodeId,
      date: {$between: [new Date(req.body.startDate), new Date(req.body.endDate)]},
    }})
    .then(data => res.send(data))
    .catch(err => { res.status(500).send(err); });
  });

  app.get('/api/stats_by_soundcast', (req, res) => {
    database.ListeningSession.findAll({where: {
      soundcastId: req.body.soundcastId,
      date: {$between: [req.body.startDate, req.body.endDate]},
    }})
    .then(data => res.send(data))
    .catch(err => { res.status(500).send(err); });
  });
};
