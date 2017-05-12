import React, {Component} from 'react'
import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom'
import firebase from 'firebase'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import {Helmet} from "react-helmet"
import { browserHistory } from 'react-router'
import injectTapEventPlugin from 'react-tap-event-plugin'
// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin()

import { config } from '../config'
import {loadCourses} from './actions/index'
import Page from './components/page'
import About from './components/about'
import Referral from './components/referral'
import CreatorTerms from './components/creator_terms'
import TermsFreeContent from './components/terms_free_content_May2017'
import { OrderConfirmation } from './components/order_confirmation'
import {AppSignup} from './containers/app_signup'
import {AppSignin} from './containers/app_signin'
import {Courses} from './containers/courses'
import {MyCourses} from './containers/mycourses'
import {Course} from './containers/course_page'
import {Course_Purchased} from './containers/course_page_purchased'
import {Cart} from './containers/cart'
import {Checkout} from './containers/checkout'
import NotFound from './components/page_404'
import PassRecovery from './components/pass_recovery'
import { signinUser } from './actions/index'

class _Routes extends Component {
  constructor() {
    super()
  }

  componentDidMount() {
    const that = this
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        const userId = user.uid
        firebase.database().ref('users/' + userId)
        .on('value', snapshot => {
            const firstName = snapshot.val().firstName
            const lastName = snapshot.val().lastName
            const email = snapshot.val().email
            const courses = snapshot.val().courses
            const pic_url = snapshot.val().pic_url || ""
            const stripe_id = snapshot.val().stripe_id
            that.props.signinUser({firstName, lastName, email, courses, pic_url, stripe_id})
        })
      }
    })

    firebase.database().ref('courses')
            .on('value', snapshot => {
              this.props.loadCourses(snapshot.val())
            })

  }

  render() {
    return (
      <Router history = { browserHistory }>
        <div>
          <Helmet>
            <meta property="og:type" content="website"/>
            <meta property="og:url" content="https://mysoundwise.com/" />
            <meta property="og:title" content="Soundwise"/>
            <meta property="fb:app_id" content='1726664310980105' />
            <meta property="og:description" content="Soundwise is a mobile learning platform that helps you improve your life and career through short audio lessons from top experts in personal development, science, and business."/>
            <meta property="og:image" content="https://mysoundwise.com/images/thumnail_FB.png" />
            <title>Soundwise: audio courses in business and personal development from leading experts</title>
            <meta name="description" content="Audio courses to help you improve your life and career from top experts in personal development, science, and business." />
            <meta name="keywords" content="soundwise, soundwise inc, audio, mobile application, learning, online learning, online course, podcast, audio book, audible, marketing, entrepreneurship, fitness, how to, personal development, personal growth, learning on the go, online course, audio course, business, career, life, wellness, relationship, empowerment, spirituality, self help" />
          </Helmet>
          <Switch>
             <Route exact path="/" component={Page}/>
             <Route path="/about" component={About}/>
             <Route path='/signup' component={AppSignup} />
             <Route path='/signin' component={AppSignin} />
             <Route path="/gift" component={Referral} />
             <Route path="/creator_terms" component={CreatorTerms} />
             <Route path="/terms_free_content_May2017" component={TermsFreeContent} />
             <Route exact path="/myprograms" component={MyCourses}/>
             <Route path="/myprograms/:courseId" component={Course_Purchased}/>
             <Route path="/cart" component={Cart} />
             <Route path="/confirmation" component={OrderConfirmation} />
             <Route path="/courses/:courseId" component={Course} />
             <Route path="/password_reset" component={PassRecovery} />
             <Route path ="/notfound" component={NotFound} />
             <Route component={NotFound} />
          </Switch>
        </div>
      </Router>
    )
  }
}



function mapDispatchToProps(dispatch) {
  return bindActionCreators({ loadCourses, signinUser }, dispatch)
}

export const Routes = connect(null, mapDispatchToProps)(_Routes)