import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as firebase from 'firebase';
import 'url-search-params-polyfill';
import {orange500, blue500} from 'material-ui/styles/colors';
import {
    Route,
    Link,
    Redirect
} from 'react-router-dom';
import { withRouter } from 'react-router';

import { signinUser } from '../actions/index';
import Colors from '../styles/colors';
import { GreyInput } from '../components/inputs/greyInput';
import { minLengthValidator, emailValidator } from '../helpers/validators';
import { OrangeSubmitButton } from '../components/buttons/buttons';
import { signIn, compileUser } from './common';

var provider = new firebase.auth.FacebookAuthProvider();

class _AppSignin extends Component {
    constructor(props) {
        super(props);

        this.state = {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            message: '',
            pic_url: '',
            courses: '',
            redirectToReferrer: false,
        };

        this.publisherID = null;
    }

    componentDidMount() {
        // console.log('params in signin: ', this.props.match.params);
        if(this.props.match.params.id) {
            this.publisherID = this.props.match.params.id;
        }
        if(this.props.history.location.state) {
            const {soundcast, soundcastID, checked, sumTotal} = this.props.history.location.state;
            this.setState({
                soundcast,
                soundcastID,
                checked,
                sumTotal
            });
        }
    }

    signInClick() {
      const { email, password } = this.state;
      const { signinUser, history, match } = this.props;
      signIn(email, password, signinUser, history, match, user => {
        // console.log('Signin success', user);
      }, error => {
        this.setState({ message: error.toString() });
      });
    }

    signInInvitedAdmin() {
        const { match, history } = this.props;
          firebase.auth().onAuthStateChanged(user => {
                if (user) {
                    const userId = user.uid;
                    firebase.database().ref(`publishers/${match.params.id}/administrators/${userId}`).set(true);
                    firebase.database().ref(`publishers/${match.params.id}/soundcasts`)
                    .once('value')
                    .then(snapshot => {
                        firebase.database().ref(`users/${userId}/soundcasts_managed`).set(snapshot.val());
                        firebase.database().ref(`users/${userId}/admin`).set(true);
                        firebase.database().ref(`users/${userId}/publisherID`).set(match.params.id);
                        console.log('completed adding publisher to invited admin');
                    })
                    .then(() => {
                        firebase.database().ref(`users/${userId}`)
                        .on('value', snapshot => {
                            const _user = snapshot.val();
                            compileUser(_user, signinUser);
                        });
                    })
                    .then(() => {
                        history.push('/dashboard/soundcasts');
                    });
                } else {
                    // alert('profile saving failed. Please try again later.');
                    // Raven.captureMessage('invited admin saving failed!')
                }
          });
    }

    handleChange(field, e) {
        this.setState({
            [field]: e.target.value
        })
    }

    componentWillMount() {

    }

