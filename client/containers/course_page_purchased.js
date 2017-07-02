import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Link } from 'react-router-dom'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import firebase from 'firebase'
import { Redirect } from 'react-router-dom'
import {Helmet} from "react-helmet"
import { withRouter } from 'react-router'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import Snackbar from 'material-ui/Snackbar'

import Footer from '../components/footer'
import { CourseHeaderPurchased } from '../components/course_header_purchased'
import CourseBodyPurchased from '../components/course_body_purchased'
import CourseBody from './course_body'
import SocialShare from '../components/socialshare'
import { SoundwiseHeader } from '../components/soundwise_header'
import {PlayerBar} from './player_bar'

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
        sections: [],
        resources: []
      },
      userCourses: {},
      open: false
    }
    this.handleSnackbarClose = this.handleSnackbarClose.bind(this)
  }

  componentWillMount() {

    // if(navigator.webkitTemporaryStorage.queryUsageAndQuota) {
    //   navigator.webkitTemporaryStorage.queryUsageAndQuota (
    //       function(usedBytes, grantedBytes) {
    //           console.log('we are using ', usedBytes, ' of ', grantedBytes, 'bytes')
    //       },
    //       function(e) { console.log('Error', e);  }
    //   )
    // }

    const that = this
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        const userId = user.uid

        firebase.database().ref('users/' + userId + '/courses')
          .on('value', snapshot => {
            that.props.loadUserCourses(snapshot.val())

            if(snapshot.val()[that.props.match.params.courseId]) {

              firebase.database().ref('courses/' + that.props.match.params.courseId)
                .on('value', snapshot => {

                    that.props.setCurrentCourse(snapshot.val())

                    let sections = []
                    snapshot.val().sections.forEach(section => { // build a playlist of sections
                        sections.push(section)
                    })
                    sections.sort((a, b) => (
                      a.section_number - b.section_number
                    ))
                    that.props.setCurrentPlaylist(sections)
                })
              }
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

  componentWillReceiveProps(nextProps) {

    if(nextProps.courses[nextProps.match.params.courseId] && this.props.courses[this.props.match.params.courseId] == undefined) {

      this.props.setCurrentCourse(nextProps.courses[this.props.match.params.courseId])
      let sections = []
      nextProps.courses[this.props.match.params.courseId].sections.forEach(section => { // build a playlist of sections
          sections.push(section)
      })
      sections.sort((a, b) => (
        a.section_number - b.section_number
      ))
      this.props.setCurrentPlaylist(sections)
    }

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
    // const course = this.props.userInfo.courses ? this.props.userInfo.courses[this.props.match.params.courseId] : this.state.course

    const course = this.props.courses[this.props.match.params.courseId] || this.state.course

    if((this.props.userInfo.firstName && !this.props.userInfo.courses) || (this.props.userInfo.courses && !this.props.userInfo.courses[this.props.match.params.courseId])) {
      return <Redirect to={`/courses/${this.props.match.params.courseId}`}/>
    }

    if(!this.props.isLoggedIn ) {
      return (
        <div>
        <Helmet>
          <title>{`${course.name} | Soundwise`}</title>
          <meta property="og:url" content={`https://mysoundwise.com/courses/${course.id}`} />
          <meta property="fb:app_id" content='1726664310980105' />
          <meta property="og:title" content={course.name}/>
          <meta property="og:description" content={course.description}/>
          <meta property="og:image" content={course.img_url_mobile} />
          <meta name="description" content={course.description} />
          <meta name="keywords" content={course.keywords} />
        </Helmet>
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

    return (
      <div className='vbox'>
        <Helmet>
          <title>{`${course.name} | Soundwise`}</title>
          <meta property="og:url" content={`https://mysoundwise.com/courses/${course.id}`} />
          <meta property="fb:app_id" content='1726664310980105' />
          <meta property="og:title" content={course.name}/>
          <meta property="og:description" content={course.description}/>
          <meta property="og:image" content={course.img_url_mobile} />
          <meta name="description" content={course.description} />
          <meta name="keywords" content={course.keywords} />
        </Helmet>
        <SoundwiseHeader />
         <CourseHeaderPurchased course={course}/>
        <MuiThemeProvider >
          <CourseBodyPurchased course={course} userCourse={this.props.userCourses[this.props.match.params.courseId]}/>
        </MuiThemeProvider>

        {this.renderSnackbar()}
        <Footer />
        <MuiThemeProvider >
          <PlayerBar/>
        </MuiThemeProvider>
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

