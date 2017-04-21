import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Link } from 'react-router-dom'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import firebase from 'firebase'
import { withRouter } from 'react-router'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import Snackbar from 'material-ui/Snackbar'

import { CourseHeaderPurchased } from '../components/course_header_purchased'
import CourseBodyPurchased from '../components/course_body_purchased'
import CourseBody from '../components/course_body'
import SocialShare from '../components/socialshare'
import { SoundwiseHeader } from '../components/soundwise_header'
import {setCurrentPlaylist, setCurrentCourse, loadUserCourses} from '../actions/index'

class _Course_Purchased extends Component {
  constructor(props) {
    super(props)
    this.state = {
      course: {
        runtime: '',
        price: '',
        name: '',
        description: '',
      },
      userCourses: {},
      open: false
    }
    this.handleSnackbarClose = this.handleSnackbarClose.bind(this)
  }

  componentWillMount() {

    // caches.keys().then(function(cacheKeys) {
    //   console.log(cacheKeys); // ex: ["test-cache"]
    // });
    if(navigator.webkitTemporaryStorage.queryUsageAndQuota) {
      navigator.webkitTemporaryStorage.queryUsageAndQuota (
          function(usedBytes, grantedBytes) {
              console.log('we are using ', usedBytes, ' of ', grantedBytes, 'bytes')
          },
          function(e) { console.log('Error', e);  }
      )
    }


    const that = this
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        const userId = user.uid

        firebase.database().ref('users/' + userId + '/courses')
          .on('value', snapshot => {

            that.props.loadUserCourses(snapshot.val())

            that.setState({
              userCourses: snapshot.val(),
              course: snapshot.val()[that.props.match.params.courseId]
            })

            that.props.setCurrentCourse(that.state.userCourses[that.props.match.params.courseId])

            let sections = []
            that.state.course.modules.forEach(module => { // build a playlist of sections
              module.sections.forEach(section => {
                sections.push(section)
              })
            })
            that.props.setCurrentPlaylist(sections)

        })
      }
    })
  }

  componentDidMount() {
    const that = this
    setTimeout(() => {
      that.setState({
        open: true
      })
    }, 3000)
  }

  handleSnackbarClose() {
    this.setState({
      open: false
    })
  }

  renderSnackbar() {
    if('caches' in window) {
      return (
        <MuiThemeProvider >
          <Snackbar
            open = {this.state.open}
            message = 'Click on "enable offline" to listen to a section later with no Internet.'
            autoHideDuration={4000}
            onRequestClose={this.handleSnackbarClose}
          />
        </MuiThemeProvider>
      )
    }
  }

  render() {
    // const course = this.props.courses[this.props.match.params.courseId]
    const course = this.props.userInfo.courses ? this.props.userInfo.courses[this.props.match.params.courseId] : this.state.course


    return (
      <div>
        <SoundwiseHeader />
         <CourseHeaderPurchased course={course}/>
        <MuiThemeProvider >
          <CourseBodyPurchased course={course} />
        </MuiThemeProvider>

        {this.renderSnackbar()}

      </div>
    )
  }
}

        // <SocialShare />

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ setCurrentPlaylist, setCurrentCourse, loadUserCourses }, dispatch)
}

const mapStateToProps = state => {
  const { userInfo, isLoggedIn } = state.user
  const { courses, currentPlaylist, userCourses } = state.setCourses
  return {
    userInfo, isLoggedIn, courses, currentPlaylist, userCourses
  }
}

const Course_Purchases_worouter = connect(mapStateToProps, mapDispatchToProps)(_Course_Purchased)

export const Course_Purchased = withRouter(Course_Purchases_worouter)

