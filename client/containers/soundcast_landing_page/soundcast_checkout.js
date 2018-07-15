import React, {Component} from 'react';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import firebase from 'firebase';
import moment from 'moment';
import Dots from 'react-activity/lib/Dots';

import PageHeader from './components/page_header';
import Payment from './components/payment';
import SoundcastInCart from './components/soundcast_in_cart';
import Notice from '../../components/notice';
import { sendEmail, signinUser, signupUser } from '../../actions/index';
import { GreyInput } from '../../components/inputs/greyInput';
import { minLengthValidator } from '../../helpers/validators';
import { OrangeSubmitButton } from '../../components/buttons/buttons';
import { signInPassword, signInFacebook, signupCommon, facebookErrorCallback } from '../commonAuth';

const provider = new firebase.auth.FacebookAuthProvider();

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
      coupon: '',
      runSignIn: false,
      showFacebook: true,
      showPassword: true,
      hideCardInputs: false,
    }

    this.publisherID = moment().format('x') + 'p';
    this.setTotalPrice = this.setTotalPrice.bind(this);
    this.handleStripeId = this.handleStripeId.bind(this);
    this.signupCallback = this.signupCallback.bind(this);
    this.signinCallback = this.signinCallback.bind(this);
    this.setAddSoundcastToUser = this.setAddSoundcastToUser.bind(this);
  }

  async componentDidMount() {
    const {location} = this.props.history;
    if(location.state && location.state.soundcast) {
      const {soundcast, soundcastID, checked, sumTotal, userInfo, soundcastUser} = location.state;
      this.setSoundcastData(soundcast, soundcastID, checked, sumTotal, userInfo, soundcastUser);
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

  setSoundcastData(soundcast, soundcastID, checked, sumTotal, userInfo, soundcastUser) {
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
    if (soundcastUser) {
      const that = this;
      (function timer() {
        if (that.addSoundcastToUser) {
          that.addSoundcastToUser(null, userInfo, that.props.signinUser, soundcastID);
        } else {
          setTimeout(timer, 150);
        }
      }());
    }
  }

  setTotalPrice(totalPrice, coupon) {
    this.setState({ totalPrice, coupon });
    if (Number(totalPrice) === 0) {
      const {userInfo} = this.props;
      if (userInfo && userInfo.email) { // logged in
        this.addSoundcastToUser(null, userInfo, this.props.signinUser, this.state.soundcastID);
      } else {
        this.setState({ hideCardInputs: true }); // skip card input
      }
    }
  }

  setAddSoundcastToUser(addSoundcastToUser) {
    this.addSoundcastToUser = addSoundcastToUser;
  }

  handleStripeId(charge, state) { // success payment callback
    // The app should check whether the email address of the user already has an account.
    // The stripe id associated with the user's credit card should be saved in user's data
    const {email, firstName, lastName} = state;
    firebase.auth().fetchSignInMethodsForEmail(email)
    .then(providerInfo => {
      const newState = {
        lastStep: true,
        charge,
        email,
        firstName,
        lastName,
      };
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

  handleChange(field, e) {
    this.setState({ [field]: e.target.value })
  }

  handleFBAuth() {
    const {runSignIn} = this.state;
    const {signinUser, history} = this.props;
    if(runSignIn) {
      signInFacebook(this.signinCallback, error => this.setState({ message: error.toString() }));
    } else { // sign up
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
                signupCommon(user, null, this.signupCallback);
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
                signupCommon(snapshot.val(), null, this.signupCallback);
              });
            }
          });
        });
      });
    }
  }

  signupCallback(user) {
    console.log('Success signup', user);
    this.props.signupUser(user);
    this.addSoundcastToUser(this.state.charge, user, this.props.signinUser, this.state.soundcastID);
  }

  signinCallback(user) {
    console.log('Success signin', user);
    this.props.signinUser(user);
    this.addSoundcastToUser(this.state.charge, user, this.props.signinUser, this.state.soundcastID);
  }

  async submitPassword() {
    const {runSignIn, firstName, lastName, email, password} = this.state;
    if(runSignIn) {
      signInPassword(email, password, this.signinCallback,
        error => this.setState({ message: error.toString() })
      );
    } else { // sign up
      try {
        await firebase.auth().createUserWithEmailAndPassword(email, password);
        signupCommon(this.state, null, this.signupCallback);
      } catch (error) {
        this.setState({ message: error.toString() });
        console.log('Error submitPassword', error.toString());
      }
    }
  }

  render() {
    const {soundcast, soundcastID, checked, sumTotal,
           totalPrice, message, coupon, hideCardInputs} = this.state;
    const {userInfo, history} = this.props;

    if(!soundcast) {
      return (
        <div>
          <PageHeader />
          <section className="padding-110px-tb xs-padding-60px-tb bg-white builder-bg border-none" id="title-section1">
            <div className="container">
              <div className="row">
                <div style={{width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '1em'}}>
                  <Dots style={{display: 'flex'}} color="#727981" size={32} speed={1}/>
                </div>
              </div>
            </div>
          </section>
        </div>
      )
    } else if(soundcast && this.state.lastStep) {
      console.log('soundcast 1: ', soundcast);
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
                        <SoundcastInCart
                          lastStep={true}
                          soundcast={soundcast}
                        />
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
      console.log('soundcast 2: ', soundcast);
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
                          history={history}
                          soundcast={soundcast}
                          checked={checked}
                          sumTotal={sumTotal}
                          setTotalPrice={this.setTotalPrice}
                        />
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </section>
          {
          <Payment
            soundcast={soundcast}
            soundcastID={soundcast.bundle? soundcast.soundcastsIncluded :soundcastID}
            isBundle={soundcast.bundle}
            checked={checked}
            totalPrice={totalPrice}
            userInfo={userInfo}
            sumTotal={sumTotal}
            history={history}
            coupon={coupon}
            isEmailSent={this.props.isEmailSent}
            sendEmail={this.props.sendEmail}
            handleStripeId={this.handleStripeId}
            setAddSoundcastToUser={this.setAddSoundcastToUser}
            hideCardInputs={hideCardInputs}
          />
          }
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
