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
import firebase from 'firebase'

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

const persistor = persistStore(store, {storage: localForage, blacklist: ['setPlayer']})

persistor.purge()

// const history = syncHistoryWithStore(browserHistory, store)

const courseInfo = {
      "name": "The Fight for Your Joy Course",
      "img_url_mobile": "https://www.dropbox.com/s/8rq1rotvavnax0y/fight_for_your_joy_cover.png?dl=1",
      "img_url_web": "https://www.dropbox.com/s/5rssyn3vx3kuxgs/joy.jpg?dl=1",
      "id": 112,
      "run_time": "25:13",
      "url": "",
      "category": "Personal Development",
      "description": "The right words, just when you need them, right where you are: introducing Sonic Collections. Fight for Your Joy is an audio love-gram from me to you. These are eight of my most Soulful pieces — for helping you to get to where the joy lives — inside of you.",
      "teacher": "Danielle Laporte",
      "teacher_profession": "Personal Growth Teacher",
      "teacher_img": "https://www.dropbox.com/s/13lc5lekrnlej3q/danielle_laporte_bg.jpg?dl=1",
      "teacher_thumbnail": "https://www.dropbox.com/s/9jra90vkbxvnymt/danielle_laporte.png?dl=1",
      "teacher_bio": 'Danielle LaPorte is an invited member of Oprah’s Super Soul 100, a group who, in Oprah Winfrey’s words, “is uniquely connecting the world together with a spiritual energy that matters.” She is author of White Hot Truth: Clarity for keeping it real on your spiritual path—from one seeker to another. The Fire Starter Sessions, and The Desire Map: A Guide To Creating Goals With Soul—the book that has been translated into 8 languages, evolved into a yearly day planner system, a top 10 iTunes app, and an international workshop program with licensed facilitators in 15 countries.',
      "modules": [
        {
          "module_id": 1,
          "module_title": "Fight for Your Joy",
          "sections": [
            {
              "section_id": 7,
              "title": "This could be good. This could be bad. Fact is: you are free to choose",
              "content": "Based on what you’ve done in the past, and what you’re doing now, you are likely to head in the direction you’re going. This could be good. This could be bad. Fact is: You are free to choose. Three psychics with great track records will predict the same outcomes. You could have your Jupiter conjunct with Pluto, blue blood, and a very big trust fund. Or the odds could be ferociously against you — could be lookin’ grim and slim. But nothing is certain. You could change your mind and change your behaviour, a miracle could happen, forces could intervene, the other people involved could shift. This could be good. This could be bad. Fact is: You are free to choose.",
              "section_url": "https://www.dropbox.com/s/cowbxot0c97xo2n/1%20This%20Could%20Be%20Good%2C%20Could%20Be%20Bad.mp3?dl=1"
            },
            {
              "section_id": 8,
              "title": "Fighting for your joy",
              "content": "I’ve had to fight for my joy. I’ve also loved and laughed and created my way to it. But it’s fair to say that removing all of the obstacles, illusions, attacks, grief, and heavy trippin’ from my truth has been strenuous work. I know growth is cyclical, I know that you never really arrive. I know grief can catch you off guard. I know nothing is certain. Now that I’m at the most joyful I’ve ever been, (there’s a difference between happiness and joy), I’m asking: Will I have to fight for my joy again?",
              "section_url": "https://www.dropbox.com/s/uf4imd7bgpea2pi/2%20Fighting%20for%20Your%20Joy.mp3?dl=1"
            },
            {
              "section_id": 9,
              "title": "8 sure ways to block positivity",
              "content": "1. Overzealous competitiveness. Sure, play to win, but when the focus is on decimating the competition, you’re wasting invaluable creative energy that you could pour into your staying power. 2. Ambivalence and indifference. When you’re in touch with your truth, you can make a clear choice. (Personally, I’m always leery of collaborating with someone who doesn’t know what they want. Hell, I’m leery of having lunch with someone who doesn’t know what they want.) 3. Scarcity mentality. Because… If you think there’s not enough to go around, then you won’t bother to look for the abundance. 4. Comparing yourself to others. Totally toxic.",
              "section_url": "https://www.dropbox.com/s/jmx4i4d69zfldd7/3%20Positivity%20Blocks.mp3?dl=1"
            },
            {
              "section_id": 10,
              "title": "Been burned? Betrayal, denial, and the bloody beauty of it all",
              "content": "I’ve been betrayed — severely. Thank God. Betrayal is such a defining experience — it lays your heart bare, and that’s a bloody, good thing. Bloody good. Betrayal shows precisely where you are weak and where you are mighty — in one fell swoop. Betrayal shows your loyalty. Betrayal reveals the lies you’ve been telling yourself. Being betrayed by another person is often (not always,) a reflection of how you were betraying yourself. It’s a lie looking back at you.",
              "section_url": "https://www.dropbox.com/s/b3npbudkuxt17br/4%20Betrayal.mp3?dl=1"
            },
            {
              "section_id": 11,
              "title": "The Principles of Active Waiting vs. feeling-like-a-loser, losing-your-mind kind of waiting",
              "content": "I’ve learned a lot about waiting in the last while. I can’t say I’m a fan of waiting for what I want but I’ve finally learned to harness the waiting periods in a new way. Some might call it the virtue of patience, but I’ll never admit to becoming patient. I have a reputation to protect. Inactive waiting is total hell. It’s a sure way to get stuck, slip into complaining, and let your creativity get all flabby. You put things on hold. You start paying rent in One Day Some Day Town. You see everything around you as “not quite what I’m waiting for.” And then you get into all the nasty new-age sponsored self-down talk, “Why aren’t I manifesting what I want? What am I doing wrong?”",
              "section_url": "https://www.dropbox.com/s/9av6hnczfgbsas1/5%20Principles%20of%20Waiting.mp3?dl=1"
            },
            {
              "section_id": 12,
              "title": "The inevitable panic that sets in when you let go of expectations. (And why it’s good.)",
              "content": "Expectations. Hot subject. Letting go of expectations. Raising your expectations. Meeting expectations. … failing to meet expectations. Not so great, expectations. PARADOX OF DESIRE & EXPECTATION. The A SIDE: You have to want what you want with all your heart. REALLY want it! Squeeze it. Don’t apologize for the ferocity of it. Declare it. Ask for it. Pray for it. The energy of your desire increases it’s potentiality and magnetism.",
              "section_url": "https://www.dropbox.com/s/w5c30sl6b32qssu/6%20Pain%20and%20Expectations.mp3?dl=1"
            },
            {
              "section_id": 13,
              "title": "Instant gratification has gotten a bad rap",
              "content": "Why would you want to delay gratification? Within the constraints of morality and maturity, you should do whatever you need to do to feel gratified in the moment. It may be as subtle as choosing a more positive thought or reminding yourself to smile. Maybe it’s taking two minutes in your car or at your desk to do nothing but fantasize. Maybe instant gratification is fifty sit-ups for an adrenaline rush, ordering dessert first, giving an unexpected hug, signing the lease, or telling your boss to shove it.",
              "section_url": "https://www.dropbox.com/s/iv808z9fsvoz5zh/7%20Instant%20Gratification.mp3?dl=1"
            },
            {
              "section_id": 14,
              "title": "Please don’t punish yourself",
              "content": "It’s hard enough to make your way in a world where you will be judged, daily. To overcome the intentional punishments inflicted by dark mongers; to find the right concoction for emotional wounds; and to rise from the simply deep heartache of not getting what you want — it’s anything but easy. It’s gruelling enough to be betrayed when you have been over-loyal; to feel like an imposter at the pretty party; to be seemingly alone in your looping fixations (you’re never alone); to feel like the star ship flew off and orphaned you in a cabbage patch of zygotes to be adopted by humans who can’t understand you. This stuff of earth, you know, it’s a lot of things, but it’s anything but easy.",
              "section_url": "https://www.dropbox.com/s/1tljcoxzbf2es48/8%20Please%20Don%27t%20Punish%20Yourself.mp3?dl=1"
            }
          ]
        }
      ]
    }

