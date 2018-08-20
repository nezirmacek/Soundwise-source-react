'use strict';
const moment = require('moment');
const firebase = require('firebase-admin');

const getById = id =>
  firebase
    .database()
    .ref(`likes/${id}`)
    .once('value')
    .then(snapshot => (snapshot.exists() ? snapshot.val() : null));

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
        return `${user.firstName} ${user.lastName}`;
      } else {
        return '';
      }
    });

module.exports = {
  getById,
  setFullName,
  setLikesCount,
  getFullNameByUid,
  updateLikeInEpisode,
};
