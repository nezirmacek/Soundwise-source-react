import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Link } from 'react-router-dom'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import firebase from 'firebase'
import { withRouter } from 'react-router'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import getMuiTheme from 'material-ui/styles/getMuiTheme'

import { CourseHeader } from '../components/course_header'
import { CourseHeaderPurchased } from '../components/course_header_purchased'
import { CourseBody } from '../components/course_body'
import SocialShare from '../components/socialshare'
import { SoundwiseHeader } from '../components/soundwise_header'
import {setCurrentPlaylist, setCurrentCourse} from '../actions/index'

class _Course extends Component {
  constructor(props) {
    super(props)
    this.state = {
      course: {
        runtime: '',
        price: '',
        name: '',
        description: '',
        modules: [
          {
            sections: []
          }
        ]
      },
      userCourses: {}
    }
  }

  componentWillMount() {
    const that = this
    firebase.database().ref('courses/' + this.props.match.params.courseId)
      .once('value')
      .then(snapshot => {
        // console.log('course fetched from firebase: ', snapshot.val())
        that.setState({
          course: snapshot.val(),
        })

        that.props.setCurrentCourse(snapshot.val())

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
         <CourseHeader course={course}/>

        <MuiThemeProvider >
          <CourseBody  course={this.props.currentCourse}/>
        </MuiThemeProvider>
      </div>
    )
  }
}

        // <SocialShare />

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ setCurrentPlaylist, setCurrentCourse }, dispatch)
}

const mapStateToProps = state => {
  const { userInfo, isLoggedIn } = state.user
  const { courses, currentPlaylist, currentCourse } = state.setCourses
  return {
    userInfo, isLoggedIn, courses, currentPlaylist, currentCourse
  }
}

const Course_worouter = connect(mapStateToProps, mapDispatchToProps)(_Course)

export const Course = withRouter(Course_worouter)

