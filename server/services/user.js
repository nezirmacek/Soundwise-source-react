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

const replaceDots = x => x.replace('.', '(dot)');

const registerSoundcastOnPostgres = (
  email,
  soundcastID,
  subscriberEmailList,
  inviteeEmailList
) => {
  if (inviteeEmailList) {
    fetch(API.DELETE_EMAIL, {
      method: 'post',
      body: JSON.stringify({ emails: [email], emailListId: inviteeEmailList }),
    });
  }

  fetch(API.ADD_EMAIL, {
    method: 'post',
    body: JSON.stringify({
      emailAddressArr: [email],
      emailListId: subscriberEmailList,
      soundcastID,
      listName: 'subscriberEmailList',
    }),
  });
};

const signUp = ({ email, firstName, lastName, facebookId, picUrl }) => {
  const emailWithDotsReplaced = replaceDots(email);
  const id = 0;

  invitationManager
    .getUserInvitations(emailWithDotsReplaced)
    .then(invitations =>
      Promise.all(
        invitations.map(soundcastID =>
          soundcastManager.getById(soundcastID).then(soundcast => {
            const {
              inviteeEmailList,
              subscriberEmailList,
              publisherID,
            } = soundcast;

            registerSoundcastOnPostgres(
              email,
              soundcastID,
              subscriberEmailList,
              inviteeEmailList
            );

            return commonManager
              .update({
                [`users/${id}/soundcasts/${soundcastID}`]: {
                  subscribed: true,
                  date_subscribed: moment().format('X'),
                  current_period_end: moment()
                    .add(100, 'years')
                    .unix(),
                },
                [`invitations/${emailWithDotsReplaced}/${soundcastID}`]: false,
                [`soundcasts/${soundcastID}/invited/${emailWithDotsReplaced}`]: false,
                [`publishers/${publisherID}/freeSubscribers/${id}/${soundcastID}`]: true,
                [`soundcasts/${soundcastID}/subscribed/${id}`]: true,
              })
              .then(() =>
                publisherManager.incrementFreeSubscriberCount(publisherID)
              );
          })
        )
      )
    );

  const userInfo = {
    firstName: _.capitalize(firstName.trim()),
    lastName: _.capitalize(lastName.trim()),
    email: email.trim().toLowerCase(),
  };

  userManager.update(
    id,
    _.pickBy(userInfo, x => !(_.isNil(x) || _.isEmpty(x)))
  );
};

module.exports = {
  signUp,
};
