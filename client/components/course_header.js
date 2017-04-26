import React, {Component} from 'react'
import { Link, Redirect } from 'react-router-dom'
import { withRouter } from 'react-router'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import ReactStars from 'react-stars'
import Levels from 'react-activity/lib/Levels'
import {orange50} from 'material-ui/styles/colors'

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
    fontSize: '150px',
    opacity: 0.7
  }
}

let player, source, interval

class _CourseHeader extends Component {
  constructor(props) {
    super(props)
    this.state = {
      playing: false,
      displayTimer: 'none',
      currentTime: 0,
      duration: 0
    }

    this.checkOut = this.checkOut.bind(this)
    this.handlePlayOrPause = this.handlePlayOrPause.bind(this)
    this.handleEnd = this.handleEnd.bind(this)
  }

  componentDidMount() {
    player = document.getElementById('audio')
    source = document.getElementById('audioSource')

    player.addEventListener('ended', this.handleEnd)
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
      source.src = this.props.course.trailer_url
      player.load()
      player.play()

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
        <i style={styles.icon} className="material-icons" >pause_circle_outline</i>
      )
    } else {
      return (
        <div>
        <i style={styles.icon} className="material-icons">play_circle_outline</i>
        <p style={{fontSize: '30px'}}><strong>PLAY INTRO</strong></p>
        </div>
      )
    }
  }

  checkOut() {
    if(this.props.isLoggedIn) {
      this.props.addCourseToCart(this.props.course)
      this.props.history.push('/cart')
    } else {
      this.props.openSignupbox(true)
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
                                    <span className="text-extra-large sm-text-extra-large font-weight-300 margin-ten-bottom xs-margin-fifteen-bottom display-block tz-text">{`${this.props.course.description} `}</span>
                                    <span className="text-extra-large sm-text-extra-large font-weight-300 margin-ten-bottom xs-margin-fifteen-bottom display-block tz-text">{`Run Time: ${run_time}`}</span>
                                </div>
                            </div>
                            <div className="row" style={{paddingBottom: '30px'}}>
                                <div className="col-md-6 col-sm-6 col-xs-6 feature-box-details-second">
                                  <span className="title-extra-large alt-font sm-section-title-medium xs-title-extra-large text-dark-gray margin-five-bottom xs-margin-ten-bottom tz-text">{`$${this.props.course.price}`}</span>
                                </div>
                                <div className="col-md-6 col-sm-6 col-xs-6">
                                  <a className="btn-medium btn btn-circle text-white no-letter-spacing" onClick={this.checkOut} style={{backgroundColor: '#F76B1C'}}
                                  >
                                    <span className="text-extra-large sm-text-extra-large tz-text">Add to Cart</span>
                                  </a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-5 col-sm-12 col-xs-12 display-table sm-margin-fifteen-bottom" style={{height: '378px'}}>
                        <div className="pull-right" style={{display: 'inline-block', position: 'relative', width: '350px', height: '350px'}}>
                            <img src={this.props.course.img_url_mobile} data-img-size="(W)450px X (H)450px" alt=""
                              style={{width: '350px', height: '350px', display: 'block'}}/>
                            <div style={styles.iconWrap}>
                              <a onClick={this.handlePlayOrPause}>
                                {this.renderPlayOrPause()}
                              </a>
                            </div>
                            <div style={timerStyle}>
                              <Levels color="#F76B1C" size={12} speed={1} />
                              <span style={{paddingLeft: '0.5em'}}>{`${remainingMin}:${remaingingSec}`}</span>
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
    signupFormOpen
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ openConfirmationbox, openSignupbox, addCourseToCart }, dispatch)
}

const CourseHeader_worouter = connect(mapStateToProps, mapDispatchToProps)(_CourseHeader)

export const CourseHeader = withRouter(CourseHeader_worouter)