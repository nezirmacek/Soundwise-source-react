'use strict';

const commonManager = require('./common');
const invitationManager = require('./invitation');
const mailingManager = require('./mailing');
const publisherManager = require('./publisher');
const soundcastManager = require('./soundcast');
const userManager = require('./user');

module.exports = {
  commonManager,
  invitationManager,
  mailingManager,
  publisherManager,
  soundcastManager,
  userManager,
};
