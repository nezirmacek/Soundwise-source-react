import React, {Component} from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { openSignupbox, openConfirmationbox, addCourseToCart } from '../actions/index'
import { withRouter } from 'react-router'
import {orange50} from 'material-ui/styles/colors'

class _CourseFooter extends Component {
  constructor(props) {
    super(props)

    this.checkOut = this.checkOut.bind(this)
  }

  checkOut() {
    if(this.props.isLoggedIn) {
      this.props.addCourseToCart(this.props.course)
      this.props.history.push('/cart')
    } else {
      this.props.openSignupbox(true)
    }
  }

  render() {
    return (
            <section className="padding-60px-tb builder-bg border-none" id="callto-action2" style={{backgroundColor: '#F76B1C'}}>
                <div className="container">
                    <div className="row equalize">
                        <div className="col-md-12 col-sm-12 col-xs-12 text-center" style={{height: "46px"}}>
                            <div className="display-inline-block sm-display-block vertical-align-middle margin-five-right sm-no-margin-right sm-margin-ten-bottom tz-text alt-font text-white title-large sm-title-large xs-title-large">{`Sign up to this program for $${this.props.course.price}`}</div>
                            <a onClick={this.checkOut} className="btn-large btn text-white highlight-button-white-border btn-circle"><span className="tz-text" >ADD TO CART</span></a>
                        </div>
                    </div>
                </div>
            </section>
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
  return bindActionCreators({ openSignupbox, addCourseToCart }, dispatch)
}

export const CourseFooter = withRouter(connect(mapStateToProps, mapDispatchToProps)(_CourseFooter))
