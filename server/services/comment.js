'use strict';

const _ = require('lodash');
const database = require('../../database/index');

const sendMail = require('../scripts/sendEmails').sendMail;
const sendNotification = require('../scripts/messaging').sendNotification;

const {commentManager, userManager} = require('../managers');

const addComment = (req, res) => {
  database.Comment.create(req.body)
    .then(data => {
      const comment = data.dataValues;
      const {announcementId, episodeId, commentId} = comment;

      if (announcementId) {
        database.Comment.count({
          where: {announcementId},
        })
          .then(count => {
            database.Announcement.update(
              {commentsCount: count},
              {where: {announcementId}}
            );
          })
          .then(() =>
            sendMail(comment)
              .then(() => {
                sendPush(comment);
                res.send(data);
              })
              .catch(error => sendError(error, res))
          )
          .catch(error => sendError(error, res));
      } else if (episodeId) {
        commentManager.addCommentToEpisode(commentId, episodeId).then(() =>
          sendMail(comment)
            .then(() => {
              sendPush(comment);
              res.send(data);
            })
            .catch(error => sendError(error, res))
        );
      }
    })
    .catch(error => sendError(error, res));
};

const editComment = (req, res) => {
  const comment = req.body;
  const commentId = req.params.id;

  database.Comment.update(comment, {
    where: {commentId},
  })
    .then(data => res.send(data))
    .catch(error => sendError(error, res));
};

const deleteComment = (req, res) => {
  const commentId = req.params.id;

  database.Comment.find({where: {commentId}})
    .then(data => {
      const {announcementId, episodeId} = data.dataValues;
      database.Comment.destroy({where: {commentId}}).then(() => {
        if (announcementId) {
          database.Comment.count({where: {announcementId}}).then(count => {
            database.Announcement.update(
              {commentsCount: count},
              {where: {announcementId}}
            )
              .then(() => res.send({response: 'OK'}))
              .catch(error => sendError(error, res));
          });
        } else if (episodeId) {
          commentManager
            .removeCommentToEpisode(commentId, episodeId)
            .then(() => res.send({response: 'OK'}))
            .catch(error => sendError(error, res));
        }
      });
    })
    .catch(error => sendError(error, res));
};

const sendPush = comment => {
  if (comment.parentId) {
    database.Comment.findById(comment.parentId).then(data => {
      userManager.getById(data.dataValues.userId).then(user => {
        if (user && user.token) {
          user.token.forEach(t =>
            sendNotification(t, {
              data: {
                type: comment.episodeId ? 'COMMENT_EPISODE' : 'COMMENT_MESSAGE',
                [comment.episodeId
                  ? 'episodeId'
                  : 'messageId']: comment.episodeId
                  ? comment.episodeId
                  : comment.announcementId,
                soundcastId: comment.soundcastId,
              },
              notification: {
                title: 'New comment',
                body: 'To your comment answered',
              },
            })
          );
        }
      });
    });
  }
};

const sendError = (err, res) => {
  console.log(err);
  res.status(500).send(err);
};

module.exports = {
  addComment,
  editComment,
  deleteComment,
};
