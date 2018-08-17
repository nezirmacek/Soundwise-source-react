var Sequelize = require('sequelize');
var db;

if (process.env.DATABASE_URL) {
  var match = process.env.DATABASE_URL.match(
    /postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/
  );
  db = new Sequelize(match[5], match[1], match[2], {
    dialect: 'postgres',
    protocol: 'postgres',
    port: match[4],
    host: match[3],
    logging: false,
    dialectOptions: {
      ssl: false,
    },
  });
} else {
  db = new Sequelize('soundwise', 'root', '111', {
    dialect: 'postgres',
    port: 5432,
    logging: false,
    dialectOptions: {
      ssl: false,
    },
  });
}

var User = db.define('User', {
  userId: { type: Sequelize.STRING, primaryKey: true },
  firstName: Sequelize.STRING,
  lastName: Sequelize.STRING,
  picURL: Sequelize.STRING,
});

var Comment = db.define('Comment', {
  commentId: { type: Sequelize.STRING, primaryKey: true },
  content: Sequelize.TEXT,
  userId: { type: Sequelize.STRING, allowNull: false },
  announcementId: Sequelize.STRING,
  parentId: { type: Sequelize.STRING, allowNull: true },
  episodeId: Sequelize.STRING,
  soundcastId: Sequelize.STRING,
  timeStamp: Sequelize.BIGINT,
});

var Announcement = db.define('Announcement', {
  announcementId: { type: Sequelize.STRING, primaryKey: true },
  content: Sequelize.STRING,
  userId: { type: Sequelize.STRING, allowNull: false },
  publisherId: { type: Sequelize.STRING, allowNull: false },
  soundcastId: { type: Sequelize.STRING, allowNull: false },
});

var Like = db.define('Like', {
  likeId: { type: Sequelize.STRING, primaryKey: true },
  userId: { type: Sequelize.STRING, allowNull: false },
  soundcastId: { type: Sequelize.STRING, allowNull: false },
  episodeId: Sequelize.STRING,
  announcementId: Sequelize.STRING,
  commentId: Sequelize.STRING,
  timeStamp: Sequelize.BIGINT,
});

var Episode = db.define('Episode', {
  episodeId: { type: Sequelize.STRING, primaryKey: true },
  soundcastId: { type: Sequelize.STRING, allowNull: false },
  publisherId: { type: Sequelize.STRING, allowNull: false },
  title: Sequelize.STRING,
  soundcastTitle: Sequelize.STRING,
  imageUrl: Sequelize.STRING,
});

var Soundcast = db.define('Soundcast', {
  soundcastId: { type: Sequelize.STRING, primaryKey: true },
  publisherId: { type: Sequelize.STRING, allowNull: false },
  title: Sequelize.STRING,
  imageUrl: Sequelize.STRING,
  itunesId: Sequelize.STRING, // if the soundcast is imported from itunes
  category: Sequelize.STRING,
  rank: Sequelize.FLOAT,
  updateDate: Sequelize.BIGINT,
  published: Sequelize.BOOLEAN,
  landingPage: Sequelize.BOOLEAN,
});

var Publisher = db.define('Publisher', {
  publisherId: { type: Sequelize.STRING, primaryKey: true },
  name: { type: Sequelize.STRING, allowNull: false },
  paypalEmail: { type: Sequelize.STRING },
  imageUrl: Sequelize.STRING,
});

var ListeningSession = db.define('ListeningSession', {
  //<------ a session is the period between user starting to play an audio and the audio being paused
  sessionId: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  soundcastId: { type: Sequelize.STRING, allowNull: false },
  episodeId: { type: Sequelize.STRING, allowNull: false },
  userId: { type: Sequelize.STRING, allowNull: false },
  publisherId: { type: Sequelize.STRING, allowNull: false },
  date: { type: Sequelize.DATEONLY, allowNull: false },
  startPosition: { type: Sequelize.INTEGER, allowNull: false }, //in seconds, where in the audio file the session started
  endPosition: { type: Sequelize.INTEGER, allowNull: false }, //in seconds, where in the audio file the session ended
  sessionDuration: { type: Sequelize.INTEGER, allowNull: false }, //in seconds
  percentCompleted: { type: Sequelize.INTEGER, allowNull: false }, //0 - 100, equal to endPosition / total audio file length * 100
});

