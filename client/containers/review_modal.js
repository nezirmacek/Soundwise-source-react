import React, {Component} from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as firebase from "firebase"
import TextField from 'material-ui/TextField'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import {orange500, blue500} from 'material-ui/styles/colors'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import { Link, Redirect } from 'react-router-dom'
import { withRouter } from 'react-router'
import ReactStars from 'react-stars'

import { openReviewbox } from '../actions/index'

class _ReviewModal extends Component {
  constructor(props) {
    super(props)

    this.state = {
      rating: 5,
      review: ''
    }

    this.ratingChanged = this.ratingChanged.bind(this)
    this.handleReviewChange = this.handleReviewChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  ratingChanged(newRating) {
    console.log('new rating: ', newRating)
    this.setState({
      rating: newRating
    })
  }

  handleReviewChange(e) {
    e.preventDefault()

    this.setState({
      review: e.target.value
    })
  }

  handleSubmit() {
    const {rating, review} = this.state
    const time = new Date()
    const date = time.toDateString()
    const reviewer = `${this.props.userInfo.firstName} ${this.props.userInfo.lastName.slice(0,1)}.`

    console.log('review: ', {date, reviewer, rating, review})

    firebase.database().ref('courses/' + this.props.course.id)
      .child('reviews').push({date, reviewer, rating, review})

    this.props.openReviewbox(false)
  }

  reviewForm() {
    return (
      <section className="padding-110px-tb xs-padding-60px-tb bg-gray builder-bg contact-form-style6 border-none" id="contact-section12">
          <div className="">
              <div className="row">
                  <div className="col-md-8 col-sm-12 col-xs-12 center-col text-center">
                      <h2 className="section-title-large sm-section-title-medium xs-section-title-large text-dark-gray font-weight-600 alt-font margin-six-bottom xs-margin-fifteen-bottom tz-text">How would you rate this program?</h2>
                      <div style={{width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2em'}}>
                      <ReactStars
                        count={5}
                        value = {this.state.rating}
                        size={28}
                        onChange={this.ratingChanged}
                        color2={'#ffd700'}
                        style={{float: 'left', display: 'inline'}}/>
                      </div>
                      <div className="text-medium width-90 sm-width-100 center-col tz-text margin-thirteen-bottom xs-margin-nineteen-bottom">Tell us what you think of the program. Your review will help other people decide if this class is right for them. (Optional)</div>
                  </div>
                  <div className="col-md-6 col-sm-12 col-xs-12 center-col text-center">
                      <div className="width-100">
                          <textarea name="review"
                            id="review" placeholder="Your review" className="medium-input border-radius-4"
                            onChange={this.handleReviewChange}
                            value={this.state.review}>
                          </textarea>
                          <button
                            onClick={this.handleSubmit}
                            type="submit" className="contact-submit btn btn-large propClone bg-sky-blue btn-3d text-white tz-text">Submit</button>
                      </div>
                  </div>
              </div>
          </div>
      </section>
    )
  }

  render() {
    return (
      <MuiThemeProvider>
      <Dialog
        // title="Get Started"
        modal={false}
        open={this.props.reviewFormOpen}
        autoScrollBodyContent={true}
        onRequestClose={() => this.props.openReviewbox(false)}
      >
        {this.reviewForm()}
      </Dialog>
      </MuiThemeProvider>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ openReviewbox }, dispatch)
}

const mapStateToProps = state => {
  const { userInfo, isLoggedIn } = state.user
  const { reviewFormOpen } = state.reviewBox
  return {
    userInfo, isLoggedIn, reviewFormOpen
  }
}

export const ReviewModal = connect(mapStateToProps, mapDispatchToProps)(_ReviewModal)