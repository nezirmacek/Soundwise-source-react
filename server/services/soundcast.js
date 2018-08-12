'use strict';

const soundcastRepository = require('../repositories').soundcastRepository;

const createOrUpdate = data =>
  soundcastRepository.get(data.soundcastId).then(
    obj =>
      obj
        ? obj.update({
            landingPage: data.landingPage,
            publisherId: data.publisherId,
            imageUrl: data.imageUrl,
            updateDate: data.last_update,
          })
        : soundcastRepository.create(data)
  );

module.exports = {
  createOrUpdate,
};
