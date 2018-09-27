'use strict';

const Op = require('sequelize').Op;
const {
  eventRepository,
  userRepository,
  soundcastRepository,
} = require('../repositories');
const { EventTypes } = require('../scripts/utils')();
const {
  User,
  Episode,
  Announcement,
  Soundcast,
  Comment,
} = require('../../database');

const eventCreators = {};

const handleEvent = async (type, data) => {
  let event = await createEvent(type, data);
  try {
    event = await eventRepository.create(event);
    console.log(`Event ${type} created`);
  } catch (err) {
    console.log('Failed to save event to the database');
  }
};

const createEvent = async (type, data) => {
  // Validate type
  if (!Object.values(EventTypes).includes(type)) {
    throw TypeError(`Event type ${type} is not supported by EventFactory.`);
  }

  try {
    const event = await eventCreators[type](data);
    return event;
  } catch (e) {
    console.log(`Failed to compose Event ${type}`, e);
  }
};

eventCreators[EventTypes.NEW_EPISODE_PUBLISHED] = async episode => {
  const event = {
    type: EventTypes.NEW_EPISODE_PUBLISHED,
    episodeId: episode.episodeId,
    soundcastId: episode.soundcastId,
    publisherId: episode.publisherId,
    avatarUrl: episode.imageUrl,
    story: `${episode.soundcastTitle} published ${episode.title}`,
  };
  return event;
};

eventCreators[EventTypes.NEW_MESSAGE_POSTED] = async announcement => {
  const { soundcastId, announcementId, creatorId, publisherId } = announcement;
  const hostUser = await userRepository.findById(creatorId);
  const soundast = await soundcastRepository.findById(soundcastId);
  const event = {
    type: EventTypes.NEW_MESSAGE_POSTED,
    announcementId,
    soundcastId,
    publisherId,
    userId: announcement.creatorId,
    avatarUrl: soundcast.imageUrl,
    firstName: hostUser.firstName,
    lastName: hostUser.lastName,
    story: `${hostUser.firstName} ${hostUser.lastName} sent you a message`,
  };

  return event;
};

eventCreators[EventTypes.EPISODE_LIKED] = async episode_like => {
  const { episodeId, soundcastId, userId, likeId } = episode_like;
  const user = await userRepository.findById(userId);
  const episode = await Episode.findOne({ where: { episodeId } });

  const event = {
    type: EventTypes.EPISODE_LIKED,
    likeId,
    episodeId,
    soundcastId,
    userId,
    avatarUrl: user.picURL,
    firstName: user.firstName,
    lastName: user.lastName,
    story: `${user.firstName} ${user.lastName} liked ${episode.title}`,
  };

  return event;
};

eventCreators[EventTypes.MESSAGE_LIKED] = async announcement_like => {
  const { announcementId, soundcastId, userId, likeId } = announcement_like;
  const user = await User.findOne({ where: { userId } });
  const announcement = await Announcement.findOne({
    where: { announcementId },
  });
  const hostUser = await User.findOne({
    where: { userId: announcement.creatorId },
  });

  const event = {
    type: EventTypes.MESSAGE_LIKED,
    likeId,
    announcementId,
    soundcastId,
    userId,
    avatarUrl: user.picURL,
    firstName: user.firstName,
    lastName: user.lastName,
    story: `${hostUser.firstName} ${hostUser.lastName} liked ${
      hostUser.firstName
    } ${hostUser.lastName}'s message`,
  };

  return event;
};

eventCreators[EventTypes.EP_COMMENT_LIKED] = async ep_comment_like => {
  const { episodeId, soundcastId, userId, likeId, commentId } = ep_comment_like;

  const user = await User.findOne({ where: { userId } });
  const episode = await Episode.findOne({ where: { episodeId } });

  const event = {
    type: EventTypes.EP_COMMENT_LIKED,
    likeId,
    commentId,
    episodeId,
    soundcastId,
    userId,
    avatarUrl: user.picURL,
    firstName: user.firstName,
    lastName: user.lastName,
    story: `${user.firstName} ${user.lastName} liked your comment on ${
      episode.title
    }`,
  };

  return event;
};

