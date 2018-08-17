'use strict';
const moment = require('moment');
const firebase = require('firebase-admin');
const _ = require('lodash');

const getById = id =>
  firebase
    .database()
    .ref(`likes/${id}`)
    .once('value')
    .then(snapshot => (snapshot.exists() ? snapshot.val() : null));

const addLike = (id, like) =>
  firebase
    .database()
    .ref(`likes/${id}`)
    .set(like)
    .then(() =>
      firebase
        .database()
        .ref(
          like.announcementID
            ? `messages/${like.announcementID}/likes/${id}`
            : like.episodeId
              ? `episodes/${like.episodeID}/likes/${id}`
              : `comments/${like.commentID}/likes/${id}`
        )
        .set(moment().format('X'))
    );

const removeLike = (id, like) =>
  firebase
    .database()
    .ref(
      like.announcementId
        ? `messages/${like.announcementId}/likes/${id}`
        : like.episodeId
          ? `episodes/${like.episodeId}/likes/${id}`
          : `comments/${like.commentId}/likes/${id}`
    )
    .remove()
    .then(() =>
      firebase
        .database()
        .ref(`likes/${id}`)
        .remove()
    );

const setLikesCount = (path, count) =>
  firebase
    .database()
    .ref(path)
    .set(count);

const setFullName = (like, fullName) => {
  if (fullName !== undefined) {
    if (like.episodeId !== undefined) {
      return firebase
        .database()
        .ref(`episodes/${like.episodeId}/lastLiked`)
        .set(fullName)
        .then(() => fullName);
    } else if (like.announcementId !== undefined) {
      return firebase
        .database()
        .ref(`messages/${like.announcementId}/lastLiked`)
        .set(fullName)
        .then(() => fullName);
    }
  }
};

const setFullNameByUid = (userId, like) =>
  firebase
    .database()
    .ref(`users/${userId}`)
    .once('value')
    .then(snapshot => {
      if (snapshot.val()) {
        const user = snapshot.val();
        const fullName = `${user.firstName} ${user.lastName}`;
        setFullName(like, fullName);
      } else {
        return false;
      }
    });

module.exports = {
  getById,
  addLike,
  removeLike,
  setFullName,
  setLikesCount,
  setFullNameByUid,
};
