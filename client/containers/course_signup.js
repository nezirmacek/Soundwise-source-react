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

import { signupUser, signinUser, openSignupbox, openConfirmationbox } from '../actions/index'

const styles = {
  errorStyle: {
    color: orange500,
  },
  underlineStyle: {
    borderColor: orange500,
  },
  floatingLabelStyle: {
    color: orange500,
  },
  floatingLabelFocusStyle: {
    color: blue500,
  },
  table: {
    width: '100%',
    justifyContent: 'center',
    // paddingLeft: '10%',
    // paddingRight: '10%'
  },
  button: {
    backgroundColor: '#F76B1C'
  },
  headerText: {
    color: '#61E1FB'
  },
  error: {
    color: 'red'
  }
}

class _CourseSignup extends Component {
  constructor(props) {
    super(props)
    this.state = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      response: '',
      renderSignup: true,
    }
    this.signUp = this.signUp.bind(this)
    this.signIn = this.signIn.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.signupForm = this.signupForm.bind(this)
    this.switchForm = this.switchForm.bind(this)
    this.handleSignupOrLogin = this.handleSignupOrLogin.bind(this)
  }

  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  switchForm() {
    const current = this.state.renderSignup
    this.setState({
      renderSignup: !current
    })
  }

  async signUp() {
    const {firstName, lastName, email, password} = this.state

    if(firstName.length < 1 || lastName.length < 1) {
      alert('Please enter your name!')
    } else if(email.indexOf('@') < 0) {
      alert('Please enter a valid email!')
    } else if(password.length < 1 ) {
      alert('Please enter a passowrd!')
    }

    try {
        await firebase.auth().createUserWithEmailAndPassword(this.state.email, this.state.password)

        this.setState({
            response: "account created"
        })

        const userId = firebase.auth().currentUser.uid
        firebase.database().ref('users/' + userId).set({
          firstName,
          lastName,
          email
        })

        this.props.signupUser({firstName, lastName, email, password})
        this.props.openSignupbox(false)
        this.props.history.push('/checkout')

    } catch (error) {
        this.setState({
            response: error.toString()
        })
      alert(
        'Error',
        this.state.response
      )
        console.log(error.toString())
    }
  }

  async signIn() {
    let {firstName, lastName, email, password} = this.state

    try {
        await firebase.auth().signInWithEmailAndPassword(email, password)

        const userId = firebase.auth().currentUser.uid
        firebase.database().ref('users/' + userId)
        .once('value')
        .then(snapshot => {
            firstName = snapshot.val().firstName,
            lastName = snapshot.val().lastName,
            email = snapshot.val().email
            this.props.signinUser({firstName, lastName, email})
            this.props.openSignupbox(false)
            this.setState({
              firstName,
              lastName,
              email
            })
            this.props.history.push('/checkout')
        })

    } catch (error) {
        this.setState({
            message: error.toString()
        })
        console.log(error.toString())
    }
  }

  signupForm() {
    const { firstName, lastName, email, password } = this.state
    return (
      <div style={styles.table}>
        <section className=" bg-white builder-bg" id="subscribe-section6">
            <div className="">
                <div className="row">
                    <div className="col-md-8 center-col col-sm-12 text-center">
                        <h3 className="title-extra-large-2 alt-font xs-title-large  margin-four-bottom tz-text" style={styles.headerText}>Get started</h3>
                        <div className="text-extra-large sm-text-extra-large text-medium-gray width-80 xs-width-100 center-col margin-twelve-bottom xs-margin-nineteen-bottom tz-text">Sign up to Soundwise and take a step towards your highest potential. Already have a Soundwise account? <a onClick={() => this.switchForm()} className="text-decoration-underline">Log in here.</a></div>
                    </div>
                    <div className="col-md-6 center-col col-sm-12 text-center">
                            <input
                              onChange={this.handleChange}
                              value={firstName} type="text" name="firstName" id="fname" data-email="required" placeholder="First Name" className="big-input bg-light-gray alt-font border-radius-4"/>
                            <input
                              onChange={this.handleChange}
                              value={lastName} type="text" name="lastName" id="lname" data-email="required" placeholder="Last Name" className="big-input bg-light-gray alt-font border-radius-4"/>
                            <input
                              onChange={this.handleChange}
                              value={email} type="email" name="email" id="email" data-email="required" placeholder="Email" className="big-input bg-light-gray alt-font border-radius-4"/>
                            <input
                              onChange={this.handleChange}
                              value={password} type="password" name="password" id="password" data-email="required" placeholder="Password" className="big-input bg-light-gray alt-font border-radius-4"/>
                            <div style={styles.error}>
                              {this.state.response}
                            </div>
                            <div className="margin-seven-top text-small2 sm-width-100 center-col tz-text xs-line-height-20">* We don't share your personal info with anyone. Check out our <a href="#" className="text-decoration-underline tz-text">Privacy Policy</a> for more information.
                            </div>
                    </div>
                </div>
            </div>
        </section>
      </div>
    )
  }

  loginForm() {
    const { email, password } = this.state
    return (
      <section className=" bg-white builder-bg" id="subscribe-section6">
          <div className="">
              <div className="row">
                  <div className="col-md-8 center-col col-sm-12 text-center">
                      <h2 className="title-extra-large-2 alt-font xs-title-large  margin-four-bottom tz-text" style={styles.headerText}>Log In</h2>
                      <div className="text-extra-large sm-text-extra-large text-medium-gray width-80 xs-width-100 center-col margin-twelve-bottom xs-margin-nineteen-bottom tz-text">Need a Soundwise account? <a onClick={() => this.switchForm()} className="text-decoration-underline">Get started here.</a></div>
                  </div>
                  <div className="col-md-6 center-col col-sm-12 text-center">
                          <input
                            onChange={this.handleChange}
                            value={email} type="email" name="email" id="email" data-email="required" placeholder="Email" className="big-input bg-light-gray alt-font border-radius-4"/>
                          <input
                            onChange={this.handleChange}
                            value={password} type="password" name="password" id="password" data-email="required" placeholder="Password" className="big-input bg-light-gray alt-font border-radius-4"/>
                          <div style={styles.error}>
                            {this.state.response}
                          </div>
                  </div>
              </div>
          </div>
      </section>
    )
  }

  handleClose() {
    if(this.props.signupFormOpen) {
      this.props.openSignupbox(false)
    } else if(this.props.confirmationBoxOpen) {
      this.props.openConfirmationbox(false)
    }
  }

  handleSignupOrLogin() {
    if(this.state.renderSignup) {
      this.signUp()
    } else {
      this.signIn()
    }
  }

  signupDialog() {
    const actions = [
      <FlatButton
        label="SUBMIT"
        primary={true}
        keyboardFocused={true}
        onTouchTap={() => this.handleSignupOrLogin()}
      />,
      <FlatButton
        label="CANCEL"
        primary={false}
        keyboardFocused={true}
        onTouchTap={() => this.handleClose()}
      />
    ]
    return (
      <MuiThemeProvider>
      <Dialog
        // title="Get Started"
        actions={actions}
        modal={false}
        open={this.props.signupFormOpen}
        autoScrollBodyContent={true}
        onRequestClose={() => this.handleClose()}
      >
        {this.state.renderSignup ? this.signupForm() : this.loginForm()}
      </Dialog>
      </MuiThemeProvider>
    )
  }

  render() {
    if(this.state.redirectToCheckout) {
      return (
        <Redirect to='/checkout' />
      )
    }

    return (
      <div>
          {this.signupDialog()}
      </div>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ signupUser, signinUser, openConfirmationbox, openSignupbox }, dispatch)
}

const mapStateToProps = state => {
  const { userInfo, isLoggedIn } = state.user
  const { signupFormOpen, confirmationBoxOpen } = state.signupBox
  return {
    userInfo, isLoggedIn, signupFormOpen, confirmationBoxOpen
  }
}

const CourseSignup_worouter = connect(mapStateToProps, mapDispatchToProps)(_CourseSignup)

export const CourseSignup = withRouter(CourseSignup_worouter)