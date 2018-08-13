'use strict';

const database = require('../../database');

const get = id =>
  database.Soundcast.findOne({
    where: { soundcastId: id },
  });

const create = soundcast => database.Soundcast.create(soundcast);

module.exports = {
  get,
  create,
};