eventCreators[EventTypes.MSG_COMMENT_LIKED] = async msg_comment_like => {
  const {
    announcementId,
    soundcastId,
    userId,
    likeId,
    commentId,
  } = msg_comment_like;

  const user = await User.findOne({ where: { userId } });
  const soundcast = await Soundcast.findOne({ where: { soundcastId } });

  const event = {
    type: EventTypes.MSG_COMMENT_LIKED,
    likeId,
    commentId,
    announcementId,
    soundcastId,
    userId,
    avatarUrl: user.picURL,
    firstName: user.firstName,
    lastName: user.lastName,
    story: `${user.firstName} ${
      user.lastName
    } liked your comment on a message from ${soundcast.title}`,
  };

  return event;
};

eventCreators[EventTypes.EPISODE_COMMENTED] = async episode_comment => {
  const { soundcastId, episodeId, userId, commentId } = episode_comment;

  const user = await User.findOne({ where: { userId } });
  const episode = await Episode.findOne({ where: { episodeId } });

  const event = {
    type: EventTypes.EPISODE_COMMENTED,
    commentId,
    episodeId,
    soundcastId,
    userId,
    avatarUrl: user.picURL,
    firstName: user.firstName,
    lastName: user.lastName,
    story: `${user.firstName} ${user.lastName} commented on ${episode.title}`,
  };

  return event;
};

eventCreators[EventTypes.EP_COMMENT_REPLIED] = async ep_comment_reply => {
  const {
    episodeId,
    soundcastId,
    userId,
    commentId,
    parentId,
  } = ep_comment_reply;

  const user = await User.findOne({ where: { userId } });
  const episode = await Episode.findOne({ where: { episodeId } });
  const parentComment = await Comment.findOne({
    where: { commentId: parentId },
  });

  const event = {
    type: EventTypes.EP_COMMENT_REPLIED,
    commentId,
    episodeId,
    soundcastId,
    userId,
    parentUserId: parentComment.userId,
    avatarUrl: user.picURL,
    firstName: user.firstName,
    lastName: user.lastName,
    story: `${user.firstName} ${user.lastName} replied to your comment on ${
      episode.title
    }`,
  };

  return event;
};

eventCreators[EventTypes.MESSAGE_COMMENTED] = async message_comment => {
  const { soundcastId, announcementId, userId, commentId } = message_comment;

  const user = await User.findOne({ where: { userId } });
  const soundcast = await Soundcast.findOne({ where: { soundcastId } });

  const event = {
    type: EventTypes.MESSAGE_COMMENTED,
    commentId,
    announcementId,
    soundcastId,
    userId,
    avatarUrl: user.picURL,
    firstName: user.firstName,
    lastName: user.lastName,
    story: `${user.firstName} ${user.lastName} commented on a message from ${
      soundcast.title
    }`,
  };

  return event;
};

eventCreators[EventTypes.MSG_COMMENT_REPLIED] = async msg_comment_reply => {
  const {
    announcementId,
    soundcastId,
    userId,
    commentId,
    parentId,
  } = msg_comment_reply;

  const user = await User.findOne({ where: { userId } });
  const soundcast = await Soundcast.findOne({ where: { soundcastId } });
  const parentComment = await Comment.findOne({
    where: { commentId: parentId },
  });

  const event = {
    type: EventTypes.MSG_COMMENT_REPLIED,
    commentId,
    announcementId,
    soundcastId,
    userId,
    parentUserId: parentComment.userId,
    parentId,
    avatarUrl: user.picURL,
    firstName: user.firstName,
    lastName: user.lastName,
    story: `${user.firstName} ${
      user.lastName
    } replied to your comment on a message from ${soundcast.title}`,
  };

  return event;
};

const sendError = (err, res) => {
  console.log(err);
  res.status(500).send(err);
};

module.exports = { handleEvent };
