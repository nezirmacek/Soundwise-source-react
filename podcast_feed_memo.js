// ****** example uses node-podcast module: https://github.com/maxnowack/node-podcast ******
// ****** An example object for creating podcast feed ******
const podcastObj = {
  title: 'The True Voyage: A Soundcast on Inner Mastery',
  desciption: 'A soundcast that inspires you to master the grand expedition called being human. Hosted by Natasha Che, this weekly series explores consciousness, personal growth, creativity, relationship and inner awakening.',
  generator: 'https://mysoundwise.com',
  feedUrl: 'https://mysoundwise.com/rss/1508293913676s', // '1508293913676s' is the soundcast id
  siteUrl: 'https://mysoundwise.com/soundcasts/1508293913676s',
  imageUrl: 'https://s3.amazonaws.com/soundwiseinc/demo/1508293913676s.jpg',
  author: 'Natasha Che',
  copyright: '2018 Natasha Che',
  language: 'en',
  categories: ['Education', 'Training', 'Self-Help'],
  pubDate: moment().toDate(),
  itunesAuthor: 'Natasha Che',
  itunesSubtitle: 'The True Voyage: A Soundcast on Inner Mastery', // need to be < 255 characters
  itunesSummary: 'A soundcast that inspires you to master the grand expedition called being human. Hosted by Natasha Che, this weekly series explores consciousness, personal growth, creativity, relationship and inner awakening.', // need to be < 4000 characters
  itunesOwner: {name: 'Soundwise', email: 'support@mysoundwise.com'},
  itunesExplicit: false,
  itunesCategory: [{
        "text": "Education",
        "subcats": [{
          "text": "Training"
        }]
    },{
        "text": "Health",
        "subcats": [{
          "text": "Self-Help"
        }]
    }],
  itunesImage: 'https://s3.amazonaws.com/soundwiseinc/demo/1508293913676s.jpg', // need to be between 1400x1400 px and 3000x3000 px
  customElements: [
    {'googleplay:email': 'support@mysoundwise.com'},
    {'googleplay:description': 'A soundcast that inspires you to master the grand expedition called being human. Hosted by Natasha Che, this weekly series explores consciousness, personal growth, creativity, relationship and inner awakening.'}, // need to be < 4000 characters
    {'googleplay:category': 'Religion & Spirituality'},
    {'googleplay:author': 'Natasha Che'},
    {'googleplay:explicit': false},
    {'googleplay:image': 'https://s3.amazonaws.com/soundwiseinc/demo/1508293913676s.jpg'}, // need to be between 1400x1400 px and 3000x3000 px
  ]
};

// ****** an example of episode object ******
const episodeObj = {
  title: "Don't You Dare Stop Being Judgmental, Ep 6",
  desciption: "<p>For most people, life is an inner war on a daily basis, from the smallest logistics...need to get out of bed, oh no!...to the paradigm-altering life decisions that you're too afraid to make. There's a firmly established command-and-judge program installed in almost everyone, to get the human self behave in such ways that the ego gets what it wants. These inner wars are exhausting (though you may not even be aware of it since you're so used to them). And they keep you from your deeper fulfillment and higher potential. Yet most of us simply don't know how to get out of the program. </p><p>In this episode, I talk about how you can start unwinding the internal conflicts and restoring peace inside by creating new responses to your self judgments.<p>", // may contain html
  url: 'https://mysoundwise.com/episodes/1509908899352e', // '1509908899352e' is the unique episode id
  categories: ['Education', 'Training', 'Self-Help'], // same as the soundcast categories
  itunesImage: 'https://s3.amazonaws.com/soundwiseinc/demo/1508293913676s.jpg',
  author: 'Natasha Che',
  date: 'the episode publication date',
  enclosure : {url:'https://s3.amazonaws.com/soundwiseinc/demo/1509908899352e.mp3'}, // link to audio file
  itunesAuthor: 'Natasha Che',
  itunesSubtitle: 'The True Voyage: A Soundcast on Inner Mastery', // need to be < 255 characters
  itunesSummary: "<p>For most people, life is an inner war on a daily basis, from the smallest logistics...need to get out of bed, oh no!...to the paradigm-altering life decisions that you're too afraid to make. There's a firmly established command-and-judge program installed in almost everyone, to get the human self behave in such ways that the ego gets what it wants. These inner wars are exhausting (though you may not even be aware of it since you're so used to them). And they keep you from your deeper fulfillment and higher potential. Yet most of us simply don't know how to get out of the program. </p><p>In this episode, I talk about how you can start unwinding the internal conflicts and restoring peace inside by creating new responses to your self judgments.<p>", // may contain html, need to be wrapped within <![CDATA[ ... ]]> tag, and need to be < 4000 characters
  itunesExplicit: false,
  itunesDuration: 5670, // audio duration in seconds
  itunesKeywords: ['personal growth', 'self-love'],
};

// ****** TASK LIST ******
// ****** STEP 1a: set up api end point '/api/create_feed' ******
  // the endpoint responds to post request from front end to create a podcast feed for an existing soundcast

  // example request:
reqest.body = {
  soundcastId: '1508293913676s',
};

