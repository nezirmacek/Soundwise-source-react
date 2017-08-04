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


const expiration = new Date(2099, 7, 31)


firebase.initializeApp(config)

// const soundcast1 = {
//   "title": "Example Soundcast",
//   "creatorID": "xD5tW78sX6M96C4xpd7iOIN5Qth1",
//   "imageURL": "https://s3.amazonaws.com/soundwiseinc/demo/fightForYourJoy.png",
//   "episodes": {
//     "d46b4eb8-7663-11e7-b5a5-be2e44b06b34": true
//   },
//   "invited": {
//     "ilovewordsworth@gmail(dot)com": true,
//     "natasha@natashache(dot)com": true
//   },
//   "subscribed": {
//     "ilovewordsworth@gmail(dot)com": "xD5tW78sX6M96C4xpd7iOIN5Qth1"
//   }
// }

// const episode1 = {
//   "title": "Example Episode",
//   "timestamp": 1501556215,
//   "creatorID": "xD5tW78sX6M96C4xpd7iOIN5Qth1",
//   "description": "This is an example episode.",
//   "url": "https://s3.amazonaws.com/soundwiseinc/demo/7+Instant+Gratification.mp3",
//   "actionstep": "This is an example action step.",
//   "notes": "https://s3.amazonaws.com/soundwiseinc/demo/Thiscouldbegood.Thiscouldbebad.Factisyouarefreetochoose.pdf",
//   "soundcastID": "5a83201c-76bd-11e7-b5a5-be2e44b06b34",
//   "likes": {
//     "keeq4re9p0v4ws": true,
//     "vcarieemgridos": true
//   },
//   "comments": {
//     "voesfmvioedkht": true,
//     "4fionviutrmrem": true
//   }
// }

// const comments = {
//   "voesfmvioedkht": {
//     "userID": "vcarieemgridos",
//     "timestamp": 1901756724,
//     "content": "Thanks a lot. I fully agree!",
//     "episodeID": "755047ae-76bc-11e7-b5a5-be2e44b06b34"
//   },
//   "4fionviutrmrem": {
//     "userID": "keeq4re9p0v4ws",
//     "timestamp": 1501756712,
//     "content": "This is awesome!",
//     "episodeID": "755047ae-76bc-11e7-b5a5-be2e44b06b34"
//   },
// }

// firebase.database().ref('soundcasts/5a83201c-76bd-11e7-b5a5-be2e44b06b34')
//     .set(soundcast1)

// firebase.database().ref('episodes/d46b5246-7663-11e7-b5a5-be2e44b06b34')
//     .set(episode1)

// firebase.database().ref('comments')
//     .set(comments)

const admin = {
  "firstName": "Denis",
  "lastName": "Yakovenko",
  "admin": true,
  "publisherID": "smoeist9oveshvi",
  "soundcasts_managed": {
    "5a83201c-76bd-11e7-b5a5-be2e44b06b34": true,
    "35546702-76cb-11e7-b5a5-be2e44b06b34": true
  },
  "email": [
    "denis@me.come"
  ],
  "subscriptions": {
    "5a83201c-76bd-11e7-b5a5-be2e44b06b34": true,
    "35546702-76cb-11e7-b5a5-be2e44b06b34": true
  }
}

const publisher = {
  "name": "Keller Williams Realty",
  "imageURL": "",
  "soundcasts": {
    "5a83201c-76bd-11e7-b5a5-be2e44b06b34": true,
    "35546702-76cb-11e7-b5a5-be2e44b06b34": true
  }
}

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

