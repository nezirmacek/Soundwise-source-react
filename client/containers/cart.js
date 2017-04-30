import React, {Component} from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Link, Redirect } from 'react-router-dom'
import { withRouter } from 'react-router'

import { SoundwiseHeader } from '../components/soundwise_header'
import {deleteCourseFromCart, openSignupbox} from '../actions/index'
import {CourseSignup} from './course_signup'
import {Checkout} from './checkout'
import Footer from '../components/footer'

const styles = {
  button: {
    backgroundColor: '#61E1FB'
  },
}

class _Cart extends Component {
  constructor(props) {
    super(props)
    this.state = {
      redirectToCheckout: false
    }
    this.renderItem = this.renderItem.bind(this)
    // this.checkOut = this.checkOut.bind(this)
  }

  renderItem(course) {
    return (
      <section className="padding-50px-tb xs-padding-60px-tb bg-white" id="content-section23" >
        <div className="container">
            <div className="row equalize sm-equalize-auto equalize-display-inherit">
                <div className="col-md-12 col-sm-12 col-xs-12 display-table margin-six-left sm-no-margin" style={{height: ''}}>
                    <div className="display-table-cell-vertical-middle">
                        <div className="row">
                            <div className='col-md-2 col-sm-12 col-xs-12'>
                              <img src={course.img_url_mobile}
                                alt=""
                                style={{width: '100px', height: '100px'}}/>
                            </div>
                            <div className="col-md-7 col-sm-8 col-xs-8">
                                <h2 className="title-extra-large alt-font sm-section-title-medium xs-title-extra-large text-dark-gray margin-five-bottom xs-margin-ten-bottom tz-text">{course.name}</h2>
                                <span className="text-extra-large sm-text-extra-large font-weight-300 margin-ten-bottom xs-margin-fifteen-bottom display-block tz-text">{`by ${course.teacher}`}</span>
                            </div>
                            <div className="col-md-3 col-sm-4 col-xs-4 feature-box-details-second pull-right">
                              <span className="title-extra-large alt-font sm-section-title-medium xs-title-extra-large text-dark-gray margin-five-bottom xs-margin-ten-bottom tz-text">{`$${course.price}`}</span>
                              <a onClick={() => this.props.deleteCourseFromCart(course)}>
                                <i className="fa fa-trash fa-2x"
                                aria-hidden="true"
                                style={{paddingLeft: '2em'}}></i>
                              </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>
    )
  }

  render() {
    const items_num = this.props.shoppingCart.length
    const subtotal = this.props.shoppingCart.reduce((cumm, course) => {
      return cumm + course.price
    }, 0)

    if(items_num === 0) {
      return (
        <div>
          <SoundwiseHeader />
          <section className="padding-110px-tb xs-padding-60px-tb bg-white builder-bg border-none" id="title-section1">
              <div className="container">
                  <div className="row">
                      <div className="col-md-12 col-sm-12 col-xs-12 text-center">
                          <h2 className="section-title-large sm-section-title-medium text-dark-gray font-weight-600 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text">YOUR CART IS EMPTY</h2>
                      </div>
                  </div>
              </div>
          </section>
          <Footer />
        </div>
      )
    } else {
    return (
      <div>
        <SoundwiseHeader />
        <section className="padding-30px-tb xs-padding-30px-tb bg-white border-none" style={{}}>
          <div className="container">
            <div className="row">
                {this.props.shoppingCart.map(course => {
                  return this.renderItem(course)
                })}

            </div>
          </div>
        </section>
        <Checkout subtotal={subtotal}/>
        <Footer />
      </div>
    )
    }
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ deleteCourseFromCart, openSignupbox }, dispatch)
}

const mapStateToProps = state => {
  const { userInfo, isLoggedIn } = state.user
  const { signupFormOpen } = state.signupBox
  const { shoppingCart } = state.checkoutProcess
  return {
    isLoggedIn,
    shoppingCart,
    signupFormOpen
  }
}

const Cart_woroute = connect(mapStateToProps, mapDispatchToProps)(_Cart)
export const Cart = withRouter(Cart_woroute)
