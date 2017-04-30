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

const persistor = persistStore(store, {storage: localForage, blacklist: ['setPlayer', 'setCurrentSection']})

// persistor.purge()

// const history = syncHistoryWithStore(browserHistory, store)

const courseInfo = {
      "name": "All You Need to Know about Teaching Your Young Child A Second Language",
      "img_url_mobile": "https://s3.amazonaws.com/soundwiseinc/llacey_simmons/all+you+need+to+know+about+teaching+your+child+another+language.png",
      "id": 116,
      "run_time": 6108,
      "price": 14.95,
      "trailer_url": "https://s3.amazonaws.com/soundwiseinc/llacey_simmons/section+1.mp3",
      "category": "Parenting",
      "keywords": "parenting, parenting how to, teaching child another language, early childhood education, second language education, bilingual babes, foreign language to toddlers, how to teach foreign language in kindergarten, audiobooks, communication skills, audio courses, online courses",
      "description": ["Teaching your young child another language has numerous cognitive, health and development benefits that go beyond the language skill itself. In this program, Llacey Simmons will give you a comprehensive guide to effectively teach your child another language – even if you don't speak anything other than English."],
      "description_long":["Hi, my name is Llacey Simmons. I’m an instructional designer, professional tutor, and the mom to a four-year-old.", "And I only speak English. That’s right, I’m monolingual.", "But, I am raising my son, Cavanaugh, to be an English, Chinese, and Arabic speaking genius.", "Well, maybe not a genius. But you have to agree that’s pretty impressive.", "When I was pregnant, I often researched late into the night on early childhood language development. And I was floored by what scientific research had showed about the benefits of teaching young children another language, including how it could boost kids’ mathematical skills, problem-solving, and abstract thinking. Teaching a kid a tonal language such as Chinese has proven to be especially beneficial.", "I decided to have my son learn Chinese early on. And since he was born, I’ve spent hundreds of hours researching on language learning resources, and experimenting with different teaching tools and methods.", "Today, my son can read almost 300 Chinese characters and is reading in Chinese at a second grade level. Oh, did I mention he just turned 4?", "And how’s my own Chinese, you ask? Well, when Cavanaugh was a baby, I took a stab at Chinese and after 10 minutes of an intense Rosetta Stone session, I decided to leave the language learning to Cavanaugh.", "I’m the living proof that you CAN raise a bilingual child, even if you do not speak another language.", "And this course will teach you how.", "I condensed almost everything I know about how to raise a bilingual child as a monolingual parent, into 10 compact audio sections. I did the heavy lifting--the research, the experiments, the trials and errors--so that you don’t have to.", "It’s my promise to you that if you listen to the course and do the action steps I recommended, you’ll be well on your way to successfully teach your child another language, which will benefit your child’s professional and personal life for years to come. And one day, you kid will thank you for that."],
      "features": ["Essential tools to teach your young child another language", "Works even if you don't speak the language yourself", "10 audio sections", "Dos and donts to maximize your child's language learning potential", "Transcripts for all sections", "Option to play audios offline (on computer and android phone with Chrome browser", "Additional resources"],
      "metrics": {
          19: {
            timesCompleted: 0
          },
          20: {
            timesCompleted: 0
          },
          21: {
            timesCompleted: 0
          },
          22: {
            timesCompleted: 0
          },
          23: {
            timesCompleted: 0
          },
          24: {
            timesCompleted: 0
          },
          25: {
            timesCompleted: 0
          },
          26: {
            timesCompleted: 0
          },
          27: {
            timesCompleted: 0
          },
          28: {
            timesCompleted: 0
          }
        },
      "teacher": "Llacey Simmons",
      "teacher_profession": "Instructional Designer, Parenting Blogger, Mommy to A 4-Year-Old",
      "teacher_img": "https://s3.amazonaws.com/soundwiseinc/llacey_simmons/Llacey+Simmons+2.jpg",
      "teacher_thumbnail": "https://s3.amazonaws.com/soundwiseinc/llacey_simmons/Llacey+Simmons.jpg",
      "teacher_bio": ["Llacey Simmons is an instructional designer and professional tutor living in Maryland. She is also the proud mom to Cavanaugh, a 4-year-old boy who is a trilingual genius. Llacey has a master’s degree in Instructional Systems Development and a MBA. She regularly writes about how to effectively raise multilingual children on her parenting blog, our21stcenturykids.com."],
      "resources": [
        {
          "description": "Llacey's blog is a great resource for fresh information on how to raise multilingual children",
          "link": "http://our21stcenturykids.com"
        }
      ],
      "modules": [
        {
          "module_id": 1,
          "module_title": "All You Need to Know about Teaching Your Young Child A Second Language",
          "sections": [
            {
              "section_id": 19,
              "section_number": 1,
              "run_time": "10:29",
              "title": "6 Reasons Why Learning a Second Language Will Give Your Child A Head Start in Life",
              "content": "In this section we’ll dive into some research-backed reasons why teaching your child a second language has lasting (and phenomenal) benefits, on cognitive, social, analytical, health and professional levels.",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/llacey_simmons/section+1.mp3",
              "transcript_url": "https://s3.amazonaws.com/soundwiseinc/llacey_simmons/Section+1+Transcript.pdf"
            },
            {
              "section_id": 20,
              "section_number": 2,
              "run_time": "11:33",
              "title": "Five Language Myths You’ll Have to Overcome",
              "content": "As important as it is to be aware of the benefits of teaching your child a second language, it is equally essential to be aware of some of the common language myths. In this section, I address some common doubts about teaching your child another language at a young age.",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/llacey_simmons/section+2.mp3",
              "transcript_url": "https://s3.amazonaws.com/soundwiseinc/llacey_simmons/Section+2+Transcript.pdf"
            },
            {
              "section_id": 21,
              "section_number": 3,
              "run_time": "12:38",
              "title": "10 Must-Dos To Prepare Yourself for Success in Teaching Your Child A Second Language",
              "content": "You’ve made the decision to start your child on the path to becoming bilingual. Congratulations! But what do you do next? Here I talk about the 10 must-take steps to help you get things started.",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/llacey_simmons/section+3.mp3",
              "transcript_url": "https://s3.amazonaws.com/soundwiseinc/llacey_simmons/Section+3+Transcript.pdf"
            },
            {
              "section_id": 22,
              "section_number": 4,
              "run_time": "7:57",
              "title": "A Look into the Critical Languages",
              "content": "Picking the right language can be easier said than done. So in this section, I'll shed some light on the critical languages and give you my take on each of them. I personally choose my son’s target languages from this list.",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/llacey_simmons/section+4.mp3",
              "transcript_url": "https://s3.amazonaws.com/soundwiseinc/llacey_simmons/Section+4+Transcript.pdf"
            },
            {
              "section_id": 23,
              "section_number": 5,
              "run_time": "11:04",
              "title": "Five Simple Methods for Teaching Your Child Another Language ",
              "content": "In this section I talk about the four types of bilingual proficiency, and guide you through a few tried-and-true methods to give your child the target language immersion he/she needs, depending on the resources available to you and your teaching goals.",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/llacey_simmons/section+5.mp3",
              "transcript_url": "https://s3.amazonaws.com/soundwiseinc/llacey_simmons/Section+5+Transcript.pdf"
            },
            {
              "section_id": 24,
              "section_number": 6,
              "run_time": "13:00",
              "title": "The Top Five Objections You’ll Hear against Teaching Your Child Another Language and How to Handle Them",
              "content": "Raising a bilingual child is a big endeavor, and what is already hard can become an even tougher task if important people in your child’s life are not on board. Here I talk about how to communicate with your spouse and family members to make sure everyone is on the same page about your child's lanauge learning needs.",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/llacey_simmons/section+6.mp3",
              "transcript_url": "https://s3.amazonaws.com/soundwiseinc/llacey_simmons/Section+6+Transcript.pdf"
            },
            {
              "section_id": 25,
              "section_number": 7,
              "run_time": "8:22",
              "title": "Six Affordable Ways to Maximize Your Child’s Language Exposure",
              "content": "Language lessons, books and classes can be expensive. But there're creative ways that you can use to give your child the needed lanauge immersion, without breaking the bank. In this section I'll tell you about the most cost-efficient and effective approaches that I've found.",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/llacey_simmons/section+7.mp3",
              "transcript_url": "https://s3.amazonaws.com/soundwiseinc/llacey_simmons/Section+7+Transcript.pdf"
            },
            {
              "section_id": 26,
              "section_number": 8,
              "run_time": "8:21",
              "title": "Five Language Learning Principles You Can’t Forget ",
              "content": "When it comes to teaching your child another lanauge, knowing what not to do is sometimes as important as knowing what to do. Forgetting about the principles I'll explain in this section at your own--very high--cost!",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/llacey_simmons/section+8.mp3",
              "transcript_url": "https://s3.amazonaws.com/soundwiseinc/llacey_simmons/Section+8+Transcript.pdf"
            },
            {
              "section_id": 27,
              "section_number": 9,
              "run_time": "6:13",
              "title": "The One Secret to Help Your Child Learn Even Faster (Hint: Culture)",
              "content": "A lanauge is not just letters, sounds, and words. Languages come from cultures. Understanding that culture is what brings language to life, and is a major part of being bilingual. This section will give you  additional tips you can use to keep your child interested in lanauge learning and maximize his/her learning efficiency.",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/llacey_simmons/section+9.mp3",
              "transcript_url": "https://s3.amazonaws.com/soundwiseinc/llacey_simmons/Section+9+Transcript.pdf"
            },
            {
              "section_id": 28,
              "section_number": 10,
              "run_time": "12:11",
              "title": "The Go-to Checklist for Picking an Immersion Program ",
              "content": "When you look for any kind of language program for your child, you'll want to have a set of questions ready to help you pick the best program that meets your child's learning needs. Asking the 10 questions I explain in this section will help you narrow down your options and settle on the right program.",
              "section_url": "https://s3.amazonaws.com/soundwiseinc/llacey_simmons/section+10.mp3",
              "transcript_url": "https://s3.amazonaws.com/soundwiseinc/llacey_simmons/Section+10+Transcript.pdf"
            }
          ]
        }
      ]
    }

