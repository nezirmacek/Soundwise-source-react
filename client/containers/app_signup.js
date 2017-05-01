import React, {Component} from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as firebase from "firebase"
import {orange500, blue500} from 'material-ui/styles/colors'
import {
  BrowserRouter as Router,
  Route,
  Link,
  Redirect
} from 'react-router-dom'
import { withRouter } from 'react-router'

import {SoundwiseHeader} from '../components/soundwise_header'
import { signupUser } from '../actions/index'

var provider = new firebase.auth.FacebookAuthProvider()

const styles = {
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

class _AppSignup extends Component {
  constructor(props) {
    super(props)
    this.state = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      message: '',
      pic_url: '../images/smiley_face.jpg',
      redirectToReferrer: false
    }
    this.signUp = this.signUp.bind(this)
    this.handleChange = this.handleChange.bind(this)
  }

  async signUp() {
    const that = this
    const {firstName, lastName, email, password, pic_url} = this.state

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
            message: "account created"
        })

        const userId = firebase.auth().currentUser.uid
        firebase.database().ref('users/' + userId).set({
          firstName,
          lastName,
          email,
          pic_url
        })

        that.props.signupUser({firstName, lastName, email, pic_url})
        that.props.history.push('/myprograms')
    } catch (error) {
        this.setState({
            message: error.toString()
        })
        console.log(error.toString())
    }
  }

  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  handleFBAuth() {
    const that = this

    firebase.auth().signInWithPopup(provider).then(function(result) {
      // This gives you a Facebook Access Token. You can use it to access the Facebook API.
      // The signed-in user info.
      const user = result.user
      const email = user.email
      const pic_url = result.user.photoURL
      const name = user.displayName.split(' ')
      const firstName = name[0]
      const lastName = name[1]

      const userId = firebase.auth().currentUser.uid
      firebase.database().ref('users/' + userId).set({
        firstName,
        lastName,
        email,
        pic_url
      })

      that.props.signupUser({firstName, lastName, email, pic_url})
      that.props.history.push('/myprograms')

    }).catch(function(error) {
      // Handle Errors here.
      if (error.code === 'auth/account-exists-with-different-credential') {
        // Step 2.
        // User's email already exists.
        // The pending Facebook credential.
        var pendingCred = error.credential
        // The provider account's email address.
        var email = error.email
        // Get registered providers for this email.
        firebase.auth().fetchProvidersForEmail(email).then(function(providers) {
          // Step 3.
          // If the user has several providers,
          // the first provider in the list will be the "recommended" provider to use.
          if (providers[0] === 'password') {
            // Asks the user his password.
            // In real scenario, you should handle this asynchronously.
            var password = prompt('Please enter your Soundwise password') // TODO: implement promptUserForPassword.
            firebase.auth().signInWithEmailAndPassword(email, password).then(function(user) {
              // Step 4a.
              return user.link(pendingCred)
            }).then(function() {
              // Facebook account successfully linked to the existing Firebase user.
              const userId = firebase.auth().currentUser.uid
              firebase.database().ref('users/' + userId)
              .once('value')
              .then(snapshot => {
                  const firstName = snapshot.val().firstName
                  const lastName = snapshot.val().lastName
                  const email = snapshot.val().email
                  const pic_url = snapshot.val().pic_url
                  that.props.signupUser({firstName, lastName, email, pic_url})
                  that.props.history.push('/myprograms')
              })
            })
          }

        })
      }
    })
  }

  render() {
    const { firstName, lastName, email, password, redirectToReferrer } = this.state
    const { from } = this.props.location.state || { from: { pathname: '/courses' } }

    if(redirectToReferrer) {
      return (
        <Redirect to={from} />
      )
    }
    return (
    <div>
      <SoundwiseHeader />
      <section className="padding-110px-tb xs-padding-60px-tb bg-white builder-bg" id="subscribe-section6">
          <div className="container">
              <div className="row">
                  <div className="col-md-8 center-col col-sm-12 text-center">
                      <h2 className="title-extra-large-2 alt-font xs-title-large  margin-four-bottom tz-text" style={styles.headerText}>Get Started</h2>
                      <div className="text-extra-large sm-text-extra-large text-medium-gray width-80 xs-width-100 center-col margin-twelve-bottom xs-margin-nineteen-bottom tz-text">Sign up to Soundwise and take a step towards your highest potential. Already have a Soundwise account? <Link to="/signin" className="text-decoration-underline">Log in here.</Link></div>
                  </div>
                  <div className="col-md-6 col-sm-11 col-xs-11 center-col text-center" style={{padding: '1.5em', margin: '2em'}}>
                      <button onClick={() => this.handleFBAuth()}  className="text-white btn btn-extra-large2 propClone btn-3d text-white width-100 builder-bg tz-text bg-blue tz-background-color"><i className="fa fa-facebook icon-medium margin-four-right tz-icon-color vertical-align-sub"></i><span className="tz-text">Sign up with Facebook</span></button>
                  </div>
                  <div className="col-md-6 center-col col-sm-12 text-center">
                      <div className="text-extra-large sm-text-extra-large text-medium-gray width-80 xs-width-100 center-col margin-twelve-bottom xs-margin-nineteen-bottom tz-text">Or</div>
                      <h4 className="title-extra-large xs-title-large width-80 xs-width-100 center-col margin-twelve-bottom xs-margin-nineteen-bottom tz-text">Sign up with email</h4>
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
                          <button
                            onClick={this.signUp}
                            type="submit" className="contact-submit btn btn-extra-large2 propClone btn-3d text-white width-100 builder-bg tz-text" style={styles.button}>GET STARTED!</button>
                          <div style={styles.error}>
                            {this.state.message}
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
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ signupUser }, dispatch)
}

const mapStateToProps = state => {
  const { userInfo, isLoggedIn } = state.user
  return {
    userInfo, isLoggedIn
  }
}

const AppSignup_worouter = connect(mapStateToProps, mapDispatchToProps)(_AppSignup)

export const AppSignup = withRouter(AppSignup_worouter)
