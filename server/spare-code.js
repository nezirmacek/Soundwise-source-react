// *** adding parentId to child comments in firebase
// const commentsRef = firebase.database().ref('/comments');

// commentsRef.on('child_added', comment => {
//   const commentObj = comment.val();
//   const commentId = comment.key;
//   const parsedIDs = commentId.split('-');
//   let parentId;
//   if(parsedIDs.length == 3) {
//     parentId = parsedIDs[1];
//   }
//   if(parentId) {
//     firebase.database().ref(`/comments/${commentId}/parentId`).set(parentId);
//   }
// });

// *** Move messages from under soundcasts to messages node in firebase
// const soundcastsRef = firebase.database().ref('/soundcasts');
// const messagesRef = firebase.database().ref('/messages');
// var newMessageId;
// soundcastsRef.on('child_added', soundcast => {
//   const soundcastObj = soundcast.val();
//   const soundcastId = soundcast.key;
//   if(soundcastObj.announcements) {
//     // console.log(Object.keys(soundcastObj.announcements));
//     for(var key in soundcastObj.announcements) {
//       const {content, creatorID, date_created, id, isPublished, publisherID, soundcastID} = soundcastObj.announcements[key];
//       // firebase.database().ref(`/messages/${key}`).once('value', snapshot => {
//       //   if(!snapshot.val()) { // if data doesn't already exist

//           firebase.database().ref(`/messages/${key}`).set({content, creatorID, date_created, id, isPublished, publisherID, soundcastID});
//       //   }
//       // })
//     }
//   }
// });

// *** fixing listeningSession date format
// const options = {
//   method: 'GET',
//   uri: 'https://mysoundwise.com/api/listeningSessions'
// };
// let newSession, newOption;

// request(options)
// .then(data => {
//   // console.log(data);
//   JSON.parse(data).forEach(session => {
//     if(session.date.length > 10) {
//       newSession = Object.assign({}, session, {date: session.date.slice(0, 10)});
//       newOption = {
//         method: 'PUT',
//         uri: `https://mysoundwise.com/api/listeningSessions/${session.sessionId}`,
//         json: newSession
//       };
//       request(newOption).
//       then(data => {console.log('session changed')})
//       .catch(err => console.log(err));
//     }
//   });
// });

// *** create new email list in sendgrid
// var sgMail = require('@sendgrid/mail');
// var sendGridApiKey = require('../config').sendGridApiKey;
// sgMail.setApiKey(sendGridApiKey);
// var client = require('@sendgrid/client');
// client.setApiKey(sendGridApiKey);

// let listId;
// const data1 = {
//   method: 'POST',
//   url: '/v3/contactdb/lists',
//   body: {'name': `podcast-conversion-course`},
// };
// client.request(data1)
// .then(([response, body]) => {
//   listId = body.id;
//   console.log(listId); // 3921133
// });

// *** save soundcast and episodes in database ***

// const soundcastId = '1514433422681s';
// firebase.database().ref(`soundcasts/${soundcastId}`)
// .once('value')
// .then(snapshot => {
//   const soundcast = {
//     soundcastId,
//     publisherId: snapshot.val().publisherID,
//     title: snapshot.val().title,
//   };
//   request.post('https://mysoundwise.com/api/soundcast', {form: soundcast}, (err, response, body) => {
//     console.log('response: ', response.statusCode);
//     if (response.statusCode == 200) {
//       const episodes = Object.keys(snapshot.val().episodes);
//       const promises = episodes.map(episodeID => {
//         return firebase.database().ref(`episodes/${episodeID}`)
//         .once('value')
//         .then(episodeSnapshot => {
//           const episodeObj = {
//             episodeId: episodeID,
//             soundcastId,
//             publisherId: soundcast.publisherId,
//             title: episodeSnapshot.val().title,
//             soundcastTitle: soundcast.title,
//           };
//           request.post('https://mysoundwise.com/api/episode', {form: episodeObj}, (err, response, body) => {
//             if (err) {
//               console.log(err);
//             }
//             console.log(`${episodeID} posted`);
//           });
//         });
//       });
//       Promise.all(promises)
//       .then(() => console.log('episodes posted'))
//       .catch(err => console.log(err));
//     }
//   });
// });

// *** move courses to soundcasts ***

// let id = Number(moment().format('x'));
// firebase.database().ref('courses/125')
// .once('value').then(snapshot => {
//   const sections = snapshot.val().sections;
//   const promises = sections.map((section, i) => {
//     const sectionParts = section.run_time.split(':');
//     const episodeObj = {
//       title: section.title,
//       date_created: moment().format('X'),
//       creatorID: 'uiG3uVUIdfZrDq4FLYs9YO40A0D2',
//       publisherID: '1503002103690p',
//       url: section.section_url,
//       duration: Number(sectionParts[0]) * 60 + Number(sectionParts[1]),  // duration is in seconds
//       publicEpisode: false,
//       soundcastID: '1514430398074s',
//       isPublished: true,
//       index: sections.length - i,
//     };
//     firebase.database().ref(`episodes/${id}e`)
//     .set(episodeObj);

//     firebase.database().ref(`soundcasts/1514430398074s/episodes/${id}e`)
//     .set(true);
//     console.log(`${id}e saved`);
//     id += 5;
//   });
// });

// *** update stripe connected account ***

// var stripe_key =  require('../config').stripe_key;
// var stripe = require('stripe')(stripe_key);

// stripe.accounts.update('acct_1Bdla1BEkT8zqJaI', {
//   'metadata': {
//     'publisherId': '1506441305461p',
//   },
//   'payout_statement_descriptor': 'Soundwise transfer',
// });