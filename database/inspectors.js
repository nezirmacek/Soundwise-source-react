'use strict';

const database = require('./index');
const firebase = require('firebase-admin');
const moment = require('moment');
const sendMail = require('../server/scripts/sendEmails').sendMail;
const _ = require('lodash');

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

const getContentPush = entity => {
  const soundcastId = entity.soundcastId;
  if (entity.likeId === undefined) {
    return entity.announcementId
      ? {
          data: {
            type: 'COMMENT_MESSAGE',
            messageId: entity.announcementId,
            soundcastId,
          },
          notification: {
            title: 'Comment message',
            body: 'text',
          },
        }
      : {
          data: {
            type: 'COMMENT_EPISODE',
            episodeId: entity.episodeId,
            soundcastId,
          },
          notification: {
            title: 'Comment episode',
            body: entity.content,
          },
        };
  } else {
    return entity.announcementId
      ? {
          data: {
            type: 'LIKE_MESSAGE',
            messageId: entity.announcementId,
            soundcastId,
          },
          notification: {
            title: 'Like message',
            body: 'text',
          },
        }
      : entity.episodeId
        ? {
            data: {
              type: 'LIKE_EPISODE',
              episodeId: entity.episodeId,
              soundcastId,
            },
            notification: {
              title: 'Like episode',
              body: 'text',
            },
          }
        : {
            data: {
              type: 'LIKE_COMMENT',
              messageId: entity.commentId,
              soundcastId,
            },
            notification: {
              title: 'Like comment',
              body: 'text',
            },
          };
  }
};

const sendPush = (content, deviceId) => {
  firebase
    .messaging()
    .sendToDevice(deviceId, content, {
      priority: 'high',
      timeToLive: 60 * 60 * 24,
    })
    .then(res => console.log(res))
    .catch(e => console.log(e));
};

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
                  user.token.forEach(t => sendPush(getContentPush(comment), t));
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
                  user.token.forEach(t => sendPush(getContentPush(like), t));
                }
              });
          });
      }
      if (like.episodeId !== undefined && fullName !== undefined) {
        firebase
          .database()
          .ref(`episodes/${like.episodeId}/lastLike`)
          .set(fullName);
      }
      likeCount(like, true);
      res.send(data);
    })
    .catch(err => res.status(500).send(err));
};

const deleteLike = (req, res) => {
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
        if (like.episodeId !== undefined) {
          database.Like.findAll({ where: { episodeId: like.episodeId } }).then(
            likes => {
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
                  firebase
                    .database()
                    .ref(`episodes/${like.episodeId}/lastLike`)
                    .set(`${user.name} ${user.lastName}`);
                });
            }
          );
        }
        likeCount(like, false);
        res.send({ count });
      })
      .catch(err => res.status(500).send(err));
  });
};

const editLike = (req, res) => {
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
};

module.exports = {
  addComment,
  editComment,
  deleteComment,
  addLike,
  editLike,
  deleteLike,
};
