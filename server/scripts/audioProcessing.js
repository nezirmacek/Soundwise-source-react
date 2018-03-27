'use strict';
const S3Strategy = require('express-fileuploader-s3');
const awsConfig = require('../../config').awsConfig;
const uploader = require('./express-fileuploader-updated');
const firebase = require('firebase-admin');
const request = require('request-promise');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(require('../../config').sendGridApiKey);
const fs = require('fs');
const ffmpeg = require('./ffmpeg');

const parseSilenceDetect = s => s.split('\n').filter(i => i.slice(0, 14) === '[silencedetect')
		.map(i => i.split('] ')[1]).join(' | ').split(' | ').map(i => i.split(': ')); // *
		// * example return: [
		//   ["silence_start"   , "-0.0150208"],
		//   ["silence_end"     , "5.08898"   ],
		//   ["silence_duration", "5.104"     ],
		//   ["silence_start"   , "10.041"    ],
		//   ["silence_end"     , "15.553"    ],
		//   ["silence_duration", "5.512"     ],
		//   ["silence_start"   , "17.481"    ] ]

const logErr = errMsg => console.log(`Error: audio processing ${errMsg}`);

module.exports.audioProcessing = async (req, res) => {
	// 1. Client make post request to /api/audio_processing, with episode ID and processing options
	// request example: {
		// episodeId: '1519588329916e', // need to retrieve episode info from firebase for tagging
		// soundcastId: '1508293913676s', // need to retrieve soundcast info from firebase for tagging
		// publisherEmail: 'john@awesomepublisher.com',
		// publisherFirstName: 'John',
		// tagging: true,
		// intro: 'https://mysoundwise.com/tracks/intro12345s.mp3',
		// outro: 'https://mysoundwise.com/tracks/outro12345s.mp3',
		// overlayDuration: 2, // how many seconds intro/outro should overlay the main audio,
		// setVolume: true,
		// trim: true,
		// removeSilence: 0.7, // the number is the silence remove threshold. e.g. remove silence longer than 0.7 second
		// autoPublish: false, // if true, automatically publish the episode after processing, otherwise, save the episode as draft and notify user by email
		// emailListeners: false }
	const { episodeId, soundcastId, publisherEmail, publisherFirstName,
					tagging, intro, outro, overlayDuration, setVolume, trim,
					removeSilence, autoPublish, emailListeners } = req.body;
	if (episodeId && soundcastId && publisherEmail && publisherFirstName &&
			typeof tagging         === 'boolean' && publisherName && publisherImageUrl  &&
			typeof overlayDuration === 'number'  && typeof setVolume      === 'boolean' &&
			typeof trim            === 'boolean' && typeof removeSilence  === 'number'  &&
			typeof autoPublish     === 'boolean' && typeof emailListeners === 'boolean') {
	  // 2. return 200 ok to client if request body includes all necessary information
		res.end('ok');

		// 3. Get the episode url from firebase 'episodes/[episode id]/url', fetch the audio file
		const episodeObj = await firebase.database().ref(`episodes/${episodeId}`).once('value');
		const episode = episodeObj.val();
		request.get({
			url: episode.url,
			encoding: null // return body as a Buffer
		}).then(async body => {
			const ext = episode.url.slice(-4);
			const filePath = `/tmp/audio_processing_${episodeId + ext}`;
			fs.writeFile(filePath, body, err => {
				if (err) {
					return logErr(`cannot write tmp audio file ${filePath}`);
				}
				// 4. Run some or all of the following processing options, depending on what options are requested from the client:
				//    A: [tagging] add metadata tags to the episode audio file
				//    B: [trim] trim off silence at beginning and end of audio file
				//    C: [intro, outro] attach intro/outro clips to audio file
				//    D: [setVolume] harmonize volume and set loudness to desired level
				//    E: [removeSilence] remove excessively long silence throughout the audio file (e.g. any silence longer than 0.7 second)
				try {
					if (trim) {
						(new ffmpeg(filePath)).then(file => {
							file.addCommand('-af', `silencedetect=n=-60dB:d=1`);
							file.addCommand('-f', `null`);
							file.save('-', (err, fileName, stdout, stderr) => {
								if (err) {
									return logErr(`trim running silencedetect ${filePath} ${err}`);
								}
								const output = parseSilenceDetect(stdout + '\n' + stderr);
								let start = 0, end = file.metadata.duration.seconds + 1;
								if (output[0][0] === 'silence_start') {
									const silenceStart = Number(output[0][1]);
									if (silenceStart > -0.2 && silenceStart < 0.2) { // +/- 0.2 second
										start = Number(output[1][1]).toFixed(3);
									}
								}
								if (output[output.length - 1][0] === 'silence_start') {
									end = Number(output[output.length - 1][1]).toFixed(3);
								}
								(new ffmpeg(filePath)).then(file => {
									file.addCommand('-af', `atrim=${start}:${end}`);
									const trimmedPath = `${filePath.slice(0, -4)}_trimmed${ext}`;
									file.save(trimmedPath, err => {
										if (err) {
											return logErr(`trimming fails ${filePath} ${err}`);
										}
										removeSilenceProcessing(trimmedPath);
									});
								}, err => logErr(`trim unable to parse file ${err}`));
							});
						}, err => logErr(`trim unable to run silencedetect ${err}`));
					} else {
						removeSilenceProcessing(filePath);
					}
					function removeSilenceProcessing(filePath) {
						if (removeSilence) {
							(new ffmpeg(filePath)).then(file => {
								file.addCommand('-af', `silencedetect=n=-60dB:d=${ removeSilence }`);
								file.addCommand('-f', `null`);
								file.save('-', (err, fileName, stdout, stderr) => {
									if (err) {
										return logErr(`removeSilence running silencedetect ${filePath} ${err}`);
									}
									const output = parseSilenceDetect(stdout + '\n' + stderr);
									(new ffmpeg(filePath)).then(file => {
										let chunksCount = 0;
										let filterComplex = '"';
										let filterComplexEnd = '';
										if (output[0][0] === 'silence_start') { // not starting with silence (trimmed)
											chunksCount++;
											filterComplex += `[0]atrim=start=0`;
										}
										output.forEach(i => {
											if (i[0] === 'silence_end') { // not empty block
												chunksCount++;
												filterComplex += `[0]atrim=start=${Number(i[1]).toFixed(3)}`;
											}
											if (i[0] === 'silence_start') {
												filterComplex += `:end=${Number(i[1]).toFixed(3)}[a${chunksCount}];`;
												filterComplexEnd += `[a${chunksCount}]`;
											}
										});
										if (output[output.length - 1][0] === 'silence_duration') { // not ending with silence
											filterComplex += `:end=${file.metadata.duration.seconds + 1}[a${chunksCount}];`;
											filterComplexEnd += `[a${chunksCount}]`;
										}
										filterComplex += `${filterComplexEnd}concat=n=${chunksCount}:v=0:a=1"`;
										file.addCommand('-filter_complex', filterComplex);
										// *command example: ffmpeg -i audio_processing_out.mp3 -filter_complex "[0]atrim=start=5.088:end=10.041[a1];[0]atrim=start=15.553:end=17.481[a2];[a1][a2]concat=n=2:v=0:a=1" out.mp3
										const silenceRemovedPath = `${filePath.slice(0, -4)}_silence_removed${ext}`;
										file.save(silenceRemovedPath, err => {
											if (err) {
												return logErr(`removing silence fails ${filePath} ${err}`);
											}
											introProcessing(silenceRemovedPath);
										});
									}, err => logErr(`removeSilence unable to parse file ${err}`));
								});
							}, err => logErr(`removeSilence unable to run silencedetect ${err}`));
						} else {
							introProcessing(filePath);
						}
					}
					// *** Add intro and outro ***
					// Intro needs to be faded out at the end. And outro needs to be faded in.
					function introProcessing(filePath) {
						if (intro) {
							request.get({ url: intro, encoding: null }).then(async body => {
								const introPath = `${filePath.slice(0, -4)}_intro${intro.slice(-4)}`;
								fs.writeFile(introPath, body, err => {
									if (err) {
										return logErr(`intro write file ${introPath}`);
									}
									(new ffmpeg(introPath)).then(file => {
										const milliseconds = file.metadata.duration.raw.split('.')[1] || 0;
										const introDuration = Number(file.metadata.duration.seconds + '.' + milliseconds);
										if (overlayDuration) { // make fading
											// a. fade out an intro
											// ffmpeg -i intro.mp3 -af 'afade=t=out:st=885:d=5' intro-fadeout.mp3
											// One thing to note is that if overlayDuration > 0, the intro fade out duration should be overlayDuration x 2
											const fadeDuration = overlayDuration * 2;
											const fadeStartPosition = introDuration - fadeDuration;
											file.addCommand('-af', `afade=t=out:st=${fadeStartPosition}:d=${fadeDuration}`);
											const introFadePath = `${introPath.slice(0, -4)}_fade${intro.slice(-4)}`;
											file.save(introFadePath, err => {
												if (err) {
													return logErr(`intro fade fails ${introPath} ${err}`);
												}
												outroProcessing(filePath, introFadePath, introDuration);
											});
										} else {
											outroProcessing(filePath, introPath, introDuration);
										}
									}, err => logErr(`ffmpeg intro ${introPath} ${err}`));
								});
							}).catch(err => logErr(`intro request ${err}`));
						} else {
							outroProcessing(filePath); // no intro
						}
					}
					function outroProcessing(filePath, introPath, introDuration) {
						if (outro) {
							request.get({ url: outro, encoding: null }).then(async body => {
								const outroPath = `${filePath.slice(0, -4)}_outro${outro.slice(-4)}`;
								fs.writeFile(outroPath, body, err => {
									if (err) {
										return logErr(`outro write file ${filePath}`);
									}
									(new ffmpeg(outroPath)).then(file => {
										if (overlayDuration) { // make fading
											// a. fade in an outro clip
											// ffmpeg -i outro.mp3 -af 'afade=t=in:ss=0:d=5' outro-fadein.mp3
											file.addCommand('-af', `afade=t=in:st=0:d=${overlayDuration * 2}`);
											const outroFadePath = `${outroPath.slice(0, -4)}_fade${outro.slice(-4)}`;
											file.save(outroFadePath, err => {
												if (err) {
													return logErr(`outro fade fails ${outroFadePath} ${err}`);
												}
												concat(filePath, introPath, introDuration, outroFadePath);
											});
										} else {
											concat(filePath, introPath, introDuration, outroPath);
										}
									}, err => logErr(`ffmpeg intro ${outroPath} ${err}`));
								});
							}).catch(err => logErr(`outro request ${err}`));
						} else {
							concat(filePath, introPath, introDuration); // no outro
						}
					}
					function concat(filePath, introPath, introDuration, outroPath) {
						if (introPath || outroPath) {
							(new ffmpeg(filePath)).then(file => {
								const milliseconds = file.metadata.duration.raw.split('.')[1] || 0;
								const mainFileDuration = Number(file.metadata.duration.seconds + '.' + milliseconds);
								let adelay1, adelay2;
								if (introPath) {
									let introDelay = introDuration;
									if (overlayDuration) { // have fading
										introDelay = introDuration - overlayDuration;
									}
									introDelay = Math.floor(introDelay * 1000); // converting to milliseconds
									adelay1 = introDelay;
									// *because adelay can't accept all= option to delay all channels in -filter_complex
									// we use approach from https://trac.ffmpeg.org/ticket/5855#comment:4 ("4000|4000|4000|...")
									// ffmpeg -i main.mp3 -i intro.mp3 -i outro.mp3 -filter_complex "[0]adelay=4000|4000|4000|4000[a];[2]adelay=7000|7000|7000|7000[b];[1][a][b]amix=3" out_test.mp3
									for (var i = 0; i < 8; i++) { // 8 audio channels
										adelay1 += '|' + introDelay;
									}
									file.addCommand('-i', `${introPath}`);
								}
								if (outroPath) {
									file.addCommand('-i', `${outroPath}`);
								}
								let filterComplex = '';
								if (introPath && outroPath) {
									let outroDelay = introDuration + mainFileDuration; // includes intro duration
									if (overlayDuration) { // have fading
										outroDelay = introDuration + mainFileDuration - 2*overlayDuration;
									}
									outroDelay = Math.floor(outroDelay * 1000);
									adelay2 = outroDelay;
									for (var i = 0; i < 8; i++) { adelay2 += '|' + outroDelay; }
									filterComplex= `"[0]adelay=${adelay1}[a];[2]adelay=${adelay2}[b];[1][a][b]amix=3"`;
								} else if (introPath && !outroPath) { // only intro
									filterComplex= `"[0]adelay=${adelay1}[a];[1][a]amix=2"`;
								} else if (!introPath && outroPath) { // only outro
									let outroDelay = mainFileDuration;
									if (overlayDuration) { // have fading
										outroDelay = mainFileDuration - overlayDuration;
									}
									outroDelay = Math.floor(outroDelay * 1000);
									adelay2 = outroDelay;
									for (var i = 0; i < 8; i++) { adelay2 += '|' + outroDelay; }
									filterComplex= `"[1]adelay=${adelay2}[a];[0][a]amix=2"`;
								}
								file.addCommand('-filter_complex', `${filterComplex}`);
								const concatPath = `${filePath.slice(0, -4)}_concat${intro.slice(-4)}`;
								file.save(concatPath, err => {
									if (err) {
										return logErr(`concat save fails ${concatPath} ${err}`);
									}
									nextProcessing(concatPath);
								});
							}, err => logErr(`ffmpeg main file ${filePath} ${err}`));
						} else {
							nextProcessing(filePath);
						}
					}
					function nextProcessing(filePath) { // final stage
						(new ffmpeg(filePath)).then(async file => {
							if (tagging) {
							  const soundcast = await firebase.database().ref(`soundcasts/${soundcastId}`).once('value');
								const { title, hostName } = soundcast.val();
								const episodeTitle = episode.title.replace(/"/g, "'\\\\\\\\\\\\\"'").replace(/%/g, "\\\\\\\\\\\\%").replace(":", "\\\\\\\\\\\\:");
						    const hostNameEscaped = hostName.replace(/"/g, "\\\\\\\\\\\\\"").replace(/%/g, "\\\\\\\\\\\\%").replace(":", "\\\\\\\\\\\\:");
						    file.addCommand('-metadata', `title="${episodeTitle}"`);
						    file.addCommand('-metadata', `track="${episode.index}"`);
						    file.addCommand('-metadata', `artist="${hostNameEscaped}"`);
						    file.addCommand('-metadata', `album="${title}"`);
						    file.addCommand('-metadata', `year="${new Date().getFullYear()}"`);
						    file.addCommand('-metadata', `genre="Podcast"`);

						    // https://stackoverflow.com/questions/18710992/how-to-add-album-art-with-ffmpeg
								// ffmpeg -i in.mp3 -i test.jpeg -map 0:0 -map 1:0 -c copy -id3v2_version 3 -metadata:s:v title="Album cover" -metadata:s:v comment="Cover (front)" out.mp3

						    if (file.metadata.audio.codec === 'mp3') {
						      file.addCommand('-codec', 'copy');
						    } else { // 'aac' for .m4a files
						      file.setAudioCodec('mp3').setAudioBitRate(64);
						    }
							}
							if (setVolume) {
								// *** Set volume target and harmonize loudness level ***
								// set Integrated loudness to -14: I=-14
								// set True peak value to -3: TP=-2
								// set Loudness range to 11: LRA=11
								// ffmpeg -i audio.mp3 -af loudnorm=I=-14:TP=-2:LRA=11:measured_I=-19.5:measured_LRA=5.7:measured_TP=-0.1:measured_thresh=-30.20::linear=true:print_format=summary -ar 44.1k audio-normalized.mp3
						    file.addCommand('-af', `loudnorm=I=-14:TP=-2:LRA=11:measured_I=-19.5:measured_LRA=5.7:measured_TP=-0.1:measured_thresh=-30.20::linear=true:print_format=summary`);
						    file.addCommand('-af', `44.1k`);
							}
							const outputPath = `${filePath.slice(0, -4)}_output${intro.slice(-4)}`;
							file.save(outputPath, err => {
								if (err) {
									return logErr(`output save fails ${outputPath} ${err}`);
								}
								uploader.use(new S3Strategy({
									uploadPath: 'soundcasts',
									headers: { 'x-amz-acl': 'public-read' },
									options: {
										key: awsConfig.accessKeyId,
										secret: awsConfig.secretAccessKey,
										bucket: 'soundwiseinc',
									},
								}));
								console.log('CHECK: audio processing ', filePath, id);
								uploader.upload('s3' // saving to S3 db
									// 5a. If 'autoPublish == true', save processed audio file to AWS S3
									//         to replace the original file
									//     If 'autoPublish == false', save processed audio file to AWS S3 under
									//         'https://s3.amazonaws.com/soundwiseinc/soundcasts/[episodeId-edited].mp3'
								 , { path: outputPath, name: `${id + (autoPublish ? '' : '-edited')}.mp3` } // file
								 , (err, files) => {
									fs.unlink(filePath, err => 0); // remove original file
									fs.unlink(outputPath, err => 0); // remove tagged file
									if (err) {
										return reject(`Error: uploading ${id}.mp3 to S3 ${err}`);
									}
									if (!autoPublish) {
										// 5a. - and then do // TODO - review
										firebase.database().ref(`episodes/${episodeId}/editedUrl`).set(`https://s3.amazonaws.com/soundwiseinc/soundcasts/${episodeId}-edited.mp3`);
									} else {
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
									}
									// 6. Notify the publisher by email.
						      sgMail.send({
						        to: publisherEmail,
						        from: 'support@mysoundwise.com',
						        subject: 'Your episode has been processed!',
						        html: `<p>Hello ${publisherFirstName},</p><p>${episodeTitle} has been processed${autoPublish ? ' and published' : ''}.</p><p>${autoPublish ? 'You can now review and publish the processed episode from your dashboard.' : ''}</p><p>Folks at Soundwise</p>`,
						      });
								}); // s3 upload
							}); // file.save outputPath
						}, err => logErr(`nextProcessing unable to parse file with ffmpeg ${err}`));
					}
				} catch(e) {
					logErr(`ffmpeg catch ${e.body || e.stack}`);
				}
			}); // fs.writeFile
		}).catch(err => {
	    logErr(`unable to obtain episode ${err}`);
	    // res.error(`Error: unable to obtain episode ${err}`);
	  });
	} else {
		res.error('Error: audio processing undefined parameters');
	}
}
