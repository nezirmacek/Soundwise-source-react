import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';
import * as types from '../actions/types';
import * as _ from 'lodash';

function user(state= {
  userInfo: {},
  isLoggedIn: ''
}, action) {
  switch (action.type) {
    case types.SIGNUP:
      return {
        ...state,
        userInfo: action.payload,
        isLoggedIn: true
      }
    case types.SIGNIN:
      return {
        ...state,
        userInfo: action.payload,
        isLoggedIn: true
      }
    case types.SIGNOUT:
      return {
        ...state,
        isLoggedIn: false
      }
    default:
      return state
  }
}

function categories(state= {
    categories: {},
}, action) {
    switch (action.type) {
        case types.SUBSCRIBE_TO_CATEGORIES:
            return {
                ...state,
                categories: action.payload,
            };
        default:
            return state;
    }
}

function setPlayer(state={
  playerLaunched: false,
  speed: 1
}, action) {
  switch (action.type) {
    case types.PLAYER:
      return  {
        ...state,
        playerLaunched: action.payload
      }
    case types.CHANGE_SPEED:
      return {
        ...state,
        speed: action.payload
      }
    default:
      return state
  }
}

function setCurrentSection(state={
  currentSection: {},
  playing: false
}, action) {
  switch (action.type) {
    case types.CURRENT_SECTION:
      return {
        ...state,
        currentSection: action.payload
      }
    case types.CHANGE_PLAYSTATUS:
      const newStatus = !state.playing
      return {
        ...state,
        playing: action.payload
      }
    default:
      return state
  }
}

function setCourses(state={
  courses: {},
  currentCourse: {
      teachers: [],
  },
  userCourses: {},
  currentPlaylist: [],
  currentTime: 0,
  currentDuration: 1
}, action) {
  switch (action.type) {
    case types.COURSES:
      return {
        ...state,
        courses: action.payload
      }
    case types.USER_COURSES:
     return {
       ...state,
       userCourses: action.payload
     }
    case types.CURRENT_COURSE:
     return {
       ...state,
       currentCourse: action.payload
     }
    case types.PLAYLIST:
      return {
        ...state,
        currentPlaylist: action.payload
      }
    case types.CURRENT_PROGRESS:
      return {
        ...state,
        currentTime: action.payload.currentTime,
        currentDuration: action.payload.duration
      }
    default:
      return state
  }
}

function reviewBox(state={
  reviewFormOpen: false
}, action) {
  switch(action.type) {
    case types.OPEN_REVIEWBOX:
      return {
        ...state,
        reviewFormOpen: true
      }
    case types.CLOSE_REVIEWBOX:
      return {
        ...state,
        reviewFormOpen: false
      }
    default:
      return state
  }
}

function signupBox(state= {
  signupFormOpen: false,
  confirmationBoxOpen: false
}, action) {
  switch (action.type) {
    case types.OPEN_SIGNUPBOX:
      return {
        ...state,
        signupFormOpen: true,
      }
    case types.CLOSE_SIGNUPBOX:
      return {
        ...state,
        signupFormOpen: false,
      }
    case types.OPEN_CONFIRMATIONBOX:
      return {
        ...state,
        confirmationBoxOpen: true,
      }
    case types.CLOSE_CONFIRMATIONBOX:
      return {
        ...state,
        confirmationBoxOpen: false,
      }
    default:
      return state
  }
}

function checkoutProcess(state={
  shoppingCart: [],

}, action) {
  switch(action.type) {
    case types.ADDTOCART:
        let _cart = JSON.parse(JSON.stringify(state.shoppingCart));
        const courseInCart = _.find(_cart, {id: action.payload.id});
        if (!courseInCart) {
            _cart.push(action.payload);
            let _newState =  {
                ...state,
                shoppingCart: _cart,
            };
            return _newState;
        } else {
            return state;
        }
        break;
    case types.DELETE_FROM_CART:
      const newCart = JSON.parse(JSON.stringify(state.shoppingCart));
      _.remove(newCart, course => course.id === action.payload.id);
        return {
        ...state,
        shoppingCart: newCart,
      };
    case types.DELETE_ALL:
      return {
        ...state,
        shoppingCart: []
      }
    default:
      return state
  }
}

const rootReducer = combineReducers({
  setCourses,
  setPlayer,
  setCurrentSection,
  routing,
  signupBox,
  reviewBox,
  user,
  categories,
  checkoutProcess
})

export default rootReducer