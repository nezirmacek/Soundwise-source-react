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
      "name": "Sell Anything to Anyone with Powerful Storytelling",
      "img_url_mobile": "https://s3.amazonaws.com/soundwiseinc/Paul+Smith/storytelling.png",
      "id": 128,
      "run_time": 3243,
      "price": 3.99,
      "trailer_url": "https://s3.amazonaws.com/soundwiseinc/Paul+Smith/1+-+Story-the+secret+to+sell+without+selling.mp3",
      "category": "Business",
      "keywords": "Paul Smith, storytelling, stories, business, selling, marketing, sales, storytelling for sales, narrative, entrepreneurship, sell with a story, start a business, coaching, audiobooks, audio courses, online courses, training, tutorial",
      "description": ["Rapidly elevate your effectiveness in sales and selling with powerful and practical story telling techniques from best-selling author and trainer Paul Smith."],
      "description_long":['Whether you’re an employee pitching your boss on a new idea, an entrepreneur inviting funders to invest, or a parent cajoling children to study, you spend your days trying to get buy-in from others. Like it or not, you’re in sales, all day every day.', 'And what is the best sales technique invented by mankind? Stories.', 'Knowing when to tell stories, how to tell stories, and which stories to tell will immediately boost your ability to influence, persuade, build relationship and ultimately close more sales.', 'Storytelling packs the emotional punch to turn routine presentations into productive relationships. It explains products or services in ways that resonate; it connects people and creates momentum. Stories speak to the part of the brain where decisions are made.', 'In this course, renowned author, speaker and storytelling trainer Paul Smith will teach you how to tell the most effective sales stories, including how to select the right story, how to craft a powerful narrative related to your product, service, or brand, and how to use stories to introduce yourself, build rapport, address objections, add value, create a sense of urgency, and more.'],
      "features": ["Learn to use storytelling to influence, persuade, and close sales", "Pick the right sales stories for different selling situations", "The right story structure for maximum effectiveness", "How to increase the emotional impact of your storytelling", "11 audio lessons and 5 supplementary materials", "Complementary notes and action steps/exercises"],
      "metrics": {
          108: {
            timesCompleted: 0
          },
          109: {
            timesCompleted: 0
          },
          110: {
            timesCompleted: 0
          },
          111: {
            timesCompleted: 0
          },
          112: {
            timesCompleted: 0
          },
          113: {
            timesCompleted: 0
          },
          114: {
            timesCompleted: 0
          },
          115: {
            timesCompleted: 0
          },
          116: {
            timesCompleted: 0
          },
          117: {
            timesCompleted: 0
          },
          118: {
            timesCompleted: 0
          }
        },
      "teachers": [
        {
          "teacher": "Paul Smith",
          "teacher_profession": "Author and Storytelling Expert",
          "teacher_img": "https://s3.amazonaws.com/soundwiseinc/Paul+Smith/Paul+Smith.jpg",
          "teacher_thumbnail": "https://s3.amazonaws.com/soundwiseinc/Paul+Smith/Paul+Smith.jpg",
          "teacher_bio": ["Paul is one of the world’s leading experts on organizational storytelling. He’s a keynote speaker, storytelling coach, and bestselling author of the books Sell with a Story (#1 bestseller in Amazon’s Sales and Selling category) and Lead with a Story (#1 bestseller in Amazon’s Business Communication category), already in its 8th printing and available in 7 languages around the world. His work has been featured in The Wall Street Journal, Inc., Time, Forbes, Fast Company, The Washington Post, among others."],
          "teacher_website": "http://leadwithastory.com",
          "teacher_linkedin": "https://www.linkedin.com/in/smithpa9",
          "teacher_facebook": "https://www.facebook.com/LeadWithAStory",
          "teacher_twitter": "https://twitter.com/LeadWithAStory",
          "teacher_instagram": "",
        }
      ],
      "sections": [
        {
          "section_id": 108,
          "section_number": 1,
          "run_time": "06:57",
          "content": "Paul explains what a story is and gives an example of an effective sales story.",
          "preview": "true",
          "title": "Story: The Secret To Sell Without Selling",
          "actions": "Think back to your own experience. When was the last time someone told you a story in the process of selling you something? What was the story’s effect on you?",
          "section_url": "https://s3.amazonaws.com/soundwiseinc/Paul+Smith/1+-+Story-the+secret+to+sell+without+selling.mp3",
          "transcript_url": "",
          "notes_url": "https://s3.amazonaws.com/soundwiseinc/Paul+Smith/lesson+1.pdf",
          "resources": ""
        },
        {
          "section_id": 109,
          "section_number": 2,
          "run_time": "03:08",
          "content": "The top five reasons for telling stories in sales.",
          "preview": "",
          "title": "5 Ways Stories Help You Be More Effective In Selling",
          "actions": "Think about the following. What is your top reason for learning storytelling in sales?",
          "section_url": "https://s3.amazonaws.com/soundwiseinc/Paul+Smith/2+-+5+ways+stories+help+you+be+more+effective+in+selling.mp3",
          "transcript_url": "",
          "notes_url": "https://s3.amazonaws.com/soundwiseinc/Paul+Smith/lesson+2.pdf",
          "resources": ""
        },
        {
          "section_id": 110,
          "section_number": 3,
          "run_time": "07:34",
          "content": "Different types of stories you need to tell in the sales process, from introducing yourself, to building rapport, to making the pitch, to closing the sale.",
          "preview": "",
          "title": "25 Stories You Need In The Typical Sales Process (With Examples) ",
          "actions": "Review the “25 sales stories” worksheet in the resources section of this lesson. Try to think of one story you can tell in each category, for the purpose of selling your product or service.",
          "section_url": "https://s3.amazonaws.com/soundwiseinc/Paul+Smith/3+-+the+25+stories+you+need+in+the+typical+sales+process+(with+examples).mp3",
          "transcript_url": "",
          "notes_url": "https://s3.amazonaws.com/soundwiseinc/Paul+Smith/lesson+3.pdf",
          "resources": [{
            "link": "https://s3.amazonaws.com/soundwiseinc/Paul+Smith/25+sales+story+worksheet.pdf",
            "description": "25 Sales Story Worksheet",
            "link_text": "worksheet"
          }]
        },
        {
          "section_id": 111,
          "section_number": 4,
          "run_time": "03:26",
          "content": 'Paul explains and gives an example of “the problem story”.',
          "preview": "",
          "title": "The Most Important Story To Tell When Pitching Anyone",
          "actions": 'Think of one “problem story” you can tell for your product or service. And practice telling that story.',
          "section_url": "https://s3.amazonaws.com/soundwiseinc/Paul+Smith/4+-+the+most+important+story+to+tell+when+pitching+anyone-the+problem+story.mp3",
          "transcript_url": "",
          "notes_url": "https://s3.amazonaws.com/soundwiseinc/Paul+Smith/lesson+4.pdf",
          "resources": ""
        },
        {
          "section_id": 112,
          "section_number": 5,
          "run_time": "06:18",
          "content": "Paul explains the right structure for your story and what the story structure should sound like with examples.",
          "preview": "",
          "title": "How To Craft Stories: 8 Questions Your Story Structure Absolutely Needs To Answer",
          "actions": 'Review the notes for this lesson. Does the “problem story” you came up with in the last lesson answer the 8 questions for story structure?',
          "section_url": "https://s3.amazonaws.com/soundwiseinc/Paul+Smith/5+-+how+to+craft+stories-8+questions+your+story+structure+needs+to+answer.mp3",
          "transcript_url": "",
          "notes_url": "https://s3.amazonaws.com/soundwiseinc/Paul+Smith/lesson+5.pdf",
          "resources": ""
        },
        {
          "section_id": 113,
          "section_number": 6,
          "run_time": "04:02",
          "content": "The best and worst ways to introduce your story.",
          "preview": "",
          "title": "The Do's And Don’ts For Starting Your Story",
          "actions": 'Think about your “problem story” again. How would you introduce this story in the middle of a conversation with someone without making it awkward?',
          "section_url": "https://s3.amazonaws.com/soundwiseinc/Paul+Smith/6+-+the+do's+and+dont's+for+starting+your+story.mp3",
          "transcript_url": "",
          "notes_url": "https://s3.amazonaws.com/soundwiseinc/Paul+Smith/lesson+6.pdf",
          "resources": ""
        },
        {
          "section_id": 114,
          "section_number": 7,
          "run_time": "05:31",
          "content": "The right way to deliver the 4 main components of a story: context, challenge, conflict, and resolution.",
          "preview": "",
          "title": "4 Components Of Your Story Body And How To Maximize The Impact Of Each",
          "actions": 'Review one of the sales stories you came up with. Does your story include the components of context, challenge, conflict, and resolution?',
          "section_url": "https://s3.amazonaws.com/soundwiseinc/Paul+Smith/7+-+the+4+main+components+of+your+story+body+and+how+to+maximize+the+impact+of+each.mp3",
          "transcript_url": "",
          "notes_url": "https://s3.amazonaws.com/soundwiseinc/Paul+Smith/lesson+7.pdf",
          "resources": ""
        },
        {
          "section_id": 115,
          "section_number": 8,
          "run_time": "02:10",
          "content": "How to transition out of your story in a way that will increase its impact on your listener.",
          "preview": "",
          "title": "3 Most Productive Things To Do After Telling Your Story",
          "actions": 'Practice telling one of your sales stories to someone and incorporate the three actions introduced in this lesson at the end of your story.',
          "section_url": "https://s3.amazonaws.com/soundwiseinc/Paul+Smith/8+-+the+3+most+productive+things+to+do+after+telling+your+story.mp3",
          "transcript_url": "",
          "notes_url": "https://s3.amazonaws.com/soundwiseinc/Paul+Smith/lesson+8.pdf",
          "resources": [
            {
              "link": "https://s3.amazonaws.com/soundwiseinc/Paul+Smith/story+structure+template.pdf",
              "link_text": "Story Structure Template",
              "description": "A template to help you sort out the various components of your story"
            }
          ]
        },
        {
          "section_id": 116,
          "section_number": 9,
          "run_time": "05:50",
          "content": "This lesson takes the high concept of purpose and brings it down to the level of practical application. ",
          "preview": "",
          "title": "A Defining Element Of Great Stories That You Should Not Ignore",
          "actions": 'Think of one of the sales stories you came up with. What emotions does your story try to convey?',
          "section_url": "https://s3.amazonaws.com/soundwiseinc/Paul+Smith/9+-+A+defining+element+of+stories+that+you+cannot+skip.mp3",
          "transcript_url": "",
          "notes_url": "https://s3.amazonaws.com/soundwiseinc/Paul+Smith/lesson+9.pdf",
          "resources": [
            {
              "link": "https://s3.amazonaws.com/soundwiseinc/Paul+Smith/story+structure+template.pdf",
              "link_text": "Story Structure Template",
              "description": "A template to help you sort out the various components of your story"
            }
          ]
        },
        {
          "section_id": 117,
          "section_number": 10,
          "run_time": "02:40",
          "content": "Actionable tips for making your stories come to life.",
          "preview": "",
          "title": "4 Techniques To Increase The Emotional Impact Of Your Story",
          "actions": 'Try telling one of your sales stories using at least one of the techniques mentioned in this lesson. Can you include a bit of dialogue? How about some fix of show and tell?',
          "section_url": "https://s3.amazonaws.com/soundwiseinc/Paul+Smith/10+-+4+techniques+to+increase+the+emotional+impact+of+your+story.mp3",
          "transcript_url": "",
          "notes_url": "https://s3.amazonaws.com/soundwiseinc/Paul+Smith/lesson+10.pdf",
          "resources": ""
        },
        {
          "section_id": 118,
          "section_number": 11,
          "run_time": "06:27",
          "content": "Surprise makes your story more memorable. And here’s how to add it to any story you tell.",
          "preview": "",
          "title": "A Foolproof Way To Deliver A Surprise Ending To Your Story",
          "actions": 'Complete the story database worksheet included in the resources section of this lesson for at least one of your sales stories.',
          "section_url": "https://s3.amazonaws.com/soundwiseinc/Paul+Smith/11+-+A+foolproof+way+to+deliver+a+surprise+ending+to+your+story.mp3",
          "transcript_url": "",
          "notes_url": "https://s3.amazonaws.com/soundwiseinc/Paul+Smith/lesson+11.pdf",
          "resources": [
            {
              "link": "https://s3.amazonaws.com/soundwiseinc/Paul+Smith/Storytelling-for-Sales-Course-Cheat-Sheet.pdf",
              "link_text": "Storytelling for sales cheat sheet ",
              "description": "Short and sweet summary of this course in one page"
            },
            {
              "link": "https://s3.amazonaws.com/soundwiseinc/Paul+Smith/Story-Database.docx",
              "link_text": "Story database",
              "description": "Organize your stories in a worksheet according to the type and purpose of each story"
            },
            {
              "link": "http://a.co/0BJaj8g",
              "link_text": "Sell with A Story",
              "description": "Paul's book on storytelling in sales"
            }
          ]
        },
      ],
    }

const expiration = new Date(2099, 7, 31)


firebase.initializeApp(config)


// firebase.database().ref('courses/128/reviews')
//     .set(reviews)

// firebase.database().ref('courses/' + courseInfo.id)
//   .set(courseInfo)
//   .then(() => console.log('courseInfo set.'))
//   .catch((err) => console.log(err))

// firebase.database().ref('courses/115/metrics')
//   .set(update)

// firebase.database().ref('coupons/ps100')
//   .set(coupon)

// *** add course to one particular user ***

// firebase.database().ref('users/xD5tW78sX6M96C4xpd7iOIN5Qth1/courses/127')
// .on('value', snapshot => {
//     if (snapshot.val()) {

//       firebase.database().ref('users/DUbIlexWhjQKI4WgOgrqHMS68t93/courses/127')
//         .set(snapshot.val())
//         .then(() => console.log('course added'))
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

