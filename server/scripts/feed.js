'use strict';

const request = require('request');
const Podcast = require('podcast');
const firebase = require('firebase-admin');
const sizeOf = require('image-size');
const moment = require('moment');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(require('../../config').sendGridApiKey);

module.exports.createFeed = (req, res) => {
  const { soundcastId } = req.body;
  const soundcast = await firebase.database().ref(`soundcasts/${soundcastId}`).once('value');
  const { title, short_description, hostName, episodes, itunesExplicit,
          itunesCategory, itunesImage, googleplayCategory } = soundcast.val();
  // checking image size
  request.get({
    encoding: null, // return body as a Buffer
    url: itunesImage
  }, (err, res, body) => {
    const { height, width } = sizeOf(body); // {height: 1400, width: 1400, type: "jpg"}
    if (height > 1400 && width > 1400 && height < 3000 && width < 3000 ) {
      // creating feed xml
      const itunesSummary = short_description.length >= 4000 ? short_description.slice(0, 3998) + '..' : short_description
      const categories = []
      itunesCategory.forEach(i => i.subcats.forEach(j => categories.push(j.text)))
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
        categories, // construct the categories array taking sub-categories from itunesCategory
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
          {'googleplay:description': short_description}, // need to be < 4000 characters
          {'googleplay:category': googleplayCategory},
          {'googleplay:author': hostName},
          {'googleplay:explicit': itunesExplicit},
          {'googleplay:image': itunesImage}, // need to be between 1400x1400 px and 3000x3000 px
        ]
      }
      const feed = new Podcast(podcastObj);
      sgMail.send({
        to: 'support@mysoundwise.com',
        from: 'natasha@mysoundwise.com',
        subject: 'New podcast creation request!',
        html: `<p>A new podcast feed has been created for ${soundcastId}</p>`,
      });
      res.end(feed.buildXml())
    } else {
      res.error(`Error: image size must be between 1400x1400 px and 3000x3000 px`)
    }
  });
}
