import React from 'react'
import { render } from 'react-dom'
import { browserHistory } from 'react-router'

import { syncHistoryWithStore } from 'react-router-redux'
import thunkMiddleware from 'redux-thunk'  //check out https://github.com/gaearon/redux-thunk for how to use this
import { applyMiddleware, createStore, compose } from 'redux';
import {persistStore, autoRehydrate} from 'redux-persist'
import localForage from 'localForage'
// import { offline } from 'redux-offline';
// import offlineConfig from 'redux-offline/lib/defaults';
import { Provider } from 'react-redux'
import firebase from 'firebase'

import { config } from '../config'
import {Routes} from './routes'
import rootReducer from './reducers'

// let createStoreWithMiddleware = applyMiddleware(thunkMiddleware)(createStore)
// let store = createStoreWithMiddleware(rootReducer)
const store = createStore(
  rootReducer,
  {},
  compose(
    applyMiddleware(thunkMiddleware),
    // offline(offlineConfig)
    autoRehydrate()
  )
)

const persistor = persistStore(store, {storage: localForage, blacklist: ['setPlayer']})

// persistor.purge()

// const history = syncHistoryWithStore(browserHistory, store)

const courseInfo = {
      "name": "How to Conquer Public Speaking Anxiety in 5 Minutes",
      "img_url_mobile": "https://s3.amazonaws.com/soundwiseinc/geoff_woliner/with+Geoff+Woliner.png",
      "id": 115,
      "run_time": 950,
      "price": 5,
      "trailer_url": "https://s3.amazonaws.com/soundwiseinc/geoff_woliner/01+intro.mp3",
      "category": "Communication",
      "keywords": "public speaking, public speaking fear, fear of public speaking, public speaking anxiety, toastmaster, effective public speaking, public speaking tips, public speaking techniques, public speaking courses, audiobooks, communication skills, audio courses, online courses",
      "description": ["Does the idea of public speaking make you want to vomit? Don’t worry. Geoff Woliner got you covered. In this audio program, the award-winning comedian will teach you a tried-and-true technique that can make your public speaking experience more relaxing than a lazy Sunday afternoon."],
      "description_long":["Public speaking opens doors.", "Not only is it a manifestation of power and charisma, being a great public speaker also helps you establish credibility, win friends and connections, persuade your audience, and get you more success in your professional and personal life.", "In contrast, a public speaking flop can hugely affect one’s self confidence. It makes you question your own ability and courage. It adds to that feeling of shame that most of us feel on a primal level.", "If the idea of standing in front of an audience makes your stomach tied in knots, you’ve come to the right place.", "In this audio program, award-winning comedian and speech writer Geoff Woliner will teach you a technique that he has used to help numerous clients overcome their public speaking anxiety. The best part: it can be done in five minutes!", "You’ve tried the rest. Now try the best."],
      "features": ["An effective technique that helps conquer your public speaking fear--fast", "A simple exercise to get yourself in the right public speaking mindset in 5 minutes", "4 audio sections", "Transcripts for all sections", "Option to play audios offline (on computer and android phone with Chrome browser", "Additional resources"],
      "teacher": "Geoff Woliner",
      "teacher_profession": "Comedian",
      "teacher_img": "https://s3.amazonaws.com/soundwiseinc/geoff_woliner/Geoff-Woliner-Headshot.jpg",
      "teacher_thumbnail": "https://s3.amazonaws.com/soundwiseinc/geoff_woliner/Geoff-Woliner-Headshot.jpg",
      "teacher_bio": ["Geoff Woliner, winner of Stand-Up NY’s “Funniest Person From Queens” is a seasoned comedian, emcee, association development professional and pet psychologist. Correction: Aspiring pet psychologist. Seeing how the power of humor has helped deliver knockout presentations in all walks of life, he created Winning Wit, a speech writing company, in 2011. Together with a team of award-winning comedians throughout North America, Winning Wit helps people write and deliver great content that has audiences raving.", "Winning Wit is a unique, cutting edge service that has been featured on WTOP radio, Kentucky Bride Magazine, Brides and Weddings of Northern Virginia and many other publications."],
      "modules": [
        {
          "module_id": 1,
          "module_title": "How to Conquer Public Speaking Anxiety in 5 Minutes",
          "sections": [
            {
              "section_id": 15,
              "section_number": 1,
              "run_time": "2:58",
              "title": "Introduction: why are we afraid of public speaking",
              "content": "Most people are terrified of pubic speaking. The fear may seem irrational, but there're actually three very good reasons for it. If the idea of going on a stage makes you want to throw up and call in sick, it's ok! You're not alone.",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/geoff_woliner/01+intro.mp3",
              "transcript_url": "https://s3.amazonaws.com/soundwiseinc/geoff_woliner/section+1.pdf"
            },
            {
              "section_id": 16,
              "section_number": 2,
              "run_time": "3:13",
              "title": "Why the usual approaches to reduce public speaking anxiety get you nowhere",
              "content": "Chances are, you’ve tried something along the way to conquer your public speaking fear, and more than likely, it involves one or more of the approaches I talk about in this section. What? They haven't worked? I'm not surpised. And in this section, I explain why the common methods you hear about may not be effective as you want them to be.",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/geoff_woliner/02+ineffective+approaches.mp3",
              "transcript_url": "https://s3.amazonaws.com/soundwiseinc/geoff_woliner/section+2.pdf"
            },
            {
              "section_id": 17,
              "section_number": 3,
              "run_time": "5:28",
              "title": "The one technique that will conquer your public speaking fear for good",
              "content": "In this section, I talk about the state of mind you need that will be the perfect antidote to any public speaking fear. More importantly, I walk you through a simple, but tried-and-true technique that will get you into the right state of mind quickly.",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/geoff_woliner/03+the+solution.mp3",
              "transcript_url": "https://s3.amazonaws.com/soundwiseinc/geoff_woliner/section+3.pdf"
            },
            {
              "section_id": 18,
              "section_number": 4,
              "run_time": "4:11",
              "title": "An exercise to help you become your best speaker self in 5 minutes",
              "content": "In this section I guide you through an exercise that implements the technique I explained in the previous section. So make sure you actually do the exercise with me, while listening to this section. And don't forget to revisit this exercise every time before you go in front of a group of people to deliver your killer speech.",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/geoff_woliner/04+exercise.mp3",
              "transcript_url": "https://s3.amazonaws.com/soundwiseinc/geoff_woliner/section+4.pdf"
            }
          ]
        }
      ]
    }

