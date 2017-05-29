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
      "img_url_mobile": "https://s3.amazonaws.com/soundwiseinc/Charlie+Tillet/financial+projections-+what+every+startup+founder+needs+to+know.png",
      "id": 122,
      "run_time": 3977,
      "price": 0,
      "trailer_url": "https://s3.amazonaws.com/soundwiseinc/Charlie+Tillet/lesson-1.mp3",
      "category": "Entrepreneurship",
      "keywords": "financials, financial models, financial projections, revenue projections, income statement, entrepreneurship, entrepreneur, Charlie Tillet, business model, business plan, revenue model, MIT, MIT Sloan, startups, marketing, product launch, sales, customer acquisition, lean startup, business, audiobooks, audio courses, online courses",
      "description": ["Knowing what resources it will take to run the business is crucial for every startup. In the course, senior financial executive Charlie Tillett teaches you the building blocks of financial planning and projections for you business."],
      "description_long":["Running a startup involves a high degree of uncertainty. But that doesn’t mean as a founder, you don’t need to plan ahead. Just to the opposite, the more you understand the financial assumptions and business drivers of your company and plan your actions accordingly, the more you stand a chance to succeed. Besides, before you talk to potential investors, you want to make sure you understand what resources it takes to get your company off the ground, and what milestones you need to achieve by when.", "In this course, seasoned financial executive Charlie Tillett will show you how to go about making financial projections for your company that will deepen your understanding of your own business and increase your credibility with investors. The course also shows you how venture financing works, and teaches you, through concrete examples, how external financing changes the equity structure of your company over time. After taking this course and completing the exercises, you will be better equipped to negotiate with investors and assess potential investment offers.", "The course is mainly designed for entrepreneurs seeking external financing. But the principals and wisdom presented here are useful no matter how you plan to fund your company."],
      "features": ["Learn how to determine the financial needs of your business", "Overview of the building blocks of startup financials", "Easy-to-understand financial accounting examples for entrepreneurs", "Time-tested financial planning tips", "8 audio lessons", "Notes and action steps for every lesson", "Financial projection template included", "Option to play audios offline (on computer and android phone with Chrome browser"],
      "metrics": {
          58: {
            timesCompleted: 0
          },
          59: {
            timesCompleted: 0
          },
          60: {
            timesCompleted: 0
          },
          61: {
            timesCompleted: 0
          },
          62: {
            timesCompleted: 0
          },
          63: {
            timesCompleted: 0
          },
          64: {
            timesCompleted: 0
          },
          65: {
            timesCompleted: 0
          }
        },
      "teacher": "Charlie Tillett",
      "teacher_profession": "Financial Executive",
      "teacher_img": "https://s3.amazonaws.com/soundwiseinc/Charlie+Tillet/Charlie+Tillet+2.png",
      "teacher_thumbnail": "https://s3.amazonaws.com/soundwiseinc/Charlie+Tillet/Charlie+Tillet+2.png",
      "teacher_bio": ["Charlie is a seasoned financial executive who has 20+ years of experience working with VC-backed, early-stage, technology companies. He raised over $125 million in more than a dozen equity/debt funding transactions, including a NASDAQ IPO, and has participated in multiple M&A engagements. Charlie has a BSBA from Boston University and an SM from the Sloan School of Management at MIT with a concentration in Entrepreneurial Finance."],
      "teacher_website": "",
      "teacher_linkedin": "https://www.linkedin.com/in/charlietillett/",
      "teacher_facebook": "",
      "teacher_twitter": "",
      "teacher_instagram": "",
      "modules": [
        {
          "module_id": 1,
          "module_title": "Financial Projections: What Every Startup Founder Needs to Know",
          "sections": [
            {
              "section_id": 58,
              "section_number": 1,
              "run_time": "10:13",
              "title": "Why are financials so important to the success of your company?",
              "actions": "Gross margin is a company's total sales revenue minus the direct and indirect costs of producing the sold products, divided by total sales revenue, expressed as a percentage. Do you know the gross margin of your startup? If not, do some calculation and find out.",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/Charlie+Tillet/lesson-1.mp3",
              "transcript_url": "",
              "notes_url": "https://s3.amazonaws.com/soundwiseinc/Charlie+Tillet/Lesson-2.jpg",
              "resources": ""
            },
            {
              "section_id": 59,
              "section_number": 2,
              "run_time": "11:10",
              "title": "A primer on venture capital financing deals",
              "actions": "Let’s do some simple math. Based on your current assumptions of market size and customer behavior, what’s your company’s projected revenue in 5 years? And let’s say your company’s valuation in 5 years will be 3 times the projected revenue. If a VC invests $1 million in your company today, how much ownership do they need to have to make a 3-time to 5-time return on investment? ",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/Charlie+Tillet/lesson-2.mp3",
              "transcript_url": "",
              "notes_url": "https://s3.amazonaws.com/soundwiseinc/Charlie+Tillet/Lesson-3.jpg",
              "resources": ""
            },
            {
              "section_id": 60,
              "section_number": 3,
              "run_time": "7:57",
              "title": "How to make income statement projections that increase your credibility with investors",
              "actions": "Start a simple 4-year income statement projection in annual frequency for your startup, using the template provided under the resources section of this lesson. Don’t worry about doing it right. You will revise it later.",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/Charlie+Tillet/lesson-3.mp3",
              "transcript_url": "",
              "notes_url": "https://s3.amazonaws.com/soundwiseinc/Charlie+Tillet/Lesson-4.jpg",
              "resources": [{"link": "https://s3.amazonaws.com/soundwiseinc/Charlie+Tillet/Annual_income_statement_example.xlsx", "description": "Annual income statement example", "link_text": "download here"}]
            },
            {
              "section_id": 61,
              "section_number": 4,
              "run_time": "6:01",
              "title": "Financial statement examples from the real world and what you can learn from them",
              "actions": "Find the income statements of a few publicly traded companies in your industry from Yahoo Finance. How do your company’s gross margins, expense ratios, and operating profits that you projected in Lesson 4 compare to your industry peers?",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/Charlie+Tillet/lesson-4.mp3",
              "transcript_url": "",
              "notes_url": "https://s3.amazonaws.com/soundwiseinc/Charlie+Tillet/Lesson-5.jpg",
              "resources": ""
            },
            {
              "section_id": 62,
              "section_number": 5,
              "run_time": "8:52",
              "title": "Do's and don'ts of financial projections",
              "actions": "Revise your income statement projections by incorporating the tips given in this lesson. Think about your distribution strategies. How are you going to get your product into the hands of your customers and how do different strategies impact your financial projections?",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/Charlie+Tillet/lesson-5.mp3",
              "transcript_url": "",
              "notes_url": "https://s3.amazonaws.com/soundwiseinc/Charlie+Tillet/Lesson-6.jpg",
              "resources": ""
            },
            {
              "section_id": 63,
              "section_number": 6,
              "run_time": "5:12",
              "title": "Rules of thumb for building financial models for a tech company",
              "actions": "Review the income statement projections you made earlier. How do your projections of salaries, marketing and sales expenditures, and revenue per employee in Year 4 compare to the rules of thumb mentioned in this lesson?",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/Charlie+Tillet/lesson-6.mp3",
              "transcript_url": "",
              "notes_url": "https://s3.amazonaws.com/soundwiseinc/Charlie+Tillet/Lesson-7.jpg",
              "resources": ""
            },
            {
              "section_id": 64,
              "section_number": 7,
              "run_time": "9:19",
              "title": "A detailed walkthrough of the financial projection templates",
              "actions": "Download the full financial projection templates under the resources section of this lesson. Spend sometime exploring the connections between different spreadsheets. You may want to replay the lesson at a slower speed while going through the templates.",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/Charlie+Tillet/lesson-7.mp3",
              "transcript_url": "",
              "notes_url": "",
              "resources": [{"link": "https://s3.amazonaws.com/soundwiseinc/Charlie+Tillet/financial+projection+templates.xlsx", "description": "Financial projection template", "link_text": "download here"}, {"link": "https://www.amazon.com/exec/obidos/ASIN/1568848684/ref=nosim/mitopencourse-20", "description": "Check out Chapters 10 and 11", "link_text": "Business Plans For Dummies"}]
            },
            {
              "section_id": 65,
              "section_number": 8,
              "run_time": "7:33",
              "title": "How to divide your equity pie",
              "actions": "If your startup has cofounders or early collaborators and you haven’t discussed equity shares, start the discussions now. Make sure you and your collaborators are on the same page about equity splits among yourselves, before you talk to outside investors. ",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/Charlie+Tillet/lesson-8.mp3",
              "transcript_url": "",
              "notes_url": "https://s3.amazonaws.com/soundwiseinc/Charlie+Tillet/Lesson-9.jpg",
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

