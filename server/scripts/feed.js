'use strict';
const path = require('path');
const util = require('util');
const S3Strategy = require('express-fileuploader-s3');
const awsConfig = require('../../config').awsConfig;
const uploader = require('./express-fileuploader-updated');
const firebase = require('firebase-admin');
const request = require('request-promise');
const Podcast = require('podcast');
const sizeOf = require('image-size');
const moment = require('moment');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(require('../../config').sendGridApiKey);
const fs = require('fs');
const ffmpeg = require('./ffmpeg');

module.exports.createFeed = async (req, res) => {
  const { soundcastId, soundcastTitle, itunesExplicit, itunesImage, email, firstName } = req.body, categories = [];
  const soundcast = await firebase.database().ref(`soundcasts/${soundcastId}`).once('value');
  const soundcastVal = soundcast.val();
  const { title, short_description, autoSubmitPodcast } = soundcastVal;
  const soundcastHost = soundcastVal.hostName;
  const episodes = Object.keys(soundcastVal.episodes || {});
  const itunesCategory = req.body.itunesCategory.map(i => { // ['Main Cat - Sub Cat', ..]
    const [main, sub] = i.split(' - ');
    categories.push(sub || main); // sub-categories from itunesCategory
    return { text: main, subcats: [{ text: (sub || main) }] };
  });
  // checking image size
  request.get({
    encoding: null, // return body as a Buffer
    url: itunesImage
  }).then(async body => {
    const { height, width } = sizeOf(body); // {height: 1400, width: 1400, type: "jpg"}
    if (height >= 1400 && width >= 1400 && height <= 3000 && width <= 3000 ) {
      // creating feed xml
      const itunesSummary = short_description.length >= 4000 ?
                            short_description.slice(0, 3997) + '..' : short_description;
      const itunesOwner = autoSubmitPodcast ? {name: 'Soundwise', email: 'support@mysoundwise.com'} : {name: soundcastHost, email};
      const googleplayEmail = autoSubmitPodcast ? 'support@mysoundwise.com' : email;

      const podcastObj = {
        title,
        description: short_description,
        generator: 'https://mysoundwise.com',
        feedUrl: `https://mysoundwise.com/rss/${soundcastId}`, // '1508293913676s' is the soundcast id
        siteUrl: `https://mysoundwise.com/soundcasts/${soundcastId}`,
        imageUrl: itunesImage,
        author: soundcastHost,
        copyright: `${new Date().getFullYear()} ${soundcastHost}`,
        language: 'en',
        categories,
        pubDate: moment().toDate(),
        itunesAuthor: soundcastHost,
        itunesSubtitle: title,
        itunesSummary, // need to be < 4000 characters
        itunesOwner,
        itunesExplicit,
        itunesCategory,
        itunesImage, // need to be between 1400x1400 px and 3000x3000 px
        customNamespaces: {googleplay: 'http://www.google.com/schemas/play-podcasts/1.0/play-podcasts.xsd'},
        customElements: [
          {'googleplay:email': googleplayEmail},
          {'googleplay:description': itunesSummary}, // need to be < 4000 characters
          {'googleplay:category': [{ _attr: { text: itunesCategory[0].text}}]},
          {'googleplay:author': soundcastHost},
          {'googleplay:explicit': itunesExplicit},
          {'googleplay:image': [{ _attr: { href: itunesImage}}]}, // need to be between 1400x1400 px and 3000x3000 px
        ]
      }
      const feed = new Podcast(podcastObj);

      const episodesArr = [];
      if (episodes.length) {
        await Promise.all(episodes.map(id => new Promise(async resolve => {
          const episode = await firebase.database().ref(`episodes/${id}`).once('value');
          const val = episode.val();
          val.isPublished && val.publicEpisode && episodesArr.push(Object.assign({}, val, {id}));
          resolve();
        })));
      }
      if (episodesArr.length === 0) {
        return res.status(400).send(`RSS feed can only be created when there are published episodes in this soundcast.`);
      }
      res.status(200).send({});

      const episodesToRequest = [];
      episodesArr.forEach(i => !i.id3Tagged && episodesToRequest.push(i)); // not tagged, unique items
      // console.log('episodesToRequest: ', episodesToRequest);

      const episodesArrSorted = episodesArr.slice(); // make copy, STEP 3a
      // loop over the episodes, episodes with a lower index number needs to be added first
      episodesArrSorted.sort((a, b) => b.index - a.index); // sort in reverse(!) order
      if (episodesArrSorted.length > 50) {
        episodesArrSorted.length = 50; // only take the most recent 50 episodes
      }
      episodesArrSorted.sort((a, b) => a.index - b.index); // older episodes need to go into the feed first
      episodesArrSorted.forEach(i => {
        if (!i.duration) { // have no duration field
          if (!episodesToRequest.some(j => j.id === i.id)) { // and not in episodesToRequest
            episodesToRequest.push(i);
          }
        }
      });
      // console.log('episodesToRequest: ', episodesToRequest);
      Promise.all(episodesToRequest.map(episode => new Promise((resolve, reject) => {
        request.get({ encoding: null, url: episode.url }).then(body => {
          const id = episode.id;
          const filePath = `/tmp/${id + episode.url.slice(-4)}`;
          fs.writeFile(filePath, body, err => {
            if (err) {
              return reject(`Error: cannot write tmp audio file ${filePath}`);
            }
            try {
              (new ffmpeg(filePath)).then(file => {
                if (episode.id3Tagged) { // tagged
                  resolve({ id, fileDuration: (Math.round(episode.duration) || file.metadata.duration.seconds) });
                } else { // not tagged, setting up ID3
                  const episodeTitle = episode.title.replace(/"/g, "'\\\\\\\\\\\\\"'").replace(/%/g, "\\\\\\\\\\\\%").replace(":", "\\\\\\\\\\\\:");
                  const hostNameEscaped = soundcastHost.replace(/"/g, "\\\\\\\\\\\\\"").replace(/%/g, "\\\\\\\\\\\\%").replace(":", "\\\\\\\\\\\\:");
                  file.addCommand('-metadata', `title="${episodeTitle}"`);
                  file.addCommand('-metadata', `track="${episode.index}"`);
                  file.addCommand('-metadata', `artist="${hostNameEscaped}"`);
                  file.addCommand('-metadata', `album="${title}"`);
                  file.addCommand('-metadata', `year="${new Date().getFullYear()}"`);
                  file.addCommand('-metadata', `genre="Podcast"`);
                  file.addCommand('-metadata', `'cover art=${itunesImage}'`);
                  if (file.metadata.audio.codec === 'mp3') {
                    file.addCommand('-codec', 'copy');
                  } else { // 'aac' for .m4a files
                    file.setAudioCodec('mp3').setAudioBitRate(64);
                  }
                  console.log(`Episode: ${id} tagged, path ${filePath}`);
                  const updatedPath = `${filePath.slice(0, -4)}_updated.mp3`;
                  file.save(updatedPath, err => {
                    if (err) {
                      return reject(`Error: saving fails ${filePath} ${err}`);
                    }
                    console.log(`File ${filePath} successfully saved`);
                    const s3Path = episode.url.split('/')[4]; // example https://s3.amazonaws.com/soundwiseinc/demo/1508553920539e.mp3 > demo
                    const episodeFileName = episode.url.split('/')[5];
                    uploader.use(new S3Strategy({
                      uploadPath: 'soundcasts', // `${s3Path}`,
                      headers: { 'x-amz-acl': 'public-read' },
                      options: {
                        key: awsConfig.accessKeyId,
                        secret: awsConfig.secretAccessKey,
                        bucket: 'soundwiseinc',
                      },
                    }));
                    console.log('CHECK: ', updatedPath, id);
                    uploader.upload('s3' // saving to S3 db
                     , { path: updatedPath, name: `${id}.mp3` } // file
                     , (err, files) => {
                      fs.unlink(filePath, err => 0); // removing original file
                      fs.unlink(updatedPath, err => 0); // removing converted file
                      if (err) {
                        return reject(`Error: uploading ${id}.mp3 to S3 ${err}`);
                      }
                      // after upload success, change episode tagged record in firebase:
                      console.log(id, ' uploaded to: ', files[0].url.replace('http', 'https'));
                      firebase.database().ref(`episodes/${id}/id3Tagged`).set(true);
                      firebase.database().ref(`episodes/${id}/url`).set(`https://mysoundwise.com/tracks/${id}.mp3`); // use the proxy
                      resolve({ id, fileDuration: file.metadata.duration.seconds });
                    });
                  });
                }
              }, err => reject(`Error: unable to parse file with ffmpeg ${err}`));
            } catch(e) {
              reject(`Error: ffmpeg catch ${e.body || e.stack}`);
            }
          }); // fs.writeFile
        }).catch(err => reject(`Error: unable to obtain episode ${episode.url}`));
      }))).then(results => {
        console.log('files processed.');
        episodesArrSorted.forEach(episode => {
          const description = `${episode.description || ''}<br /><p>Subscribe to ${title} on <a href="https://mysoundwise.com/soundcasts/${soundcastId}">Soundwise</a></p>`; ;
          // const itunesSummary = description.length >= 3988 ?
                                // description.slice(0, 3985) + '..' : description;
          const itunesSummary = `${episode.description || ''}<p></p><p>Subscribe to <a href="https://mysoundwise.com/soundcasts/${soundcastId}">${title}</a> on <a href="https://mysoundwise.com/soundcasts/${soundcastId}">Soundwise</a></p>`; // let itunes truncate it if it's longer than 4000
          const episodeObj = {
            title: episode.title,
            description, // may contain html
            url: `https://mysoundwise.com/episodes/${episode.id}`, // '1509908899352e' is the unique episode id
            categories, // use the soundcast categories
            itunesTitle: episode.title,
            itunesImage: episode.coverArtUrl || itunesImage, // check if episode.coverArtUrl exists, if so, use that, if not, use the soundcast cover art
            author: soundcastHost,
            date: moment(episode.date_created * 1000).toDate(),
            pubDate: moment(episode.date_created * 1000).toDate(),
            enclosure : {url: episode.url}, // link to audio file
            itunesAuthor: soundcastHost,
            itunesSubtitle: episode.title.length >= 255 ? episode.title.slice(0, 252) + '..' : episode.title, // need to be < 255 characters
            // todo: check whether CDATA tag is actually needed
            itunesSummary,
            // itunesSummary: `<![CDATA[${itunesSummary}]]>`, // may contain html, need to be wrapped within <![CDATA[ ... ]]> tag, and need to be < 4000 characters
            itunesExplicit,
            itunesDuration: Math.round(episode.duration) || results.find(i => i.id === episode.id).fileDuration, // check if episode.duration exists, if so, use that, if not, need to get the duration of the audio file in seconds
            customElements: [{ 'content:encoded': { _cdata: itunesSummary }}]
          };
          // check if episode.keywords exists, if so, use that, if not, don't add it
          if (episode.keywords && episode.keywords.length) {
            episodeObj.itunesKeywords = episode.keywords;
          }
          // console.log('episodeObj: ', episodeObj);
          feed.addItem(episodeObj);
        });
        const xml = feed.buildXml('  ');
        // store the cached xml somewhere in our database (firebase or postgres)
        console.log(`xml file generated for ${soundcastId}`);
        firebase.database().ref(`soundcastsFeedXml/${soundcastId}`).set(xml);
        firebase.database().ref(`soundcasts/${soundcastId}/podcastFeedVersion`).once('value')
          .then(version => {
            if(!version.val()) {
              firebase.database().ref(`soundcasts/${soundcastId}/podcastFeedVersion`).set(1);
              sgMail.send({ // send email
                to: 'support@mysoundwise.com',
                from: 'natasha@mysoundwise.com',
                subject: 'New podcast creation request!',
                html: `<p>A new podcast feed has been created for ${soundcastId}.</p><p>${autoSubmitPodcast && 'Please submit the feed to iTunes & google play' || null}</p>`,
              });
              sgMail.send({
                to: email,
                from: 'support@mysoundwise.com',
                subject: 'Your podcast feed has been created!',
                html: `<p>Hello ${firstName},</p><p>We have created a podcast feed for ${soundcastTitle}. The feed url link is <a href=${`https://mysoundwise.com/rss/${soundcastId}`}>${`https://mysoundwise.com/rss/${soundcastId}`}</a>.</p><p>If you've opted to have us submit your podcast to iTunes and Google Play for you, we'll let you know when that's done. If you've opted for self submission, please go ahead and submit your feed url to any podcast aggregators you like.</p><p>Folks at Soundwise</p>`,
              });
            } else {
              firebase.database().ref(`soundcasts/${soundcastId}/podcastFeedVersion`).set(version.val() + 1);
            }
          });
          // res.end(xml);
      })
      .catch(error => console.log('Promise.all failed: ', error)); // Promise.all catch
    } else {
      res.status(400).send(`Error: image size must be between 1400x1400 px and 3000x3000 px`);
    }
  }).catch(err => {
    console.log(`Error: unable to obtain image ${err}`);
    res.status(400).send(`Error: unable to obtain image ${err}`);
  });
}

module.exports.requestFeed = async (req, res) => {
  if (req.params && req.params.id) {
    const xml = await firebase.database().ref(`soundcastsFeedXml/${req.params.id}`).once('value');
    res.end(xml.val());
  } else {
    res.status(400).send('Error: soundcast id must be provided');
  }
}
