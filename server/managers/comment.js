'use strict';
const moment = require('moment');
const firebase = require('firebase-admin');

const getById = id =>
  firebase
    .database()
    .ref(`comments/${id}`)
    .once('value')
    .then(snapshot => (snapshot.exists() ? snapshot.val() : null));

const childComment = (id, comment) =>
  firebase
    .database()
    .ref(
      comment.announcementID
        ? `messages/${comment.announcementID}/comments/${id}`
        : `episodes/${comment.episodeID}/comments/${id}`
    )
    .set(moment().format('X'));

const addComment = (id, comment) =>
  firebase
    .database()
    .ref(`comments/${id}`)
    .set(comment)
    .then(() => childComment(id, comment));

const updateComment = (id, comment) =>
  firebase
    .database()
    .ref(`comments/${id}`)
    .update(comment)
    .then(() => childComment(id, comment));

const removeComment = (id, comment) =>
  firebase
    .database()
    .ref(
      comment.announcementId
        ? `messages/${comment.announcementId}/comments/${id}`
        : `episodes/${comment.episodeId}/comments/${id}`
    )
    .remove()
    .then(() =>
      firebase
        .database()
        .ref(`comments/${id}`)
        .remove()
    );

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
        .then(snapshot => (snapshot.val() ? snapshot.val() : null))
    );

module.exports = {
  getById,
  addComment,
  updateComment,
  removeComment,
  getUserParentComment,
};
