import React, {Component} from 'react'
import { Link, Redirect } from 'react-router-dom'
import { withRouter } from 'react-router'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import ReactStars from 'react-stars'
import Levels from 'react-activity/lib/Levels'
import {orange50} from 'material-ui/styles/colors'
import Spinner from 'react-activity/lib/Spinner'
import Axios from 'axios'
import * as firebase from "firebase"

import { CourseSignup } from '../containers/course_signup'
import SocialShare from './socialshare'
import { openSignupbox, openConfirmationbox, addCourseToCart } from '../actions/index'

const styles = {
  iconWrap: {
    // width: '100%',
    // height: '100%',
    position: 'absolute',
    left: 0,
    right: 0,
    transform: `translate(${0}, -${50}%)`,
    top: '50%',
    // zIndex: 10,
    textAlign: 'center',
    // verticalAlign: 'bottom'
    // background: hsla(0, 100%, 50%, 0.4)
  },
  icon: {
    // position: 'relative',
    // top: 0,
    // right: '-10px',
    // bottom: '-10px',
    fontSize: '40px'
    // color: 'white'
  }
}

let player, source, interval

class _CourseHeader extends Component {
  constructor(props) {
    super(props)
    this.state = {
      playing: false,
      initialized: false,
      displayTimer: 'none',
      currentTime: 0,
      duration: 0,
      paid: false,
      startPaymentSubmission: false,
      paymentError: ''
    }

    this.checkOut = this.checkOut.bind(this)
    this.handlePlayOrPause = this.handlePlayOrPause.bind(this)
    this.handleEnd = this.handleEnd.bind(this)
    this.addCourseToUser = this.addCourseToUser.bind(this)
    this.submitPayment = this.submitPayment.bind(this)
    this.renderProgressBar = this.renderProgressBar.bind(this)
    this.addCourseToUser = this.addCourseToUser.bind(this)
  }

  componentDidMount() {
    player = document.getElementById('audio')
    source = document.getElementById('audioSource')

    player.addEventListener('ended', this.handleEnd)

    // cache course image
    // if('caches' in window && nextprops.course.img_url_mobile) {
    //     let headers = new Headers()
    //     headers.append('access-control-allow-origin', '*')
    //     headers.append('access-control-allow-methods', 'GET')
    //     headers.append('access-control-allow-headers', 'content-type, accept')
    //     headers.append('Content-Type', "image/jpeg;image/png;text/xml")

    //     var myInit = { method: 'GET',
    //            headers: headers,
    //            mode: 'no-cors',
    //            cache: 'default' }

    //     let request = new Request(nextprops.course.img_url_mobile, myInit)

    //     fetch(request)
    //     .then(response => {
    //       // if(!response.ok) {
    //       //   throw new TypeError('bad response status')
    //       // }

    //       return caches.open('audio-cache')
    //         .then(cache => {
    //           cache.put(nextprops.course.img_url_mobile, response)
    //           console.log('image cached')
    //         })
    //     })
    // }
  }

  handleEnd() {
    this.setState({
      playing: false,
      displayTimer: 'none'
    })
  }

  handlePlayOrPause() {
    const that = this
    if(this.state.playing) {
      player.pause()

      this.setState({
        playing: false,
        displayTimer: 'none',
      })

      clearInterval(interval)

    } else {
      if(this.state.initialized) {
        player.play()
      } else {
        source.src = this.props.course.trailer_url
        player.load()
        player.play()
        this.setState({
          initialized: true
        })
      }

      this.setState({
        playing: true,
        displayTimer: '',
        duration: player.duration
      })

      interval = setInterval(() => {
        that.setState({
          currentTime: player.currentTime,
          duration: player.duration})
      }, 1000)
    }
  }

  renderPlayOrPause() {
    if(this.state.playing) {
      return (
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1em'}}>
          <i style={styles.icon} className="material-icons" >pause_circle_outline</i>
          <span style={{fontSize: '30px', paddingLeft: '1em'}}><strong>PAUSE</strong></span>
        </div>      )
    } else {
      return (
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1em'}}>
          <i style={styles.icon} className="material-icons">play_circle_outline</i>
          <span style={{fontSize: '30px', paddingLeft: '0.5em'}}><strong>PLAY LESSON 1</strong></span>
        </div>
      )
    }
  }

  addCourseToUser() {
    const that = this
    const userId = firebase.auth().currentUser.uid
    const {category, id, img_url_mobile, keywords, modules, name, price, run_time, teacher, teacher_bio, teacher_img, teacher_thumbnail} = this.props.course

    let sectionProgress = {}
    course.modules.forEach(module => {
      module.sections.forEach(section => {
        sectionProgress[section.section_id] = {
          playProgress: 0,
          completed: false,
          timesRepeated: 0
        }
      })
    })

    course.sectionProgress = sectionProgress

    const updates = {}
    updates['/users/' + userId + '/courses/' + this.props.course.id] = {category, id, img_url_mobile, keywords, modules, name, price, run_time, teacher, teacher_bio, teacher_img, teacher_thumbnail}

    updates['/courses/' + this.props.course.id + '/users/' + userId] = userId
    firebase.database().ref().update(updates)

    Axios.post('/api/email_signup', { //handle mailchimp api call
      firstName: that.props.userInfo.firstName,
      lastName: that.props.userInfo.lastName,
      email: that.props.userInfo.email,
      courseID: this.props.course.id
    })
    .then(() => {
      that.props.history.push('/confirmation')
    })
    .catch((err) => {
      that.props.history.push('/confirmation')
    })

  }

