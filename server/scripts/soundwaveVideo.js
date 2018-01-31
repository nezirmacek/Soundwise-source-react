// **** create video from audio wave and picture ***
'use strict';
const path = require('path');
const S3Strategy = require('express-fileuploader-s3');
const awsConfig = require('../../config').awsConfig;
const uploader = require('express-fileuploader');
// const firebase = require('firebase-admin');
const request = require('request-promise');
const moment = require('moment');

var sgMail = require('@sendgrid/mail');
var sendGridApiKey = require('../../config').sendGridApiKey;
sgMail.setApiKey(sendGridApiKey);
var client = require('@sendgrid/client');
client.setApiKey(sendGridApiKey);

const fs = require('fs');
const ffmpeg = require('./ffmpeg');
const sizeOf = require('image-size');
const makeId = f => Math.random().toString().slice(2) + Math.random().toString().slice(2);

// **** The task: generate video combing audio wave and picture with audio file and picture uploaded from front end

// example output: https://twitter.com/RealNatashaChe/status/957752354841022464


//// TEST EXEC
// const position = 'top';
// const position = 'middle';
const position = 'bottom';
const videoPath = `video-${position}.mp4`;
// fs.readFile('test.jpg', (err, image) => { // load image as Buffer
fs.readFile('ep-18-square.png', (err, image) => { // load image as Buffer
  module.exports.createAudioWaveVid( // run test
    { body: { image, audio: 'test.mp3' // 'ep-18-clip.mp3'
      , color: 'pink', position, email: 'test@gmail.com' }}, // req
    { end: f => 0, error: f => 0 } // res
  );
});
//// /TEST EXEC

const sendError = (res, err) => {
  console.log(err);
  res.error(err);
};

