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
          type: 'COMMENT_MESSAGE',
          messageId: entity.announcementId,
          soundcastId,
        }
      : {
          type: 'COMMENT_EPISODE',
          episodeId: entity.episodeId,
          soundcastId,
        };
  } else {
    return entity.announcementId
      ? {
          type: 'LIKE_MESSAGE',
          messageId: entity.announcementId,
          soundcastId,
        }
      : entity.episodeId
        ? {
            type: 'LIKE_EPISODE',
            messageId: entity.episodeId,
            soundcastId,
          }
        : {
            type: 'LIKE_COMMENT',
            messageId: entity.commentId,
            soundcastId,
          };
  }
};

const sendPush = (content, deviceId) => {
  firebase
    .messaging()
    .send({ data: content, token: deviceId })
    .then(res => console.log(res));
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
                if (user.token !== undefined) {
                  user.token.forEach(t => sendPush(getContentPush(comment), t)); // FIX ME
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
  console.log(fbComment);
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
      if (comment.episodeId !== undefined && commentId.fullName !== undefined) {
        console.log(commentId.fullName);
        firebase
          .database()
          .ref(`episodes/${comment.episodeId}/lastLike`)
          .set(commentId.fullName);
      }
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
            if (user.token !== undefined) {
              user.token.forEach(t => sendPush(getContentPush(like), t)); // push
            }
          });
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