    handleFBAuth() {
        const that = this;
        const {history, userInfo, signinUser, match} = this.props;
        let soundcast, soundcastID, checked, sumTotal;
        if(history.location.state && history.location.state.soundcast) {
            soundcast = history.location.state.soundcast;
            soundcastID = history.location.state.soundcastID;
            checked = history.location.state.checked;
            sumTotal = history.location.state.sumTotal;
        }
        // firebase.auth().signInWithRedirect(provider)

        firebase.auth().signInWithPopup(provider).then(function(result) {
            // This gives you a Facebook Access Token. You can use it to access the Facebook API.
            // The signed-in user info.
            const userId = firebase.auth().currentUser.uid;
            firebase.database().ref('users/' + userId)
                .once('value')
                .then(snapshot => {
                    if(snapshot.val() && typeof(snapshot.val().firstName) !== 'undefined') { // if user already exists
                        let updates = {};
                        updates['/users/' + userId + '/pic_url/'] = snapshot.val().pic_url;
                        firebase.database().ref().update(updates);

                        let _user = snapshot.val();
                        _user.pic_url = _user.photoURL;
                        delete _user.photoURL;
                        signinUser(_user);

                        if (history.location.state && history.location.state.soundcast) {
                            compileUser(_user, signinUser);
                            history.push('/soundcast_checkout', {
                                soundcast: history.location.state.soundcast,
                                soundcastID: history.location.state.soundcastID,
                                checked: history.location.state.checked,
                                sumTotal: history.location.state.sumTotal,
                            });
                        } else if (_user.admin) {
                            compileUser(_user, signinUser);
                            history.push('/dashboard/soundcasts');
                        } else if(match.params.id) {
                            that.signInInvitedAdmin();
                        } else {
                            history.push('/myprograms');
                        }
                    } else {  //if it's a new user

                        // const { email, photoURL: pic_url, displayName } = result.user;
                        // const name = displayName.split(' ');
                        // const _userToRegister = {
                        //     firstName: name[0],
                        //     lastName: name[1],
                        //     email,
                        //     pic_url,
                        // };
                        //
                        // firebase.database().ref('users/' + userId).set(_userToRegister);
                        // signinUser(_userToRegister);
                        // // from login page now register subscribers by default
                        // history.push('/myprograms');

                        alert('You don’t have a Soundwise account. Please create or sign up for a soundcast to get started.');
                        if(match.params.id) {
                            history.push(`/signup/admin/${match.params.id}`);
                        } else {
                            history.push('/signup');
                        }
                    }
                })
        }).catch(function(error) {
            // Handle Errors here.
            if (error.code === 'auth/account-exists-with-different-credential') {
                // Step 2.
                // User's email already exists.
                // The pending Facebook credential.

                // that.setState({
                //     message: error.toString()
                // })
                console.log('facebook error');
                var pendingCred = error.credential;
                // The provider account's email address.
                var email = error.email;
                // Get registered providers for this email.
                firebase.auth().fetchProvidersForEmail(email).then(function(providers) {
                    // Step 3.
                    // If the user has several providers,
                    // the first provider in the list will be the "recommended" provider to use.
                    if (providers[0] === 'password') {
                        // Asks the user his password.
                        // In real scenario, you should handle this asynchronously.
                        var password = prompt('Please enter your Soundwise password'); // TODO: implement promptUserForPassword.
                        firebase.auth().signInWithEmailAndPassword(email, password).then(function(user) {
                            // Step 4a.
                            return user.link(pendingCred)
                        }).then(function() {
                            // Facebook account successfully linked to the existing Firebase user.
                              firebase.auth().onAuthStateChanged(function(user) {
                                    if (user) {
                                        const userId = user.uid;
                                        firebase.database().ref('users/' + userId)
                                            .once('value')
                                            .then(snapshot => {
                                                const _user = snapshot.val();
                                                const firstName = snapshot.val().firstName;
                                                const lastName = snapshot.val().lastName;
                                                const email = snapshot.val().email[0];
                                                const courses = snapshot.val().courses;
                                                const soundcasts = snapshot.val().soundcasts;
                                                const pic_url = snapshot.val().pic_url;

                                                signinUser(_user);

                                                if (soundcast) {
                                                    compileUser(_user, signinUser);
                                                    history.push('/soundcast_checkout', {soundcast, soundcastID, checked, sumTotal});
                                                } else if (_user.admin && !match.params.id) {
                                                    compileUser(_user, signinUser);
                                                    history.push('/dashboard/soundcasts');
                                                } else if(match.params.id) {
                                                    that.signInInvitedAdmin();
                                                } else {
                                                    history.push('/myprograms');
                                                }
                                            });
                                    } else {
                                        // alert('User saving failed. Please try again later.');
                                        // Raven.captureMessage('user saving failed!')
                                    }
                              });
                        })
                    }

                })
            }
        })
    }

