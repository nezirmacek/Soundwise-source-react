import React, {Component} from 'react';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import firebase from 'firebase';

import  PageHeader  from './components/page_header';
import Payment from './components/payment';
import SoundcastInCart from './components/soundcast_in_cart';
import Notice from '../../components/notice';
import { sendEmail, signinUser } from '../../actions/index';
import { GreyInput } from '../../components/inputs/greyInput';
import { minLengthValidator } from '../../helpers/validators';
import { OrangeSubmitButton } from '../../components/buttons/buttons';
import { signIn } from '../common';

class _SoundcastCheckout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      success: false,
      lastStep: false, // last step dialog
      firstname: '',
      lastname: '',
      email: '',
      password: '',
      runSignIn: false,
      showFacebook: true,
      showPassword: true,
      platformCustomer: null,
    }
    this.handlePaymentSuccess = this.handlePaymentSuccess.bind(this);
    this.setTotalPrice = this.setTotalPrice.bind(this);
    this.handleStripeId = this.handleStripeId.bind(this);
  }

  async componentDidMount() {
    const {location} = this.props.history;
    if(location.state && location.state.soundcast) {
      const {soundcast, soundcastID, checked, sumTotal} = location.state;
      this.setSoundcastData(soundcast, soundcastID, checked, sumTotal);
    } else if (location.search.includes('?soundcast_id=')) {
      const params = new URLSearchParams(location.search);
      const soundcastID = params.get('soundcast_id');
      const checked = Number(params.get('checked')) || 0;
      const _soundcast =  await firebase.database().ref('soundcasts/' + soundcastID).once('value');
      const soundcast = _soundcast.val();
      if (soundcast) {
        const sumTotal = soundcast.prices[checked].price === 'free' ? '' : `Total today: $${Number(soundcast.prices[checked].price).toFixed(2)}`;
        this.setSoundcastData(soundcast, soundcastID, checked, sumTotal);
      } else {
        this.props.history.push('/notfound');
      }
    }
  }

  setSoundcastData(soundcast, soundcastID, checked, sumTotal) {
    let totalPrice;
    if(soundcast.prices[checked].price == 'free') {
      totalPrice = 0;
    } else {
      totalPrice = Number(soundcast.prices[checked].price);
    }
    this.setState({
      totalPrice,
      soundcast,
      soundcastID,
      checked,
      sumTotal,
    });
  }

  handlePaymentSuccess() {
    const {soundcast, soundcastID, checked, sumTotal} = this.state;
    this.setState({ success: true });
    // this.props.history.push('/mysoundcasts');
    const text = `Thanks for subscribing to ${soundcast.title}. We'll send you an email with instructions to download the Soundwise app. If you already have the app on your phone, your new soundcast will be automatically loaded once you sign in to your account.`;
    this.props.history.push({
      pathname: '/notice',
      state: {
        text,
        soundcastTitle: soundcast.title,
        soundcast,
        soundcastID,
        checked,
        sumTotal,
        ios: 'https://itunes.apple.com/us/app/soundwise-learn-on-the-go/id1290299134?ls=1&mt=8',
        android: 'https://play.google.com/store/apps/details?id=com.soundwisecms_mobile_android'
      }
    });
  }

  setTotalPrice(totalPrice) {
    this.setState({ totalPrice });
  }

  handleStripeId(charge, userInfo, state) {
    // The app should check whether the email address of the user already has an account.
    // The stripe id associated with the user's credit card should be saved in user's data
    if (!(userInfo && userInfo.email)) { // not logged in
      const {email, firstName, lastName} = state;
      firebase.auth().fetchSignInMethodsForEmail(email)
      .then(providerInfo => {
        const platformCustomer = charge ? (charge.platformCustomer || charge.stripe_id) : null;
        const newState = { lastStep: true, email, firstName, lastName, platformCustomer };
        // if user has an account, the providerInfo is either ['facebook.com'] or ['password']
        // if the user doesn't have account, the providerInfo returns empty array, []
        if (providerInfo && providerInfo.length) { // registered
          // If yes, app should sign in the user with the password entered or through FB;
          newState.runSignIn = true;
          newState.showFacebook = providerInfo.indexOf('facebook.com') !== -1;
          newState.showPassword = providerInfo.indexOf('password') !== -1;
        }
        // If no, app should create a new account
        this.setState(newState);
      })
      .catch(err => {
        console.log('Payments fetchSignInMethodsForEmail', err);
      });
    }
  }

  handleChange(field, e) {
    this.setState({ [field]: e.target.value })
  }

  handleFBAuth() {
    const {runSignIn, firstName, lastName, email, password} = this.state;
    if(runSignIn) {

    } else { // sign up
      // TODO
    }
  }

  submitPassword() {
    const {runSignIn, firstName, lastName, email, password} = this.state;
    const {signinUser, history, match} = this.props;
    if(runSignIn) {
      signIn(email, password, signinUser, history, match, user => {
        if (platformCustomer && user.stripe_id !== platformCustomer) {
          firebase.database().ref(`users/${user.uid}/stripe_id`).set(platformCustomer);
          user.stripe_id = platformCustomer;
          signinUser(user);
        }
      }, error => this.setState({ message: error.toString() }));
    } else { // sign up
      // TODO
    }
  }

  render() {
    const {soundcast, soundcastID, checked, sumTotal, totalPrice} = this.state;
    const {userInfo} = this.props;

    if(!soundcast) {
      return (
        <div>
          <PageHeader />
          <section className="padding-110px-tb xs-padding-60px-tb bg-white builder-bg border-none" id="title-section1">
            <div className="container">
              <div className="row">
                <div className="col-md-12 col-sm-12 col-xs-12 text-center">
                  <h2 className="section-title-large sm-section-title-medium text-dark-gray font-weight-600 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text">YOUR CART IS EMPTY</h2>
                </div>
              </div>
            </div>
          </section>
        </div>
      )
    } else if(soundcast && this.state.lastStep) {
      return (
        <div>
          <PageHeader />
          <section className="bg-white border-none">
            <div className="container">
              <div className="row">
                <section className="bg-white" id="content-section23" >
                  <div className="container">
                    <div className="row equalize sm-equalize-auto equalize-display-inherit">
                      <div className="col-md-6 col-sm-12 center-col sm-no-margin" style={{textAlign: 'center'}}>
                        <SoundcastInCart soundcast={soundcast} />
                        <div style={{fontSize: 19, fontWeight: 700, padding: '55px 0 25px'}}>
                          {this.state.runSignIn ? 'Final step: sign in to your Soundwise account'
                                                : 'One last step...'}
                        </div>
                        { this.state.showFacebook &&
                          <button
                              onClick={() => this.handleFBAuth()}
                              className="text-white btn btn-medium propClone btn-3d builder-bg tz-text bg-blue tz-background-color"
                              style={styles.fb}
                          >
                            <i className="fab fa-facebook-f icon-extra-small margin-four-right tz-icon-color vertical-align-sub" style={styles.fbIcon}></i>
                            <span className="tz-text">SIGN IN with FACEBOOK</span>
                          </button>
                        }
                        <div style={{fontStyle: 'italic', padding: '18px 0 22px'}}>
                          {!this.state.runSignIn ? 'or set a password' : (
                              this.state.showPassword ?
                                `${this.state.showFacebook ? 'or e' : 'E'}nter your password` : ''
                            )
                          }
                        </div>
                        { this.state.showPassword &&
                          <div>
                            <GreyInput
                                type='password'
                                styles={{ width: 270 }}
                                placeholder={'Password'}
                                onChange={this.handleChange.bind(this, 'password')}
                                value={this.state.password}
                                validators={[minLengthValidator.bind(null, 1)]}
                            />
                            <OrangeSubmitButton
                                styles={{marginTop: 15, marginBottom: 15}}
                                label='SIGN IN'
                                onClick={this.submitPassword.bind(this)}
                            />
                          </div>
                        }
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </section>
        </div>
      )
    } else if(soundcast && !this.state.success) {
      return (
        <div>
          <PageHeader />
          <section className="bg-white border-none">
            <div className="container">
              <div className="row">
                <section className="bg-white" id="content-section23" >
                  <div className="container">
                    <div className="row equalize sm-equalize-auto equalize-display-inherit">
                      <div className="col-md-6 col-sm-12 center-col sm-no-margin" style={{height: ''}}>
                        <SoundcastInCart
                          soundcast={soundcast}
                          checked={checked}
                          sumTotal={sumTotal}
                          setTotalPrice={this.setTotalPrice}
                        />
                      </div>
                      <div className="row">
                        <div className="col-md-12 col-sm-12 col-xs-12">

                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </section>
          <Payment
            soundcast={soundcast}
            soundcastID={soundcastID}
            checked={checked}
            total={totalPrice}
            userInfo={userInfo}
            handlePaymentSuccess={this.handlePaymentSuccess}
            isEmailSent={this.props.isEmailSent}
            sendEmail={this.props.sendEmail}
            handleStripeId={this.handleStripeId}
          />
        </div>
      )
    } else {
      return (
        <div></div>
      )
    }
  }
}

const styles = {
  fb: {
    width: 270,
    height: 44,
    marginTop: 10,
    marginBottom: 10
  },
  fbIcon: {
    marginLeft: 0,
    marginRight: 20,
    position: 'relative',
    bottom: 2,
    right: '10%',
  },
}

const mapStateToProps = state => {
    const { userInfo, isLoggedIn, isEmailSent } = state.user;
    return { userInfo, isLoggedIn, isEmailSent};
};

function mapDispatchToProps(dispatch) {
    return bindActionCreators({ sendEmail, signinUser }, dispatch);
}

const Checkout_worouter = connect(mapStateToProps, mapDispatchToProps)(_SoundcastCheckout);

export const SoundcastCheckout = withRouter(Checkout_worouter);
