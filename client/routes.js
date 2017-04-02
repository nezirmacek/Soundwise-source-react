import React, {Component} from 'react'
import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom'
import firebase from 'firebase'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'
import injectTapEventPlugin from 'react-tap-event-plugin'
// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin()

import { config } from '../config'
import {loadCourses} from './actions/index'
import Page from './components/page'
import About from './components/about'
import OrderConfirmation from './components/order_confirmation'
import {AppSignup} from './containers/app_signup'
import {AppSignin} from './containers/app_signin'
import {Courses} from './containers/courses'
import {MyCourses} from './containers/mycourses'
import {Course} from './containers/course_page'
import {Course_Purchased} from './containers/course_page_purchased'
import {Cart} from './containers/cart'
import {Checkout} from './containers/checkout'
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
        .once('value')
        .then(snapshot => {
            const firstName = snapshot.val().firstName
            const lastName = snapshot.val().lastName
            const email = snapshot.val().email
            const courses = snapshot.val().courses
            that.props.signinUser({firstName, lastName, email, courses})
        })
      }
    })

    firebase.database().ref('courses')
            .once('value')
            .then(snapshot => {
              // console.log('courses fetched from firebase: ', snapshot.val())
              this.props.loadCourses(snapshot.val())
            })
  }

  render() {
    return (
      <Router history = { browserHistory }>
        <div>
          <Switch>
             <Route exact path="/" component={Page}/>
             <Route path="/about" component={About}/>
             <Route path='/signup' component={AppSignup} />
             <Route path='/signin' component={AppSignin} />

             <Route exact path="/myprograms" component={MyCourses}/>
             <Route exact path="/myprograms/:courseId" component={Course_Purchased}/>
             <Route path="/cart" component={Cart} />
             <Route path="/checkout" component={Checkout} />
             <Route path="/confirmation" component={OrderConfirmation} />
             <Route path="/courses/:courseId" component={Course} />
          </Switch>
        </div>
      </Router>
    )
  }
}

             // <Route path="/courses" component={Courses}/>

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ loadCourses, signinUser }, dispatch)
}

export const Routes = connect(null, mapDispatchToProps)(_Routes)