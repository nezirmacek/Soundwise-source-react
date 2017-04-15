import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Link } from 'react-router-dom'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import {Helmet} from "react-helmet"
import firebase from 'firebase'
import { withRouter } from 'react-router'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import getMuiTheme from 'material-ui/styles/getMuiTheme'

import { CourseHeader } from '../components/course_header'
import { CourseHeaderPurchased } from '../components/course_header_purchased'
import { CourseBody } from '../components/course_body'
import SocialShare from '../components/socialshare'
import { SoundwiseHeader } from '../components/soundwise_header'
import {setCurrentPlaylist, setCurrentCourse, loadCourses} from '../actions/index'

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

      firebase.database().ref('courses')
        .once('value')
        .then(snapshot => {
          // console.log('course fetched from firebase: ', snapshot.val())
          that.props.loadCourses(snapshot.val())
        })
        .then(() => {
          that.setState({
            course: that.props.courses[that.props.match.params.courseId],
          })

          that.props.setCurrentCourse(that.state.course)

          let sections = []
          that.state.course.modules.forEach(module => { // build a playlist of sections
            module.sections.forEach(section => {
              sections.push(section)
            })
          })
          that.props.setCurrentPlaylist(sections)
        })

  }

  // componentWillReceiveProps(nextProps) {
  //   const that = this
  //   if(nextProps.courses[that.props.match.params.courseId]) {
  //     that.setState({
  //       course: nextProps.courses[that.props.match.params.courseId],
  //     })

  //     that.props.setCurrentCourse(that.state.course)

  //     let sections = []
  //     that.state.course.modules.forEach(module => { // build a playlist of sections
  //       module.sections.forEach(section => {
  //         sections.push(section)
  //       })
  //     })
  //     that.props.setCurrentPlaylist(sections)
  //   }
  // }


  render() {
    // const course = this.props.courses[this.props.match.params.courseId]
    const course = this.props.courses[this.props.match.params.courseId] || this.state.course

    return (
      <div>
        <Helmet>
          <title>{`${course.name} | Soundwise`}</title>
          <meta property="og:url" content={`https://mysoundwise.com/courses/${course.id}`} />
          <meta property="og:title" content={course.name}/>
          <meta property="og:description" content={course.description}/>
          <meta property="og:image" content={course.img_url_mobile} />
          <meta name="description" content={course.description} />
          <meta name="keywords" content="soundwise, soundwise inc, audio, mobile application, learning, online learning, online course, podcast, audio book, audible, marketing, entrepreneurship, fitness, how to, personal development, personal growth, learning on the go, online course, audio course, business, career, life, wellness, relationship, empowerment, spirituality, self help" />
        </Helmet>
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
  return bindActionCreators({ setCurrentPlaylist, setCurrentCourse, loadCourses }, dispatch)
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

