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
      "name": "Easy Networking: How to Make Connections That Count",
      "img_url_mobile": "https://s3.amazonaws.com/soundwiseinc/Marsha+Shandur/EASY+NETWORKING.png",
      "id": 125,
      "run_time": 3260,
      "price": 0,
      "trailer_url": "https://s3.amazonaws.com/soundwiseinc/Marsha+Shandur/lesson-1.mp3",
      "category": "Communication",
      "keywords": "Marsha Shandur, yes yes Marsha, Networking, introverts, career development, making friends, Communication, events, how to write emails, marketing, persuasion, influence, effective Networking, connections, coaching, audiobooks, audio courses, online courses",
      "description": ["If you don’t enjoy networking, you could be doing it wrong. In this course, Networking Mentor Marsha (from YesYesMarsha.com)  teaches you the effective strategies to make instant connections with people...while actually having fun. An introvert must-listen."],
      "description_long":["You’re great at what you do - but, deep down, you know that isn’t enough. Success builds on human relationships. So if you want to get ahead in business and life? You have to network.", "But networking. Ugh.", "Here’s the thing: networking isn’t what you think it is. It’s not walking up to the most important person in the room, telling them how much you love their tie, and then asking them for favors. That kind of brown-nosing might work for some people - but not you.", "Networking Mentor Yes Yes Marsha will show you that real networking is just this: talking to people that you get on well with, about things that you’re both interested in. Making genuine human connections.", "Imagine if you could go to any event – yes, even the networking events that usually make you want to hide under the registration desk – get a ton out of it for your business and career and, actually enjoy yourself. Really!", "It’s easy to make instant connections with people. You just need to know how.", "Marsha’s course will teach you the mindset and strategies to avoid common networking traps and effortlessly build rapport with people you want to connect to, both in person and over email—especially if you’re an introvert."],
      "features": ["Learn to establish instant connection with others effortlessly", "Feel at home at networking events", "Write effective networking emails", "The right way to ask favors", "12 audio lessons", "Option to play audios offline (on computer and android phone with Chrome browser)"],
      "metrics": {
          73: {
            timesCompleted: 0
          },
          74: {
            timesCompleted: 0
          },
          75: {
            timesCompleted: 0
          },
          76: {
            timesCompleted: 0
          },
          77: {
            timesCompleted: 0
          },
          78: {
            timesCompleted: 0
          },
          79: {
            timesCompleted: 0
          },
          80: {
            timesCompleted: 0
          },
          81: {
            timesCompleted: 0
          },
          82: {
            timesCompleted: 0
          },
          83: {
            timesCompleted: 0
          },
          84: {
            timesCompleted: 0
          }
        },
      "teacher": "Yes Yes Marsha",
      "teacher_profession": "Networking Mentor",
      "teacher_img": "https://s3.amazonaws.com/soundwiseinc/Marsha+Shandur/Marsha-yesyesMarsha.jpg",
      "teacher_thumbnail": "https://s3.amazonaws.com/soundwiseinc/Marsha+Shandur/Marsha-yesyesMarsha.jpg",
      "teacher_bio": ["When it comes to networking, Marsha believes that nobody wants to be schmoozed. As the founder of YesYesMarsha.com, she helps people (like you!) build meaningful business and career connections that move your career forward faster, using networking and powerful, personal storytelling. Throughout her career as a Coach, DJ, Music Supervisor for hit TV shows and Author on Bloomsbury Publishing, she has been featured on Forbes, the BBC and Mashable. (Photo credit: Caroline White)"],
      "teacher_website": "http://www.yesyesmarsha.com/",
      "teacher_linkedin": "https://www.linkedin.com/in/yesyesmarsha/?ppe=1",
      "teacher_facebook": "https://www.facebook.com/yesyesmarsha",
      "teacher_twitter": "https://twitter.com/yesyesmarsha?lang=en",
      "teacher_instagram": "https://www.instagram.com/yesyesmarsha/",
      "modules": [
        {
          "module_id": 1,
          "module_title": "Easy Networking: How to Make Connections That Count",
          "sections": [
            {
              "section_id": 73,
              "section_number": 1,
              "run_time": "3:10",
              "title": "The REAL reason you HAVE to network (its not what you think)",
              "actions": "",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/Marsha+Shandur/lesson-1.mp3",
              "transcript_url": "",
              "notes_url": "",
              "resources": [{"link": "http://yym.ca/freeuppp", "link_text": "The Yes Yes Marsha Mailer", "description": "Get tips and advice - including things I'd NEVER say on the internet"}]
            },
            {
              "section_id": 74,
              "section_number": 2,
              "run_time": "6:55",
              "title": "Networking for introverts - top ten tips from Yes Yes Marsha",
              "actions": "",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/Marsha+Shandur/lesson-2.mp3",
              "transcript_url": "",
              "notes_url": "",
              "resources": [{"link": "https://s3.amazonaws.com/soundwiseinc/Marsha+Shandur/Yes+Yes+Marsha+-+Nice+To+Meet+You+Email+Template.pdf", "link_text": "An email template from YesYesMarsha.com", "description": "Nice to meet you"}]
            },
            {
              "section_id": 75,
              "section_number": 3,
              "run_time": "3:10",
              "title": "How not to be self-conscious",
              "actions": "",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/Marsha+Shandur/lesson-3.mp3",
              "transcript_url": "",
              "notes_url": "",
              "resources": [
                {"link": "http://www.yesyesmarsha.com/names/", "link_text": "Free guide", "description": "Get Marsha's free guide on how to remember ANYONE's name"},
                {"link": "http://www.yesyesmarsha.com/brain/?doing_wp_cron=1496888506.6735260486602783203125", "link_text": "A Behind-The-Scenes Tour of my Brain Going to a Conference", "description": "I’m awkward at events, too"}
              ]
            },
            {
              "section_id": 76,
              "section_number": 4,
              "run_time": "4:02",
              "title": "How to avoid small talk",
              "actions": "",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/Marsha+Shandur/lesson-4.mp3",
              "transcript_url": "",
              "notes_url": "",
              "resources": ""
            },
            {
              "section_id": 77,
              "section_number": 5,
              "run_time": "3:19",
              "title": "How to get out of an awkward conversation (without being offensive)",
              "actions": "",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/Marsha+Shandur/lesson-5.mp3",
              "transcript_url": "",
              "notes_url": "",
              "resources": ""
            },
            {
              "section_id": 78,
              "section_number": 6,
              "run_time": "3:50",
              "title": "How to stop acting like a weirdo around people you want to impress. (Introducing your DORK GOBLIN)",
              "actions": "",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/Marsha+Shandur/lesson-6.mp3",
              "transcript_url": "",
              "notes_url": "",
              "resources": ""
            },
            {
              "section_id": 79,
              "section_number": 7,
              "run_time": "4:45",
              "title": "How to ask a favour from an old contact or colleague",
              "actions": "",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/Marsha+Shandur/lesson-7.mp3",
              "transcript_url": "",
              "notes_url": "",
              "resources": [
                {"link_text": "Email template", "description": "Email template for asking a favor from a long-lost colleague", "link": "https://s3.amazonaws.com/soundwiseinc/Marsha+Shandur/Yes+Yes+Marsha+-+Email+Template+to+Ask+Long-Lost+Colleague+for+Favour.pdf"}
              ]
            },
            {
              "section_id": 80,
              "section_number": 8,
              "run_time": "4:10",
              "title": "How to contact big-shots in your industry",
              "actions": "",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/Marsha+Shandur/lesson-8.mp3",
              "transcript_url": "",
              "notes_url": "",
              "resources": [
                {"link_text": "Favor leads to liking ", "description": "Humans are wired to reciprocate ", "link": "http://med.stanford.edu/coi/journal%20articles/Regan_DT-Effects_of_A_Favor_and_Liking_on_Compliance.pdf"},
                {
                  "link_text": "Free email template",
                  "link": "https://s3.amazonaws.com/soundwiseinc/Marsha+Shandur/Yes+Yes+Marsha+-+Email+Template+for+how+to+Ask+a+Favour+from+a+Big-Shot.pdf",
                  "description": "Email template for asking a favor from a big shot"
                }
              ]
            },
            {
              "section_id": 81,
              "section_number": 9,
              "run_time": "5:19",
              "title": "Embarrassed yourself in front of a VIP? Here's how to recover",
              "actions": "",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/Marsha+Shandur/lesson-9.mp3",
              "transcript_url": "",
              "notes_url": "",
              "resources": ""
            },
            {
              "section_id": 82,
              "section_number": 10,
              "run_time": "5:52",
              "title": "How to warm up a cold contact BEFORE you email them",
              "actions": "",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/Marsha+Shandur/lesson-10.mp3",
              "transcript_url": "",
              "notes_url": "",
              "resources": ""
            },
            {
              "section_id": 83,
              "section_number": 11,
              "run_time": "4:52",
              "title": "How to write an email subject line - that gets your message read",
              "actions": "",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/Marsha+Shandur/lesson-11.mp3",
              "transcript_url": "",
              "notes_url": "",
              "resources": [
                {"link_text": "Are You Making This One HUGE, Common Mistake In Your Emails?", "description": "Make the email about them, not about you", "link": "http://www.yesyesmarsha.com/notme/"},
                {"link_text": "This Is The Most Important Moment Of Your Life. Don’t Fug It Up.", "description": "Don’t ask what you can google", "link": "http://www.yesyesmarsha.com/godblog/"},
                {"link_text": "Important Rule When Emailing Big Shots", "description": "Keep your email brief", "link": "http://www.yesyesmarsha.com/brevity/"}
              ]
            },
            {
              "section_id": 84,
              "section_number": 12,
              "run_time": "4:56",
              "title": "The best way to sign off an email",
              "actions": "",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/Marsha+Shandur/lesson-12.mp3",
              "transcript_url": "",
              "notes_url": "",
              "resources": [
                {"link_text": "Are You Making This One HUGE, Common Mistake In Your Emails?", "description": "Make the email about them, not about you", "link": "http://www.yesyesmarsha.com/notme/"},
                {"link_text": "This Is The Most Important Moment Of Your Life. Don’t Fug It Up.", "description": "Don’t ask what you can google", "link": "http://www.yesyesmarsha.com/godblog/"},
                {"link_text": "Important Rule When Emailing Big Shots", "description": "Keep your email brief", "link": "http://www.yesyesmarsha.com/brevity/"},
                {"link_text": "How to Win Friends and Influence People in the Digital Age", "description": "A useful book", "link": "https://www.amazon.com/dp/1451612591/ref=cm_sw_r_cp_dp_T2_FglozbPH4CD30"}
              ]
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