module.exports.createAudioWaveVid = async (req, res) => {
  const {image, audio, color, position, email} = req.body; // image and audio are image and audio files. Color (string) is color code for the audio wave. Position (string) is the position of the audio wave. It can be "top", "middle", "bottom". Email (string) is the user's email address.
  try {
    (new ffmpeg(audio)).then(audioFile => { // loading audio file
      // **** step 1a: check if audio file is <= 60 seconds long. If it's > 60 seconds, return error to the front end saying "audio length needs to be under 60 seconds.".
      if (audioFile.metadata.duration.seconds > 60) {
        return sendError(res, `Error: audio file ${audio} length larger than 60 seconds`);
      }
      const imageBuffer = image; // TODO check if image coming as url
      const { height, width, type } = sizeOf(imageBuffer); // {height: 200, width: 300, type: "jpg"}
      const imagePath = `/tmp/${makeId()}.${type}`;
      fs.writeFile(imagePath, imageBuffer, err => { // save imageBuffer to file
        if (err) {
          return sendError(res, `Error: cannot save image file ${imagePath} ${err}`);
        }
        const doResize = [];
        new Promise(resolve => {
          // **** step 1b: check image size: If it's a square image, dimensions need to be at least 1080px x 1080px. If it's a rectangular image, dimensions need to be at least 1280 px x 720 px. If image is smaller than required size, return error to front end saying "image is too small."
          if (height === width) { // square
            if (height < 1080) {
              return res.error(`Error: image is too small.`);
            } else if (height > 1080) {
              doResize.push(1080, 1080); // if image is larger than the required size, it needs to be scaled back to either 1080x1080 or 1280x720.
            }
          } else {  // rectangular
            if (width < 1280 || height < 720) {
              return res.error(`Error: image is too small.`);
            } else if (width > 1280 || height > 720) {
              doResize.push(1280, 720);
            }
          }
          if (doResize.length) { // resizing
            (new ffmpeg(imagePath)).then(imageFile => {
              const updatedImagePath = `${imagePath.slice(0, -4)}_updated.png`;
              // ffmpeg -i ep-18-square.png -vf scale=1080:1080 out.png
              imageFile.addCommand('-vf', `scale=${doResize[0]}:${doResize[1]}`);
              imageFile.save(updatedImagePath, (err, fileName) => {
                if (err) {
                  return sendError(res, `Error: cannot save updated image ${imagePath} ${err}`);
                }
                fs.unlink(imagePath, err => 0); // removing original image file
                resolve(updatedImagePath);
              });
            });
          } else {
            resolve(imagePath);
          }
        }).then(imagePath => {
          // **** step 1c: If audio and image are good, store image and audio in temp file and return 200 ok to front end.
          res.end('OK');

          // **** step 2: create audio waveform from the audio file and combine it with the image file to create a .mp4 video, using the color and waveform position settings from the request body.
          // example commandline command for image size == 1080x1080, color == 'orange', and position == 'bottom':
          // ffmpeg -i audioFile.mp3 -loop 1 -i image.png -filter_complex "[0:a]showwaves=s=1080x150:colors=orange:mode=cline[sw];[1:v]scale=1080:-1,crop=iw:1080[bg];[bg][sw]overlay=0:780:shortest=1:format=auto,format=yuv420p[vid]" -map "[vid]" -map 0:a -codec:v libx264 -crf 18 -preset fast -codec:a aac -strict -2 -b:a 192k video.mp4

//ffmpeg -i ep-18-clip.mp3 -loop 1 -i /tmp/78127593593186539352258370396023_updated.png -filter_complex "[0:a]showwaves=s=1080x150:colors=orange:mode=cline[sw];[1:v]scale=600:-1,crop=iw:600[bg];[bg][sw]overlay=0:780:shortest=1:format=auto,format=yuv420p[vid]" -map "[vid]" -map 0:a -codec:v libx264 -crf 18 -preset fast -codec:a aac -strict 2 -b:a 192k video.mp4

          const scale = doResize[0] || width;
          const crop  = doResize[1] || height;
          const isSquare = crop !== 720;
          const marginLeft = isSquare ? 0 : 100; // no margin if square
          let marginTop;  // top position (default)
          if (position === 'top') {
            marginTop = isSquare ? 150 : 100;
          } else if (position === 'middle') {
            marginTop = crop / 2 - 75; // 75 - half of wavesHeight (150)
          } else { // default bottom
            marginTop = crop - ((isSquare ? 150 : 100) + 150); // + 150 - wavesHeight
          }
          const filter_complex = `"[0:a]showwaves=s=1080x150:colors=${color}:mode=cline[sw];`
            + `[1:v]scale=${scale}:-1,crop=iw:${crop}[bg];[bg][sw]overlay=`
            + `${marginLeft}:${marginTop}:shortest=1:format=auto,format=yuv420p[vid]"`;
          audioFile.addCommand('-loop'          , '1'           );
          audioFile.addCommand('-i'             , imagePath     );
          audioFile.addCommand('-filter_complex', filter_complex);
          audioFile.addCommand('-map'           , '"[vid]"'     );
          audioFile.addCommand('-map'           , '0:a'         );
          audioFile.addCommand('-codec:v'       , 'libx264'     );
          audioFile.addCommand('-crf'           , '18'          );
          audioFile.addCommand('-preset'        , 'fast'        );
          audioFile.addCommand('-codec:a'       , 'aac'         );
          audioFile.addCommand('-strict'        , '2'           );
          audioFile.addCommand('-b:a'           , '192k'        );
          audioFile.save(videoPath, (err, fileName) => {
            if (err) {
              return console.log(`Error: video saving fails ${videoPath} ${err}`);
            }
            console.log(`Video file ${videoPath} successfully saved`);
            // fs.unlink(audio, err => 0); // removing audio file
            fs.unlink(imagePath, err => 0); // removing image file
          });

          // if (file.metadata.audio.codec !== 'mp3') {
          //   file.setAudioCodec('mp3').setAudioBitRate(64);

        });
      }); // fs.writeFile(imagePath
    }, err => sendError(res, `Error: soundwaveVideo unable to parse file with ffmpeg ${err}`));
  } catch(e) {
    sendError(res, `Error: soundwaveVideo ffmpeg catch ${e.body || e.stack}`);
  }


  // **** step 3: upload the video created to AWS s3

  // **** step 4: email the user the download link of the video file. If there is a processing error, notify user by email that there is an error.

  // sgMail.send({ // send email
  //   to: email,
  //   from: 'support@mysoundwise.com',
  //   subject: 'Your soundwave video is ready for download!',
  //   html: `<p>Hi!</p><p>Your soundwave video is ready! To download, click <a href=${videoUrl}>here</a>.</p><p>Please note: your download link will expire in 24 hours.</p><p>Folks at Soundwise</p>`,
  // });

  // **** step 5: save user email in our email contact database

  // const options = {
  //   method: 'POST',
  //   url: '/v3/contactdb/recipients',
  //   body: [{email}],
  // };
  // client.request(options)
  // .then(([response, body]) => {
  //     recipients = body.persisted_recipients; // array of recipient IDs
  //     const data = {
  //       method: 'POST',
  //       url: `/v3/contactdb/lists/2910467/recipients`,
  //       body: recipients,
  //     };
  //     client.request(data)
  //   }).then(([response, body]) => {
  //     console.log(body);
  //   })
  //   .catch(err => {
  //     console.log('error: ', err.message);
  //   });

  // **** step 6: delete the image, audio and video files from temp folder.

  // **** step 7: Delete the video file from AWS s3 in 24 hours.
};
