'use strict';

const database = require('../../database/index');
const sendNotification = require('../scripts/messaging').sendNotification;
const {commentManager, likeManager} = require('../managers');

const addLike = (req, res) => {
  if (!req.body.fullName) {
    res.status(400).send({error: 'fullName can not be null'});
    return;
  }
  database.Like.create(req.body)
    .then(data => {
      const like = data.dataValues;
      const fullName = req.body.fullName;
      if (like.episodeId) {
        // LIKE EPISODE
        likeManager
          .setFullName(like.episodeId, fullName)
          .then(() =>
            database.Like.count({where: {episodeId: like.episodeId}})
              .then(count => likeManager.setLikesCount(like.episodeId, count))
              .then(() => res.send(data))
              .catch(error => sendError(error, res))
          )
          .catch(error => sendError(error, res));
      } else if (like.announcementId) {
        // LIKE MESSAGE
        database.Like.count({
          where: {announcementId: like.announcementId},
        })
          .then(count =>
            database.Announcement.update(
              {lastLiked: fullName, likesCount: count},
              {where: {announcementId: like.announcementId}}
            )
              .then(() => res.send(data))
              .catch(error => sendError(error, res))
          )
          .catch(error => sendError(error, res));
      } else if (like.commentId) {
        // LIKE COMMENT
        commentManager
          .getUserParentComment(like.commentId)
          .then(user => {
            if ((user && !!user.token) || user.id === like.userId) {
              user.token.forEach(t =>
                sendNotification(t, {
                  data: {
                    type: 'LIKE_COMMENT',
                    commentId: like.commentId,
                    soundcastId: like.soundcastId,
                  },
                  notification: {
                    title: 'New like',
                    body: `${user.firstName} ${
                      user.lastName
                    } liked your comment`,
                  },
                })
                  .then(() => res.send(data))
                  .catch(error => sendError(error, res))
              );
            }
          })
          .catch(error => sendError(error, res));
      }
    })
    .catch(error => sendError(error, res));
};

const deleteLike = (req, res) => {
  const likeId = req.params.id;
  database.Like.find({where: {likeId}})
    .then(data => {
      const like = data.dataValues;

      database.Like.destroy({where: {likeId}})
        .then(() => {
          if (like.announcementId) {
            // UNLIKE MESSAGE
            database.Like.findAll({
              where: {announcementId: like.announcementId},
              order: [['timeStamp', 'DESC']],
              limit: 1,
            })
              .then(likes => {
                likeManager
                  .getFullNameByUid(
                    likes[0] ? likes[0].dataValues.userId : null
                  )
                  .then(fullName =>
                    database.Like.count({
                      where: {announcementId: like.announcementId},
                    })
                      .then(count => {
                        database.Announcement.update(
                          {likesCount: count, lastLiked: fullName},
                          {where: {announcementId: like.announcementId}}
                        )
                          .then(() => res.send({fullName}))
                          .catch(error => sendError(error, res));
                      })
                      .catch(error => sendError(error, res))
                  )
                  .catch(error => sendError(error, res));
              })
              .catch(error => sendError(error, res));
          } else if (like.commentId) {
            // UNLIKE COMMENT
            database.Like.findAll({
              where: {commentId: like.commentId},
              order: [['timeStamp', 'DESC']],
              limit: 1,
            })
              .then(like =>
                likeManager
                  .getFullNameByUid(like[0] ? like[0].dataValues.userId : '')
                  .then(fullName => res.send({fullName}))
                  .catch(error => sendError(error, res))
              )
              .catch(error => sendError(error, res));
          } else if (like.episodeId) {
            // UNLIKE EPISODE
            database.Like.findAll({
              where: {episodeId: like.episodeId},
              order: [['timeStamp', 'DESC']],
              limit: 1,
            })
              .then(like => {
                likeManager
                  .getFullNameByUid(like[0] ? like[0].dataValues.userId : '')
                  .then(fullName =>
                    database.Like.count({
                      where: {episodeId: like.episodeId},
                    }).then(count =>
                      likeManager
                        .updateLikeInEpisode(like.episodeId, count, fullName)
                        .then(() => res.send({fullName}))
                    )
                  );
              })
              .catch(error => sendError(error, res));
          }
        })
        .catch(error => sendError(error, res));
    })
    .catch(error => sendError(error, res));
};

const sendError = (err, res) => {
  console.log(err);
  res.status(500).send(err);
};

module.exports = {addLike, deleteLike};