  checkOut() {
    if(this.props.isLoggedIn) {

      // if(this.props.userInfo.stripe_id && this.props.userInfo.stripe_id.length > 0) {
      //   this.submitPayment()
      // } else {
        if(this.props.course.price == 0) {
          this.addCourseToUser()

        } else {

          this.props.addCourseToCart(this.props.course)
          this.props.history.push('/cart')
        }
      // }
    } else {
      this.props.openSignupbox(true)
    }
  }

  submitPayment() {
    this.setState({
      startPaymentSubmission: true
    })

    const amount = this.props.course.price *100 //in cents
    const email = this.props.userInfo.email
    const that = this
    const customer = this.props.userInfo.stripe_id

    Axios.post('/api/charge', {
      amount,
      customer: that.props.userInfo.stripe_id,
      currency: 'usd',
      receipt_email: email,
      description: that.props.course.name,
      statement_descriptor: 'Soundwise Audio Course'
    })
    .then(function (response) {

      const paid = response.data.paid //boolean

      if(paid) {  // if payment made, push course to user data, and redirect to a thank you page
        that.setState({
          paid: true,
          startPaymentSubmission: false
        })

        that.addCourseToUser() //push course to user profile and redirect
      }
    })
    .catch(function (error) {
      console.log('error from stripe: ', error)
      that.setState({
        paymentError: 'Your payment is declined :( Please check your credit card information.',
        startPaymentSubmission: false
      })
    })
  }

  addCourseToUser() {
    const that = this
    const userId = firebase.auth().currentUser.uid
    const {category, id, img_url_mobile, keywords, modules, name, price, run_time, teacher, teacher_bio, teacher_profession, description, teacher_img, teacher_thumbnail} = this.props.course

    let sectionProgress = {}
    this.props.course.modules.forEach(module => {
      module.sections.forEach(section => {
        sectionProgress[section.section_id] = {
          playProgress: 0,
          completed: false,
          timesRepeated: 0
        }
      })
    })

    const updates = {}
    updates['/users/' + userId + '/courses/' + this.props.course.id] = {category, id, img_url_mobile, keywords, modules, name, price, run_time, teacher, teacher_bio, teacher_profession, description, teacher_img, teacher_thumbnail, sectionProgress}
    // store stripe customer ID info: (only works with real credit cards)
    // updates['/users/' + userId + '/stripeId'] = stripeId
    updates['/courses/' + this.props.course.id + '/users/' + userId] = userId
    firebase.database().ref().update(updates)

    that.props.history.push('/confirmation')
  }

  renderProgressBar() {
    if(this.state.startPaymentSubmission) {
      return (
        <Spinner style={{display: 'flex', paddingLeft: '0.5em'}} color="#727981" size={16} speed={1}/>
      )
    }
  }

  // handleClick() {
  //   this.props.openSignupbox(true)
  // }

