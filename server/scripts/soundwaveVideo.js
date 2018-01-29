// **** create video from audio wave and picture ***
'use strict';
const path = require('path');
const S3Strategy = require('express-fileuploader-s3');
const awsConfig = require('../../config').awsConfig;
const uploader = require('express-fileuploader');
// const firebase = require('firebase-admin');
const request = require('request-promise');
const moment = require('moment');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(require('../../config').sendGridApiKey);
const fs = require('fs');
const ffmpeg = require('./ffmpeg');

// **** The task: generate video combing audio wave and picture with audio file and picture uploaded from front end

// example output: https://twitter.com/RealNatashaChe/status/957752354841022464

module.exports.createAudioWaveVid = async (req, res) => {
  const {image, audio, color, position, email} = req.body;
  // image and audio are image and audio files. Color (string) is color code for the audio wave. Position (string) is the position of the audio wave. It can be "top", "middle", "bottom". Email (string) is the user's email address.

  // **** step 1a: check if audio file is <= 60 seconds long. If it's > 60 seconds, return error to the front end saying "audio length needs to be under 60 seconds.".

  // **** step 1b: check image size: If it's a square image, dimensions need to be at least 1080px x 1080px. If it's a rectangular image, dimensions need to be at least 1280 px x 720 px. If image is smaller than required size, return error to front end saying "image is too small."

  // **** ste 1c: If audio and image are good, store image and audio in temp file and return 200 ok to front end.

  // **** step 2: create audio waveform from the audio file and combine it with the image file to create a .mp4 video, using the color and waveform position settings from the request body.

  // if image is larger than the required size, it needs to be scaled back to either 1080x1080 or 1280x720.

  // example commandline command for image size == 1080x1080, color == 'orange', and position == 'bottom':
  // ffmpeg -i audioFile.mp3 -loop 1 -i image.png -filter_complex "[0:a]showwaves=s=1080x150:colors=orange:mode=cline[sw];[1:v]scale=1080:-1,crop=iw:1080[bg];[bg][sw]overlay=0:780:shortest=1:format=auto,format=yuv420p[vid]" -map "[vid]" -map 0:a -codec:v libx264 -crf 18 -preset fast -codec:a aac -strict -2 -b:a 192k video.mp4

  // **** step 3: upload the video created to AWS s3

  // **** step 4: email the user the download link of the video file. If there is a processing error, notify user by email that there is an error.

  // **** step 5: save user email in our email contact database

  // **** step 6: delete the image, audio and video files from temp folder.

  // **** step 7: Delete the video file from s3 in 24 hours.
};