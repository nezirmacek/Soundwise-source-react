import React, {Component} from 'react'
import { render } from 'react-dom'
import { browserHistory } from 'react-router'

import { syncHistoryWithStore } from 'react-router-redux'
import thunkMiddleware from 'redux-thunk'  //check out https://github.com/gaearon/redux-thunk for how to use this
import { applyMiddleware, createStore, compose } from 'redux';
import {persistStore, autoRehydrate} from 'redux-persist'
import localForage from 'localforage'
// import { offline } from 'redux-offline';
// import offlineConfig from 'redux-offline/lib/defaults';
import { Provider } from 'react-redux'
import * as firebase from 'firebase'

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

// const persistor = persistStore(store, {storage: localForage, blacklist: ['setPlayer', 'setCurrentSection']})

// persistor.purge()

// const history = syncHistoryWithStore(browserHistory, store)

const courseInfo = {
      "name": "How to Get Anything You Want: A Course on Inner Mastery",
      "img_url_mobile": "https://s3.amazonaws.com/soundwiseinc/Steve+Pavlina/personal+dev+for+smart+people.png",
      "id": 126,
      "run_time": 6260,
      "price": 1.99,
      "trailer_url": "https://s3.amazonaws.com/soundwiseinc/Steve+Pavlina/1+-+my+story.mp3",
      "category": "Personal growth",
      "keywords": "Steve Pavlina, personal growth, personal development, growth, build confidence, achieve goals, happiness, life purpose, overcome fear, self esteem, limiting beliefs, start a business, coaching, audiobooks, audio courses, online courses",
      "description": ["Personal growth author and teacher Steve Pavlina presents actionable insights and tips in this course to help you build confidence, achieve goals, and discover your unique path to a fulfilling life."],
      "description_long":['Despite promises of "fast and easy" results from slick marketers, real personal growth is neither fast nor easy. The truth is that hard work, courage, and self-discipline are required to achieve meaningful results--results that are not attained by those who cling to the fantasy of achievement without effort.', "Personal Development for Smart People reveals the unvarnished truth about what it takes to consciously grow as a human being. In this course, you'll learn practical, insightful methods for improving your health, relationships, career, finances, and more. You'll see how to become the conscious creator of your life instead of feeling hopelessly adrift, enjoy a fulfilling career that honors your unique self-expression, wake up early feeling motivated, energized, and enthusiastic, achieve inspiring goals with disciplined daily habits and much more.", "With his refreshingly honest yet highly motivating style, Steve Pavlina will help you courageously explore, creatively express, and consciously embrace your extraordinary human journey."],
      "features": ["Practical tools for finding your purpose and direction", "Actionable insights on how to live a fulfilling life", "Build courage, confidence, and self-awareness", "Break through limiting beliefs and achieve personal goals", "12 audio lessons", "Option to play audios offline (on computer and android phone with Chrome browser)"],
      "metrics": {
          85: {
            timesCompleted: 0
          },
          86: {
            timesCompleted: 0
          },
          87: {
            timesCompleted: 0
          },
          88: {
            timesCompleted: 0
          },
          89: {
            timesCompleted: 0
          },
          90: {
            timesCompleted: 0
          },
          91: {
            timesCompleted: 0
          },
          92: {
            timesCompleted: 0
          },
          93: {
            timesCompleted: 0
          },
          94: {
            timesCompleted: 0
          },
          95: {
            timesCompleted: 0
          },
          96: {
            timesCompleted: 0
          }
        },
      "teacher": "Steve Pavlina",
      "teacher_profession": "Personal Growth Teacher",
      "teacher_img": "https://s3.amazonaws.com/soundwiseinc/Steve+Pavlina/Steve-Pavlina-Headshot.jpeg",
      "teacher_thumbnail": "https://s3.amazonaws.com/soundwiseinc/Steve+Pavlina/Steve-Pavlina-Headshot.jpeg",
      "teacher_bio": ["Steve is widely recognized as the most successful personal-development blogger, attracting more than two million monthly readers who value his unique insights. Instead of posing as a self-help guru with the answers, Steve encourages people to conduct their own personal growth experiments and learn through direct experience. He has been quoted as an expert by the New York Times, USA Today, U.S. News & World Report, The Guardian, Chicago Tribune, Los Angeles Daily News, and many other publications."],
      "teacher_website": "https://en.wikipedia.org/wiki/Steve_Pavlina",
      "teacher_linkedin": "",
      "teacher_facebook": "",
      "teacher_twitter": "https://twitter.com/stevepavlina?lang=en",
      "teacher_instagram": "",
      "teachers": [
        {
          "teacher": "Steve Pavlina",
          "teacher_profession": "Personal Growth Teacher",
          "teacher_img": "https://s3.amazonaws.com/soundwiseinc/Steve+Pavlina/Steve-Pavlina-Headshot.jpeg",
          "teacher_thumbnail": "https://s3.amazonaws.com/soundwiseinc/Steve+Pavlina/Steve-Pavlina-Headshot.jpeg",
          "teacher_bio": ["Steve is widely recognized as the most successful personal-development blogger, attracting more than two million monthly readers who value his unique insights. Instead of posing as a self-help guru with the answers, Steve encourages people to conduct their own personal growth experiments and learn through direct experience. He has been quoted as an expert by the New York Times, USA Today, U.S. News & World Report, The Guardian, Chicago Tribune, Los Angeles Daily News, and many other publications."],
          "teacher_website": "https://en.wikipedia.org/wiki/Steve_Pavlina",
          "teacher_linkedin": "",
          "teacher_facebook": "",
          "teacher_twitter": "https://twitter.com/stevepavlina?lang=en",
          "teacher_instagram": "",
        }
      ],
      "sections": [
        {
          "section_id": 85,
          "section_number": 1,
          "run_time": "7:44",
          "content": "This lesson is an introduction to the course with a story about how I got started on the personal growth path.",
          "title": "My story",
          "actions": "",
          "section_url": "https://s3.amazonaws.com/soundwiseinc/Steve+Pavlina/1+-+my+story.mp3",
          "transcript_url": "",
          "notes_url": "",
          "resources": ""
        },
        {
          "section_id": 86,
          "section_number": 2,
          "run_time": "9:28",
          "title": "First step: accepting the reality of where you are ",
          "content": "This lesson explores the topic of moving beyond denial and ignorance to face and accept the truth in your life, including two different methods for how to accomplish that.",
          "actions": "",
          "section_url": "  https://s3.amazonaws.com/soundwiseinc/Steve+Pavlina/2+-+accepting+the+reality+of+where+you+are+now.mp3",
          "transcript_url": "",
          "notes_url": "",
          "resources": ""
        },
        {
          "section_id": 87,
          "section_number": 3,
          "run_time": "10:04",
          "title": "How to use your intuition to help achieving your goals",
          "content": "This lesson will teach you two different methods for accessing your intuition and communicating with your subconscious mind. You’ll also learn how you can apply these skills to help you achieve your goals and overcome resistance.",
          "actions": "",
          "section_url": "https://s3.amazonaws.com/soundwiseinc/Steve+Pavlina/3+-+how+your+intuition+can+help+you+achieve+your+goals.mp3",
          "transcript_url": "",
          "notes_url": "",
          "resources": ""
        },
        {
          "section_id": 88,
          "section_number": 4,
          "run_time": "9:47",
          "title": "Your beliefs and how to make them work for you",
          "content": "This lesson is about understanding beliefs and how to modify your beliefs in order to make goal achievement easier.",
          "actions": "",
          "section_url": "https://s3.amazonaws.com/soundwiseinc/Steve+Pavlina/4+-+your+beliefs+and+how+to+make+them+work+for+you.mp3",
          "transcript_url": "",
          "notes_url": "",
          "resources": ""
        },
        {
          "section_id": 89,
          "section_number": 5,
          "run_time": "6:28",
          "title": "What to do when faced with difficult decisions",
          "content": "This lesson explores those frustrating problems of life where you feel you must choose between a limited number of options, none of which seems very appealing.",
          "actions": "",
          "section_url": "https://s3.amazonaws.com/soundwiseinc/Steve+Pavlina/5+-+what+to+do+when+you+have+difficult+choices+to+make.mp3",
          "transcript_url": "",
          "notes_url": "",
          "resources": ""
        },
        {
          "section_id": 90,
          "section_number": 6,
          "run_time": "9:23",
          "title": "How to overcome your fear",
          "content": "This lesson explores the topic of fear. It presents two ways to overcome fear, first by building courage and secondly by shifting your mental model of reality to eliminate the experience of fear entirely.",
          "actions": "",
          "section_url": "https://s3.amazonaws.com/soundwiseinc/Steve+Pavlina/6+-+overcoming+your+fear.mp3",
          "transcript_url": "",
          "notes_url": "",
          "resources": ""
        },
        {
          "section_id": 91,
          "section_number": 7,
          "run_time": "7:07",
          "title": "Getting clarity about your life from multiple perspectives",
          "content": "The goal of this lesson is to help you answer the question, “How shall I live my life?”.  By using your imagination to look at your life from other perspectives in both time and space, you can gain tremendous clarity. You will see how your life looks from different angles.",
          "actions": "",
          "section_url": "https://s3.amazonaws.com/soundwiseinc/Steve+Pavlina/7+-+getting+clarity+about+your+life+from+multiple+perspectives.mp3",
          "transcript_url": "",
          "notes_url": "",
          "resources": ""
        },
        {
          "section_id": 92,
          "section_number": 8,
          "run_time": "9:11",
          "title": "4 ways to build confidence",
          "content": "This lesson will give you four different methods for boosting your confidence.",
          "actions": "",
          "section_url": "https://s3.amazonaws.com/soundwiseinc/Steve+Pavlina/8+-+4+ways+to+build+confidence.mp3",
          "transcript_url": "",
          "notes_url": "",
          "resources": ""
        },
        {
          "section_id": 93,
          "section_number": 9,
          "run_time": "9:52",
          "title": "How to find your purpose",
          "content": "This lesson takes the high concept of purpose and brings it down to the level of practical application.",
          "actions": "",
          "section_url": "https://s3.amazonaws.com/soundwiseinc/Steve+Pavlina/9+-+how+to+find+your+purpose.mp3",
          "transcript_url": "",
          "notes_url": "",
          "resources": ""
        },
        {
          "section_id": 94,
          "section_number": 10,
          "run_time": "6:59",
          "title": "Why living your purpose is so important",
          "content": "This lesson discusses why purpose is crucial for boosting self-esteem and living a fulfilling life.",
          "actions": "",
          "section_url": "https://s3.amazonaws.com/soundwiseinc/Steve+Pavlina/10+-+why+purpose+is+so+important.mp3",
          "transcript_url": "",
          "notes_url": "",
          "resources": ""
        },
        {
          "section_id": 95,
          "section_number": 11,
          "run_time": "8:46",
          "title": "Tips for achieving your goals faster",
          "content": "In this lesson you’ll gain insights on closing the gap between your current position and your goals/intentions.",
          "actions": "",
          "section_url": "https://s3.amazonaws.com/soundwiseinc/Steve+Pavlina/11+-+how+to+achieve+your+goals+faster.mp3",
          "transcript_url": "",
          "notes_url": "",
          "resources": ""
        },
        {
          "section_id": 96,
          "section_number": 12,
          "run_time": "8:31",
          "title": "Bonus: Kick-starting your own business",
          "content": "This lesson will give you tips on how to kick-start your own business, especially a part-time, home-based business.",
          "actions": "",
          "section_url": "https://s3.amazonaws.com/soundwiseinc/Steve+Pavlina/12+-++bonus_kickstarting+your+own+business.mp3",
          "transcript_url": "",
          "notes_url": "",
          "resources": ""
        },
      ],
      "modules": [
        {
          "module_id": 1,
          "module_title": "Personal Development for Smart People",
          "sections": [
            {
              "section_id": 85,
              "section_number": 1,
              "run_time": "7:44",
              "content": "This lesson is an introduction to the course with a story about how I got started on the personal growth path.",
              "title": "My story",
              "actions": "",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/Steve+Pavlina/1+-+my+story.mp3",
              "transcript_url": "",
              "notes_url": "",
              "resources": ""
            },
            {
              "section_id": 86,
              "section_number": 2,
              "run_time": "9:28",
              "title": "First step: accepting the reality of where you are ",
              "content": "This lesson explores the topic of moving beyond denial and ignorance to face and accept the truth in your life, including two different methods for how to accomplish that.",
              "actions": "",
              "section_url": "  https://s3.amazonaws.com/soundwiseinc/Steve+Pavlina/2+-+accepting+the+reality+of+where+you+are+now.mp3",
              "transcript_url": "",
              "notes_url": "",
              "resources": ""
            },
            {
              "section_id": 87,
              "section_number": 3,
              "run_time": "10:04",
              "title": "How to use your intuition to help achieving your goals",
              "content": "This lesson will teach you two different methods for accessing your intuition and communicating with your subconscious mind. You’ll also learn how you can apply these skills to help you achieve your goals and overcome resistance.",
              "actions": "",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/Steve+Pavlina/3+-+how+your+intuition+can+help+you+achieve+your+goals.mp3",
              "transcript_url": "",
              "notes_url": "",
              "resources": ""
            },
            {
              "section_id": 88,
              "section_number": 4,
              "run_time": "9:47",
              "title": "Your beliefs and how to make them work for you",
              "content": "This lesson is about understanding beliefs and how to modify your beliefs in order to make goal achievement easier.",
              "actions": "",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/Steve+Pavlina/4+-+your+beliefs+and+how+to+make+them+work+for+you.mp3",
              "transcript_url": "",
              "notes_url": "",
              "resources": ""
            },
            {
              "section_id": 89,
              "section_number": 5,
              "run_time": "6:28",
              "title": "What to do when faced with difficult decisions",
              "content": "This lesson explores those frustrating problems of life where you feel you must choose between a limited number of options, none of which seems very appealing.",
              "actions": "",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/Steve+Pavlina/5+-+what+to+do+when+you+have+difficult+choices+to+make.mp3",
              "transcript_url": "",
              "notes_url": "",
              "resources": ""
            },
            {
              "section_id": 90,
              "section_number": 6,
              "run_time": "9:23",
              "title": "How to overcome your fear",
              "content": "This lesson explores the topic of fear. It presents two ways to overcome fear, first by building courage and secondly by shifting your mental model of reality to eliminate the experience of fear entirely.",
              "actions": "",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/Steve+Pavlina/6+-+overcoming+your+fear.mp3",
              "transcript_url": "",
              "notes_url": "",
              "resources": ""
            },
            {
              "section_id": 91,
              "section_number": 7,
              "run_time": "7:07",
              "title": "Getting clarity about your life from multiple perspectives",
              "content": "The goal of this lesson is to help you answer the question, “How shall I live my life?”.  By using your imagination to look at your life from other perspectives in both time and space, you can gain tremendous clarity. You will see how your life looks from different angles.",
              "actions": "",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/Steve+Pavlina/7+-+getting+clarity+about+your+life+from+multiple+perspectives.mp3",
              "transcript_url": "",
              "notes_url": "",
              "resources": ""
            },
            {
              "section_id": 92,
              "section_number": 8,
              "run_time": "9:11",
              "title": "4 ways to build confidence",
              "content": "This lesson will give you four different methods for boosting your confidence.",
              "actions": "",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/Steve+Pavlina/8+-+4+ways+to+build+confidence.mp3",
              "transcript_url": "",
              "notes_url": "",
              "resources": ""
            },
            {
              "section_id": 93,
              "section_number": 9,
              "run_time": "9:52",
              "title": "How to find your purpose",
              "content": "This lesson takes the high concept of purpose and brings it down to the level of practical application.",
              "actions": "",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/Steve+Pavlina/9+-+how+to+find+your+purpose.mp3",
              "transcript_url": "",
              "notes_url": "",
              "resources": ""
            },
            {
              "section_id": 94,
              "section_number": 10,
              "run_time": "6:59",
              "title": "Why living your purpose is so important",
              "content": "This lesson discusses why purpose is crucial for boosting self-esteem and living a fulfilling life.",
              "actions": "",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/Steve+Pavlina/10+-+why+purpose+is+so+important.mp3",
              "transcript_url": "",
              "notes_url": "",
              "resources": ""
            },
            {
              "section_id": 95,
              "section_number": 11,
              "run_time": "8:46",
              "title": "Tips for achieving your goals faster",
              "content": "In this lesson you’ll gain insights on closing the gap between your current position and your goals/intentions.",
              "actions": "",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/Steve+Pavlina/11+-+how+to+achieve+your+goals+faster.mp3",
              "transcript_url": "",
              "notes_url": "",
              "resources": ""
            },
            {
              "section_id": 96,
              "section_number": 12,
              "run_time": "8:31",
              "title": "Bonus: Kick-starting your own business",
              "content": "This lesson will give you tips on how to kick-start your own business, especially a part-time, home-based business.",
              "actions": "",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/Steve+Pavlina/12+-++bonus_kickstarting+your+own+business.mp3",
              "transcript_url": "",
              "notes_url": "",
              "resources": ""
            },
          ]
        }
      ]
    }

