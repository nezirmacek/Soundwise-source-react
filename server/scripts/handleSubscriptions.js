'use strict';
const moment = require('moment');
const {
  publisherManager,
  soundcastManager,
  userManager,
} = require('../managers');
const {mailingService, subscriptionService} = require('../services');

const unsubscribe = (req, res) => {
  const {paymentId, userId, soundcastId, publisherId} = req.body;

  userManager
    .getById(userId)
    .then(user =>
      soundcastManager
        .getById(soundcastId)
        .then(soundcast =>
          mailingService.deleteFromMailingList(
            user.email,
            soundcast.subscriberEmailList
          )
        )
    );

  soundcastManager
    .removeSubscribedUser(soundcastId, userId)
    .then(() =>
      userManager
        .unsubscribe(userId, soundcastId)
        .then(
          () =>
            paymentId
              ? subscriptionService
                  .delStripeSubscriptions(paymentId)
                  .then(
                    response =>
                      response
                        ? res.status(200).send(response)
                        : res.status(500).send({error: response})
                  )
              : publisherManager
                  .removeFreeSubscriberCount(publisherId, userId, soundcastId)
                  .then(() =>
                    publisherManager
                      .decrementFreeSubscriberCount(publisherId)
                      .then(() => res.status(200).send({}))
                  )
        )
    )
    .catch(error =>
      res.status(500).send({message: 'Failed free unsubscription', error})
    );
};

const subscribe = (req, res) => {
  const {soundcastId, userId, publisherId} = req.body;
  soundcastManager
    .getById(soundcastId)
    .then(
      soundcast =>
        soundcast.bundle
          ? soundcast.soundcastsIncluded.forEach(id => actSubscribe(id))
          : actSubscribe(soundcastId)
    );

  const actSubscribe = id => {
    soundcastManager
      .addSubscribedUser(id, userId)
      .then(() =>
        userManager
          .subscribe(userId, id)
          .then(() =>
            publisherManager
              .incrementFreeSubscriberCount(publisherId)
              .then(() => res.status(200).send({}))
          )
      );
  };
};

const addSoundcastToUser = (charge, soundcast, userId) => {
  const paymentID = charge.id ? charge.id : null;
  const planID = charge.plan ? charge.plan.id : null;
  const billingCycle = soundcast.billingCycle ? soundcast.billingCycle : null;
  const currentPeriodEnd = charge.current_period_end
    ? charge.current_period_end
    : moment()
        .add(100, 'years')
        .format('X');
  userManager
    .subscribe(userId, soundcast.soundcastId, paymentID, {
      currentPeriodEnd,
      billingCycle,
      planID,
    })
    .then(() =>
      soundcastManager.addSubscribedUser(soundcast.soundcastId, userId)
    )
    .catch(err => err);
};

module.exports = {subscribe, unsubscribe};
