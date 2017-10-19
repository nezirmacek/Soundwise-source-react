import React, {Component} from 'react'
import { Link, Redirect } from 'react-router-dom'
import { withRouter } from 'react-router'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import ReactStars from 'react-stars'
import {orange50} from 'material-ui/styles/colors'
import Spinner from 'react-activity/lib/Spinner'
import Axios from 'axios'
import * as firebase from "firebase"

import  SoundcastSignup  from '../soundcast_signup'
// import SocialShare from './socialshare'
// import { openSignupbox, openConfirmationbox, addSoundcastToCart } from '../actions/index'

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

class _SoundcastHeader extends Component {
  constructor(props) {
    super(props)
    this.state = {
      soundcastID: '',
      soundcast: {
        title: '',
        short_description: '',
        imageURL: '',
        long_description: '',
      },
      paid: false,
      startPaymentSubmission: false,
      paymentError: ''
    }

    this.checkOut = this.checkOut.bind(this)
    this.submitPayment = this.submitPayment.bind(this)
    this.addSoundcastToUser = this.addSoundcastToUser.bind(this)
  }

  componentDidMount() {

  }

  addSoundcastToUser() {
    // const that = this
    // const userId = firebase.auth().currentUser.uid


    // const updates = {}
    // updates['/users/' + userId + '/subscriptions/' + this.props.soundcastID] = true;

    // updates['/soundcasts/' + this.props.soundcastID + '/subscribed/' + userId] = true;
    // firebase.database().ref().update(updates)

    // Axios.post('/api/email_signup', { //handle mailchimp api call
    //   firstName: that.props.userInfo.firstName,
    //   lastName: that.props.userInfo.lastName,
    //   email: that.props.userInfo.email,
    //   SoundcastID: this.props.soundcastID
    // })
    // .then(() => {
    //   that.props.history.push('/confirm_subscription')
    // })
    // .catch((err) => {
    //   that.props.history.push('/confirm_subscription')
    // })

  }

  checkOut() {
    // if(this.props.isLoggedIn) {

    //   // if(this.props.userInfo.stripe_id && this.props.userInfo.stripe_id.length > 0) {
    //   //   this.submitPayment()
    //   // } else {
    //     if(this.props.soundcast.price == 0) {
    //       this.addSoundcastToUser()

    //     } else {

    //       this.props.addSoundcastToCart(this.props.soundcast)
    //       this.props.history.push('/cart')
    //     }
    //   // }
    // } else {
    //   this.props.openSignupbox(true)
    // }
  }

  submitPayment() {
    // this.setState({
    //   startPaymentSubmission: true
    // })

    // const amount = this.props.Soundcast.price *100 //in cents
    // const email = this.props.userInfo.email
    // const that = this
    // const customer = this.props.userInfo.stripe_id

    // Axios.post('/api/charge', {
    //   amount,
    //   customer: that.props.userInfo.stripe_id,
    //   currency: 'usd',
    //   receipt_email: email,
    //   description: that.props.Soundcast.name,
    //   statement_descriptor: 'Soundwise Audio Soundcast'
    // })
    // .then(function (response) {

    //   const paid = response.data.paid //boolean

    //   if(paid) {  // if payment made, push Soundcast to user data, and redirect to a thank you page
    //     that.setState({
    //       paid: true,
    //       startPaymentSubmission: false
    //     })

    //     that.addSoundcastToUser() //push Soundcast to user profile and redirect
    //   }
    // })
    // .catch(function (error) {
    //   console.log('error from stripe: ', error)
    //   that.setState({
    //     paymentError: 'Your payment is declined :( Please check your credit card information.',
    //     startPaymentSubmission: false
    //   })
    // })
  }

