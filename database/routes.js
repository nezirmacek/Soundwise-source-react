'use strict';

const database = require('./index');
const soundcastService = require('../server/services').soundcastService;
const inspectors = require('./inspectors');

module.exports = app => {
  app.post('/api/user', (req, res) => {
    database.User.findOrCreate({
      where: {
        userId: req.body.userId,
      },
      defaults: req.body,
    })
      .then(data => res.send(data))
      .catch(err => res.status(500).send(err));
  });

  app.post('/api/coupon', (req, res) => {
    database.Coupon.create(req.body)
      .then(data => res.send(data))
      .catch(err => res.status(500).send(err));
  });

  app.get('/api/coupon', (req, res) => {
    const publisherId = JSON.parse(req.query.filter).publisherId;
    database.Coupon.findAll({
      where: { publisherId: publisherId },
    })
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send(err);
      });
  });

  app.get('/api/messages', (req, res) => {
    const soundcastId = JSON.parse(req.query.filter).soundcastId;
    database.Message.findAll({
      where: { soundcastId: soundcastId },
      order: [['updatedAt', 'DESC']],
    })
      .then(data => res.send(data))
      .catch(err => res.status(500).send(err));
  });

  app.post('/api/episode', (req, res) => {
    database.Episode.findOrCreate({
      where: { episodeId: req.body.episodeId },
      defaults: req.body,
    })
      .then(data => res.send(data))
      .catch(err => res.status(500).send(err));
  });

  app.post('/api/soundcast', (req, res) => {
    soundcastService
      .createOrUpdate(req.body)
      .then(data => res.send(data))
      .catch(err => res.status(500).send(err));
  });
  app.post('/api/messages', (req, res) => {
    database.Message.create(req.body)
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send(err);
      });
  });

  app.post('/api/category', (req, res) => {
    database.Category.create(req.body)
      .then(data => res.send(data))
      .catch(err => res.status(500).send(err));
  });

  app.post('/api/listening_session', (req, res) => {
    const data = Object.assign({}, req.body, { date: new Date(req.body.date) });
    database.ListeningSession.create(req.body)
      .then(data => res.send(data))
      .catch(err => res.status(500).send(err));
  });

  app.get('/api/stats_by_user', (req, res) => {
    database.ListeningSession.findAll({
      where: {
        userId: req.query.userId,
        date: {
          $gte: new Date(req.query.startDate),
          $lte: new Date(req.query.endDate),
        },
      },
      order: [['date', 'ASC']],
    })
      .then(data => res.send(data))
      .catch(err => res.status(500).send(err));
  });

  app.get('/api/category', (req, res) => {
    database.Category.findAll({
      order: [['name', 'ASC']],
    })
      .then(data => res.send(data))
      .catch(err => res.status(500).send(err));
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
      order: [['date', 'ASC']],
    })
      .then(data => res.send(data))
      .catch(err => res.status(500).send(err));
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
      order: [['date', 'ASC']],
    })
      .then(data => res.send(data))
      .catch(err => res.status(500).send(err));
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
      order: [['date', 'ASC']],
    })
      .then(data => res.send(data))
      .catch(err => res.status(500).send(err));
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
      order: [['date', 'ASC']],
    })
      .then(data => res.send(data))
      .catch(err => res.status(500).send(err));
  });

  app.post('/api/comments', (req, res) => inspectors.addComment(req, res));

  app.delete('/api/comments/:id', (req, res) =>
    inspectors.deleteComment(req, res)
  );

  app.post('/api/comment', inspectors.addComment);
  app.put('/api/comments/:id', (req, res) => inspectors.editComment(req, res));
  // app.put('/api/comment', inspectors.editComment);
  app.delete('/api/comment', inspectors.deleteComment);
  app.post('/api/like', inspectors.addLike);
  app.delete('/api/like', inspectors.deleteLike);
};
