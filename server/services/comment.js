'use strict';

const _ = require('lodash');
const database = require('../../database/index');

const sendMail = require('../scripts/sendEmails').sendMail;
const sendNotification = require('../scripts/messaging').sendNotification;

const {commentManager, userManager} = require('../managers');
const {commentRepository, announcementRepository} = require('../repositories');

// ADD_COMMENT
const addComment = (req, res) => {
  if (req.body.soundcastId || req.body.userId) {
    sendError({error: 'soundcastId and userId can not be null'}, res, 400);
    return;
  }

  commentRepository
    .create(req.body)
    .then(comment => {
      const {announcementId, episodeId, commentId} = comment;

      if (announcementId) {
        updateCommentsCount(announcementId)
          .then(() => {
            notifyUsers(comment);
            res.send(data);
          })
          .catch(error => sendError(error, res));
      } else if (episodeId) {
        commentManager.addCommentToEpisode(commentId, episodeId).then(() => {
          notifyUsers(comment);
          res.send(data);
        });
      }
    })
    .catch(error => sendError(error, res, 400));
};

// EDIT_COMMENT
const editComment = (req, res) => {
  const comment = req.body;
  const commentId = req.params.id;
  commentRepository
    .update(comment, commentId)
    .then(data => res.send(data))
    .catch(error => sendError(error, res, 400));
};

// DELETE_COMMENT
const deleteComment = (req, res) => {
  const commentId = req.params.id;

  commentRepository
    .get(commentId)
    .then(data => {
      const {announcementId, episodeId} = data;
      commentRepository.destroy(commentId).then(() => {
        if (announcementId) {
          updateCommentsCount(announcementId)
            .then(() => res.send({response: 'OK'}))
            .catch(error => sendError(error, res));
        } else if (episodeId) {
          commentManager
            .removeCommentToEpisode(commentId, episodeId)
            .then(() => res.send({response: 'OK'}))
            .catch(error => sendError(error, res));
        }
      });
    })
    .catch(error => sendError(error, res, 400));
};

const updateCommentsCount = announcementId =>
  commentRepository
    .count({announcementId})
    .then(count =>
      announcementRepository.update({commentsCount: count}, announcementId)
    );

const notifyUsers = comment => {
  sendMail(comment)
    .then(() => sendPush(comment))
    .catch(error => sendError(error, res));
};

const sendPush = comment => {
  const {parentId, soundcastId, episodeId, announcementId} = comment;

  if (parentId) {
    commentRepository.get(parentId).then(comment => {
      userManager.getById(comment.userId).then(user => {
        if (user && user.token) {
          user.token.forEach(t =>
            sendNotification(t, {
              data: {
                type: episodeId ? 'COMMENT_EPISODE' : 'COMMENT_MESSAGE',
                [episodeId ? 'episodeId' : 'messageId']: episodeId
                  ? episodeId
                  : announcementId,
                soundcastId,
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

const sendError = (err, res, status) => {
  console.log(err);
  res.status(status || 500).send(err);
};

module.exports = {
  addComment,
  editComment,
  deleteComment,
};
