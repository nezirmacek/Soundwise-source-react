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

const setLikesCount = (episodeId, count) =>
  firebase
    .database()
    .ref(`episodes/${episodeId}/likesCount`)
    .set(count);

const setFullName = (episodeId, fullName) =>
  firebase
    .database()
    .ref(`episodes/${episodeId}/lastLiked`)
    .set(fullName);

const updateLikeInEpisode = (episodeId, likesCount, lastLiked) =>
  firebase
    .database()
    .ref(`episodes/${episodeId}`)
    .update({ lastLiked, likesCount });

const getFullNameByUid = userId =>
  firebase
    .database()
    .ref(`users/${userId}`)
    .once('value')
    .then(snapshot => {
      if (snapshot.val()) {
        const user = snapshot.val();
        const fullName = `${user.firstName} ${user.lastName}`;
        return fullName || '';
      }
    });

module.exports = {
  getById,
  setFullName,
  setLikesCount,
  getFullNameByUid,
  updateLikeInEpisode,
};
