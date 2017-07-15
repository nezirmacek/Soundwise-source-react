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
      "img_url_mobile": "https://s3.amazonaws.com/soundwiseinc/Natasha+Che/A+COURSE+OF+INNER+MASTERY.png",
      "id": 127,
      "run_time": 5774,
      "price": 11,
      "trailer_url": "https://s3.amazonaws.com/soundwiseinc/Natasha+Che/1_The_shortest_path_finished_64kbs.mp3",
      "category": "Personal growth",
      "keywords": "Natasha Che, personal growth, personal development, growth, misfit, build confidence, authenticity, achieve goals, happiness, life purpose, overcome fear, self esteem, limiting beliefs, start a business, coaching, audiobooks, audio courses, online courses, training, tutorial",
      "description": ["Stop struggling and start living. Learn to make things happen in your external reality from a place of power. Learn how to refine your intuition, deepen your self love, and create an inspired life aligned with your highest destiny."],
      "description_long":['You have so much potential, but you’re not living it despite trying hard. You feel stuck on a certain level and struggle to find peace and purpose. You yearn for more freedom and authenticity. You don’t want to live someone else’s life anymore.', 'If any of that sounds like you, I want to tell you something-- In order to become a powerful creator in your external world, you need to align yourself internally first.', 'Like so many people, I grew up believing that the way to get what I wanted from life was by having a relentless drive and pushing harder. I did achieve a lot that way. But I also ended up exhausted and depressed.', 'An internal awakening that lasted several years made me finally realize there was a better way.', 'As within, so without. When you have the inner clarity and authentic confidence in your own destiny, creating the life you want becomes so much easier.', 'But how do you get to that place? This course teaches you how. Drawing from my personal experience and that of many others whom I mentored, I put together the essential components that you need to work on to facilitate an inner transformation—from self judgment to self love, from anxiety to freedom, from social conditioning to self expression, from operating within your limited human will to living as a channel of grace.', 'My goal is to help you find that deep connection with your higher self and take actions from a place of authentic inspiration, so that you can live more effortlessly and receiving what you really want from life with more grace and ease.'],
      "features": ["Learn how to find your unique path to success and happiness", "Make things happen in your outer world from a place of inner power", "Become more intuitive and aligned with your highest truth", "Struggle less and thrive more", "Shed social conditioning and gain freedom to embody your most authentic self", "Gain clarity about your life choices and take inspired actions", "11 audio lessons with complementary notes and action steps/exercises"],
      "metrics": {
          97: {
            timesCompleted: 0
          },
          98: {
            timesCompleted: 0
          },
          99: {
            timesCompleted: 0
          },
          100: {
            timesCompleted: 0
          },
          101: {
            timesCompleted: 0
          },
          102: {
            timesCompleted: 0
          },
          103: {
            timesCompleted: 0
          },
          104: {
            timesCompleted: 0
          },
          105: {
            timesCompleted: 0
          },
          106: {
            timesCompleted: 0
          },
          107: {
            timesCompleted: 0
          }
        },
      "teachers": [
        {
          "teacher": "Dr. Natasha Che",
          "teacher_profession": "Personal Growth Teacher",
          "teacher_img": "https://s3.amazonaws.com/soundwiseinc/Natasha+Che/natasha_che.jpg",
          "teacher_thumbnail": "https://s3.amazonaws.com/soundwiseinc/Natasha+Che/natasha_che.jpg",
          "teacher_bio": ["Natasha is a personal growth teacher, entrepreneur, and writer. She helps people navigate life transition, expedite inner awakening and find their unique path in life through her articles, videos and mentoring sessions. She is also the founder of Soundwise Inc. Natasha had a successful career in international development and is a recovering over-achiever. She has three college degrees and a PhD from Georgetown University."],
          "teacher_website": "http://natashache.com",
          "teacher_linkedin": "",
          "teacher_facebook": "https://www.facebook.com/AuthorNatashaChe",
          "teacher_twitter": "https://twitter.com/RealNatashaChe",
          "teacher_instagram": "",
        }
      ],
      "sections": [
        {
          "section_id": 97,
          "section_number": 1,
          "run_time": "07:59",
          "content": "",
          "preview": "true",
          "title": "The Shortest Path Towards Purpose And Abundance",
          "actions": "For most people, our parents are a symbol of social conditioning. Write a letter of gratitude to your parents. No matter how you feel about your relationship with them, think about the things you can possibly thank them for and write them down. And then tell them that although they taught you so much, it’s time that you start following your own inner self as your ultimate guidance in life. Whether they’re ok with it or not, from now on you’re going to following your own path. Ask for their blessing. And thank them for all the things they’ve done for you. But tell them, firmly, that your decision has been made. You don’t need to mail this letter. But the action of writing will inform your subconscious.",
          "section_url": "https://s3.amazonaws.com/soundwiseinc/Natasha+Che/1_The_shortest_path_finished_64kbs.mp3",
          "transcript_url": "",
          "notes_url": "https://s3.amazonaws.com/soundwiseinc/Natasha+Che/lesson+1.pdf",
          "resources": ""
        },
        {
          "section_id": 98,
          "section_number": 2,
          "run_time": "11:40",
          "content": "",
          "title": "The Secret To Finding Your Authentic Path",
          "actions": "For a few times throughout your day, tune in to yourself and ask “What do I want to do now?” Listen for your slightest impulse. When you get an answer, don’t filter it. Go do it.",
          "section_url": "https://s3.amazonaws.com/soundwiseinc/Natasha+Che/2_the_aut_path_finished_64kbs.mp3",
          "transcript_url": "",
          "notes_url": "https://s3.amazonaws.com/soundwiseinc/Natasha+Che/lesson+2.pdf",
          "resources": ""
        },
        {
          "section_id": 99,
          "section_number": 3,
          "run_time": "09:40",
          "content": "",
          "title": "You Move Faster When You Are Not In The Driver’s Seat",
          "actions": "Whenever you feel frustrated and impatient that something you want is not happening fast enough, try the following steps: 1) consciously slow down your breath, 2) ask your higher self to step in and take charge of the situation, 3) ask your higher self what you need to know right now, 4) embody your higher self, as much as you can, and give the answer.",
          "section_url": "https://s3.amazonaws.com/soundwiseinc/Natasha+Che/3__you_move_fasterfinished_64kbs.mp3",
          "transcript_url": "",
          "notes_url": "https://s3.amazonaws.com/soundwiseinc/Natasha+Che/lesson+3.pdf",
          "resources": ""
        },
        {
          "section_id": 100,
          "section_number": 4,
          "run_time": "09:26",
          "content": "",
          "title": "How To Trust Your Path ",
          "actions": 'Have a conversation as your higher self with your human self. It could be a conversation while you’re mediating or walking. Or it could be a written conversation. Ask your human self, “What can I do to serve you? How can I help?” And listen for the answer.',
          "section_url": "https://s3.amazonaws.com/soundwiseinc/Natasha+Che/4_how+to+trust+your+path_64kbps.mp3",
          "transcript_url": "",
          "notes_url": "https://s3.amazonaws.com/soundwiseinc/Natasha+Che/lesson+4.pdf",
          "resources": ""
        },
        {
          "section_id": 101,
          "section_number": 5,
          "run_time": "06:10",
          "content": "",
          "title": "Why Do We Struggle?",
          "actions": 'Observe yourself when you’re doing something that feels difficult. Notice how your body is feeling. Do you tense up or relax? Notice your thoughts. What do you say to yourself? What conclusion are you drawing about you and the world when there’s a gap between what you expect and what’s happening? Ask yourself, where does your expectation come from?',
          "section_url": "https://s3.amazonaws.com/soundwiseinc/Natasha+Che/5_Why_do_we_struggle_finished_64kbs.mp3",
          "transcript_url": "",
          "notes_url": "https://s3.amazonaws.com/soundwiseinc/Natasha+Che/lesson+5.pdf",
          "resources": ""
        },
        {
          "section_id": 102,
          "section_number": 6,
          "run_time": "06:15",
          "content": "",
          "title": "The Way Out Of Struggle",
          "actions": 'Observe yourself throughout the day. Whenever you have a thought coming up that says you “should” be doing something, observe how you feel in your body. Is there a part of your body that tightens up at that thought? If so, consciously relax it. And then send love to the part of you that insists on what you “should” do.',
          "section_url": "https://s3.amazonaws.com/soundwiseinc/Natasha+Che/6__The_way_out_of_struggle_finished_64kbs.mp3",
          "transcript_url": "",
          "notes_url": "https://s3.amazonaws.com/soundwiseinc/Natasha+Che/lesson+6.pdf",
          "resources": ""
        },
        {
          "section_id": 103,
          "section_number": 7,
          "run_time": "10:19",
          "content": "",
          "title": "Bulletproof Your Self Love",
          "actions": 'Write a love letter to yourself from your higher self, the part of you that’s holding the unconditional love and respect for you.',
          "section_url": "https://s3.amazonaws.com/soundwiseinc/Natasha+Che/7__Bulletproof_your_self_love_finished_64kbs.mp3",
          "transcript_url": "",
          "notes_url": "https://s3.amazonaws.com/soundwiseinc/Natasha+Che/lesson+7.pdf",
          "resources": ""
        },
        {
          "section_id": 104,
          "section_number": 8,
          "run_time": "05:29",
          "content": "",
          "title": "Why You Need A Bias Towards Action",
          "actions": 'If you feel you’re lacking clarity/direction in any area of your life, ask yourself what’s the immediate next step you can take in this area, no matter how small the step is. And then go execute that step.',
          "section_url": "https://s3.amazonaws.com/soundwiseinc/Natasha+Che/8__Why_You_Need_A_Bias_towards_Action__finished_64kbs.mp3",
          "transcript_url": "",
          "notes_url": "https://s3.amazonaws.com/soundwiseinc/Natasha+Che/lesson+8.pdf",
          "resources": ""
        },
        {
          "section_id": 105,
          "section_number": 9,
          "run_time": "10:05",
          "content": "",
          "title": "What To Do When You’re Feeling Stuck",
          "actions": 'Next time when you feel “empty”—no matter what triggers it or if there’s a trigger at all—I want you to do something courageous: instead of running away from it and distracting yourself with work or entertainment, go towards the emptiness. Feel into the core of emptiness and allow yourself to be totally immersed in it, however uncomfortable it is. If it feels too scary, ask your higher self to step in and support you while you do this. Stay in the emptiness, for as long as you can stand it.',
          "section_url": "https://s3.amazonaws.com/soundwiseinc/Natasha+Che/9___What_to_do_when_youre_feeling_stuck_finished_64kbs.mp3",
          "transcript_url": "",
          "notes_url": "https://s3.amazonaws.com/soundwiseinc/Natasha+Che/lesson+9.pdf",
          "resources": ""
        },
        {
          "section_id": 106,
          "section_number": 10,
          "run_time": "08:19",
          "content": "",
          "title": "How To Create Relationships Aligned With Who You Really Are",
          "actions": 'When you’re in a situation where you’re experiencing conflict with a loved one, notice your own internal state. Are you withholding your love for them? Is there an underlining assumption that says “I’ll give you my love if you behave”? Notice how your body feels. Is it tense and contracted, or is it relaxed and open? Send love both to yourself and to the other person. Tell the person that you’re not going to abandon him/her, no matter what happens. And then check how your body feels.',
          "section_url": "https://s3.amazonaws.com/soundwiseinc/Natasha+Che/10__How_to_Create_Relationships_Aligned_with_Who_You_Really_Are_finished_64kbs.mp3",
          "transcript_url": "",
          "notes_url": "https://s3.amazonaws.com/soundwiseinc/Natasha+Che/lesson+10.pdf",
          "resources": ""
        },
        {
          "section_id": 107,
          "section_number": 11,
          "run_time": "10:52",
          "content": "",
          "title": "From Inner Mastery To Outer Attainment",
          "actions": 'Every morning for the next week, write down three things you feel thankful for in your life, and then three things you did right the day before.',
          "section_url": "https://s3.amazonaws.com/soundwiseinc/Natasha+Che/11__From_inner_mastery_to_outer_attainment_finished_64kbs.mp3",
          "transcript_url": "",
          "notes_url": "https://s3.amazonaws.com/soundwiseinc/Natasha+Che/lesson+11.pdf",
          "resources": ""
        },
      ],
    }

const expiration = new Date(2099, 7, 31)
const coupon = {
  course_id: 127,
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

firebase.database().ref('coupons/natasha100')
  .set(coupon)

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

