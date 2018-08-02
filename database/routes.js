'use strict';

const database = require('./index');
const firebase = require('firebase-admin');
const moment = require('moment');
const soundcastService = require('../server/services').soundcastService;
const sendMail = require('../server/scripts/sendEmails').sendMail;
const _ = require('lodash');

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

  app.post('/api/category', (req, res) => {
    database.Category.create(req.body)
      .then(data => res.send(data))
      .catch(err => res.status(500).send(err));
  });

  app.post('/api/listening_session', (req, res) => {
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

  const getEvent = (type, entity) => {
    let event = {
      type,
      // story: 'string',
      userId: entity.userId,
      episodeId: entity.episodeId,
      likeId: entity.likeId,
      soundcastId: entity.soundcastId,
      messageId: entity.messageId,
      commentId: entity.commentId,
      parentId: entity.commentId,
    };
    event = _.pickBy(event, _.identity);
    return event;
  };

  const sendPush = (deviceId, content) => {
    firebase
      .messaging()
      .send({ data: { type: '', soundcastId: '' }, token: deviceId })
      .then(res => console.log(res));
  };

  // COMMENTS

  app.post('/api/comments', (req, res) => {
    database.Comment.create(req.body)
      .then(data => {
        const comment = data.dataValues;
        const commentId = comment.commentId;
        let fbComment = {
          userID: comment.userId,
          content: comment.content,
          timestamp: comment.timeStamp,
          parentID: comment.parentId,
          episodeID: comment.episodeId,
          soundcastID: comment.soundcastId,
          announcementID: comment.announcementId,
        };
        fbComment = _.pick(fbComment, _.identity);

        firebase
          .database()
          .ref(`comments/${commentId}`)
          .set(fbComment);
        firebase
          .database()
          .ref(
            comment.announcementId
              ? `messages/${comment.announcementId}/comments/${commentId}`
              : `episodes/${comment.episodeId}/comments/${commentId}`
          )
          .set(moment().format('X'));
        if (comment.parentId) {
          firebase
            .database()
            .ref(`comment/${comment.parentId}/userID`)
            .once('value')
            .then(snap => {
              firebase
                .database()
                .ref(`users/${snap.val()}`)
                .once('value')
                .then(snapshot => {
                  const user = snapshot.val();
                  user.token.forEach(t => sendPush(t, comment.content)); // FIX ME
                });
            });
        }
        res.send(data);
        sendMail(fbComment).then(() => res.send(data));
        // database.Event.create(getEvent('comment', comment)); // event
      })
      .catch(err => res.status(500).send(err));
  });

  app.delete('/api/comments/:id', (req, res) => {
    const commentId = req.params.id;
    database.Comment.find({ where: { commentId } }).then(data => {
      const comment = data.dataValues;
      database.Comment.destroy({
        where: { commentId },
      })
        .then(count => {
          firebase
            .database()
            .ref(
              comment.announcementId
                ? `messages/${comment.announcementId}/comments/${commentId}`
                : `episodes/${comment.episodeId}/comments/${commentId}`
            )
            .remove();
          firebase
            .database()
            .ref(`comments/${commentId}`)
            .remove();
          res.send({ count });
        })
        .catch(err => res.status(500).send(err));
    });
  });

  app.put('/api/comments/:id', (req, res) => {
    const comment = req.body;
    const commentId = req.params.id;
    let fbComment = {
      userID: comment.userId,
      content: comment.content,
      timestamp: comment.timeStamp,
      parentID: comment.parentId,
      episodeID: comment.episodeId,
      soundcastID: comment.soundcastId,
      announcementID: comment.announcementId,
    };
    fbComment = _.pickBy(fbComment, _.identity);
    database.Comment.update(comment, {
      where: { commentId: commentId },
    })
      .then(data => {
        firebase
          .database()
          .ref(`comments/${commentId}`)
          .set(fbComment);
        firebase
          .database()
          .ref(
            comment.announcementId
              ? `messages/${comment.announcementId}/comments/${commentId}`
              : `episodes/${comment.episodeId}/comments/${commentId}`
          )
          .set(moment().format('X'));
        if (comment.episodeId !== null && commentId.fullName !== null) {
          firebase
            .database()
            .ref(`episodes/${comment.episodeId}/lastLike`)
            .set(commentId.fullName);
        }
        res.send(data);
      })
      .catch(err => res.status(500).send(err));
  });

  // LIKES

  const likeCount = (like, increment) => {
    const path = like.announcementId
      ? `messages/${like.announcementId}/likeCount`
      : like.episodeId
        ? `episodes/${like.episodeId}/likeCount`
        : `comments/${like.commentId}/likeCount`;
    firebase
      .database()
      .ref(path)
      .once('value')
      .then(snap =>
        firebase
          .database()
          .ref(path)
          .set(increment ? snap.val() + 1 : snap.val() - 1)
      );
  };

  app.post('/api/likes', (req, res) => {
    database.Like.create(req.body)
      .then(data => {
        const like = data.dataValues;
        const likeId = like.likeId;
        let fbLike = {
          likeID: like.likeId,
          userID: like.userId,
          timestamp: like.timeStamp,
          episodeID: like.episodeId,
          commentID: like.commentId,
          soundcastID: like.soundcastId,
          announcementID: like.announcementId,
        };
        fbLike = _.pickBy(fbLike, _.identity);

        firebase
          .database()
          .ref(`likes/${likeId}`)
          .set(fbLike);
        firebase
          .database()
          .ref(
            like.announcementId
              ? `messages/${like.announcementId}/likes/${likeId}`
              : like.episodeId
                ? `episodes/${like.episodeId}/likes/${likeId}`
                : `comments/${like.commentId}/likes/${likeId}`
          )
          .set(moment().format('X'));
        if (like.commentId) {
          firebase
            .database()
            .ref(`users/${like.userId}`)
            .once('value')
            .then(snapshot => {
              const user = snapshot.val();
              user.token.forEach(t => console.log(t)); // push
            });
        }
        likeCount(like, true);
        res.send(data);
      })
      .catch(err => res.status(500).send(err));
  });

  app.delete('/api/likes/:id', (req, res) => {
    const likeId = req.params.id;
    database.Like.find({ where: { likeId } }).then(data => {
      const like = data.dataValues;
      database.Like.destroy({
        where: { likeId },
      })
        .then(count => {
          firebase
            .database()
            .ref(
              like.announcementId
                ? `messages/${like.announcementId}/likes/${likeId}`
                : like.episodeId
                  ? `episodes/${like.episodeId}/likes/${likeId}`
                  : `comments/${like.commentId}/likes/${likeId}`
            )
            .remove();
          firebase
            .database()
            .ref(`likes/${likeId}`)
            .remove();
          likeCount(like, false);
          res.send({ count });
        })
        .catch(err => res.status(500).send(err));
    });
  });

  app.put('/api/likes/:id', (req, res) => {
    const like = req.body;
    const likeId = req.params.id;
    let fbLike = {
      likeID: like.likeId,
      userID: like.userId,
      timestamp: like.timeStamp,
      episodeID: like.episodeId,
      commentID: like.commentId,
      soundcastID: like.soundcastId,
      announcementID: like.announcementId,
    };
    fbLike = _.pickBy(fbLike, _.identity);
    database.Like.update(like, {
      where: { likeId },
    })
      .then(data => {
        firebase
          .database()
          .ref(`likes/${likeId}`)
          .set(fbLike);
        firebase
          .database()
          .ref(
            like.announcementId
              ? `messages/${like.announcementId}/likes/${likeId}`
              : like.episodeId
                ? `episodes/${like.episodeId}/likes/${likeId}`
                : `comments/${like.commentId}/likes/${likeId}`
          )
          .set(moment().format('X'));
        res.send(data);
      })
      .catch(err => res.status(500).send(err));
  });
};
