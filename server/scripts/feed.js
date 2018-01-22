'use strict';

const request = require('request');
const sizeOf = require('image-size');
const RSS = require('rss');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(require('../../config').sendGridApiKey);

module.exports.createFeed = (req, res) => {
  const { soundcastId } = req.body;
  const soundcast = await firebase.database().ref(`soundcasts/${soundcastId}`).once('value');
  debugger // check soundcast object
  const errors = [];
  const fields = ['title', 'description', 'generator', 'feedUrl', 'siteUrl', 'imageUrl',
   'author', 'copyright', 'language', 'categories', 'pubDate', 'itunesSubtitle',
   'itunesSummary', 'itunesImage', 'itunesCategory', 'customElements']
  fields.forEach(i => !podcastObj[i] && errors.push(`Field ${i} must not be empty`))
  if (errors.length) {
    res.error(`Errors occur:\n${errors.join('\n')}`)
  } else { // checking image size ??
    request.get({
      encoding: null, // return body as a Buffer
      url: podcastObj.imageUrl
    }, (err, res, body) => {
      const { height, width } = sizeOf(body); // {height: 1400, width: 1400, type: "jpg"}
      if (height > 1400 && width > 1400 && height < 3000 && width < 3000 ) {
        // creating feed xml
        const feed = new RSS({
          title:           podcastObj.title,
          description:     podcastObj.description,
          generator:       podcastObj.generator,
          feed_url:        podcastObj.feedUrl,
          site_url:        podcastObj.siteUrl,
          image_url:       podcastObj.imageUrl,
          copyright:       podcastObj.copyright,
          language:        podcastObj.language,
          categories:      podcastObj.categories,
          pubDate:         podcastObj.pubDate,
          custom_elements: podcastObj.customElements
        });
        sgMail.send({
          to: 'support@mysoundwise.com',
          from: 'natasha@mysoundwise.com',
          subject: 'New podcast creation request!',
          html: `<p>A new podcast feed has been created for ${soundcastId}</p>`,
        });
        res.end(feed.xml())
      } else {
        res.error(`Error: image size must be between 1400x1400 px and 3000x3000 px`)
      }
    })
  }
}
