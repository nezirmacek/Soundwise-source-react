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
const {userRepository} = require('../repositories');

const replaceDots = x => x.replace('.', '(dot)');

const completeSignUp = async ({email, firstName, lastName, picUrl}) => {
  const emailWithDotsReplaced = replaceDots(email);

  const userId = await userManager.getId(email);

  if (userId) {
    const userInfo = {
      firstName: _.capitalize(firstName.trim()),
      lastName: _.capitalize(lastName.trim()),
      email: [email.trim().toLowerCase()],
      pic_url: picUrl,
    };

    await userManager.update(
      userId,
      _.pickBy(userInfo, x => !(_.isNil(x) || _.isEmpty(x)))
    );
  }

  await userRepository.create({
    userId,
    email,
    firstName,
    lastName,
    picUrl,
  });

  const invitations = await invitationManager.getUserInvitations(
    emailWithDotsReplaced
  );

  await Promise.all(
    invitations.map(async soundcastId => {
      const soundcast = await soundcastManager.getById(soundcastId);

      const {inviteeEmailList, subscriberEmailList, publisherID} = soundcast;

      if (inviteeEmailList) {
        await mailingService.deleteFromMailingList([email], inviteeEmailList);
      }

      await mailingService.addToMailingList(
        soundcastId,
        [email],
        'subscriberEmailList',
        subscriberEmailList
      );

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

      await publisherManager.incrementFreeSubscriberCount(publisherID);
    })
  );

  await mailingService.sendTransactionalEmails(
    [{firstName, lastName, email}],
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

module.exports = {
  completeSignUp,
};
