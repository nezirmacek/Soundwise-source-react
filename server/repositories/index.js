'use strict';

const announcementRepository = require('./announcement');
const soundcastRepository = require('./soundcast');
const commentRepository = require('./comment');
const userRepository = require('./user');

module.exports = {
  announcementRepository,
  soundcastRepository,
  commentRepository,
  userRepository,
};