  addSoundcastToUser() {
    // const that = this
    // const userId = firebase.auth().currentUser.uid
    // const {category, id, img_url_mobile, keywords, modules, name, price, run_time, teacher, teacher_bio, teacher_profession, description, teacher_img, teacher_thumbnail} = this.props.Soundcast

    // let sectionProgress = {}
    // this.props.Soundcast.modules.forEach(module => {
    //   module.sections.forEach(section => {
    //     sectionProgress[section.section_id] = {
    //       playProgress: 0,
    //       completed: false,
    //       timesRepeated: 0
    //     }
    //   })
    // })

    // const updates = {}
    // updates['/users/' + userId + '/Soundcasts/' + this.props.Soundcast.id] = {category, id, img_url_mobile, keywords, modules, name, price, run_time, teacher, teacher_bio, teacher_profession, description, teacher_img, teacher_thumbnail, sectionProgress}
    // // store stripe customer ID info: (only works with real credit cards)
    // // updates['/users/' + userId + '/stripeId'] = stripeId
    // updates['/Soundcasts/' + this.props.Soundcast.id + '/users/' + userId] = userId
    // firebase.database().ref().update(updates)

    // that.props.history.push('/confirmation')
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

    const soundcastName = this.props.soundcast.title.split(' ').join('%20');
    let displayedPrice = 'Free';
    let {prices} = this.props.soundcast;

    if(prices && prices.length > 0 && prices[0].price != 'free' ) {
        prices = prices.map(price => {
            if(price.billingCycle == 'one time' || price.billingCycle == 'monthly' ) {
                price.measure = price.price;
            } else if(price.billingCycle == 'quarterly') {
                price.measure = Math.floor(price.price / 3 *100) / 100;
            } else if(price.billingCycle == 'annual') {
                price.measure = Math.floor(price.price / 12 *100) / 100;
            }
            return price;
        });

        prices.sort((a, b) => (
            a.measure - b.measure
        ));
        // console.log('prices: ', prices);
        displayedPrice = prices[0].billingCycle == 'one time' ?
                            `$${prices[0].measure}` :
                            `$${prices[0].measure} / month`;
    }


    return (
      <div>
        <section className=" bg-white" id="content-section23" style={{paddingBottom: 15, paddingTop: 35}}>
            <div className="container">
                <div className="row equalize sm-equalize-auto equalize-display-inherit">
                    <div className="col-md-6 col-sm-12 col-xs-12 display-table margin-six-left sm-no-margin" style={{height: '378px'}}>
                        <div className="display-table-cell-vertical-middle">
                            <div className="row" style={{height: '80%'}}>
                                <div className="col-md-12 col-sm-12 col-xs-12">
                                    <div style={{height: 80, display: 'flex', alignItems: 'center',}}>
                                      <h2 className="title-extra-large alt-font sm-section-title-medium xs-title-extra-large text-dark-gray  tz-text">{this.props.soundcast.title}</h2>
                                    </div>
                                    <div style={{height: 160, paddingTop: 15}}>
                                      <span className="text-extra-large sm-text-extra-large font-weight-500 margin-ten-bottom xs-margin-fifteen-bottom display-block tz-text">{`${this.props.soundcast.short_description}`}</span>
                                    </div>
                                    <div className="social social-icon-color text-extra-large sm-text-extra-large  margin-ten-bottom xs-margin-fifteen-bottom display-block tz-text" style={{display: 'flex', alignItems: 'center'}}>
                                        <span className="margin-eight-right title-small sm-title-small">
                                          Share this soundcast:
                                        </span>
                                        <a target="_blank" href={`http://www.facebook.com/sharer/sharer.php?u=https://mysoundwise.com/Soundcasts/${this.props.soundcastID}`} className="margin-eight-right">
                                            <i className="icon-large sm-icon-extra-small fa fa-facebook tz-icon-color"></i>
                                        </a>
                                        <a target="_blank" href={`https://twitter.com/intent/tweet?text=${soundcastName}. https://mysoundwise.com/soundcasts/${this.props.soundcastID}`} className="margin-eight-right">
                                            <i className="icon-large sm-icon-extra-small fa fa-twitter tz-icon-color"></i>
                                        </a>
                                        <a target="_blank" href={`https://plus.google.com/share?url=https://mysoundwise.com/Soundcasts/${this.props.soundcastID}`} className="margin-eight-right">
                                            <i className="icon-large sm-icon-extra-small fa fa-google-plus tz-icon-color"></i>
                                        </a>
                                        <a target="_blank" href={`https://www.linkedin.com/shareArticle?mini=true&amp;url=https%3A//mysoundwise.com/Soundcasts/${this.props.soundcastID}&amp;title=${soundcastName}&amp;source=`} className="margin-eight-right">
                                            <i className="icon-large sm-icon-extra-small fa fa-linkedin tz-icon-color"></i>
                                        </a>
                                    </div>
                                </div>
                            </div>
                            <div className="row" style={{paddingBottom: '30px'}}>
                                <div className="col-md-6 col-sm-6 col-xs-6 feature-box-details-second">
                                  <span className="title-large alt-font sm-section-title-medium xs-title-extra-large text-dark-gray margin-five-bottom xs-margin-ten-bottom tz-text">{displayedPrice}</span>
                                </div>
                                <div className="col-md-5 col-sm-6 col-xs-6">
                                  <a className="btn-medium btn btn-circle text-white no-letter-spacing" onClick={this.props.openModal} style={{backgroundColor: '#F76B1C'}}
                                  >
                                    <span className="text-extra-large sm-text-extra-large tz-text">SUBSCRIBE</span>
                                    {this.renderProgressBar()}
                                  </a>
                                  <div style={{color: 'red'}}>{this.state.paymentError}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-5 col-sm-12 col-xs-12  sm-margin-fifteen-bottom" style={{height: '378px', display: 'flex', justifyContent: 'flex-end'}}>
                        <div className="" style={{display: 'inline-block', position: 'relative', width: '350px', height: '350px'}}>
                            <img
                                src={this.props.soundcast.imageURL}
                                data-img-size="(W)450px X (H)450px"
                                alt=""
                                style={{width: '350px', height: '350px', display: 'block'}}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <SoundcastSignup soundcast={this.props.soundcast}/>
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

// function mapDispatchToProps(dispatch) {
//   return bindActionCreators({ openConfirmationbox, openSignupbox, addSoundcastToCart }, dispatch)
// }

const SoundcastHeader_worouter = connect(mapStateToProps, null)(_SoundcastHeader)

export const SoundcastHeader = withRouter(SoundcastHeader_worouter)