const update = {
  7: {
    timesStarted: 0,
    timesCompleted: 0
  },
  8: {
    timesStarted: 0,
    timesCompleted: 0
  },
  9: {
    timesStarted: 0,
    timesCompleted: 0
  },
  10: {
    timesStarted: 0,
    timesCompleted: 0
  },
  11: {
    timesStarted: 0,
    timesCompleted: 0
  },
  12: {
    timesStarted: 0,
    timesCompleted: 0
  },
  13: {
    timesStarted: 0,
    timesCompleted: 0
  },
  14: {
    timesStarted: 0,
    timesCompleted: 0
  }
}

// const expiration = new Date(2017, 7, 31)
// const coupon = {
//   course_id: 112,
//   discount: 100, //100% discount
//   count: 0,
//   expiration: expiration.toString()
// }

firebase.initializeApp(config)

// firebase.database().ref('courses/' + courseInfo.id)
//   .set(courseInfo)

// firebase.database().ref('courses')
//         .once('value')
//         .then(snapshot => {
//           console.log(snapshot.val())
//         })
// firebase.database().ref('courses/112/metrics')
//   .set(update)
// firebase.database().ref('coupons/DL100')
//   .set(coupon)

export const App = ({match}) => (
  <Provider store = { store }>
    <Routes />
  </Provider>
)

render(<App />, document.getElementById('root'))

