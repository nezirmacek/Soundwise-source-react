'use strict';

const fs = require('fs');
const firebase = require('firebase-admin');
const database = require('../database');
var serviceAccount = require('../serviceAccountKey');

const LOG_ERR = 'logErrsComments.txt';

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: `https://${
    process.env.NODE_ENV === 'production'
      ? 'soundwise-a8e6f'
      : 'soundwise-testbase'
  }.firebaseio.com`,
});

const syncPubsliher = async () => {
  console.log('start');
  const publishers = (await firebase
    .database()
    .ref('publishers')
    .once('value')).val();
  const keys = Object.keys(publishers);
  for (const key of keys) {
    const fbPublisher = publishers[key];
    if (fbPublisher) {
      const publisher = getPublisherForPsql(key, fbPublisher);
      const isExist = await database.Publisher.findById(publisher.publisherId);
      console.log('isExist:', !!isExist);
      if (!!isExist) {
        console.log('update');
        console.log('key', key);
        console.log('publisher', publisher);
        await database.Publisher.update(publisher, {
          where: { publisherId: key },
        })
          .then(data => console.log(data + '\n'))
          .catch(e => {
            console.log('ERROR' + e + '\n');
            logInFile(`ID: ${key}\nERROR: ${e}\n\n`);
          });
      } else {
        if (publisher) {
          console.log('create');
          console.log('key', key);
          console.log('publisher', publisher);
          await database.Publisher.create(publisher)
            .then(data => console.log('data', data.dataValues + '\n'))
            .catch(e => {
              console.log('ERROR' + e + '\n');
              logInFile(`ID: ${key}\nERROR: ${e}\n\n`);
            });
        }
      }
    }
  }
  console.log('finish');
};

const getPublisherForPsql = (key, fbPublisher, parent) => {
  const { name, paypalEmail, imageUrl } = fbPublisher;
  const publisher = {
    publisherId: key,
    name: name ? name : null,
    paypalEmail: paypalEmail ? paypalEmail : null,
    imageUrl: imageUrl ? imageUrl : null,
  };
  return publisher;
};

const logInFile = text => {
  fs.appendFile(LOG_ERR, text, err => {
    if (err) throw err;
  });
};

syncPubsliher();
