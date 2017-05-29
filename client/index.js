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
      "name": "Financial Projections: What Every Startup Founder Needs to Know",
      "img_url_mobile": "https://s3.amazonaws.com/soundwiseinc/rich_kivel/How+to+Find+the+Right+Business+Model.png",
      "id": 122,
      "run_time": 2625,
      "price": 0,
      "trailer_url": "https://s3.amazonaws.com/soundwiseinc/rich_kivel/lesson-1.mp3",
      "category": "Entrepreneurship",
      "keywords": "entrepreneurship, entrepreneur, Rich Kivel, business model, business plan, revenue model, MIT, MIT Sloan, startups, marketing, product launch, sales, customer acquisition, lean startup, business, audiobooks, audio courses, online courses",
      "description": ["In this example-rich course, Richard Kivel will help you answer the million-dollar question: “How do your startup make money?” The course explores some of the common business models and discusses when they are mostly appropriately used."],
      "description_long":["To build a successful startup, having a killer product is not enough. You need to figure out how you will get your product into the hands of your customers and effectively capture part of the value you create. And as technologies evolve, the way you distribute your project and make money may evolve as well.", "In this course, serial entrepreneur and investor Rich Kivel will teach you how to go from having a business idea to ideally positioning yourself in your industry and product category, by choosing the right business model."],
      "features": ["Learn the characteristics of successful business models", "Tips on how to find your ideal market positioning", "Insights for identifying market opportunites in your industry", "Business advices from a seasoned entrepreneur", "6 audio lessons", "Action steps for every lesson", "Option to play audios offline (on computer and android phone with Chrome browser"],
      "metrics": {
          52: {
            timesCompleted: 0
          },
          53: {
            timesCompleted: 0
          },
          54: {
            timesCompleted: 0
          },
          55: {
            timesCompleted: 0
          },
          56: {
            timesCompleted: 0
          },
          57: {
            timesCompleted: 0
          }
        },
      "teacher": "Richard Kivel",
      "teacher_profession": "Entrepreneur and Investor",
      "teacher_img": "https://s3.amazonaws.com/soundwiseinc/rich_kivel/Richard_Kivel.jpeg",
      "teacher_thumbnail": "https://s3.amazonaws.com/soundwiseinc/rich_kivel/Richard_Kivel.jpeg",
      "teacher_bio": ["Rich Kivel has over 20 years of experience in managing and building successful emerging technology companies, from founding and raising capital to positioning the companies for acquisition. He is the Executive Chairman of ViS Research Institute, Inc. and a Senior Manager at Bridgewater Associates. He is a frequent Guest Lecturer at MIT Sloan School of Management and has been a Judge for the MIT $100k Entrepreneurship Competition since 1998."],
      "teacher_website": "",
      "teacher_linkedin": "https://www.linkedin.com/in/kivel/",
      "teacher_facebook": "",
      "teacher_twitter": "https://twitter.com/kivel1",
      "teacher_instagram": "",
      "modules": [
        {
          "module_id": 1,
          "module_title": "How to Find the Right Business Model for Your Startup",
          "sections": [
            {
              "section_id": 52,
              "section_number": 1,
              "run_time": "7:52",
              "title": "Why the business model can make or break your business",
              "content": "",
              "actions": "Think about your answers to the following questions. As technologies progress, how has that changed the ways goods and services are delivered to consumers? How will the emerging technologies being developed today affect your company’s business model five years from now?",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/rich_kivel/lesson-1.mp3",
              "transcript_url": "",
              "notes_url": "",
              "resources": ""
            },
            {
              "section_id": 53,
              "section_number": 2,
              "run_time": "3:39",
              "title": "The one crucial characteristic of any successful business model",
              "content": "",
              "actions": "Brainstorm and come up with at least five approaches of market distribution that can get your company’s product into the hands of your target customers.",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/rich_kivel/lesson-2.mp3",
              "transcript_url": "",
              "notes_url": "",
              "resources": ""
            },
            {
              "section_id": 54,
              "section_number": 3,
              "run_time": "13:41",
              "title": "The seven elements of a winning business model",
              "content": "",
              "actions": "Write down your answers to the following questions. 1. What’s your company’s value proposition? 2. Who are your target customers? 3. Where are you in your industry’s value chain? 4. What are your cost structure and target profit margins? 5. How will you develop a sustainable competitive advantage?",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/rich_kivel/lesson-3.mp3",
              "transcript_url": "",
              "notes_url": "",
              "resources": [{"link": "https://s3.amazonaws.com/soundwiseinc/rich_kivel/businessmodelgeneration_preview.pdf", "description": "Useful book on busines model generation", "link_text": "Business Model Generation by Alexander Osterwalder and Yves Pigneur"}, {"link": "https://s3.amazonaws.com/soundwiseinc/rich_kivel/business_model_canvas_poster.pdf", "description": "Business model canvas", "link_text": "Canvas template"}]
            },
            {
              "section_id": 55,
              "section_number": 4,
              "run_time": "6:08",
              "title": "The evolution of business model in action-- Google",
              "content": "",
              "actions": "The cost of digital storage has dropped dramatically over the past twenty years. How has that changed the business models of existing and new companies? Think of at least three examples.",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/rich_kivel/lesson-4.mp3",
              "transcript_url": "",
              "notes_url": "",
              "resources": ""
            },
            {
              "section_id": 56,
              "section_number": 5,
              "run_time": "11:41",
              "title": "Examples of successful business models and what you can learn from them",
              "content": "",
              "actions": "Can you think of anything in common among the business model examples mentioned in this lesson? Hint: Think of how those companies take advantage of new technological progress to reinvent old industries.",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/rich_kivel/lesson-5.mp3",
              "transcript_url": "",
              "notes_url": "",
              "resources": ""
            },
            {
              "section_id": 57,
              "section_number": 6,
              "run_time": "0:44",
              "title": "Summary",
              "content": "",
              "actions": "",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/rich_kivel/lesson-6.mp3",
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

