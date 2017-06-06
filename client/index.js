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
      "name": "The Crash Course on Startup Legal Issues",
      "img_url_mobile": "https://s3.amazonaws.com/soundwiseinc/Joe+Hadzima/the+crash+course+on+startup+legal+issues.png",
      "id": 123,
      "run_time": 2900,
      "price": 0,
      "trailer_url": "https://s3.amazonaws.com/soundwiseinc/Joe+Hadzima/lesson+1.mp3",
      "category": "Entrepreneurship",
      "keywords": "financials, law, cofounders, trademarks, copyrights, patents, intellectual property, legal, venture capital, startup financing, startup legal issues, equity splits, startup employment, entrepreneurship, entrepreneur, Charlie Tillet, business model, business plan, revenue model, MIT, MIT Sloan, startups, marketing, product launch, sales, customer acquisition, lean startup, business, audiobooks, audio courses, online courses",
      "description": ["This course offers a comprehensive overview of startup legal issues, including how to protect your intellectual properties, how to avoid the major tax traps in starting a company, and the important legal concepts and terms involved in distributing equity and soliciting investments."],
      "description_long":["Learning about the laws may not be your favorite part of running a startup. But if you are unaware of the legal ramifications of the actions you take, it may cost you and your company heavily down the road.", "In this course, seasoned entrepreneur and startup lawyer Joe Hadzima walks you through the legal issues you’ll likely encounter in the startup life cycle, from protecting your company’s intellectual assets through patents, copyrights and trademarks, to negotiating with investors on venture deal terms. At the end of the course, you will have a comprehensive understanding of the most important startup legal issues you need to look into or seek professional help on."],
      "features": ["Learn how to protect the intellectual properties of your business", "Learn how to choose the right legal form for your business", "Overview of legal issues related to equity distribution among co-founders and early employees", "Legal concepts and terms in venture capital financing", "7 audio lessons", "Notes and action steps for every lesson", "Option to play audios offline (on computer and android phone with Chrome browser"],
      "metrics": {
          66: {
            timesCompleted: 0
          },
          67: {
            timesCompleted: 0
          },
          68: {
            timesCompleted: 0
          },
          69: {
            timesCompleted: 0
          },
          70: {
            timesCompleted: 0
          },
          71: {
            timesCompleted: 0
          },
          72: {
            timesCompleted: 0
          }
        },
      "teacher": "Joseph Hadzima",
      "teacher_profession": "entrepreneur and lawyer",
      "teacher_img": "https://s3.amazonaws.com/soundwiseinc/Joe+Hadzima/Joe-Hadzima-400.jpg",
      "teacher_thumbnail": "https://s3.amazonaws.com/soundwiseinc/Joe+Hadzima/Joe-Hadzima-400.jpg",
      "teacher_bio": ["Joe has been involved in the founding of more than 100 companies as a founder, investor, director, legal counsel, or employee. He is the managing director of Main Street Partners LLC, as well as the president of its portfolio company, IPVision, Inc., an intellectual property management, systems, and services firm."],
      "teacher_website": "http://www.ipvisioninc.com/",
      "teacher_linkedin": "https://www.linkedin.com/in/joehadzima/",
      "teacher_facebook": "",
      "teacher_twitter": "https://twitter.com/JoeHadzima",
      "teacher_instagram": "",
      "modules": [
        {
          "module_id": 1,
          "module_title": "The Crash Course on Startup Legal Issues",
          "sections": [
            {
              "section_id": 66,
              "section_number": 1,
              "run_time": "3:43",
              "title": "How can intellectual properties help your business?",
              "actions": "",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/Joe+Hadzima/lesson+1.mp3",
              "transcript_url": "",
              "notes_url": "https://s3.amazonaws.com/soundwiseinc/Joe+Hadzima/Lesson-01.jpg",
              "resources": [{"link": "http://www.mitef.org/s/1314/interior-2-col.aspx?sid=1314&gid=5&pgid=5821", "link_text": "Questions of Copyright: Another Weapon in the Property Arsenal", "description": "Basic concepts of copyright protection"}, {"link": "http://www.mitef.org/s/1314/interior-2-col.aspx?sid=1314&gid=5&pgid=5823", "link_text": "Of Kleenex and Cheez Whiz: Trademarks are Nothing to Sneeze At", "description": "Practical tips on trademarks"}]
            },
            {
              "section_id": 67,
              "section_number": 2,
              "run_time": "6:54",
              "title": "Four types of IP protection and how each works",
              "actions": "Think about the intellectual assets your company has. Do you have any assets you should potentially protect with trademark or copyright?",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/Joe+Hadzima/lesson+2.mp3",
              "transcript_url": "",
              "notes_url": "https://s3.amazonaws.com/soundwiseinc/Joe+Hadzima/Lesson-02.jpg",
              "resources": [{"link": "http://www.mitef.org/s/1314/interior-2-col.aspx?sid=1314&gid=5&pgid=5821", "link_text": "Questions of Copyright: Another Weapon in the Property Arsenal", "description": "Basic concepts of copyright protection"}, {"link": "http://www.mitef.org/s/1314/interior-2-col.aspx?sid=1314&gid=5&pgid=5823", "link_text": "Of Kleenex and Cheez Whiz: Trademarks are Nothing to Sneeze At", "description": "Practical tips on trademarks"}]
            },
            {
              "section_id": 68,
              "section_number": 3,
              "run_time": "10:51",
              "title": "Four steps to get a patent",
              "actions": "Think about the intellectual assets your company has. Do you have any asset that is commercially valuable and may quality for a patent?",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/Joe+Hadzima/lesson+3.mp3",
              "transcript_url": "",
              "notes_url": "https://s3.amazonaws.com/soundwiseinc/Joe+Hadzima/Lesson-03.jpg",
              "resources": [{"link": "http://www.mitef.org/s/1314/interior-2-col.aspx?sid=1314&gid=5&pgid=5822", "link_text": "The Importance of Patents: It Pays to Know Patent Regulations", "description": "What is a patent, how do you get one and what value are they?"}]
            },
            {
              "section_id": 69,
              "section_number": 4,
              "run_time": "8:16",
              "title": "How to decide the legal form of your company and avoid Section 83 trap",
              "actions": "If you have not incorporated your startup, do some research on the characteristics of LLC, C Corp and S Corp. Think about which legal form would be best for your company given your goals and long term vision.",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/Joe+Hadzima/lesson+4.mp3",
              "transcript_url": "",
              "notes_url": "https://s3.amazonaws.com/soundwiseinc/Joe+Hadzima/Lesson-04.jpg",
              "resources": [{"link": "http://www.mitef.org/s/1314/interior-2-col.aspx?sid=1314&gid=5&pgid=5794", "link_text": "Subchapter S: Some Myths, Realities and Practical Considerations", "description": "What is a Subchapter S Corporation and why / when should you use it?"},
                {"link": "http://www.mitef.org/s/1314/interior-2-col.aspx?sid=1314&gid=5&pgid=5795", "link_text": "Is An LLC For Me?", "description": "What is a Limited Liability Company and is it appropriate for a technology growth company?"}]
            },
            {
              "section_id": 70,
              "section_number": 5,
              "run_time": "7:20",
              "title": "How to slice the equity pie",
              "actions": "If you have cofounders or collaborators for your startup, have you formally discussed the equity arrangement? If not, have the discussion soon and complete the paperwork. You can use the “Founders’ Memo” included in the Resources section of this lesson to guide your discussion.",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/Joe+Hadzima/lesson+5.mp3",
              "transcript_url": "",
              "notes_url": "https://s3.amazonaws.com/soundwiseinc/Joe+Hadzima/Lesson-05.jpg",
              "resources": [{"link": "https://s3.amazonaws.com/soundwiseinc/Joe+Hadzima/FoundersMemo.pdf", "link_text": "Founders' Memo", "description": 'Designed to educate the "team" of Founders as they work out the relationships among themselves. It should be considered by anyone who is thinking of starting a new venture.'},
                {"link": "http://www.mitef.org/s/1314/interior-2-col.aspx?sid=1314&gid=5&pgid=5820", "link_text": "Ten Commandments of How To Work Effectively With Lawyers", "description": "Practical tips about how to use your lawyers effectively."},
                ]
            },
            {
              "section_id": 71,
              "section_number": 6,
              "run_time": "5:18",
              "title": "Different types of equity compensation and related legal issues",
              "actions": "Depending on the stage of your company, you may want to issue founders’ stocks, restricted stocks, or stock options to your stakeholders. Discuss with your lawyer about what would make the most sense for your company.",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/Joe+Hadzima/lesson+6.mp3",
              "transcript_url": "",
              "notes_url": "https://s3.amazonaws.com/soundwiseinc/Joe+Hadzima/Lesson-06.jpg",
              "resources": [{"link": "http://www.mitef.org/s/1314/interior-2-col.aspx?sid=1314&gid=5&pgid=5801", "link_text": "Steer Clear of the Tempest: A Startup Tragedy in Three Acts", "description": "The importance of securities laws and how one company's failure to comply with these laws may have caused the company to fail itself."},
                {"link": "http://www.mitef.org/s/1314/interior-2-col.aspx?sid=1314&gid=5&pgid=5796", "link_text": "Thinking About Valuation", "description": "Pre-Money and Post-Money Valuation; Some techniques for valuing a venture."},
                {
                  "link_text": "Dilution: Here Is A Primer of Stock Vocabulary", "description": "A primer on stock vocabulary relating to dilution.", "link": "http://www.mitef.org/s/1314/interior-2-col.aspx?sid=1314&gid=5&pgid=5797"
                },
                {
                  "link_text": "Take Stock When Using Stock in Trade Part One: Stock Basics", "description": "Covers basic terminology and concepts about stock and about equity compensation of employees.", "link": "http://www.mitef.org/s/1314/interior-2-col.aspx?sid=1314&gid=5&pgid=5798"
                },
                {
                  "link_text": "Take Stock When Using Stock in Trade Part Two: Stock and Options", "description": "Some considerations in using stock and options.", "link": "http://www.mitef.org/s/1314/interior-2-col.aspx?sid=1314&gid=5&pgid=5799"
                },
                {
                  "link_text": "Employees' Stock Reward - How Much Stock Do They Deserve?", "description": "What is appropriate stock compensation for employees?", "link": "http://www.mitef.org/s/1314/interior-2-col.aspx?sid=1314&gid=5&pgid=5800"
                }
                ]
            },
            {
              "section_id": 72,
              "section_number": 7,
              "run_time": "7:58",
              "title": "Capital structure and investor term variations you need to know",
              "actions": "If your company is looking to raise your first round of funding, do some research on how convertible note financing works and discuss with your lawyer about whether that is a good option for you. You can start your research with the materials included in the Resources section of this lesson.",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/Joe+Hadzima/lesson+7.mp3",
              "transcript_url": "",
              "notes_url": "https://s3.amazonaws.com/soundwiseinc/Joe+Hadzima/Lesson-07.jpg",
              "resources": [
                {
                  "link_text": "All Financing Sources Are Not Equal", "description": "There are differences among financing sources - pick the one that ís right for you.", "link": "http://www.mitef.org/s/1314/interior-2-col.aspx?sid=1314&gid=5&pgid=5803"
                },
                {
                  "link_text": "A Beginner's Guide to Venture Capital (PPT)", "description": "How is a Venture Capital Fund Structured? How Are VCs Compensated? What Do These Things Mean To You?", "link": "https://s3.amazonaws.com/soundwiseinc/Joe+Hadzima/Beginners+Guide+to+VC+(1).ppt"
                },
                {
                  "link_text": "Venture Capital Deal Terms (PPT)", "description": "Presentation Slides from MIT Enterprise Forum Satellite Broadcast on Structuring Deals.", "link": "https://s3.amazonaws.com/soundwiseinc/Joe+Hadzima/Venture+Capital+Deal+Terms+(1).ppt"
                },
                {
                  "link_text": "Sample First Round Venture Capital Termshee (PDF)", "description": "This is a sample termsheet from a venture capital firm for a first round (Series A Convertible Preferred) deal.", "link": "https://s3.amazonaws.com/soundwiseinc/Joe+Hadzima/VCTermsheet.pdf"
                },
                {
                  "link_text": "startupcompanylawyer.com", "description": "Good discussion on the pros and cons of convertible note", "link": "http://www.startupcompanylawyer.com/category/convertible-note-bridge-financing/"
                }
              ]
            }
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

firebase.database().ref('courses/' + courseInfo.id)
  .set(courseInfo)
  .then(() => console.log('courseInfo set.'))
  .catch((err) => console.log(err))

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

