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
    // autoRehydrate()
  )
)

// const persistor = persistStore(store, {storage: localForage, blacklist: ['setPlayer', 'setCurrentSection']})

// persistor.purge()

// const history = syncHistoryWithStore(browserHistory, store)


const expiration = new Date(2099, 7, 31)


firebase.initializeApp(config)

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

  componentDidMount(){
    // firebase.database().ref('invitations/xc22@georgetown(dot)edu')
    // .once('value')
    // .then(snapshot => {
    //   if(snapshot.val()) {
    //     console.log('invitation: ', snapshot.val());
    //   } else {
    //     console.log('not found');
    //   }
    // })
  }

  render() {
    // if(!this.state.rehydrated) {
    //   return <div>Loading...</div>
    // }
    return (
      <Provider store = { store }>
        <Routes />
      </Provider>
    )
  }
}

render(<App />, document.getElementById('root'))

