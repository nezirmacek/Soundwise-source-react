'use strict';

const _ = require('lodash');
const moment = require('moment');
const {
  commonManager,
  invitationManager,
  publisherManager,
  soundcastManager,
  userManager,
} = require('../managers');
const mailingService = require('./mailing');
const { userRepository } = require('../repositories');

const replaceDots = x => x.replace('.', '(dot)');

const subscribeToSoundcast = async (soundcastId, userId, email) => {
  const soundcast = await soundcastManager.getById(soundcastId);

  if (soundcast) {
    if (soundcast.bundle) {
      await Promise.all(
        soundcast.soundcastsIncluded.map(id =>
          subscribeToSoundcast(id, userId, email)
        )
      );
    } else {
      const { inviteeEmailList, subscriberEmailList, publisherID } = soundcast;

      const emailWithDotsReplaced = replaceDots(email);

      if (inviteeEmailList) {
        try {
          await mailingService.deleteFromMailingList([email], inviteeEmailList);
        } catch (error) {
          console.log(error);
        }
      }

      try {
        await mailingService.addToMailingList(
          soundcastId,
          [email],
          'subscriberEmailList',
          subscriberEmailList
        );
      } catch (error) {
        console.log(error);
      }

      try {
        await commonManager.update({
          [`users/${userId}/soundcasts/${soundcastId}`]: {
            subscribed: true,
            date_subscribed: moment().format('X'),
            current_period_end: moment()
              .add(100, 'years')
              .unix(),
          },
          [`invitations/${emailWithDotsReplaced}/${soundcastId}`]: false,
          [`soundcasts/${soundcastId}/invited/${emailWithDotsReplaced}`]: false,
          [`publishers/${publisherID}/freeSubscribers/${userId}/${soundcastId}`]: true,
          [`soundcasts/${soundcastId}/subscribed/${userId}`]: true,
        });
      } catch (error) {
        console.log(error);
      }

      try {
        await publisherManager.incrementFreeSubscriberCount(publisherID);
      } catch (error) {
        console.log(error);
      }
    }
  }
};

const completeSignUp = async ({ email, firstName, lastName, picUrl }) => {
  const emailWithDotsReplaced = replaceDots(email);

  let userId;

  try {
    userId = await userManager.getId(email);
  } catch (error) {
    console.log(error);
  }

  if (userId) {
    const userInfo = {
      firstName: _.capitalize(firstName.trim()),
      lastName: _.capitalize(lastName.trim()),
      email: [email.trim().toLowerCase()],
      pic_url: picUrl,
    };

    try {
      await userManager.update(
        userId,
        _.pickBy(userInfo, x => !(_.isNil(x) || _.isEmpty(x)))
      );
    } catch (error) {
      console.log(error);
    }

    try {
      await userRepository.create({
        userId,
        email,
        firstName,
        lastName,
        picUrl,
      });
    } catch (error) {
      console.log(error);
    }

    let invitations;

    try {
      invitations = await invitationManager.getUserInvitations(
        emailWithDotsReplaced
      );
    } catch (error) {
      console.log(error);
    }

    if (invitations) {
      await Promise.all(
        invitations.map(soundcastId =>
          subscribeToSoundcast(soundcastId, userId, email)
        )
      );
    }
  }

  await mailingService.sendTransactionalEmails(
    [{ firstName, lastName, email }],
    `What are you creating, ${_.capitalize(firstName)}?`,
    `<p>Hello ${_.capitalize(
      firstName
    )},</p><p></p><p>This is Natasha, founder of Soundwise. We're so excited to have you join our expanding community of knowledge creators!</p><p>If you're creating a podcast, make sure to check out our <a href="http://bit.ly/2IILSGm">quick start guide</a> and <a href="http://bit.ly/2qlyVKK">"how to get subscribers" guide</a>.</p><p>I'm curious...would you mind sharing what kind of content you're creating? </p><p></p><p>Click reply and let me know.</p><p></p><p>Natasha</p><p></p><p>p.s. If you need help with anything related to creating your audio program, please don't hesitate to shoot me an email. We'll try our best to help.</p>`,
    'Natasha Che',
    'natasha@mysoundwise.com',
    null,
    true,
    'natasha@mysoundwise.com'
  );
};

const editUserInfo = (req, res) => {
  const userId = req.params.id;
  let userInfo = req.body;
  // for firebase naming pic_url
  if (userInfo.picURL) {
    userInfo = { pic_url: userInfo.picURL, ..._.omit(userInfo, ['picURL']) };
  }
  userRepository.update(userInfo, userId).then(() =>
    userManager
      .update(userId, userInfo)
      .then(() => res.send({ status: 'OK' }))
      .catch(error => res.status(500).send({ error }))
  );
};

module.exports = {
  completeSignUp,
  editUserInfo,
};
