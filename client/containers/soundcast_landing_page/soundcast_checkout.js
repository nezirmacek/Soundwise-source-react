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
import { sendEmail, signinUser, signupUser } from '../../actions/index';
import { GreyInput } from '../../components/inputs/greyInput';
import { minLengthValidator } from '../../helpers/validators';
import { OrangeSubmitButton } from '../../components/buttons/buttons';
import { signIn, signInFacebook, signupCommon, facebookErrorCallback } from '../commonAuth';

class _SoundcastCheckout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      success: false,
      lastStep: false, // last step dialog
      message: '',
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      runSignIn: false,
      showFacebook: true,
      showPassword: true,
      platformCustomer: null,
    }

    this.publisherID = moment().format('x') + 'p';
    this.handlePaymentSuccess = this.handlePaymentSuccess.bind(this);
    this.setTotalPrice = this.setTotalPrice.bind(this);
    this.handleStripeId = this.handleStripeId.bind(this);
    this.checkStripeId = this.checkStripeId.bind(this);
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

  handleStripeId(charge, userInfo, state) { // success payment callback
    // The app should check whether the email address of the user already has an account.
    // The stripe id associated with the user's credit card should be saved in user's data
    if (!(userInfo && userInfo.email)) { // not logged in
      const {email, firstName, lastName} = state;
      firebase.auth().fetchSignInMethodsForEmail(email)
      .then(providerInfo => {
        const platformCustomer = charge ? (charge.platformCustomer || charge.stripe_id) : null;
        const newState = { lastStep: true, email, firstName, lastName, platformCustomer };
        // TODO add firstName, lastName, email validation
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

  checkStripeId(user) {
    const {platformCustomer} = this.state;
    if (platformCustomer && user.stripe_id !== platformCustomer) {
      firebase.database().ref(`users/${user.uid}/stripe_id`).set(platformCustomer);
      user.stripe_id = platformCustomer;
      signinUser(user);
    }
  }

  handleFBAuth() {
    const {runSignIn, firstName, lastName} = this.state;
    const {signinUser, signupCommon, history, match} = this.props;
    if(runSignIn) {
      signInFacebook(
        signinUser, history, match,
        user => checkStripeId(user),
        error => this.setState({ message: error.toString() })
      );
    } else { // sign up
      // TODO
      firebase.auth().signInWithPopup(provider).then(result => {
        firebase.auth().onAuthStateChanged(user => {
          if (user) {
            const userId = user.uid;
            firebase.database().ref('users/' + userId)
            .once('value')
            .then(snapshot => {
              let _user = snapshot.val();
              if(_user && _user.firstName) {
                console.log('user already exists');
                let updates = {};
                updates['/users/' + userId + '/pic_url/'] = _user.pic_url;
                firebase.database().ref().update(updates);

                _user.pic_url = _user.photoURL;
                delete _user.photoURL;
                signinUser(_user);

                if (_user.admin) {
                  history.push('/dashboard/soundcasts');
                } else if (_user.soundcasts) {
                  history.push('/mysoundcasts');
                } else {
                  history.push('/myprograms');
                }
              } else {  //if it's a new user
                const { email, photoURL, displayName } = JSON.parse(JSON.stringify(result.user));
                const name = displayName ? displayName.split(' ') : ['User', ''];
                const user = {
                  firstName: name[0],
                  lastName: name[1],
                  email,
                  pic_url: photoURL ? photoURL : '../images/smiley_face.jpg',
                };
                signupCommon(signupUser, history, match, that.publisherID, user);
              }
            });
          }
        });
      })
      .catch(error => {
        facebookErrorCallback(error, () => {
          // Facebook account successfully linked to the existing Firebase user.
          firebase.auth().onAuthStateChanged(user => {
            if (user) {
              const userId = user.uid;
              firebase.database().ref('users/' + userId)
              .once('value')
              .then(snapshot => {
                const { firstName, lastName, email, pic_url } = snapshot.val();
                const user = { firstName, lastName, email, pic_url };
                signupCommon(signupUser, history, match, this.publisherID, user);
              });
            }
          });
        });
      });
    }
  }

  async submitPassword() {
    const {runSignIn, firstName, lastName, email, password} = this.state;
    const {signinUser, signupUser, history, match} = this.props;
    if(runSignIn) {
      signIn(
        email, password, signinUser, history, match,
        user => checkStripeId(user),
        error => this.setState({ message: error.toString() })
      );
    } else { // sign up
      const {firstName, lastName, email, password, pic_url} = this.state;
      try {
        await firebase.auth().createUserWithEmailAndPassword(email, password);
        this.setState({message: 'account created'});
        signupCommon(signupUser, history, match, this.publisherID, this.state);
        return true;
      } catch (error) {
        this.setState({ message: error.toString() });
        console.log('Error submitPassword', error.toString());
      }
    }
  }

  render() {
    const {soundcast, soundcastID, checked, sumTotal, totalPrice, message} = this.state;
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
                        { message &&
                          <div style={{paddingBottom: 25}}>
                            <span style={{color: 'red', fontSize: 16}}>{message}</span>
                          </div>
                        }
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
    return bindActionCreators({ sendEmail, signinUser, signupUser }, dispatch);
}

const Checkout_worouter = connect(mapStateToProps, mapDispatchToProps)(_SoundcastCheckout);

export const SoundcastCheckout = withRouter(Checkout_worouter);