const update = {
  7: {
    timesStarted: 0,
    timesCompleted: 0
  },
  8: {
    timesStarted: 0,
    timesCompleted: 0
  },
  9: {
    timesStarted: 0,
    timesCompleted: 0
  },
  10: {
    timesStarted: 0,
    timesCompleted: 0
  },
  11: {
    timesStarted: 0,
    timesCompleted: 0
  },
  12: {
    timesStarted: 0,
    timesCompleted: 0
  },
  13: {
    timesStarted: 0,
    timesCompleted: 0
  },
  14: {
    timesStarted: 0,
    timesCompleted: 0
  }
}

// const expiration = new Date(2017, 7, 31)
// const coupon = {
//   course_id: 112,
//   discount: 100, //100% discount
//   count: 0,
//   expiration: expiration.toString()
// }

firebase.initializeApp(config)

// firebase.database().ref('courses/' + courseInfo.id)
//   .set(courseInfo)
// firebase.database().ref('courses')
//         .once('value')
//         .then(snapshot => {
//           console.log(snapshot.val())
//         })
// firebase.database().ref('courses/112/metrics')
//   .set(update)
// firebase.database().ref('coupons/DL100')
//   .set(coupon)

export const App = ({match}) => (
  <Provider store = { store }>
    <Routes />
  </Provider>
)

render(<App />, document.getElementById('root'))

