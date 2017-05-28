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
      "name": "Raising Venture Capital: What You Need to Know",
      "img_url_mobile": "https://s3.amazonaws.com/soundwiseinc/stephen_pearse/venture_capital.png",
      "id": 121,
      "run_time": 3386,
      "price": 0,
      "trailer_url": "https://s3.amazonaws.com/soundwiseinc/stephen_pearse/1+Intro+_mixdown.mp3",
      "category": "Entrepreneurship",
      "keywords": "entrepreneurship, entrepreneur, Stephen Pearse, venture capital, raise money, financing, pitch, startup pitch, pitch deck, equity financing, venture funding, MIT, MIT Sloan, startups, marketing, product launch, sales, customer acquisition, lean startup, business, audiobooks, audio courses, online courses",
      "description": ["Need to pitch your startup to venture capitalists? This course tells you how. Stephen Pearse, a serial entrepreneur and startup veteran, teaches you the nitty-gritties of pitching and presenting that will help you maximize your chance of success with potential investors."],
      "description_long":["As an entrepreneur, you always need to be selling your ideas—to potential employees, customers, partners, and investors. How quickly your business can gain traction highly depends on how good you are in making others buy into your vision.", "But how do you position and present your idea in the best light?", "Drawing on 30 years of experience as an entrepreneur, senior executive and venture capitalist, in this course Stephen Pearse will help you get into the minds of your potential investors, and show you how to make your pitch stand out in a sea of noise.", "Although this course focuses on pitching venture capital investors, the insights and practical tips shared will help you become a better salesperson for your ideas, no matter whom you are pitching to."],
      "features": ["Learn the right way to pitch your ideas that gets results", "Tips on how to approach venture investors", "Presentation techniques that capture your audience", "Invaluable advices from a seasoned entrepreneur", "12 audio lessons", "Infographic notes for individual lessons","Assignments/action steps for each lesson", "Option to play audios offline (on computer and android phone with Chrome browser"],
      "metrics": {
          40: {
            timesCompleted: 0
          },
          41: {
            timesCompleted: 0
          },
          42: {
            timesCompleted: 0
          },
          43: {
            timesCompleted: 0
          },
          44: {
            timesCompleted: 0
          },
          45: {
            timesCompleted: 0
          },
          46: {
            timesCompleted: 0
          },
          47: {
            timesCompleted: 0
          },
          48: {
            timesCompleted: 0
          },
          49: {
            timesCompleted: 0
          },
          50: {
            timesCompleted: 0
          },
          51: {
            timesCompleted: 0
          }
        },
      "teacher": "Stephen Pearse",
      "teacher_profession": "Entrepreneur and Venture Capitalist",
      "teacher_img": "https://s3.amazonaws.com/soundwiseinc/stephen_pearse/StephenPearse.jpg",
      "teacher_thumbnail": "https://s3.amazonaws.com/soundwiseinc/stephen_pearse/StephenPearse.jpg",
      "teacher_bio": ["Steven Pearse has been a technology leader and entrepreneur for 30 years. He is a Managing Director at Yucatan Rock Ventures. He has been the CEO of numerous startups in the telecommunications space, most notably Cyras Systems. Before starting his entrepreneurial career, He was Executive Vice President of Bay Networks' Internet/Telecom Business Group. Previously, he served as Senior Vice President at Time Warner Telecom and Vice President of Technology at Sprint. He is the Chairman of Innovation Pavilion, a Director of Sereniti, Inc., Voltree, Mobiwatch and C4RJ, and is a Techstars mentor and NASA advisory council appointee."],
      "teacher_website": "https://en.wikipedia.org/wiki/Stephen_Pearse",
      "teacher_linkedin": "https://www.linkedin.com/in/pearse/",
      "teacher_facebook": "",
      "teacher_twitter": "https://twitter.com/sgpearse",
      "teacher_instagram": "",
      "modules": [
        {
          "module_id": 1,
          "module_title": "Raising Venture Capital: What You Need to Know",
          "sections": [
            {
              "section_id": 40,
              "section_number": 1,
              "run_time": "1:50",
              "title": "Introduction",
              "content": "",
              "actions": "",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/bob_jones/1+Intro_mixdown.mp3",
              "transcript_url": "",
              "notes_url": "",
              "resources": ""
            },
            {
              "section_id": 41,
              "section_number": 2,
              "run_time": "3:49",
              "title": "What your investors want",
              "content": "",
              "actions": "Ask yourself the following questions. What is the long term vision for your company? What is your time horizon to achieve that vision? And how can your vision be consistent with the goals your potential investors may have?",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/stephen_pearse/2+VC+biz+model_mixdown.mp3",
              "transcript_url": "",
              "notes_url": "https://s3.amazonaws.com/soundwiseinc/stephen_pearse/lesson-2.jpg",
              "resources": ""
            },
            {
              "section_id": 42,
              "section_number": 3,
              "run_time": "3:37",
              "title": "Your advantage as a startup over big companies",
              "content": "",
              "actions": "Think about the following questions. Which larger companies in your industry can potentially acquire your startup? What advantages does your startup have over other bigger companies in your industry? What can you do that they cannot?",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/stephen_pearse/3+The+startup+advantage+over+big+companies+mixdown.mp3",
              "transcript_url": "",
              "notes_url": "",
              "resources": ""
            },
            {
              "section_id": 43,
              "section_number": 4,
              "run_time": "4:41",
              "title": "The fundamentals of a good pitch",
              "content": "",
              "actions": "Draft an elevator pitch for your startup that include the following elements: 1. the target customers; 2. the customer problem; 3. the current dissatisfactory solutions available; 4. the solution you provide; 5. what set you apart from competitive substitutes; 6. the key features of your solution. For example, your pitch can go like this: For so and so target customers, who have such and such problems and are not satisfied with such and such current solutions, our product is a…fill in new product category…that provides such and such a solution. Unlike such and such competitive substitutes, we have such and such key product features. Deliver this pitch to at least ten of your friends and families, and take feedback.",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/stephen_pearse/4+The+basics+of+a+good+pitch_mixdown.mp3",
              "transcript_url": "",
              "notes_url": "https://s3.amazonaws.com/soundwiseinc/stephen_pearse/lesson-4.jpg",
              "resources": ""
            },
            {
              "section_id": 44,
              "section_number": 5,
              "run_time": "6:22",
              "title": "Eight essential rules of a good pitch",
              "content": "",
              "actions": "Draft a pitch presentation for your startup following the 10-slides, 20-minutes, 30 pixel-font size rule. Think from your audience’s perspective. Is your presentation simple enough? Does it have an exciting hook? What questions may your audience have?",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/stephen_pearse/5+Eight+rules+of+a+good+pitch+_mixdown.mp3",
              "transcript_url": "",
              "notes_url": "https://s3.amazonaws.com/soundwiseinc/stephen_pearse/lesson-5.jpg",
              "resources": [{"link": "https://guykawasaki.com/the_102030_rule/", "description": "Guy Kawasaki's blog", "link_text": "The 10/20/30 Rule of PowerPoint"},{"link": "https://www.youtube.com/watch?v=jJ2yepIaAtE", "description": "The Pecha Kucha presentation style", "link_text": "A Pecha Kucha about Pecha Kucha"}]
            },
            {
              "section_id": 45,
              "section_number": 6,
              "run_time": "4:59",
              "title": "The anatomy of a good pitch",
              "content": "",
              "actions": "Review your pitch presentation. Does it include the following ten components? 1. The hook. 2. Your solution to the customer problem. 3. Your magic and/or your technology. 4. Your business model. 5. Your marketing and sales strategy. 6. Your competition. 7. Your management team. 8. How you’re going to spend the investment money. 9. Your current status and timeline. 10. What your request to the potential investors is.",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/stephen_pearse/6+The+anatomy+of+a+good+pitch_mixdown.mp3",
              "transcript_url": "",
              "notes_url": "https://s3.amazonaws.com/soundwiseinc/stephen_pearse/lesson-6.jpg",
              "resources": ""
            },
            {
              "section_id": 46,
              "section_number": 7,
              "run_time": "4:09",
              "title": "How to get investors excited about your pitch",
              "content": "",
              "actions": "Review your pitch presentation again. Does it have an exciting hook, for example, addressing a significant pain or implying a huge market opportunity? Is your presentation layman-friendly? Is your presentation sufficiently focused on the customer benefits of your product?",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/stephen_pearse/7+How+to+get+investors+mixdown.mp3",
              "transcript_url": "",
              "notes_url": "https://s3.amazonaws.com/soundwiseinc/stephen_pearse/lesson-7.jpg",
              "resources": ""
            },
            {
              "section_id": 47,
              "section_number": 8,
              "run_time": "3:03",
              "title": "Six presentation tips for a winning pitch",
              "content": "",
              "actions": "Practice your pitch presentation to at least five friends, families, or mentors, and ask for feedback.",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/stephen_pearse/8+Six+presentation+tips+to+help+you+deliver+a+winning+pitch_mixdown.mp3",
              "transcript_url": "",
              "notes_url": "https://s3.amazonaws.com/soundwiseinc/stephen_pearse/lesson-8.jpg",
              "resources": [{"link": "https://www.inc.com/magazine/201310/leigh-buchanan/pechakucha-a-peppy-brief-presentation-style.html", "description": "How to Add More Pep to Your Presentations, by Leigh Buchanan", "link_text": "How to Add More Pep to Your Presentations"}]
            },
            {
              "section_id": 48,
              "section_number": 9,
              "run_time": "7:50",
              "title": "Good and bad examples of real pitches",
              "content": "",
              "actions": "Google and find five pitch decks of other companies. Review them and think about: 1) What do you like and not like about them? 2) How can they be improved?",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/stephen_pearse/9+Good+and+bad+examples+of+actual+pitches_mixdown.mp3",
              "transcript_url": "",
              "notes_url": "",
              "resources": ""
            },
            {
              "section_id": 49,
              "section_number": 10,
              "run_time": "5:37",
              "title": "When and how to approach investors",
              "content": "",
              "actions": "Research the background and identify at least five venture capital firms that could be a good fit for your startup. Find out who’s who in these companies and look for common connections. Is there anyone in your personal or professional network who can introduce you to these VCs? Can you think of other creative ways to get an introduction?",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/stephen_pearse/10+When+and+how+you+should+approach+investors_mixdown.mp3",
              "transcript_url": "",
              "notes_url": "https://s3.amazonaws.com/soundwiseinc/stephen_pearse/lesson-10.jpg",
              "resources": ""
            },
            {
              "section_id": 50,
              "section_number": 11,
              "run_time": "2:52",
              "title": "Two crucial metrics to watch for in your startup",
              "content": "",
              "actions": "Ask yourself, am I paying enough attention to my startup’s cashflow? Think of ways you can better monitor your company’s financials.",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/stephen_pearse/11+Two+crucial+factors+to+watch+for+to+ensure+you+company's+successmixdown.mp3",
              "transcript_url": "",
              "notes_url": "https://s3.amazonaws.com/soundwiseinc/stephen_pearse/lesson-10.jpg",
              "resources": ""
            },
            {
              "section_id": 51,
              "section_number": 12,
              "run_time": "7:37",
              "title": "More advices on how to ensure your company's long-term success",
              "content": "",
              "actions": "Ask yourself the following questions. What are the unique competitive advantages of your company over your competitors? Why are you and your team the right people building this specific company? What can you do to make up for the skill and experience gap you may have? And what is your company’s larger mission besides making a profit?",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/stephen_pearse/12+Even+more+tips+for+ensuring+your+company's+long+term+success_mixdown.mp3",
              "transcript_url": "",
              "notes_url": "https://s3.amazonaws.com/soundwiseinc/stephen_pearse/lesson-12.jpg",
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

