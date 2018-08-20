'use strict';
const moment = require('moment');
const firebase = require('firebase-admin');

const getById = id =>
  firebase
    .database()
    .ref(`comments/${id}`)
    .once('value')
    .then(snapshot => (snapshot.exists() ? snapshot.val() : null));

const addCommentToEpisode = (id, comment) =>
  firebase
    .database()
    .ref(`episodes/${comment.episodeID}/comments/${id}`)
    .set(moment().format('X'));

const removeCommentToEpisode = (id, comment) =>
  firebase
    .database()
    .ref(`episodes/${comment.episodeId}/comments/${id}`)
    .remove();

const getUserParentComment = id =>
  firebase
    .database()
    .ref(`comments/${id}/userID`)
    .once('value')
    .then(snap =>
      firebase
        .database()
        .ref(`users/${snap.val()}`)
        .once('value')
        .then(
          snapshot =>
            snapshot.val()
              ? Object.assign({}, { id: snapshot.key }, snapshot.val())
              : null
        )
    );

module.exports = {
  getById,
  addCommentToEpisode,
  removeCommentToEpisode,
  getUserParentComment,
};