var Transaction = db.define('Transaction', {
  // records of listener payments and refunds
  transactionId: { type: Sequelize.STRING, allowNull: false, primaryKey: true },
  invoiceId: { type: Sequelize.STRING }, //only present if the charge is associated with a subscription invoice
  chargeId: { type: Sequelize.STRING, allowNull: false },
  refundId: { type: Sequelize.STRING },
  type: { type: Sequelize.STRING, allowNull: false }, //'charge' or 'refund'
  amount: { type: Sequelize.DECIMAL(7, 2), allowNull: false },
  date: { type: Sequelize.DATEONLY, allowNull: false },
  publisherId: { type: Sequelize.STRING, allowNull: false },
  soundcastId: { type: Sequelize.STRING },
  customer: { type: Sequelize.STRING, allowNull: false }, // listener's stripe id
  description: { type: Sequelize.STRING },
  paymentId: { type: Sequelize.STRING }, // id for the payment plan
  refund_date: { type: Sequelize.DATEONLY },
});

var Payout = db.define('Payout', {
  // records of payouts
  payoutId: { type: Sequelize.STRING, primaryKey: true }, // id for the payout item returned by paypal's webhook event
  amount: { type: Sequelize.DECIMAL(7, 2), allowNull: false },
  date: { type: Sequelize.DATEONLY, allowNull: false },
  publisherId: { type: Sequelize.STRING, allowNull: false },
  email: { type: Sequelize.STRING }, //email address used to send paypal payout
});

var Message = db.define('Message', {
  messageId: { type: Sequelize.STRING, primaryKey: true, allowNull: false },
  content: { type: Sequelize.STRING, allowNull: false },
  creatorId: { type: Sequelize.STRING, allowNull: false },
  publisherId: { type: Sequelize.STRING, allowNull: false },
  soundcastId: { type: Sequelize.STRING, allowNull: false },
  isPublished: Sequelize.BOOLEAN,
});

var PlatformCharges = db.define(
  'PlatformCharges',
  {
    publisherId: { type: Sequelize.STRING, allowNull: false },
    stripeCustomerId: { type: Sequelize.STRING, allowNull: false },
    subscriptionPlanName: { type: Sequelize.STRING, allowNull: false },
    subscriptionPlanId: { type: Sequelize.STRING, allowNull: false },
    subscriptionId: { type: Sequelize.STRING, allowNull: false },
    chargeId: { type: Sequelize.STRING, allowNull: false },
    chargeAmount: { type: Sequelize.DECIMAL(7, 2), allowNull: false },
    coupon: { type: Sequelize.STRING },
    referredBy: { type: Sequelize.STRING },
  },
  {
    indexes: [
      { fields: ['publisherId'] },
      { fields: ['chargeId'] },
      { fields: ['subscriptionId'] },
      { fields: ['referredBy'] },
    ],
  }
);

var Transfers = db.define(
  'Transfers',
  {
    affiliateId: { type: Sequelize.STRING, allowNull: false },
    affiliateStripeAccountId: { type: Sequelize.STRING, allowNull: false },
    subscriptionId: { type: Sequelize.STRING, allowNull: false },
    chargeId: { type: Sequelize.STRING, allowNull: false },
    chargeAmount: { type: Sequelize.DECIMAL(7, 2), allowNull: false },
    transferAmount: { type: Sequelize.DECIMAL(7, 2), allowNull: false },
  },
  {
    indexes: [
      { fields: ['affiliateId'] },
      { fields: ['subscriptionId'] },
      { fields: ['chargeId'] },
    ],
  }
);