  render() {
    // console.log('course in header: ', this.props.course)

    const timerStyle = {
      position: 'absolute',
      left: 0,
      right: 0,
      textAlign: 'right',
      top: '90%',
      paddingRight: '1em',
      paddingBottom: '1em',
      fontSize: '20px',
      display: this.state.displayTimer
    }

    let remainingTime = this.state.duration - this.state.currentTime
    let remainingMin = remainingTime > 0 ? Math.floor(remainingTime / 60) : '00'
    let remaingingSec = remainingTime > 0 ? Math.floor(remainingTime % 60) : '00'

    let run_time = ''
    if(this.props.course.run_time) {
      const rt_hour = Math.floor(this.props.course.run_time/3600)
      const rt_min = Math.floor(this.props.course.run_time/60 - rt_hour*60)
      const rt_sec = this.props.course.run_time % 60
      run_time = rt_hour > 0 ? `${rt_hour}h ${rt_min}m` : `${rt_min}m ${rt_sec}s`
    }

    let average_rating = 0, ratings = []

    const reviews = []
    for(var key in this.props.course.reviews) {
      reviews.push(this.props.course.reviews[key])
    }

    ratings = reviews.map(review => review.rating)
    const total = ratings.reduce((sum, cur) => (sum + cur), 0)
    average_rating = Math.floor(total / ratings.length * 10) / 10

    const courseName = this.props.course.name.split(' ').join('%20')
    const price = this.props.course.price == 0 ? 'Free course' : `$${this.props.course.price}`

    return (
      <div>
        <section className=" bg-white" id="content-section23" style={{paddingBottom: '15px'}}>
            <div className="container">
                <div className="row equalize sm-equalize-auto equalize-display-inherit">
                    <div className="col-md-6 col-sm-12 col-xs-12 display-table margin-six-left sm-no-margin" style={{height: '378px'}}>
                        <div className="display-table-cell-vertical-middle">
                            <div className="row">
                                <div className="col-md-12 col-sm-12 col-xs-12">
                                    <h2 className="title-extra-large alt-font sm-section-title-medium xs-title-extra-large text-dark-gray margin-five-bottom xs-margin-ten-bottom tz-text">{this.props.course.name}</h2>
                                    <div className='row' style={{margin: '0.5em', marginBottom: '2em', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start'}}>
                                      <ReactStars
                                        count={5}
                                        value={average_rating}
                                        size={28}
                                        edit={false}
                                        color2={'#ffd700'}
                                      />
                                      <span style={{marginLeft: '5px', fontSize: '18'}}>{`(${ratings.length})`}</span>
                                    </div>
                                    <span className="text-extra-large sm-text-extra-large font-weight-500 margin-ten-bottom xs-margin-fifteen-bottom display-block tz-text">{`${this.props.course.description} (Run Time: ${run_time})`}</span>
                                    <div className="social social-icon-color text-extra-large sm-text-extra-large  margin-ten-bottom xs-margin-fifteen-bottom display-block tz-text" style={{display: 'flex', alignItems: 'center'}}>
                                        <span className="margin-eight-right title-small sm-title-small">
                                          Share the course:
                                        </span>
                                        <a target="_blank" href={`http://www.facebook.com/sharer/sharer.php?u=https://mysoundwise.com/courses/${this.props.course.id}`} className="margin-eight-right">
                                            <i className="icon-large sm-icon-extra-small fa fa-facebook tz-icon-color"></i>
                                        </a>
                                        <a target="_blank" href={`https://twitter.com/intent/tweet?text=${courseName}. https://mysoundwise.com/courses/${this.props.course.id}`} className="margin-eight-right">
                                            <i className="icon-large sm-icon-extra-small fa fa-twitter tz-icon-color"></i>
                                        </a>
                                        <a target="_blank" href={`https://plus.google.com/share?url=https://mysoundwise.com/courses/${this.props.course.id}`} className="margin-eight-right">
                                            <i className="icon-large sm-icon-extra-small fa fa-google-plus tz-icon-color"></i>
                                        </a>
                                        <a target="_blank" href={`https://www.linkedin.com/shareArticle?mini=true&amp;url=https%3A//mysoundwise.com/courses/${this.props.course.id}&amp;title=${courseName}&amp;source=`} className="margin-eight-right">
                                            <i className="icon-large sm-icon-extra-small fa fa-linkedin tz-icon-color"></i>
                                        </a>
                                    </div>
                                </div>
                            </div>
                            <div className="row" style={{paddingBottom: '30px'}}>
                                <div className="col-md-5 col-sm-5 col-xs-5 feature-box-details-second">
                                  <span className="title-extra-large alt-font sm-section-title-medium xs-title-extra-large text-dark-gray margin-five-bottom xs-margin-ten-bottom tz-text">{price}</span>
                                </div>
                                <div className="col-md-6 col-sm-7 col-xs-7">
                                  <a className="btn-medium btn btn-circle text-white no-letter-spacing" onClick={this.checkOut} style={{backgroundColor: '#F76B1C'}}
                                  >
                                    <span className="text-extra-large sm-text-extra-large tz-text">TAKE THE COURSE</span>
                                    {this.renderProgressBar()}
                                  </a>
                                  <div style={{color: 'red'}}>{this.state.paymentError}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-5 col-sm-12 col-xs-12 display-table sm-margin-fifteen-bottom" style={{height: '378px'}}>
                        <div className="" style={{display: 'inline-block', position: 'relative', width: '350px', height: '350px'}}>
                            <img src={this.props.course.img_url_mobile} data-img-size="(W)450px X (H)450px" alt=""
                              style={{width: '350px', height: '350px', display: 'block'}}/>
                            <div style={timerStyle}>
                              <Levels color="#F76B1C" size={12} speed={1} />
                              <span style={{paddingLeft: '0.5em'}}>{`${remainingMin}:${remaingingSec}`}</span>
                            </div>
                            <div style={{textAlign: 'center'}}>
                              <a onClick={this.handlePlayOrPause}>
                                {this.renderPlayOrPause()}
                              </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <CourseSignup course={this.props.course}/>
      </div>
    )

  }
}

const mapStateToProps = state => {
  const { userInfo, isLoggedIn } = state.user
  const { signupFormOpen } = state.signupBox
  return {
    isLoggedIn,
    userInfo,
    signupFormOpen
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ openConfirmationbox, openSignupbox, addCourseToCart }, dispatch)
}

const CourseHeader_worouter = connect(mapStateToProps, mapDispatchToProps)(_CourseHeader)

export const CourseHeader = withRouter(CourseHeader_worouter)