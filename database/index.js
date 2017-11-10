var Sequelize = require('sequelize');
var db;

if (process.env.DATABASE_URL) {
  var match = process.env.DATABASE_URL.match(/postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/)
  db = new Sequelize(match[5], match[1], match[2], {
    dialect: 'postgres',
    protocol: 'postgres',
    port: match[4],
    host: match[3],
    logging: true,
    dialectOptions: {
      ssl: true,
    },
  });
} else {
  db = new Sequelize('soundwise', 'root', '111', {
    dialect: 'postgres',
    port: 5432,
    logging: false,
  });
}

var User = db.define('User', {
  userId: { type: Sequelize.STRING, primaryKey: true },
  firstName: Sequelize.STRING,
  lastName: Sequelize.STRING,
  picURL: Sequelize.STRING,
});

var Episode = db.define('Episode', {
  episodeId: { type: Sequelize.STRING, primaryKey: true },
  soundcastId: { type: Sequelize.STRING, allowNull: false },
  publisherId: { type: Sequelize.STRING, allowNull: false },
  title: Sequelize.STRING,
  soundcastTitle: Sequelize.STRING
});

var Soundcast = db.define('Soundcast', {
  soundcastId: { type: Sequelize.STRING, primaryKey: true },
  publisherId: { type: Sequelize.STRING, allowNull: false },
  title: { type: Sequelize.STRING}
});

var Publisher = db.define('Publisher', {
	publisherId: { type: Sequelize.STRING, primaryKey: true },
    name: { type: Sequelize.STRING, allowNull: false },
	paypalEmail: { type: Sequelize.STRING },
});

var ListeningSession = db.define('ListeningSession', { //<------ a session is the period between user starting to play an audio and the audio being paused
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

var Transaction = db.define('Transaction', { // records of listener payments and refunds
  transactionId: { type: Sequelize.STRING, allowNull: false }, //'charge' or 'refund' id from stripe
  invoiceId: { type: Sequelize.STRING }, //only present if the charge is associated with a subscription invoice
  chargeId: { type: Sequelize.STRING, allowNull: false },
  type: { type: Sequelize.STRING, allowNull: false }, //'charge' or 'refund'
  amount: { type: Sequelize.DECIMAL(7, 2), allowNull: false },
  date: { type: Sequelize.DATEONLY, allowNull: false },
  publisherId: { type: Sequelize.STRING, allowNull: false },
  soundcastId: { type: Sequelize.STRING },
  customer: { type: Sequelize.STRING, allowNull: false }, // listener's stripe id
  paymentId: { type: Sequelize.STRING }, // id for the payment plan, only present if it's a subscription
});

var Payout = db.define('Payout', { // records of payouts
  batchId: { type: Sequelize.STRING, allowNull: false }, //id for the payout batch from paypal that this particular payout belongs to
  amount: { type: Sequelize.DECIMAL(7, 2), allowNull: false },
  date: { type: Sequelize.DATEONLY, allowNull: false },
  publisherId: { type: Sequelize.STRING, allowNull: false },
  email: { type: Sequelize.STRING, allowNull: false }, //email address used to send paypal payout
  payoutId: { type: Sequelize.STRING }, // id for the payout item returned by paypal's webhook event
});

Episode.belongsTo(Soundcast, {foreignKey: 'soundcastId'});
Soundcast.hasMany(Episode, {as: 'Episodes'});

User.belongsToMany(Soundcast, {through: 'UserSoundcast', foreignKey: 'userId', otherKey: 'soundcastId'});
Soundcast.belongsToMany(User, {through: 'UserSoundcast', foreignKey: 'soundcastId', otherKey: 'userId'});

User.belongsToMany(Episode, {through: 'UserEpisode', foreignKey: 'userId', otherKey: 'episodeId'});
Episode.belongsToMany(User, {through: 'UserEpisode', foreignKey: 'episodeId', otherKey: 'userId'});

ListeningSession.belongsTo(Soundcast, {foreignKey: 'soundcastId'});
Soundcast.hasMany(ListeningSession, {as: 'ListeningSessions'});

ListeningSession.belongsTo(Episode, {foreignKey: 'episodeId'});
Episode.hasMany(ListeningSession, {as: 'ListeningSessions'});

ListeningSession.belongsTo(User, {foreignKey: 'userId'});
User.hasMany(ListeningSession, {as: 'ListeningSessions'});

User.sync({force: false});
Publisher.sync({force: false});
Soundcast.sync({force: false});
Episode.sync({force: false});
ListeningSession.sync({force: false});
Transaction.sync({force: false});
Payout.sync({force: false});

module.exports = {
	User: User,
	Soundcast: Soundcast,
	Episode: Episode,
	ListeningSession: ListeningSession,
	Transaction: Transaction,
	Payout: Payout,
	Publisher: Publisher,
	db: db,
};