const expiration = new Date(2099, 7, 31)
const coupon = {
  course_id: 126,
  discount: 100, //50% discount
  count: 0,
  expiration: expiration.toString()
}

firebase.initializeApp(config)

// firebase.database().ref('courses/' + courseInfo.id)
//   .set(courseInfo)
//   .then(() => console.log('courseInfo set.'))
//   .catch((err) => console.log(err))

// firebase.database().ref('courses/115/metrics')
//   .set(update)

// firebase.database().ref('coupons/pavlina100')
//   .set(coupon)

// *** change database structure for teacher info ***

// firebase.database().ref('courses/' + 125)
// .on('value', snapshot => {
//     if (snapshot.val()) {
//       const {
//               teacher,
//               teacher_profession,
//               teacher_img,
//               teacher_thumbnail,
//               teacher_bio,
//               teacher_website,
//               teacher_linkedin,
//               teacher_facebook,
//               teacher_twitter,
//               teacher_instagram
//             } = snapshot.val()
//       const sections = snapshot.val().modules[0].sections
//       const teachers = [
//            {
//               teacher,
//               teacher_profession,
//               teacher_img,
//               teacher_thumbnail,
//               teacher_bio,
//               teacher_website,
//               teacher_linkedin,
//               teacher_facebook,
//               teacher_twitter,
//             }
//      ]
//       firebase.database().ref('courses/125/teachers')
//         .set(teachers)
//         .then(() => console.log('125: teachers set.'))
//         .catch((err) => console.log(err))

//       firebase.database().ref('courses/125/sections')
//         .set(sections)
//         .then(() => console.log('125: sections set.'))
//         .catch((err) => console.log(err))
//     }
// })

export default class App extends Component {
  constructor() {
    super()
    this.state = {
      rehydrated: false
    }
  }

  componentWillMount(){
    const persistor = persistStore(store, {storage: localForage, blacklist: ['setPlayer', 'setCurrentSection']}, () => {
      this.setState({ rehydrated: true })
    })
  }

  render() {
    if(!this.state.rehydrated) {
      return <div>Loading...</div>
    }
    return (
      <Provider store = { store }>
        <Routes />
      </Provider>
    )
  }
}

render(<App />, document.getElementById('root'))

