import React, {Component} from 'react'
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
      "name": "The Startup Product Launch Crash Course",
      "img_url_mobile": "https://s3.amazonaws.com/soundwiseinc/bob_jones/The Startup Product Launche Crash Course.png",
      "id": 120,
      "run_time": 3443,
      "price": 0,
      "trailer_url": "https://s3.amazonaws.com/soundwiseinc/bob_jones/1+Intro_mixdown.mp3",
      "category": "Entrepreneurship",
      "keywords": "entrepreneurship, entrepreneur, Bob Jones, MIT, MIT Sloan, startups, marketing, product launch, sales, customer acquisition, lean startup, business, audiobooks, audio courses, online courses",
      "description": ["Serial entrepreneur Bob Jones shares the mindset and techniques that are crucial for a successful product launch. Whether you’re a first-time founder or a startup veteran, this gem-packed mini course will help you win more customers and avoid costly launch mistakes."],
      "description_long":["Nine out of ten startups fail. But it doesn’t have to be that way.", "In this course, Bob Jones, serial entrepreneur and CEO of Scientific Nutrition Products Inc, shows you that if you execute your product launch the right way, not only is it much easier to get initial customers, but you also maximize your startup’s chance of long-term success.", "Through his personal examples of leading two startup launches, one succeeded and one failed, Jones lays out a step-by-step product launch formula that is rooted in idea validation and deeply understanding your customers.", "No matter whether you’re launching a million-dollar medical device or working on a better way for pizza delivery from your garage, the insights Jones presents in this course will help you secure a seat in the startup winner’s camp."],
      "features": ["Learn how to launch your startup product the right way", "Essential tools for finding, reaching and retaining customers", "Techniques for developing sales channels by understanding your customers", "11 audio lessons", "Infographic cheatsheets for individual lessons","Assignments/action steps for each lesson", "Option to play audios offline (on computer and android phone with Chrome browser"],
      "metrics": {
          29: {
            timesCompleted: 0
          },
          30: {
            timesCompleted: 0
          },
          31: {
            timesCompleted: 0
          },
          32: {
            timesCompleted: 0
          },
          33: {
            timesCompleted: 0
          },
          34: {
            timesCompleted: 0
          },
          35: {
            timesCompleted: 0
          },
          36: {
            timesCompleted: 0
          },
          37: {
            timesCompleted: 0
          },
          38: {
            timesCompleted: 0
          },
          39: {
            timesCompleted: 0
          }
        },
      "teacher": "Bob Jones",
      "teacher_profession": "Serial Entrepreneur and Senior Executive",
      "teacher_img": "https://s3.amazonaws.com/soundwiseinc/bob_jones/Bob_Jones.jpg",
      "teacher_thumbnail": "https://s3.amazonaws.com/soundwiseinc/bob_jones/Bob_Jones.jpg",
      "teacher_bio": ["Bob is CEO of Scientific Nutrition Products, Inc. Previously, Bob led the Nutrition and Wellness practice at Scientia Advisors, a strategy consulting firm.  Prior to Scientia, Bob was President and CEO of Vitasoy USA, Inc., the nation’s largest marketer and manufacturer of tofu and the pioneer of soymilk in America.  This was a management turn-around.", "Before Vitasoy, Bob launched three start-ups in the medical nutrition field.  Each company addressed chronic medical disorders such as diabetes via targeted nutrition products.  All three start-ups were with staff and faculty at Harvard Medical School.  Each company created consumer products that were sold through retail pharmacies.", "Bob also worked at Abbott Laboratories and Baxter International.  He has two awarded patents in the field of nutrition.  He is an active mentor with MIT’s Venture Mentoring Service and has served as a judge in MIT’s 100K Business Plan Competition.  He has an A.B. in biology from Princeton University, and an MSM (MBA + thesis) from MIT Sloan.  After hours, Bob plays in a blues band in the Boston area."],
      "teacher_website": "http://www.foodforsleep.com",
      "teacher_linkedin": "https://www.linkedin.com/in/bostonbobjones",
      "teacher_facebook": "",
      "teacher_twitter": "",
      "teacher_instagram": "",
      "modules": [
        {
          "module_id": 1,
          "module_title": "The Startup Product Launch Crash Course",
          "sections": [
            {
              "section_id": 29,
              "section_number": 1,
              "run_time": "1:28",
              "title": "Introduction",
              "content": "",
              "actions": "",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/bob_jones/1+Intro_mixdown.mp3",
              "transcript_url": "",
              "notes_url": ""
            },
            {
              "section_id": 30,
              "section_number": 2,
              "run_time": "4:11",
              "title": "Three critical questions that determine the survival of any company",
              "content": "",
              "actions": "Write down your answers to the following questions. What is my startup really selling? Who want what I sell? How do I find those people? Is my product unique and important?",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/bob_jones/2+Three+crucial+questions+that+determine+a+survival+of+any+company_mixdown.mp3",
              "transcript_url": "",
              "notes_url": "https://s3.amazonaws.com/soundwiseinc/bob_jones/Lesson+2-01.jpg"
            },
            {
              "section_id": 31,
              "section_number": 3,
              "run_time": "5:05",
              "title": "My disastrous product launch failure",
              "content": "",
              "actions": "Write down your answer to the following question. If you were Bob, what would you have done differently to make Regain’s product launch more successful?",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/bob_jones/3+My+disastrous+product+launch+failure+_mixdown.mp3",
              "transcript_url": "",
              "notes_url": "https://s3.amazonaws.com/soundwiseinc/bob_jones/Lesson+3-01.jpg"
            },
            {
              "section_id": 32,
              "section_number": 4,
              "run_time": "4:44",
              "title": "Four lessons you should learn from my product launch failure",
              "content": "",
              "actions": "Write down your answers to the following questions. Why did Regain’s product launch failed? Could it have succeeded at all if the team had taken different actions?",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/bob_jones/4+Four+lessons+you+should+learn+from+my+product+launc+failure_mixdown.mp3",
              "transcript_url": "",
              "notes_url": ""
            },
            {
              "section_id": 33,
              "section_number": 5,
              "run_time": "8:13",
              "title": "My product launch success and what you can learn from it",
              "content": "",
              "actions": "Write down your answer to the following question. What are the most important actions Bob and his team took that lead to NiteBite’s product launch success?",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/bob_jones/5+My+product+launch+succses+and+what+you+can+learn+from+it_mixdown.mp3",
              "transcript_url": "",
              "notes_url": "https://s3.amazonaws.com/soundwiseinc/bob_jones/Lesson+5-01.jpg"
            },
            {
              "section_id": 34,
              "section_number": 6,
              "run_time": "13:12",
              "title": "How to reach your customers",
              "content": "",
              "actions": "Write down your answers to the following questions. Who influences your customers’ buying decisions? What motivate these influencers? What can you do to help your customers’ influencers succeed?",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/bob_jones/6+How+to+reach+your+costumer_mixdown.mp3",
              "transcript_url": "",
              "notes_url": "https://s3.amazonaws.com/soundwiseinc/bob_jones/Lesson+6-01.jpg"
            },
            {
              "section_id": 35,
              "section_number": 7,
              "run_time": "3:33",
              "title": "Four truths of customer acquisition I learned the hard way",
              "content": "",
              "actions": "Write down your answer to the following question. What’s the customer segment that needs your product the most, that is, feeling the most pain from the problem you’re trying to solve?",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/bob_jones/7+Four+thruts+about+customer+aquisition+_mixdown.mp3",
              "transcript_url": "",
              "notes_url": "https://s3.amazonaws.com/soundwiseinc/bob_jones/Lesson+7-01.jpg"
            },
            {
              "section_id": 36,
              "section_number": 8,
              "run_time": "2:10",
              "title": "What you are really selling no matter what you sell (ignore this and you won't have a business)",
              "content": "",
              "actions": "Write down your answer to the following question. What’s the ultimate motivator for your customers to buy your startup’s product? Pain, fear, greed, vanity, or virtue?",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/bob_jones/8+What+you're+really+selling+no+matter+what+you+sell+(neglect+this+and+you+won't+have+a+buissnis+_mixdown.mp3",
              "transcript_url": "",
              "notes_url": "https://s3.amazonaws.com/soundwiseinc/bob_jones/Lesson+8-01.jpg"
            },
            {
              "section_id": 37,
              "section_number": 9,
              "run_time": "3:35",
              "title": "A winning customer acquisition formula for any new company",
              "content": "",
              "actions": ["Research and think about the following. What are the 1 to 3 well-defined customer niches that you can dominate. Write down your answer.", "Create a set of customer interview questions. And set a goal to talk to at least x number of potential customers per week from now on."],
              "section_url": "https://s3.amazonaws.com/soundwiseinc/bob_jones/9+A+winning+customer+aquisition+formula+for+any+new+company_mixdown.mp3",
              "transcript_url": "",
              "notes_url": "https://s3.amazonaws.com/soundwiseinc/bob_jones/Lesson+9-01.jpg"
            },
            {
              "section_id": 38,
              "section_number": 10,
              "run_time": "3:13",
              "title": 'The "lean startup" customer acquisition in a nutshell',
              "content": "",
              "actions": ["Create a 30-second pitch for your product and tell it to five potential customers.", "If your company is at an early stage, think about the following. Do you have any evidence that a segment of customers will buy your product? If you don’t, go find some evidence."],
              "section_url": "https://s3.amazonaws.com/soundwiseinc/bob_jones/10+Learn+startup+customer+acquisition+in+a+nutshell_mixdown.mp3",
              "transcript_url": "",
              "notes_url": "https://s3.amazonaws.com/soundwiseinc/bob_jones/Lesson+10-01.jpg"
            },
            {
              "section_id": 39,
              "section_number": 11,
              "run_time": "7:59",
              "title": 'Bonus: What to do when your business model is not working',
              "content": "",
              "actions": "Ask yourself the following questions. Is your product something people will cheerfully pay for and tell their friends about? If not, what can you do to figure out whether you have the right business model and are targeting the right customers? Write down your answers.",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/bob_jones/11+Bonus_mixdown.mp3",
              "transcript_url": "",
              "notes_url": ""
            },
          ]
        }
      ]
    }

const expiration = new Date(2099, 7, 31)
const coupon = {
  course_id: 116,
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

// firebase.database().ref('coupons/parent100')
//   .set(coupon)

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