var Event = db.define('Event', {
  type: { type: Sequelize.STRING, allowNull: false },
  story: { type: Sequelize.STRING, allowNull: false },
  userId: { type: Sequelize.STRING, allowNull: true },
  firstName: { type: Sequelize.STRING, allowNull: true },
  lastName: { type: Sequelize.STRING, allowNull: true },
  avatarUrl: { type: Sequelize.STRING, allowNull: true },
  episodeId: { type: Sequelize.STRING, allowNull: true },
  likeId: { type: Sequelize.STRING, allowNull: true },
  soundcastId: { type: Sequelize.STRING, allowNull: true },
  messageId: { type: Sequelize.STRING, allowNull: true },
  publisherId: { type: Sequelize.STRING, allowNull: true },
  commentId: { type: Sequelize.STRING, allowNull: true },
  commentUserId: { type: Sequelize.STRING, allowNull: true },
  parentId: { type: Sequelize.STRING, allowNull: true },
  parentUserId: { type: Sequelize.STRING, allowNull: true },
});

var ImportedFeed = db.define(
  'ImportedFeed',
  {
    soundcastId: { type: Sequelize.STRING, allowNull: false },
    published: { type: Sequelize.BOOLEAN, allowNull: false },
    title: { type: Sequelize.STRING, allowNull: false },
    feedUrl: { type: Sequelize.STRING, allowNull: false },
    originalUrl: { type: Sequelize.STRING, allowNull: false },
    imageURL: { type: Sequelize.STRING, allowNull: false },
    updated: { type: Sequelize.BIGINT, allowNull: false },
    publisherId: { type: Sequelize.STRING, allowNull: false },
    userId: { type: Sequelize.STRING, allowNull: false },
    claimed: { type: Sequelize.BOOLEAN, allowNull: false },
    itunesId: { type: Sequelize.STRING, allowNull: true },
  },
  {
    indexes: [
      { fields: ['soundcastId'] },
      { fields: ['publisherId'] },
      { fields: ['feedUrl'] },
    ],
  }
);

var Category = db.define(
  'Category',
  {
    // records of payouts
    name: { type: Sequelize.STRING, allowNull: false },
    soundcastId: { type: Sequelize.STRING, allowNull: false },
    iconUrl: Sequelize.STRING,
  },
  {
    indexes: [{ fields: ['name'] }, { fields: ['soundcastId'] }],
  }
);

var PodcasterEmail = db.define(
  'PodcasterEmail',
  {
    // records of payouts
    podcastTitle: { type: Sequelize.STRING, allowNull: false },
    publisherEmail: { type: Sequelize.STRING, allowNull: false },
    last_update: { type: Sequelize.STRING, allowNull: false },
  },
  {
    indexes: [{ fields: ['publisherEmail'] }, { fields: ['last_update'] }],
  }
);

var Coupon = db.define('Coupon', {
  coupon: { type: Sequelize.STRING, allowNull: false },
  soundcastId: { type: Sequelize.STRING, allowNull: false },
  soundcastTitle: { type: Sequelize.STRING, allowNull: false },
  publisherId: Sequelize.STRING,
  userId: Sequelize.STRING,
  timeStamp: Sequelize.BIGINT,
});

// Comment.belongsTo(Episode, {foreignKey: 'episodeId'});
// Episode.hasMany(Comment, {as: 'Comments'});

// Comment.belongsTo(Announcement, {foreignKey: 'announcementId'});
// Announcement.hasMany(Comment, {as: 'Comments'});

// Like.belongsTo(Comment, {foreignKey: 'commentId'});
// Comment.hasMany(Like, {as: 'Likes'});

// Comment.belongsTo(User, {foreignKey: 'userId'});
// User.hasMany(Comment, {as: 'Comments'});

// Episode.belongsTo(Soundcast, {foreignKey: 'soundcastId'});
// Soundcast.hasMany(Episode, {as: 'Episodes'});

