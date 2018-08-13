'use strict';

const soundcastRepository = require('../repositories').soundcastRepository;

const createOrUpdate = data =>
  soundcastRepository
    .get(data.soundcastId)
    .then(obj => (obj ? obj.update(data) : soundcastRepository.create(data)));

module.exports = {
  createOrUpdate,
};