const resources = [
    {
      "description": "Research on the cognitive benefit of being bilingual",
      "link": "http://www.psychologicalscience.org/journals/cd/19_1_inpress/Bialystok_final.pdf?lan=ayajzqechdlh"
    },
    {
      "description": "Bilinguals have longer attention span",
      "link": "http://www.lingref.com/isb/4/188ISB4.PDF"
    },
    {
      "description": "Bilinguals have superior social skills",
      "link": "https://www.nytimes.com/2016/03/13/opinion/sunday/the-superior-social-skills-of-bilinguals.html?_r=0"
    },
    {
      "description": "Bilingual brains age slower",
      "link": "http://dana.org/Cerebrum/2012/The_Cognitive_Benefits_of_Being_Bilingual/"
    },
    {
      "description": "How to increase children's attention span",
      "link": "https://www.edutopia.org/discussion/7-ways-increase-students-attention-span"
    },
    {
      "description": "Llacey's blog is a great resource for fresh information on how to raise multilingual children",
      "link": "http://our21stcenturykids.com"
    }
  ]


const expiration = new Date(2099, 7, 31)
const coupon = {
  course_id: 116,
  discount: 100, //50% discount
  count: 0,
  expiration: expiration.toString()
}

firebase.initializeApp(config)

// firebase.database().ref('courses/' + '116/resources')
//   .set(resources)
//   .then(() => console.log('courseInfo set.'))
//   .catch((err) => console.log(err))

// firebase.database().ref('courses/115/metrics')
//   .set(update)

// firebase.database().ref('coupons/parent100')
//   .set(coupon)

export const App = ({match}) => (
  <Provider store = { store }>
    <Routes />
  </Provider>
)

render(<App />, document.getElementById('root'))

