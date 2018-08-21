'use strict';
const moment = require('moment');
const firebase = require('firebase-admin');
const {userManager} = require('../managers');

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
    .then(snap => userManager.getById(snap.val()));

module.exports = {
  getById,
  addCommentToEpisode,
  removeCommentToEpisode,
  getUserParentComment,
};
