import React, {Component} from 'react'
import Axios from 'axios'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Link, Redirect } from 'react-router-dom'
import Dots from 'react-activity/lib/Dots'
import { withRouter } from 'react-router'
import * as firebase from "firebase"

import { SoundwiseHeader } from '../components/soundwise_header'
import {deleteCart} from '../actions/index'

let stripe, elements

class _Checkout extends Component {
  constructor(props) {
    super(props)
    this.state={
      paymentError: '',
      submitDisabled: false,
      number: '',
      cvc: '',
      exp_month: '',
      exp_year: '',
      totalPay: 0,
      paid: false,
      startPaymentSubmission: false
    }
    this.onSubmit = this.onSubmit.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.stripeTokenHandler = this.stripeTokenHandler.bind(this)
    this.renderProgressBar = this.renderProgressBar.bind(this)
  }

  componentWillMount() {
    stripe = Stripe.setPublishableKey('pk_test_BwjUV9yHQNcgRzx59dSA3Mjt')
    this.setState({
      totalPay: this.props.shoppingCart.reduce((cumm, course) => {
      return cumm + course.price
    }, 0) * 100 // in cents
    })
  }

  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  async onSubmit(event) {
    event.preventDefault()
    this.setState({
      startPaymentSubmission: true
    })
    const {number, cvc} = this.state
    const exp_month = Number(this.state.exp_month)
    const exp_year = Number(this.state.exp_year)
    this.setState({ submitDisabled: true, paymentError: null })

    Stripe.card.createToken({number, cvc, exp_month, exp_year}, this.stripeTokenHandler)
  }

  stripeTokenHandler(status, response) {
    const amount = this.state.totalPay
    const email = this.props.userInfo.email
    const that = this

    if(response.error) {
      this.setState({
        paymentError: response.error.message,
        submitDisabled: false
      })
    } else {
      Axios.post('/api/charge', {
        amount,
        source: response.id,
        currency: 'usd',
        receipt_email: email,
        description: that.props.shoppingCart[0].name,
        statement_descriptor: 'Soundwise Audio Course'
      })
      .then(function (response) {

        const paid = response.data.paid //boolean
        const stripeId = response.data.stripeId

        if(paid) {  // if payment made, push course to user data, and redirect to a thank you page
          that.setState({
            paid,
            startPaymentSubmission: false
          })

          const userId = firebase.auth().currentUser.uid
          that.props.shoppingCart.forEach(course => {

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
            updates['/users/' + userId + '/courses/' + course.id] = course
            // store stripe customer ID info: (only works with real credit cards)
            // updates['/users/' + userId + '/stripeId'] = stripeId
            updates['/courses/' + course.id + '/users/' + userId] = userId
            firebase.database().ref().update(updates)
          })
          that.props.deleteCart()
          that.props.history.push('/confirmation')
        }
      })
      .catch(function (error) {
        console.log('error from stripe: ', error)
        that.setState({
          paymentError: 'Your payment is declined :( Please check your credit card information.'
        })
      })
    }
  }

  renderProgressBar() {
    if(this.state.startPaymentSubmission) {
      return (
        <div style={{width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '1em'}}>
          <Dots style={{display: 'flex'}} color="#727981" size={32} speed={1}/>
        </div>
      )
    }
  }

