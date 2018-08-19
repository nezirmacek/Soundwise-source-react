'use strict';

const _ = require('lodash');
const database = require('../../database/index');

const sendMail = require('../scripts/sendEmails').sendMail;

const sendNotification = require('../scripts/messaging').sendNotification;
const { getContentPush } = require('../scripts/utils');

const { commentManager } = require('../managers');

const addComment = (req, res) => {
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
      fbComment = _.pickBy(fbComment, _.identity);

      if (comment.announcementId) {
        database.Comment.count({
          where: { announcementId: comment.announcementId },
        }).then(count => {
          database.Announcement.update(
            { commentsCount: count },
            { where: { announcementId: comment.announcementId } }
          );
        });
      }

      commentManager
        .addComment(commentId, fbComment)
        .then(() => {
          if (comment.parentId) {
            commentManager.getUserParentComment(commentId).then(user => {
              if ((user && !!user.token) || user.id === comment.userId) {
                user.token.forEach(t =>
                  sendNotification(t, {
                    data: {
                      type: 'COMMENT_COMMENT',
                      commentId: comment.parentId,
                      soundcastId: comment.soundcastId,
                    },
                    notification: {
                      title: 'New comment',
                      body: `${user.firstName} ${
                        user.lastName
                      } answered your comment`,
                    },
                  })
                );
              }
              res.send(data);
              sendMail(fbComment);
            });
          } else {
            res.send(data);
          }
        })
        .catch(err => res.status(500).send(err));
    })
    .catch(err => res.status(500).send(err));
};
const editComment = (req, res) => {
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
      commentManager
        .updateComment(commentId, fbComment)
        .then(() => res.send(data));
    })
    .catch(err => {
      console.log(err);
      res.status(500).send(err);
    });
};

const deleteComment = (req, res) => {
  const commentId = req.params.id;
  database.Comment.find({ where: { commentId } })
    .then(data => {
      const comment = data.dataValues;
      database.Comment.destroy({
        where: { commentId },
      }).then(count => {
        if (comment.announcementId) {
          database.Comment.count({
            where: { announcementId: comment.announcementId },
          }).then(count => {
            database.Announcement.update(
              { commentsCount: count },
              { where: { announcementId: comment.announcementId } }
            );
          });
        }
        commentManager
          .removeComment(commentId, comment)
          .then(() => res.send({ count }));
      });
    })
    .catch(err => res.status(500).send(err));
};

module.exports = {
  addComment,
  editComment,
  deleteComment,
};