    render() {
        const { firstName, lastName, email, password, redirectToReferrer, message, soundcast, checked, sumTotal } = this.state
        const { from } = this.props.location.state || { from: { pathname: '/courses' } }
        const {history} = this.props;

        if(redirectToReferrer) {
            return (
                <Redirect to={from} />
            )
        }
        return (
            <div className="row" style={{...styles.row, height: window.innerHeight, overflow: 'auto'}}>
                {
                    soundcast &&
                    <div className='col-lg-8 col-md-12 col-sm-12 col-xs-12 center-col'>
                        <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12  text-center">
                            <img className='hidden-xs' alt="Soundwise Logo" src={soundcast.imageURL} style={{...styles.logo, height: 120}}/>
                            <div style={styles.containerWrapper}>
                                <div style={styles.container} className="center-col text-center">
                                    <div style={{...styles.title, fontSize: 20, lineHeight: 'normal'}}>
                                      {soundcast.title}
                                    </div>
                                    <button
                                        onClick={() => this.handleFBAuth()}
                                        className="text-white btn btn-medium propClone btn-3d width-60 builder-bg tz-text bg-blue tz-background-color"
                                        style={styles.fb}
                                    >
                                        <i
                                            className="fab fa-facebook-f icon-extra-small margin-four-right tz-icon-color vertical-align-sub"
                                            style={styles.fbIcon}
                                        ></i>
                                        <span className="tz-text">SIGN IN with FACEBOOK</span>
                                    </button>
                                    <hr />
                                    <span style={styles.withEmailText}>or with email</span>
                                </div>
                                <div style={styles.container} className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                    <GreyInput
                                        type="email"
                                        styles={{}}
                                        wrapperStyles={styles.inputTitleWrapper}
                                        placeholder={'Email'}
                                        onChange={this.handleChange.bind(this, 'email')}
                                        value={email}
                                        validators={[minLengthValidator.bind(null, 1)]}
                                    />
                                    <GreyInput
                                        type="password"
                                        styles={{}}
                                        wrapperStyles={styles.inputTitleWrapper}
                                        placeholder={'Password'}
                                        onChange={this.handleChange.bind(this, 'password')}
                                        value={password}
                                        validators={[minLengthValidator.bind(null, 1)]}
                                    />
                                    <div><span style={{color: 'red', fontSize: 16,}}>{message}</span></div>
                                    <OrangeSubmitButton
                                        styles={{marginTop: 15, marginBottom: 15}}
                                        label="Get Access"
                                        onClick={this.signInClick.bind(this)}
                                    />
                                    <div style={{fontSize: 14, textDecoration: 'underline', marginBottom: 20}}>
                                      <Link  to='/password_reset'>Forgot your password? </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='col-lg-6 col-md-6 col-sm-6 col-xs-12'>
                            <div className='margin-twenty-one-top sm-margin-nineteen-top title-medium text-dark-gray' style={{paddingBottom: 35, textAlign: 'center'}}><span>{soundcast.title}</span></div>
                            <div style={{marginBottom: 20, fontSize: 15}} className='text-large text-center text-dark-gray'>{soundcast.short_description}</div>
                            <ul className="" style={{paddingBottom: '1em', display: 'flex', flexWrap: 'wrap'}}>
                                {soundcast.features && soundcast.features.map((feature, i) => {
                                    return (
                                        <li key={i} className=" text-dark-gray text-large  margin-lr-auto col-md-12 col-sm-12 col-xs-12 tz-text" style={{paddingLeft: '0em', paddingRight: '1em', paddingTop: '1em', paddingBottom: '1em', listStyleType: 'none', display: 'flex', alignItems: 'center', }}><span style={{paddingRight: 10}}>
                                            ⭐</span>{feature}
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>
                    </div>
                    ||
                    <div className="col-lg-4 col-md-6 col-sm-8 col-xs-12 center-col text-center">
                        <img className='hidden-xs' alt="Soundwise Logo" src="/images/soundwiselogo.svg" style={styles.logo}/>
                        <div style={styles.containerWrapper}>
                            <div style={styles.container} className="center-col text-center">
                                <div style={{...styles.title, lineHeight: 'normal'}}>
                                  {history.location.state && history.location.state.text || 'Hello!'}
                                </div>
                                <button
                                    onClick={() => this.handleFBAuth()}
                                    className="text-white btn btn-medium propClone btn-3d width-60 builder-bg tz-text bg-blue tz-background-color"
                                    style={styles.fb}
                                >
                                    <i
                                        className="fab fa-facebook-f icon-extra-small margin-four-right tz-icon-color vertical-align-sub"
                                        style={styles.fbIcon}
                                    ></i>
                                    <span className="tz-text">SIGN IN with FACEBOOK</span>
                                </button>
                                <hr />
                                <span style={styles.withEmailText}>or with email</span>
                            </div>
                            <div style={styles.container} className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                <GreyInput
                                    type="email"
                                    styles={{}}
                                    wrapperStyles={styles.inputTitleWrapper}
                                    placeholder={'Email'}
                                    onChange={this.handleChange.bind(this, 'email')}
                                    value={email}
                                    validators={[minLengthValidator.bind(null, 1)]}
                                />
                                <GreyInput
                                    type="password"
                                    styles={{}}
                                    wrapperStyles={styles.inputTitleWrapper}
                                    placeholder={'Password'}
                                    onChange={this.handleChange.bind(this, 'password')}
                                    value={password}
                                    validators={[minLengthValidator.bind(null, 1)]}
                                />
                                <div><span style={{color: 'red', fontSize: 16,}}>{message}</span></div>
                                <OrangeSubmitButton
                                    styles={{marginTop: 15, marginBottom: 15}}
                                    label="SIGN IN"
                                    onClick={this.signInClick.bind(this)}
                                />
                                <div style={{fontSize: 14, textDecoration: 'underline'}}>
                                  <Link  to='/password_reset'>Forgot your password? </Link>
                                </div>
                                <div style={{marginBottom: 10, marginTop: 15,}}>
                                    <span style={styles.italicText}>Don't have an account? </span>
                                    <Link to="/signup/admin" style={{...styles.italicText, color: Colors.link, marginLeft: 5}}>
                                        Sign up >
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                }

            </div>
        )
    }
}

const styles = {
  row: {
    backgroundColor: Colors.window,
    paddingTop: 15,
    paddingRight: 0,
    paddingBottom: 0,
    paddingLeft: 0,
  },
  logo: {
    marginBottom: 18,
  },
  containerWrapper: {
    overflow: 'hidden',
    borderRadius: 3,
    width: 'auto',
    backgroundColor: Colors.mainWhite,
  },
  container: {
    backgroundColor: Colors.mainWhite,
  },
  title: {
    paddingTop: 20,
    fontSize: 32,
    color: Colors.fontBlack,
  },
  fb: {
    width: 212,
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
  withEmailText: {
    fontSize: 14,
    display: 'inline-block',
    paddingLeft: 20,
    paddingRight: 20,
    position: 'relative',
    bottom: 35,
    backgroundColor: Colors.mainWhite,
    fontStyle: 'Italic',
  },
  checkbox: {
    width: 20,
  },
  acceptText: {
    fontSize: 11,
    position: 'relative',
    bottom: 3,
  },
  submitButton: {
    marginTop: 40,
    marginBottom: 20,
    backgroundColor: Colors.link,
    borderColor: Colors.link,
  },
  italicText: {
    fontSize: 16,
    fontStyle: 'Italic',
    marginBottom: 10,
    display: 'inline-block',
    height: 16,
    lineHeight: '16px',
  },

  inputLabel: {
    fontSize: 14,
    marginBottom: 0,
    marginTop: 0,
    position: 'relative',
    top: 10,
  },
  greyInputText: {
    fontSize: 14,
  },
};

function mapDispatchToProps(dispatch) {
    return bindActionCreators({ signinUser }, dispatch)
}

const mapStateToProps = state => {
    const { userInfo, isLoggedIn } = state.user;
    return {
        userInfo, isLoggedIn
    }
};

const AppSignin_worouter = connect(mapStateToProps, mapDispatchToProps)(_AppSignin);

export const AppSignin = withRouter(AppSignin_worouter);
