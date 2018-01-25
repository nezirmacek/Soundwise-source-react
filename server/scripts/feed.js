'use strict';

const S3Strategy = require('express-fileuploader-s3');
const awsConfig = require('../../config').awsConfig;
const uploader = require('express-fileuploader');
const firebase = require('firebase-admin');
const request = require('request-promise');
const Podcast = require('podcast');
const sizeOf = require('image-size');
const moment = require('moment');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(require('../../config').sendGridApiKey);
const fs = require('fs');
const ffmpeg = require('./ffmpeg');
const makeId = f => Math.random().toString().slice(2) + Math.random().toString().slice(2);

uploader.use(new S3Strategy({
  uploadPath: '/',
  headers: { 'x-amz-acl': 'public-read' },
  options: {
    key: awsConfig.accessKeyId,
    secret: awsConfig.secretAccessKey,
    bucket: 'soundwiseinc',
  },
}));

module.exports.createFeed = async (req, res) => {
  const { soundcastId } = req.body, categories = [];
  const soundcast = await firebase.database().ref(`soundcasts/${soundcastId}`).once('value');
  const soundcastVal = soundcast.val();
  const { title, short_description, hostName, itunesExplicit, itunesImage } = soundcastVal;
  const episodes = Object.keys(soundcastVal.episodes || {});
  const itunesCategory = soundcastVal.itunesCategory.map(i => { // ['Main Cat - Sub Cat', ..]
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
<<<<<<< HEAD
      const itunesSummary = short_description.length >= 4000 ?
                            short_description.slice(0, 3997) + '..' : short_description;
=======
      const itunesSummary = short_description.length > 4000 ?
                            short_description.slice(0, 3998) + '..' : short_description;
>>>>>>> some fixes in episodeObj for creating podcast feed
      const podcastObj = {
        title,
        description: short_description,
        generator: 'https://mysoundwise.com',
        feedUrl: `https://mysoundwise.com/rss/${soundcastId}`, // '1508293913676s' is the soundcast id
        siteUrl: `https://mysoundwise.com/soundcasts/${soundcastId}`,
        imageUrl: itunesImage,
        author: hostName,
        copyright: `2018 ${hostName}`,
        language: 'en',
        categories,
        pubDate: moment().toDate(),
        itunesAuthor: hostName,
        itunesSubtitle: title,
        itunesSummary, // need to be < 4000 characters
        itunesOwner: {name: 'Soundwise', email: 'support@mysoundwise.com'},
        itunesExplicit,
        itunesCategory,
        itunesImage, // need to be between 1400x1400 px and 3000x3000 px
        customElements: [
          {'googleplay:email': 'support@mysoundwise.com'},
          {'googleplay:description': itunesSummary}, // need to be < 4000 characters
          {'googleplay:category': itunesCategory[0].text},
          {'googleplay:author': hostName},
          {'googleplay:explicit': itunesExplicit},
          {'googleplay:image': itunesImage}, // need to be between 1400x1400 px and 3000x3000 px
        ]
      }
      const feed = new Podcast(podcastObj);
<<<<<<< HEAD
      let episodesArr = [], episode;
      if (episodes.length) {
=======
      sgMail.send({
        to: 'support@mysoundwise.com',
        from: 'natasha@mysoundwise.com',
        subject: 'New podcast creation request!',
        html: `<p>A new podcast feed has been created for ${soundcastId}</p>`,
      });
      let episodesArr = [], episode, episodeNode;
      if (episodes && episodes.length) {
>>>>>>> some fixes in episodeObj for creating podcast feed
        for (let id of episodes) {
          episodeNode = await firebase.database().ref(`episodes/${id}`).once('value');
          episode = episodeNode.val();
          episode.isPublished && episodesArr.push(Object.assign({}, episode, {id}));
        }
      }
      if (episodesArr.length === 0) {
        return res.error(`RSS feed can only be created when there are published episodes in this soundcast.`);
      }
      const episodesToRequest = episodesArr.map(i => !i.id3Tagged); // not tagged, unique items
      const episodesArrSorted = episodesArr.slice(); // make copy, STEP 3a
      // loop over the episodes, episodes with a lower index number needs to be added first
      episodesArrSorted.sort((a, b) => b.index - a.index); // sort in reverse(!) order
      if (episodesArrSorted.length > 50) {
        episodesArrSorted.length = 50; // only take the most recent 50 episodes
      }
      episodesArrSorted.forEach(i => {
        if (!i.duration) { // have no duration field
          if (!episodesToRequest.some(j => j.id === i.id)) { // and not in episodesToRequest
            episodesToRequest.push(i);
          }
        }
      });
      Promise.all(episodesToRequest.map(episode => new Promise((resolve, reject) => {
        request.get({ encoding: null, url: episode.url }, body => {
          const path = `/tmp/${makeId() + episode.url.slice(-4)}`;
          fs.writeFile(path, body, err => {
            if (err) {
              return reject(`Error: cannot write tmp audio file ${path}`);
            }
            try { // setting ID3
              (new ffmpeg(path)).then(file => {
                if (episode.id3Tagged) {
                  if (!episode.duration) { // tagged but don't have duration
                    resolve({ id: episode.id, fileDuration: file.metadata.duration.seconds });
                  }
                } else { // not tagged
                  file.addCommand('-metadata', `title="${episode.title}"`);
                  file.addCommand('-metadata', `track="${episode.index}"`);
                  file.addCommand('-metadata', `artist="${hostName}"`);
                  file.addCommand('-metadata', `album="${title}"`);
                  file.addCommand('-metadata', `year="${new Date().getFullYear()}"`);
                  file.addCommand('-metadata', `genre="Podcast"`);
                  file.addCommand('-metadata', `'cover art=${itunesImage}'`);
                  if (file.metadata.audio.codec === 'mp3') {
                    file.addCommand('-codec', 'copy');
                  } else { // 'aac' for .m4a files
                    file.setAudioCodec('mp3').setAudioBitRate(64);
                  }
                  const updatedPath = `${path.slice(0, -4)}_updated.mp3`;
                  file.save(updatedPath, (err, fileName) => {
                    if (err) {
                      return reject(`Error: saving fails ${path} ${err}`);
                    }
                    console.log(`File ${path} successfully saved`);
                    const s3Path = episode.url.split('/')[4]; // example https://s3.amazonaws.com/soundwiseinc/demo/1508553920539e.mp3 > demo
                    uploader.upload('s3' // saving to S3 db
                     , { path: updatedPath, name: `${s3Path}/${episode.id}.mp3` } // file
                     , (err, files) => {
                      fs.unlink(path, err => 0); // removing original file
                      fs.unlink(updatedPath, err => 0); // removing converted file
                      if (err) {
                        return reject(`Error: uploading ${episode.id}.mp3 to S3 ${err}`);
                      }
                      // after upload success, change episode tagged record in firebase:
                      firebase.database().ref(`episodes/${episode.id}/id3Tagged`).set(true);
<<<<<<< HEAD
                      resolve({ id: episode.id, fileDuration: file.metadata.duration.seconds });
=======
                      episodesArr.sort((a, b) => a.index - b.index);
                      let episodeObj, startEpisode = episodesArr.length > 50 ? episodesArr.length - 50 : 0; // only take the most recent 50 episodes
                      for(var i = startEpisode; i < episodesArr.length; i++) {
                        episode = episodesArr[i];
                        episodeObj = {
                          title: episode.title,
                          desciption: episode.description, // may contain html
                          url: `https://mysoundwise.com/episodes/${episode.id}`, // '1509908899352e' is the unique episode id
                          categories, // use the soundcast categories
                          itunesImage: '', // check if episode.coverArtUrl exists, if so, use that, if not, use the soundcast cover art
                          author: hostName,
                          date: moment().toDate(),
                          enclosure : {url: episode.url}, // link to audio file
                          itunesAuthor: hostName,
                          itunesSubtitle: episode.title, // need to be < 255 characters
                          itunesSummary: episode.desciption, // may contain html, need to be wrapped within <![CDATA[ ... ]]> tag, and need to be < 4000 characters
                          itunesExplicit,
                          itunesDuration: episode.duration, // check if episode.duration exists, if so, use that, if not, need to get the duration of the audio file in seconds
                          itunesKeywords: [], // check if episode.keywords exists, if so, use that, if not, don't add it
                        };
                        feed.addItem(episodeObj);
                      }
>>>>>>> some fixes in episodeObj for creating podcast feed
                    });
                  });
                }
              }, err => reject(`Error: unable to parse file with ffmpeg ${err}`));
            } catch(e) {
              reject(`Error: ffmpeg catch ${e}`);
            }
          })
        }).catch(err => reject(`Error: unable to obtain episode ${err}`));
      }))).then(results => {
        episodesArrSorted.forEach(episode => {
          const description = episode.description
          const itunesSummary = description.length >= 3988 ?
                                description.slice(0, 3985) + '..' : description;
          const episodeObj = {
            title: episode.title,
            description, // may contain html
            url: `https://mysoundwise.com/episodes/${episode.id}`, // '1509908899352e' is the unique episode id
            categories, // use the soundcast categories
            itunesImage: episode.coverArtUrl || itunesImage, // check if episode.coverArtUrl exists, if so, use that, if not, use the soundcast cover art
            author: hostName,
            date: moment().toDate(),
            enclosure : {url: episode.url}, // link to audio file
            itunesAuthor: hostName,
            itunesSubtitle: episode.title.length >= 255 ? episode.title.slice(0, 252) + '..' : episode.title, // need to be < 255 characters
            itunesSummary: `<![CDATA[${itunesSummary}]]>`, // may contain html, need to be wrapped within <![CDATA[ ... ]]> tag, and need to be < 4000 characters
            itunesExplicit,
            itunesDuration: episode.duration || results.find(i => i.id === episode.id).fileDuration // check if episode.duration exists, if so, use that, if not, need to get the duration of the audio file in seconds
          };
          // check if episode.keywords exists, if so, use that, if not, don't add it
          if (episode.keywords && episode.keywords.length) {
            episodeObj.itunesKeywords = episode.keywords;
          }
          feed.addItem(episodeObj);
        });
        const xml = feed.buildXml();
        // store the cached xml somewhere in our database (firebase or postgres)
        firebase.database().ref(`soundcastsFeedXml/${soundcastId}`).set(xml);
        sgMail.send({ // send email
          to: 'support@mysoundwise.com',
          from: 'natasha@mysoundwise.com',
          subject: 'New podcast creation request!',
          html: `<p>A new podcast feed has been created for ${soundcastId}</p>`,
        });
        res.end(xml);
      }).catch(console.log); // Promise.all catch
    } else {
      res.error(`Error: image size must be between 1400x1400 px and 3000x3000 px`);
    }
  }).catch(err => {
    console.log(`Error: unable to obtain image ${err}`)
    res.error(`Error: unable to obtain image ${err}`)
  });
}

module.exports.requestFeed = async (req, res) => {
  if (req.params && req.params.id) {
    const xml = await firebase.database().ref(`soundcastsFeedXml/${req.params.id}`).once('value');
    req.end(xml.val());
  } else {
    res.error('Error: soundcast id must be provided');
  }
}
