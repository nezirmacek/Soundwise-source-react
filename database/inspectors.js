'use strict';

const database = require('./index');
const firebase = require('firebase-admin');
const moment = require('moment');
const sendMail = require('../server/scripts/sendEmails').sendMail;
const sendNotification = require('../server/scripts/messaging')
  .sendNotification;
const _ = require('lodash');
const getContentPush = require('../server/scripts/utils').getContentPush;

// COMMENTS

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
          .ref(`comments/${comment.parentId}/userID`)
          .once('value')
          .then(snap => {
            firebase
              .database()
              .ref(`users/${snap.val()}`)
              .once('value')
              .then(snapshot => {
                const user = snapshot.val();
                if (user.token !== undefined && user.token !== null) {
                  user.token.forEach(t =>
                    sendNotification(t, getContentPush(comment)).catch(e =>
                      console.log(e)
                    )
                  );
                }
              });
          });
      }
      sendMail(fbComment);
      res.send(data);
      // database.Event.create(getEvent('comment', comment)); // event
    })
    .catch(err => res.status(500).send(err));
};

const deleteComment = (req, res) => {
  const commentId = req.params.id;
  database.Comment.find({ where: { commentId } })
    .then(data => {
      const comment = data.dataValues;
      database.Comment.destroy({
        where: { commentId },
      }).then(count => {
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
      });
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
      res.send(data);
    })
    .catch(err => {
      console.log(err);
      res.status(500).send(err);
    });
};

// LIKES

const likeCount = like => {
  const path = like.announcementId
    ? `messages/${like.announcementId}/likeCount`
    : like.episodeId
      ? `episodes/${like.episodeId}/likeCount`
      : `comments/${like.commentId}/likeCount`;
  database.Like.findAll({ where: { episodeId: like.episodeId } }).then(likes =>
    firebase
      .database()
      .ref(path)
      .set(likes.length)
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
          .ref(`comment/${like.commentId}/userID`)
          .once('value')
          .then(snap => {
            firebase
              .database()
              .ref(`users/${snap.val()}`)
              .once('value')
              .then(snapshot => {
                const user = snapshot.val();
                if (user.token !== undefined && user.token !== null) {
                  user.token.forEach(t =>
                    sendNotification(t, getContentPush(like))
                  );
                }
              });
          });
      }
      if (fullName !== undefined) {
        if (like.episodeId !== undefined) {
          firebase
            .database()
            .ref(`episodes/${like.episodeId}/lastLiked`)
            .set(fullName);
        } else if (like.announcementId !== undefined) {
          firebase
            .database()
            .ref(`messages/${like.announcementId}/lastLiked`)
            .set(fullName);
        }
      }
      likeCount(like);
      res.send(data);
    })
    .catch(err => res.status(500).send(err));
};

const deleteLike = (req, res) => {
  const likeId = req.params.id;
  database.Like.find({ where: { likeId } })
    .then(data => {
      const like = data.dataValues;
      database.Like.destroy({ where: { likeId } }).then(count => {
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
        database.Like.findAll({ where: { episodeId: like.episodeId } }).then(
          likes => {
            if (likes.length > 0) {
              let maxTimestamp = 0;
              let lastLikeUserId = null;
              likes.forEach(val => {
                const like = val.dataValues;
                if (maxTimestamp < like.timeStamp) {
                  maxTimestamp = like.timeStamp;
                  lastLikeUserId = like.userId;
                }
              });
              firebase
                .database()
                .ref(`users/${lastLikeUserId}`)
                .once('value')
                .then(snapshot => {
                  const user = snapshot.val();
                  if (like.episodeId !== undefined) {
                    firebase
                      .database()
                      .ref(`episodes/${like.episodeId}/lastLike`)
                      .set(`${user.name} ${user.lastName}`);
                  } else if (like.announcementId !== undefined) {
                    firebase
                      .database()
                      .ref(`messages/${like.announcementId}/lastLike`)
                      .set(`${user.name} ${user.lastName}`);
                  }
                });
            }
          }
        );
        likeCount(like);
        res.send({ count });
      });
    })
    .catch(err => res.status(500).send(err));
};

module.exports = {
  addComment,
  editComment,
  deleteComment,
  addLike,
  deleteLike,
};