// User.belongsToMany(Soundcast, {through: 'UserSoundcast', foreignKey: 'userId', otherKey: 'soundcastId'});
// Soundcast.belongsToMany(User, {through: 'UserSoundcast', foreignKey: 'soundcastId', otherKey: 'userId'});

// User.belongsToMany(Episode, {through: 'UserEpisode', foreignKey: 'userId', otherKey: 'episodeId'});
// Episode.belongsToMany(User, {through: 'UserEpisode', foreignKey: 'episodeId', otherKey: 'userId'});

// ListeningSession.belongsTo(Soundcast, {foreignKey: 'soundcastId'});
// Soundcast.hasMany(ListeningSession, {as: 'ListeningSessions'});

// ListeningSession.belongsTo(Episode, {foreignKey: 'episodeId'});
// Episode.hasMany(ListeningSession, {as: 'ListeningSessions'});

// ListeningSession.belongsTo(User, {foreignKey: 'userId'});
// User.hasMany(ListeningSession, {as: 'ListeningSessions'});

// Announcement.belongsTo(User, {foreignKey: 'userId'});
// User.hasMany(Announcement, {as: 'Announcements'});

// Like.belongsTo(User, {foreignKey: 'userId'});
// User.hasMany(Like, {as: 'Likes'});

// Like.belongsTo(Episode, {foreignKey: 'episodeId'});
// Episode.hasMany(Like, {as: 'Likes'});

// Like.belongsTo(Announcement, {foreignKey: 'announcementId'});
// Announcement.hasMany(Like, {as: 'Likes'});

// Announcement.belongsTo(Soundcast, {foreignKey: 'soundcastId'});
// Soundcast.hasMany(Announcement, {as: 'Announcements'});

// Like.belongsTo(Soundcast, {foreignKey: 'soundcastId'});
// Soundcast.hasMany(Like, {as: 'Likes'});

// Announcement.belongsTo(Publisher, {foreignKey: 'publisherId'});
// Publisher.hasMany(Announcement, {as: 'Announcements'});

// Transaction.belongsTo(Soundcast, {foreignKey: 'soundcastId'});
// Soundcast.hasMany(Transaction, {as: 'Transactions'});

// Transaction.belongsTo(Publisher, {foreignKey: 'publisherId'});
// Publisher.hasMany(Transaction, {as: 'Transactions'});

// Payout.belongsTo(Publisher, {foreignKey: 'publisherId'});
// Publisher.hasMany(Payout, {as: 'Payouts'});

// Category.belongsTo(Soundcast, {foreignKey: 'soundcastId'});
// Soundcast.hasMany(Category, {as: 'Categories'});

User.sync({ force: false, alter: true });
Publisher.sync({ force: false, alter: true });
Message.sync({ force: false, alter: true });
Comment.sync({ force: false, alter: true });
Announcement.sync({ force: false });
Like.sync({ force: false, alter: true });
Soundcast.sync({ force: false, alter: true });
Episode.sync({ force: false, alter: true });
ListeningSession.sync({ force: false, alter: true });
Transaction.sync({ force: false, alter: true });
Payout.sync({ force: false, alter: true });
Coupon.sync({ force: false, alter: true });
PlatformCharges.sync({ force: false, alter: true });
Transfers.sync({ force: false, alter: true });
Event.sync({ force: false, alter: true });
ImportedFeed.sync({ force: false, alter: true });
Category.sync({ force: false, alter: true });
PodcasterEmail.sync({ force: false, alter: true });

module.exports = {
  User,
  Publisher,
  Message,
  Comment,
  Announcement,
  Like,
  Soundcast,
  Episode,
  ListeningSession,
  Transaction,
  Payout,
  Coupon,
  PlatformCharges,
  Transfers,
  ImportedFeed,
  Event,
  db,
  Category,
  PodcasterEmail,
};
