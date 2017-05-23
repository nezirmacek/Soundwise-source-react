import * as types from './types'

export function signupUser(user) {
  return {
    type: types.SIGNUP,
    payload: user
  }
}

export function signinUser(user) {
  return {
    type: types.SIGNIN,
    payload: user
  }
}

export function signoutUser() {
  return {
    type: types.SIGNOUT,
  }
}

export function loadCourses(courses) {
  return {
    type: types.COURSES,
    payload: courses
  }
}

export function loadUserCourses(courses) {
  return {
    type: types.USER_COURSES,
    payload: courses
  }
}

export function launchPlayer(status) {
  return {
    type: types.PLAYER,
    payload: status
  }
}

export function setCurrentPlaylist(playlist) {
  return {
    type: types.PLAYLIST,
    payload: playlist
  }
}

export function setCurrentPlaySection(section) {
  return {
    type: types.CURRENT_SECTION,
    payload: section
  }
}

export function getCurrentProgress(progress) {
  return {
    type: types.CURRENT_PROGRESS,
    payload: progress
  }
}

export function changePlayStatus(status) {
  return {
    type: types.CHANGE_PLAYSTATUS,
    payload: status
  }
}

export function openSignupbox(open) {
  if(open === true) {
    return {
      type: types.OPEN_SIGNUPBOX,
    }
  } else if(open === false) {
    return {
      type: types.CLOSE_SIGNUPBOX,
    }
  }
}

export function openConfirmationbox(open) {
  if(open) {
    return {
      type: types.OPEN_CONFIRMATIONBOX,
    }
  } else {
    return {
      type: types.CLOSE_CONFIRMATIONBOX,
    }
  }
}

export function setCurrentCourse(course) {
  return {
    type: types.CURRENT_COURSE,
    payload: course
  }
}

export function openReviewbox(open) {
  if(open) {
    return {
      type: types.OPEN_REVIEWBOX
    }
  } else {
    return {
      type: types.CLOSE_REVIEWBOX
    }
  }
}

export function addCourseToCart(course) {
  return {
    type: types.ADDTOCART,
    payload: course
  }
}

export function deleteCourseFromCart(course) {
  return {
    type: types.DELETE_FROM_CART,
    payload: course
  }
}

export function deleteCart() {
  return {
    type: types.DELETE_ALL
  }
}

export function changeSpeed(value) {
  return {
    type: types.CHANGE_SPEED,
    payload: value
  }
}