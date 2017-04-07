import React, {Component} from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Route, Link, Switch } from 'react-router-dom'
import firebase from "firebase"

import {SoundwiseHeader} from '../components/soundwise_header'
import CourseCard from '../components/course_card'
import {loadUserCourses} from '../actions/index'
import {Course} from './course_page'
import Footer from '../components/footer'

class _MyCourses extends Component {
  constructor(props) {
    super(props)

  }

  componentWillMount() {

    const that = this
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        const userId = user.uid

        firebase.database().ref('users/' + userId + '/courses')
        .once('value')
        .then(snapshot => {
            that.props.loadUserCourses(snapshot.val())
        })
      }
    })
  }

  // loadCourseInfo(courseId) {
  //   const that = this

  //   firebase.database().ref('courses/' + courseId)
  //   .once('value')
  //   .then(snapshot => {
  //     const newState = that.state.courseArr.concat([snapshot.val()])
  //     that.setState({
  //       courseArr: newState
  //     })
  //   })
  // }

  render() {
    const courses = this.props.userCourses
    const isLoggedIn = this.props.isLoggedIn

    const courseArr = []

    for(var key in courses) {
      courseArr.push(courses[key])
    }

    if(!isLoggedIn) {
      return (
        <div>
        <SoundwiseHeader />
        <section className="padding-110px-tb bg-white builder-bg xs-padding-60px-tb" id="feature-section14">
            <div className="container">
                <div className="row">
                    <div className="col-md-12 col-sm-12 col-xs-12 text-center">
                        <h2 className="section-title-large sm-section-title-medium xs-section-title-large text-dark-gray font-weight-600 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text">PLEASE LOG IN FIRST</h2>
                    </div>
                </div>
            </div>
        </section>
        <Footer />
        </div>
      )
    }

    if(courseArr.length === 0) {
      return (
        <div>
        <SoundwiseHeader />
        <section className="padding-110px-tb bg-white builder-bg xs-padding-60px-tb" id="feature-section14">
            <div className="container">
                <div className="row">
                    <div className="col-md-12 col-sm-12 col-xs-12 text-center">
                        <h2 className="section-title-large sm-section-title-medium xs-section-title-large text-dark-gray font-weight-600 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text">YOU HAVEN'T SIGNED UP FOR ANY PROGRAMS YET</h2>
                    </div>
                </div>
            </div>
        </section>
        <Footer />
        </div>
      )
    }

    return (
      <div>
        <SoundwiseHeader />
        <section className="padding-110px-tb bg-white builder-bg xs-padding-60px-tb" id="feature-section14">
            <div className="container">
                <div className="row">
                    <div className="col-md-12 col-sm-12 col-xs-12 text-center">
                        <h2 className="section-title-large sm-section-title-medium xs-section-title-large text-dark-gray font-weight-600 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text">MY PROGRAMS</h2>
                    </div>
                    {courseArr.map(course => (
                      <CourseCard course={course} key={course.id} match={this.props.match}/>
                    ))}
                </div>
            </div>
        </section>
        <Footer />
      </div>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ loadUserCourses }, dispatch)
}


const mapStateToProps = state => {
  const { userInfo, isLoggedIn } = state.user
  const { userCourses } = state.setCourses
  return {
    userInfo, isLoggedIn, userCourses
  }
}

export const MyCourses = connect(mapStateToProps, mapDispatchToProps)(_MyCourses)