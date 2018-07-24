'use strict';

const soundcastRepository = require('../repositories').soundcastRepository;

const createOrUpdate = data =>
  soundcastRepository.get(data.soundcastId).then(
    obj =>
      obj
        ? obj.update({
            publisherId: data.publisherId,
            title: data.title,
          })
        : soundcastRepository.create(data)
  );

module.exports = {
  createOrUpdate,
};
