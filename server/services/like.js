'use strict';

const _ = require('lodash');
const database = require('../../database/index');

const sendNotification = require('../scripts/messaging').sendNotification;
const getContentPush = require('../scripts/utils').getContentPush;

const { commentManager, likeManager } = require('../managers');

const likesCount = like => {
  const path = like.announcementId
    ? `messages/${like.announcementId}/likesCount`
    : like.episodeId
      ? `episodes/${like.episodeId}/likesCount`
      : `comments/${like.commentId}/likesCount`;
  return database.Like.count({ where: { episodeId: like.episodeId } }).then(
    count => likeManager.setLikesCount(path, count)
  );
};

const addLike = (req, res) => {
  database.Like.create(req.body)
    .then(data => {
      const like = data.dataValues;
      const likeId = like.likeId;
      const fullName = req.body.fullName;
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

      likeManager.addLike(likeId, fbLike).then(() => {
        if (like.commentId) {
          commentManager.getUserParentComment(like.commentId).then(user => {
            if (user && !!user.token) {
              user.token.forEach(t =>
                sendNotification(t, getContentPush(like))
              );
            }
          });
        }
        likeManager.setFullName(like, fullName).then(() => {
          likesCount(like).then(() => res.send(data));
        });
      });
    })
    .catch(err => res.status(500).send(err));
};

const deleteLike = (req, res) => {
  const likeId = req.params.id;
  database.Like.find({ where: { likeId } })
    .then(data => {
      const like = data.dataValues;
      database.Like.destroy({ where: { likeId } }).then(() => {
        likeManager.removeLike(likeId, like).then(() => {
          if (!!like.episodeId) {
            // set name for lastLiked
            database.Like.findAll({
              where: { episodeId: like.episodeId },
            }).then(likes => {
              if (likes.length > 0) {
                const lastLike = _.maxBy(likes, 'timeStamp');
                const userId = lastLike.dataValues.userId;

                likeManager.setFullNameByUid(userId, like).then(fullName => {
                  likesCount(like);
                  res.send({ fullName });
                });
              }
            });
          } else if (!!like.announcementId) {
            database.Like.findAll({
              where: { announcementId: like.announcementId },
            }).then(likes => {
              if (likes.length > 0) {
                const lastLike = _.maxBy(likes, 'timeStamp');
                const userId = lastLike.dataValues.userId;
                likeManager.setFullNameByUid(userId, like).then(fullName => {
                  likesCount(like);
                  res.send({ fullName });
                });
              }
            });
          }
        });
      });
    })
    .catch(err => res.status(500).send(err));
};

module.exports = {
  addLike,
  deleteLike,
};
