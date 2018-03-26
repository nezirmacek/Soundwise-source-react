// *** Specs for running automatic audio editing on uploaded audio files ***

// *** Overview: ***

// 1. Client make post request to /api/audio_processing, with episode ID and processing options
//    Example reuquest body:
      {
          epsiodeId: '123456789e', // need to retrieve episode info from firebase for tagging
          soundcastId: '987654321s', // need to retrieve soundcast info from firebase for tagging
          publisherEmail: 'john@awesomepublisher.com',
          publisherFirstName: 'John',
          publisherName: 'Awesome publisher',
          publisherImageUrl: 'https://image.link.png',
          tagging: true,
          intro: 'https://mysoundwise.com/tracks/intro12345s.mp3',
          outro: 'https://mysoundwise.com/tracks/outro12345s.mp3',
          overlayDuration: 2, // how many seconds intro/outro should overlay the main audio,
          setVolume: true,
          trim: true,
          removeSilence: 0.7 // the number is the silence remove threshold. e.g. remove silence longer than 0.7 second
          autoPublish: false // if true, automatically publish the episode after processing, otherwise, save the episode as draft and notify user by email
          emailListeners: false
      }

// 2. return 200 ok to client if request body includes all necessary information

// 3. Get the episode url from firebase 'episodes/[episode id]/url', fetch the audio file

// 4. Run some or all of the following processing options, depending on what options are requested from the client:
//    A: [tagging] add metadata tags to the episode audio file
//    B: [trim] trim off silence at beginning and end of audio file
//    C: [intro, outro] attach intro/outro clips to audio file
//    D: [setVolume] harmonize volume and set loudness to desired level
//    E: [removeSilence] remove excessively long silence throughout the audio file (e.g. any silence longer than 0.7 second)

// 5a. If 'autoPublish == true', save processed audio file to AWS S3 to replace the original file
//     If 'autoPublish == false', save processed audio file to AWS S3 under 'https://s3.amazonaws.com/soundwiseinc/soundcasts/[episodeId-edited].mp3'
//     and then do
       firebase.database().ref(`episodes/${episodeId}/editedUrl`).set(`https://s3.amazonaws.com/soundwiseinc/soundcasts/${episodeId}-edited.mp3`);

// 5b. If 'autoPublish == false', do nothing.
//     If 'autoPublish == true', publish the episode
//     To publish the episode:
//     step 1: save episode metadata in our sql database
       const soundcastObj = await firebase.database().ref(`soundcasts/${soundcastId}`).once('value');
       const soundcast = soundcastObj.val();
       // and then save data. The equivalent from front end:
       // request.post({
       //  url: '/api/episode',
       //  body: {
       //    episodeId,
       //    soundcastId,
       //    publisherId: soundcast.publisherID,
       //    title: episode.title,
       //    soundcastTitle: soundcast.title,
       //  }
       // });
//     step 2: notify subscribed listeners by text and email
//       text notification:
          let registrationTokens = [];
          if(soundcast.subscribed) {
              Object.keys(soundcast.subscribed).forEach(user => {
                if(typeof soundcast.subscribed[user] == 'object') {
                    registrationTokens.push(soundcast.subscribed[user][0]) //basic version: only allow one devise per user
                }
              });
              const payload = {
                notification: {
                  title: `${soundcast.title} just published:`,
                  body: `${episode.title}`,
                  sound: 'default',
                  badge: '1'
                }
              };
              sendNotifications(registrationTokens, payload);//sent push notificaiton
              var admin = require("firebase-admin");

              function sendNotification (registrationTokens, payload, options) {
                var options = {
                  priority: "high"
                };
                admin.messaging().sendToDevice(registrationTokens, payload, options)
                  .then(function(response) {
                    //...
                  })
                  .catch(function(error) {
                    //...
                  });
              }
          }

//        send email notification:
          if(req.body.emailListeners) {
            emailListeners(soundcast);
          }

          function emailListeners(soundcast) {
              let subscribers = [];
              const subject = `${episode.title} was just published on ${soundcast.title}`;
              if(soundcast.subscribed) {
                  // send notification email to subscribers
                  const content = `<p>Hi <span>[%first_name | Default Value%]</span>!</p><p></p><p>${req.body.publisherName} just published <strong>${episode.title}</strong> in <a href="${soundcast.landingPage ? 'https://mysoundwise.com/soundcasts/'+soundcastId : ''}" target="_blank">${soundcast.title}</a>. </p><p></p><p>Go check it out on the Soundwise app!</p>`;
                  sendMarketingEmails([soundcast.subscriberEmailList], subject, content, req.body.publisherName, req.body.publisherImageUrl, publisherEmail, 4383);
              }

              // send notification email to invitees
              if(soundcast.invited) {
                  const content = `<p>Hi there!</p><p></p><p>${req.body.publisherName} just published <strong>${episode.title}</strong> in <a href="${soundcast.landingPage ? 'https://mysoundwise.com/soundcasts/'+soundcastId : ''}" target="_blank">${soundcast.title}</a>. </p><p></p><p>To listen to the episode, simply accept your invitation to subscribe to <i>${soundcast.title}</i> on the Soundwise app!</p>`;
                  sendMarketingEmails([soundcast.inviteeEmailList], subject, content, req.body.publisherName, req.body.publisherImageUrl, publisherEmail, 4383);
              }

              function sendMarketingEmails() {
                // this should be similar to the sendMarketingEmails function under ./sendEmails.js
              }
          }