// ****** STEP 1b: retrieve additional soundcast info from firebase to construct podcastObj ******
  // something like this:
const {soundcastId} = request.body;
const soundcast = await firebase.database().ref(`soundcasts/${soundcastId}`).once('value');
const {title, short_description, hostName, episodes, itunesExplicit, itunesCategory, itunesImage, googleplayCategory} = soundcast.val();

// ****** STEP 1c: construct podcast metadata from request and soundcast data ******
const podcastObj = {
  title,
  desciption: short_description,
  generator: 'https://mysoundwise.com',
  feedUrl: `https://mysoundwise.com/rss/${soundcastId}`, // '1508293913676s' is the soundcast id
  siteUrl: `https://mysoundwise.com/soundcasts/${soundcastId}`,
  imageUrl: itunesImage,
  author: hostName,
  copyright: `2018 ${hostName}`,
  language: 'en',
  categories: [], // construct the categories array taking sub-categories from itunesCategory
  pubDate: moment().toDate(),
  itunesAuthor: hostName,
  itunesSubtitle: title,
  itunesSummary: short_description, // need to be < 4000 characters
  itunesOwner: {name: 'Soundwise', email: 'support@mysoundwise.com'},
  itunesExplicit,
  itunesCategory,
  itunesImage: itunesImage, // need to be between 1400x1400 px and 3000x3000 px
  customElements: [
    {'googleplay:email': 'support@mysoundwise.com'},
    {'googleplay:description': short_description}, // need to be < 4000 characters
    {'googleplay:category': googleplayCategory},
    {'googleplay:author': hostName},
    {'googleplay:explicit': itunesExplicit},
    {'googleplay:image': itunesImage}, // need to be between 1400x1400 px and 3000x3000 px
  ]
};

// ****** STEP 1d: create the feed ******
import Podcast from 'podcast';
const feed = new podcast(podcastObj);

// ****** STEP 2a: retreive existing episodes and add ID3 tags
let episodesArr = [], episode;
for(let key in episodes) {
  episode = await firebase.database().ref(`episodes/${key}`).once('value');
  episodesArr.push({...episode.val(), id: key});
}

// ****** STEP 2a: add ID3 tags to all existing episodes
  // episodesArr[i].url contains link to Amazon S3, where episode audio file is located.
  // check if episodesArr[i].id3Tagged = true; if yes, that means the audio file is already tagged; if not:
      // - Get the audio file from S3
      // - check if it's a mp3 (sometimes it's .m4a). if not, convert it to mp3 (output in 64kbps) with ffmpeg
      // - add ID3 tags to the file
      // tags to add:
          // ‘title’: episodesArr[i].title,
          // ‘artist’: hostName,
          // ‘album’: soundcast.val().title,
          // ‘year’: new Date().getFullYear(),
          // ‘genre’: 'Podcast'
          // ‘cover art’: [use the soundcast cover]

// ****** STEP 2b: upload the processed audio file back to S3, to the same url to replace the original files
  // one can use our current uploader set up
var uploader = require('express-fileuploader');
var S3Strategy = require('express-fileuploader-s3');
uploader.use(new S3Strategy({
  uploadPath: 'soundcasts/',
  headers: {
    'x-amz-acl': 'public-read',
  },
  options: {
    key: awsConfig.accessKeyId,
    secret: awsConfig.secretAccessKey,
    bucket: 'soundwiseinc',
  },
}));
uploader.upload('s3', '1509908899352e.mp3', function(err, files) {
  // after upload success, change episode tagged record in firebase:
  firebase.database().ref(`episodes/${episode.id}/id3Tagged`).set(true);
});
// make sure the file name is the same and the file path is the same as the original

// ****** STEP 3a: add existing episodes to the podcast feed created earlier *****
 // loop over the episodes, episodes with a lower index number needs to be added first
episodesArr.sort((a, b) => {
  return a.index - b.index
});
let episodeObj, startEpisode = episodesArr.length > 50 ? episodesArr.length - 50 : 0; // only take the most recent 50 episodes
for(var i = startEpisode; i < episodesArr.length; i++) {
  episode = episodesArr[i];
  episodeObj = {
    title: episode.title,
    desciption: episode.description, // may contain html
    url: `https://mysoundwise.com/episodes/${episode.id}`, // '1509908899352e' is the unique episode id
    categories: [], // use the soundcast categories
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

// ****** STEP 4: generate xml and set up api endpoint for returning the xml on request
  // generate xml
const xml = feed.buildXml();
  // store the cached xml somewhere in our database (firebase or postgres)
  // set up endpoint to return the xml when `https://mysoundwise.com/rss/${soundcastId}` is requested

// ****** STEP 5: finished!
  // if the feed is created for the first time, send an email to Soundwise admin, notifying that a new feed has been created
var sgMail = require('@sendgrid/mail');
var msg = {
  to: 'support@mysoundwise.com',
  from: 'natasha@mysoundwise.com',
  subject: 'New podcast creation request!',
  html: `<p>A new podcast feed has been created for ${soundcastId}</p>`,
};
sgMail.send(msg);

// the end point '/api/create_feed' will be called again whenever the soundcast metadata is changed, or when a new episode is created. Upon these changes, the feed should update and generate and cache new xml