  render() {
    const items_num = this.props.shoppingCart.length
    const subtotal = this.props.shoppingCart.reduce((cumm, course) => {
      return cumm + course.price
    }, 0)

    return (
      <div>
      <SoundwiseHeader />
        <section className='padding-110px-tb xs-padding-60px-tb bg-white builder-bg" id="subscribe-section6'>
          <div className='container'>
            <div className='row '>
              <div className="col-md-8 center-col col-sm-12">
                  <h2 className="title-extra-large-2 alt-font xs-title-large text-sky-blue-dark margin-four-bottom tz-text">CHECKOUT</h2>
                  <div className="row equalize ">
                      <div className="col-md-5  display-table col-sm-12" style={{height: '62px'}}>
                          <div className="display-table-cell-vertical-middle">
                            <div className="">
                              <Link to="/cart" className="btn  propClone btn-3d text-white width-100 builder-bg tz-text" style={{backgroundColor: '#F76B1C'}}>EDIT ORDER</Link>
                            </div>
                          </div>
                      </div>
                      <div className="col-md-6 col-sm-12 display-table pull-right" style={{height: '62px'}}>
                          <div className="display-table-cell-vertical-middle pull-right">
                              <h3 className="title-large alt-font  font-weight-400 margin-three-top margin-three-bottom sm-margin-six-bottom xs-no-margin xs-padding-bottom-20px xs-title-large display-block tz-text">{`Item(s): ${items_num} / Sub-total: $${subtotal}`}</h3>
                          </div>
                      </div>
                  </div>
                  <div className="row equalize ">
                      <div className="col-md-5 display-table col-sm-12" style={{height: '62px'}}>
                          <div className=" pull-left">
                            <input type='submit' value='Apply'
                              className='text-white btn builder-bg propClone btn-3d tz-text border-radius-4'
                              style={{float: 'right', backgroundColor: '#F76B1C', height: '3em'}}/>
                            <div className="" style={{overflow: 'hidden'}}>
                              <input className=" bg-light-gray alt-font border-radius-4" placeholder='coupon code' style={{width: '100%', paddingRight: '1em', height: '3.6em'}}/>
                            </div>
                          </div>
                      </div>
                      <div className="col-md-6 col-sm-12 display-table xs-text-center pull-right" style={{height: '62px'}}>
                          <div className="display-table-cell-vertical-middle pull-right">
                              <h3 className="title-large alt-font  font-weight-400 margin-three-top margin-three-bottom sm-margin-six-bottom xs-no-margin xs-padding-bottom-20px xs-title-large display-block tz-text">{`Total: $${subtotal}`}</h3>
                          </div>
                      </div>
                  </div>
              </div>
              <div className="col-md-6 center-col col-sm-12 ">
                <form onSubmit={this.onSubmit}>
                    <div className=''>
                      <label className='title-large alt-font  font-weight-400 margin-three-top margin-three-bottom sm-margin-six-bottom xs-no-margin xs-padding-bottom-20px xs-title-large display-block tz-text'>Card Number</label>
                      <input
                        onChange={this.handleChange}
                        required  className='big-input bg-light-gray alt-font border-radius-4' size='20' type='text' name='number'/>
                    </div>
                    <div className=' '>
                      <label className='title-large alt-font  font-weight-400 margin-three-top margin-three-bottom sm-margin-six-bottom xs-no-margin xs-padding-bottom-20px xs-title-large display-block tz-text'>CVC</label>
                      <input
                        onChange={this.handleChange}
                        required  className='big-input bg-light-gray alt-font border-radius-4' placeholder='ex. 311' size='4' type='text' name='cvc'/>
                    </div>
                    <div className=''>
                      <label className=' title-large alt-font  font-weight-400 margin-three-top margin-three-bottom sm-margin-six-bottom xs-no-margin xs-padding-bottom-20px xs-title-large display-block tz-text'>Expiration</label>
                      <select
                        onChange={this.handleChange}
                        className="big-input bg-light-gray alt-font border-radius-3" name="exp_month" id="expiry-month" style={{width: '45%', height: '3.5em'}}>
                        <option>Month</option>
                        <option value="1">Jan (01)</option>
                        <option value="2">Feb (02)</option>
                        <option value="3">Mar (03)</option>
                        <option value="4">Apr (04)</option>
                        <option value="5">May (05)</option>
                        <option value="6">June (06)</option>
                        <option value="7">July (07)</option>
                        <option value="8">Aug (08)</option>
                        <option value="9">Sep (09)</option>
                        <option value="10">Oct (10)</option>
                        <option value="11">Nov (11)</option>
                        <option value="12">Dec (12)</option>
                      </select>
                      <select
                        onChange={this.handleChange}
                        className="big-input bg-light-gray alt-font border-radius-3 pull-right" name="exp_year" style={{width: '45%', height: '3.5em', float: 'right'}}>
                        <option>Year</option>
                        <option value="2017">2017</option>
                        <option value="2018">2018</option>
                        <option value="2019">2019</option>
                        <option value="2020">2020</option>
                        <option value="2021">2021</option>
                        <option value="2022">2022</option>
                        <option value="2023">2023</option>
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                        <option value="2026">2026</option>
                        <option value="2027">2027</option>
                        <option value="2028">2028</option>
                      </select>
                    </div>
                  <div className=''>
                    <div className='col-md-12 '>
                      <span style={{color: 'red'}}>{ this.state.paymentError }</span><br />
                      <button className='contact-submit btn btn-extra-large2 propClone btn-3d text-white width-100 builder-bg tz-text' type='submit' style={{backgroundColor: '#F76B1C'}}
                        >
                        Pay Now
                      </button>
                      {this.renderProgressBar()}
                    </div>

                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }
}

const mapStateToProps = state => {
  const { userInfo, isLoggedIn } = state.user
  const { shoppingCart } = state.checkoutProcess
  return {
    userInfo,
    isLoggedIn,
    shoppingCart
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ deleteCart }, dispatch)
}

const Checkout_worouter = connect(mapStateToProps, mapDispatchToProps)(_Checkout)
export const Checkout = withRouter(Checkout_worouter)