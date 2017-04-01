import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Link } from 'react-router-dom'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import firebase from 'firebase'
import { withRouter } from 'react-router'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import getMuiTheme from 'material-ui/styles/getMuiTheme'

import { CourseHeaderPurchased } from '../components/course_header_purchased'
import CourseBodyPurchased from '../components/course_body_purchased'
import CourseBody from '../components/course_body'
import SocialShare from '../components/socialshare'
import { SoundwiseHeader } from '../components/soundwise_header'
import {setCurrentPlaylist} from '../actions/index'

class _Course_Purchased extends Component {
  constructor(props) {
    super(props)
    this.state = {
      course: {
        price: '',
        name: '',
        description: ''
      },
      userCourses: {}
    }
  }

  componentDidMount() {

    const that = this
    firebase.database().ref('courses/' + this.props.match.params.courseId)
      .once('value')
      .then(snapshot => {
        // console.log('course fetched from firebase: ', snapshot.val())
        that.setState({
          course: snapshot.val(),
        })
        let sections = []
        that.state.course.modules.forEach(module => { // build a playlist of sections
          module.sections.forEach(section => {
            sections.push(section)
          })
        })
        that.props.setCurrentPlaylist(sections)

      })
  }


  render() {
    // const course = this.props.courses[this.props.match.params.courseId]
    const {course} = this.state

    return (
      <div>
        <SoundwiseHeader />
         <CourseHeaderPurchased course={course}/>

        <MuiThemeProvider >
          <CourseBodyPurchased course={course} />
        </MuiThemeProvider>
      </div>
    )
  }
}

        // <SocialShare />

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ setCurrentPlaylist }, dispatch)
}

const mapStateToProps = state => {
  const { userInfo, isLoggedIn } = state.user
  const { courses, currentPlaylist } = state.setCourses
  return {
    userInfo, isLoggedIn, courses, currentPlaylist
  }
}

const Course_Purchases_worouter = connect(mapStateToProps, mapDispatchToProps)(_Course_Purchased)

export const Course_Purchased = withRouter(Course_Purchases_worouter)