//     step 3: update firebase
       firebase.database().ref(`episodes/${episodeId}/isPublished`).set(true);


// 6. Notify the publisher by email.
      sgMail.send({
        to: publisherEmail,
        from: 'support@mysoundwise.com',
        subject: 'Your episode has been processed!',
        html: `<p>Hello ${publisherFirstName},</p><p>${episodeTitle} has been processed${autoPublish ? ' and published' : ''}.</p><p>${autoPublish ? 'You can now review and publish the processed episode from your dashboard.' : ''}</p><p>Folks at Soundwise</p>`,
      });

// *** Option Specs ***

// *** tagging ***
// Meta data items that need to be tagged to the audio file (similar to how we did it when creating podcast feed):
    const episodeTitle = episode.title.replace(/"/g, "'\\\\\\\\\\\\\"'").replace(/%/g, "\\\\\\\\\\\\%").replace(":", "\\\\\\\\\\\\:");
    const hostNameEscaped = hostName.replace(/"/g, "\\\\\\\\\\\\\"").replace(/%/g, "\\\\\\\\\\\\%").replace(":", "\\\\\\\\\\\\:");
    file.addCommand('-metadata', `title="${episodeTitle}"`);
    file.addCommand('-metadata', `track="${episode.index}"`);
    file.addCommand('-metadata', `artist="${hostNameEscaped}"`);
    file.addCommand('-metadata', `album="${title}"`);
    file.addCommand('-metadata', `year="${new Date().getFullYear()}"`);
    file.addCommand('-metadata', `genre="Podcast"`);
    file.addCommand('-metadata', `'cover art=${itunesImage}'`); // see question below
    if (file.metadata.audio.codec === 'mp3') {
      file.addCommand('-codec', 'copy');
    } else { // 'aac' for .m4a files
      file.setAudioCodec('mp3').setAudioBitRate(64);
    }

// to add cover art to audio file:
// 1) check if episode.coverArtUrl exsits, if so, use that as the cover art
// 2) if it doesn't exist, get the soundcast cover art from firebase and use that:
      const soundcastObj = await firebase.database().ref(`soundcasts/${soundcastId}`).once('value');
      const soundcast = soundcastObj.val();
//    and use souncast.imageURL as the cover art

// *** trim silence at beginning and end ***
// trim silence at beginning and set output bitrate to 64kbps
ffmpeg -i audio.mp3  -af silenceremove=1:0:0.02 -codec:a libmp3lame -b:a 64k audio-trim.mp3

// *** Add intro and outro ***
// Intro needs to be faded out at the end. And outro needs to be faded in.

// a. fade out an intro for the last 5 seconds of the intro clip if the intro duration == 885. (need to get the intro duration first)
ffmpeg -i intro.mp3 -af 'afade=t=out:st=885:d=5' intro-fadeout.mp3

// b. fade in an outro clip for 5 seconds
ffmpeg -i outro.mp3 -af 'afade=t=in:ss=0:d=5' outro-fadein.mp3

// c. concat intro, main audio, and outro together (it looks like concat demuxer is the one we should use. I tried it on a few files. Sometimes it works. But I haven't got it to work reliably.): https://trac.ffmpeg.org/wiki/Concatenate

// d. if request.body.overlayDuration > 0, we need to overlay intro/outro with main audio for the specified overlay duration.

// *** Set volume target and harmonize loudness level ***
// set Integrated loudness to -14: I=-14
// set True peak value to -3: TP=-2
// set Loudness range to 11: LRA=11
ffmpeg -i audio.mp3 -af loudnorm=I=-14:TP=-2:LRA=11:measured_I=-19.5:measured_LRA=5.7:measured_TP=-0.1:measured_thresh=-30.20::linear=true:print_format=summary -ar 44.1k audio-normalized.mp3

// *** Remove excessive silence throughout the audio file to make it tight ***
// trim any silence longer than 0.7 second and set output bitrate to 64kbps (this command works, but for some reason it reduces the audio quality )
ffmpeg -i audio.mp3  -af silenceremove=0:0:0:-1:0.7:-35dB -b:a 64k audio-shorten.mp3
