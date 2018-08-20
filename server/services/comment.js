'use strict';

const _ = require('lodash');
const database = require('../../database/index');

const sendMail = require('../scripts/sendEmails').sendMail;
const sendNotification = require('../scripts/messaging').sendNotification;

const { commentManager } = require('../managers');

const addComment = (req, res) => {
  database.Comment.create(req.body)
    .then(data => {
      const comment = data.dataValues;
      const commentId = comment.commentId;

      if (comment.announcementId) {
        database.Comment.count({
          where: { announcementId: comment.announcementId },
        })
          .then(count => {
            database.Announcement.update(
              { commentsCount: count },
              { where: { announcementId: comment.announcementId } }
            );
          })
          .then(() =>
            sendMail(comment)
              .then(() => {
                sendPush(commentId, comment);
                res.send(data);
              })
              .catch(error => sendError(error, res))
          );
      } else if (comment.episodeId) {
        commentManager.addCommentToEpisode(commentId, comment).then(() =>
          sendMail(comment)
            .then(() => {
              sendPush(commentId, comment);
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
    where: { commentId: commentId },
  })
    .then(data => res.send(data))
    .catch(error => sendError(error, res));
};

const deleteComment = (req, res) => {
  const commentId = req.params.id;
  database.Comment.find({ where: { commentId } })
    .then(data => {
      const comment = data.dataValues;
      database.Comment.destroy({
        where: { commentId },
      }).then(() => {
        if (comment.announcementId) {
          database.Comment.count({
            where: { announcementId: comment.announcementId },
          }).then(count => {
            database.Announcement.update(
              { commentsCount: count },
              { where: { announcementId: comment.announcementId } }
            )
              .then(() => res.send({}))
              .catch(error => sendError(error, res));
          });
        } else if (comment.episodeId) {
          commentManager
            .removeCommentToEpisode(commentId, comment)
            .then(() => res.send({}))
            .catch(error => sendError(error, res));
        }
      });
    })
    .catch(error => sendError(error, res));
};

const sendPush = (commentId, comment) => {
  if (comment.parentId) {
    commentManager.getUserParentComment(commentId).then(user => {
      if ((user && !!user.token) || user.id === comment.userId) {
        user.token.forEach(t =>
          sendNotification(t, {
            data: {
              type: comment.episodeId ? 'COMMENT_EPISODE' : 'COMMENT_MESSAGE',
              [comment.episodeId ? 'episodeId' : 'messageId']: comment.episodeId
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
