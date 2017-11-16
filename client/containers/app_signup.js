import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as firebase from "firebase";
import Axios from 'axios';
import PropTypes from 'prop-types';
import {orange500, blue500} from 'material-ui/styles/colors';
import {
	BrowserRouter as Router,
	Route,
	Link,
	Redirect,
} from 'react-router-dom';
import { withRouter } from 'react-router';
import moment from 'moment';

import {SoundwiseHeader} from '../components/soundwise_header';
import { signupUser, signinUser } from '../actions/index';
import Colors from '../styles/colors';
import { GreyInput } from '../components/inputs/greyInput';
import { minLengthValidator, emailValidator } from '../helpers/validators';
import { OrangeSubmitButton } from '../components/buttons/buttons';
import ImageS3Uploader from '../components/inputs/imageS3Uploader';

var provider = new firebase.auth.FacebookAuthProvider();

class _AppSignup extends Component {
    constructor(props) {
        super(props);

        this.state = {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            message: '',
            publisher_name: '',
            pic_url: '../images/smiley_face.jpg',
            publisherImage: null,
            redirectToReferrer: false,
            isPublisherFormShown: false,
            isFBauth: false,
        };

        this.publisherID = moment().format('x') + 'p';

        this.addDefaultSoundcast = this.addDefaultSoundcast.bind(this)
    }

    componentDidMount() {
        if(this.props.match.params.id) {
            this.publisherID = this.props.match.params.id;
        }
    }

    setStatePromise(that, newState) {
        return new Promise((resolve) => {
            that.setState(newState, () => {
                resolve();
            });
        });
    }

    signUp() {
        const {firstName, lastName, email, password, pic_url} = this.state;
        const {history, match} = this.props;

        this.setState({ isFBauth: false });
        if (!this._validateForm(firstName, lastName, email, password)) return;

        firebase.auth().fetchProvidersForEmail(email)
        .then(authArr => {
            // console.log('authArr: ', authArr);
            if(authArr.length > 0) {
                if(match.params.id) {
                  history.push(`/signin/admin/${match.params.id}`, {text: 'This account already exists. Please sign in instead'});
                  return;
                } else {
                  history.push('/signin', {text: 'This account already exists. Please sign in instead'});
                }
            }
        })
        .catch(err => console.log('error: ', err));

        // const userRef = firebase.database().ref('users');
        // userRef.orderByChild('email/0').equalTo(email)
        // .once('value')
        // .then(snapshot => {
        //     if(snapshot.val() !== null) {
        //         history.push('/signin', {text: 'This account already exists. Please sign in instead'});
        //     }
        // })
        // .catch(err => console.log('error: ', err));

        if (match.params.mode !== 'admin') { // user case
            this._signUp();
        } else if (match.params.id) { // admin from invitation with publisher id
            this.signUpInvitedAdmin();
        } else {
            this.setState({isPublisherFormShown: true});
        }
    }

    getUrl (url) {
        this.setState({publisherImage: url});
    }

    signUpInvitedAdmin(user) {
        const that = this;
        const { match, history } = this.props;
        const { firstName, lastName, email, password, pic_url, publisher_name, publisherImage, isFBauth } = this.state;

        if(!isFBauth) {
            this._signUp().then(
                res => {
                    let creatorID = firebase.auth().currentUser.uid;
                    firebase.database().ref(`publishers/${that.publisherID}/administrators/${creatorID}`).set(true);

                    firebase.database().ref(`publishers/${that.publisherID}/soundcasts`)
                    .once('value')
                    .then(snapshot => {
                        firebase.database().ref(`users/${creatorID}/soundcasts_managed`)
                        .set(snapshot.val());

                        firebase.database().ref(`users/${creatorID}/admin`).set(true);

                        firebase.database().ref(`users/${userId}/publisherID`).set(that.publisherID);

                        console.log('completed adding publisher to invited admin');
                    })
                    .then(() => {
                        that.compileUser();
                    })
                    .then(() => {
                        history.push('/dashboard/soundcasts');
                    })
                }
            );
        } else {
            this.signUpUser(user);
            let creatorID = firebase.auth().currentUser.uid;
            firebase.database().ref(`publishers/${that.publisherID}/administrators/${creatorID}`).set(true);

            firebase.database().ref(`publishers/${that.publisherID}/soundcasts`)
            .once('value')
            .then(snapshot => {
                firebase.database().ref(`users/${creatorID}/soundcasts_managed`)
                .set(snapshot.val());

                firebase.database().ref(`users/${creatorID}/admin`).set(true);

                console.log('completed adding publisher to invited admin');
            })
            .then(() => {
                that.compileUser();
            })
            .then(() => {
                history.push('/dashboard/soundcasts');
            });
        }

    }

    signUpAdmin () {
        const that = this;
        const { match, history } = this.props;
        const { firstName, lastName, email, password, pic_url, publisher_name, publisherImage, isFBauth } = this.state;

        this.setState({ isFBauth: true });
        if(publisher_name.length < 1) {
            alert('Please enter a publisher name!');
            return;
        }
        if (!this._validateForm(firstName, lastName, email, password, isFBauth)) return;

        this._signUp().then(
            res => {
                if (this.props.match.params.mode === 'admin') { // admin case

                    let _newPublisher = {
                        name: publisher_name,
                        imageUrl: publisherImage,
                        administrators: {
                            [firebase.auth().currentUser.uid]: true,
                        },
                    };

                    firebase.database().ref(`publishers/${this.publisherID}`).set(_newPublisher).then(
                        res => {
                            // console.log('success add publisher: ', res);
                            that.addDefaultSoundcast()
                        },
                        err => {
                            console.log('ERROR add publisher: ', err);
                        }
                    );
                }
            }
        );
    }

    async compileUser() {
        const { signinUser, history, userInfo, match } = this.props;
        let creatorID = firebase.auth().currentUser.uid;
        let fb_operation;

        const user_snapshot = await firebase.database().ref(`users/${creatorID}`).once('value');

        let _user = user_snapshot.val();
        if (_user.soundcasts_managed && _user.admin) {
            if (_user.publisherID) {

                let publisher_snapshot = await firebase.database().ref(`publishers/${_user.publisherID}`).once('value');

                if (publisher_snapshot.val()) {
                    const _publisher = JSON.parse(JSON.stringify(publisher_snapshot.val()));
                    _publisher.id = _user.publisherID;
                    _user.publisher = _publisher;

                    if (_user.publisher.administrators) {
                        let admins = {};
                        for (let adminId in _user.publisher.administrators) {
                            admins[adminId] = await firebase.database().ref(`users/${adminId}`).once('value');
                            if (admins[adminId].val()) {
                                const _admin = JSON.parse(JSON.stringify(admins[adminId].val()));
                                _user.publisher.administrators[adminId] = _admin;
                            }
                        }
                    }
                }
            }

            let soundcastsManaged = {};
            for (let key in _user.soundcasts_managed) {
                soundcastsManaged[key] = await firebase.database().ref(`soundcasts/${key}`).once('value');

                if (soundcastsManaged[key].val()) {
                    _user = JSON.parse(JSON.stringify(_user));
                    const _soundcast = JSON.parse(JSON.stringify(soundcastsManaged[key].val()));
                    _user.soundcasts_managed[key] = _soundcast;
                    signinUser(_user);
                    if (_soundcast.episodes) {
                        let episodes = {};
                        for (let epkey in _soundcast.episodes) {
                            episodes[epkey] = await firebase.database().ref(`episodes/${epkey}`).once('value');
                            if (episodes[epkey].val()) {
                                _user = JSON.parse(JSON.stringify(_user));
                                _user.soundcasts_managed[key].episodes[epkey] = JSON.parse(JSON.stringify(episodes[epkey].val()));
                                signinUser(_user);
                            }
                        }
                    }
                }
            }
        }

        if (_user.soundcasts) {
            let userSoundcasts = {};
            for (let key in _user.soundcasts) {
                userSoundcasts[key] = await firebase.database().ref(`soundcasts/${key}`).once('value');
                if (userSoundcasts[key].val()) {
                    _user = JSON.parse(JSON.stringify(_user));
                    const _soundcast = JSON.parse(JSON.stringify(userSoundcasts[key].val()));
                    _user.soundcasts[key] = _soundcast;
                    signinUser(_user);
                    if (_soundcast.episodes) {
                        let soundcastEpisodes = {};
                        for (let epkey in _soundcast.episodes) {
                            soundcastEpisodes[epkey] = await firebase.database().ref(`episodes/${epkey}`).once('value')
                            if (soundcastEpisodes[epkey].val()) {
                                _user = JSON.parse(JSON.stringify(_user));
                                _user.soundcasts[key].episodes[epkey] = JSON.parse(JSON.stringify(soundcastEpisodes[epkey].val()));
                                signinUser(_user);
                            }
                        }
                    }
                }
            }
        }

    }

    addDefaultSoundcast() {
        const { history } = this.props;
        const that = this;

        let creatorID = firebase.auth().currentUser.uid;
        // console.log('creatorID: ', creatorID);

        const { firstName, lastName, email, password, pic_url, publisher_name, publisherImage, isFBauth } = this.state;
        const subscribed = {};
        const _email = email.replace(/\./g, "(dot)");
        subscribed[creatorID] = moment().format('X');

        const soundcastId = `${moment().format('x')}s`;

        const newSoundcast = {
            title: 'Default Soundcast',
            imageURL: publisherImage,
            short_description: 'First soundcast',
            creatorID,
            publisherID: this.publisherID,
            prices: [{price: 'free', billingCycle: 'free'}],
            forSale: true
        };

        let _promises = [
        // add soundcast
            firebase.database().ref(`soundcasts/${soundcastId}`).set(newSoundcast).then(
                res => {
                    console.log('success add soundcast: ', res);
                    return res;
                },
                err => {
                    console.log('ERROR add soundcast: ', err);
                    Promise.reject(err);
                }
            ),
            // add soundcast to publisher
            firebase.database().ref(`publishers/${this.publisherID}/soundcasts/${soundcastId}`).set(true).then(
                res => {
                    console.log('success add soundcast to publisher: ', res);
                    return res;
                },
                err => {
                    console.log('ERROR add soundcast to publisher: ', err);
                    Promise.reject(err);
                }
            ),
            // add soundcast to admin
            firebase.database().ref(`users/${creatorID}/soundcasts_managed/${soundcastId}`).set(true).then(
                res => {
                    console.log('success add soundcast to admin.soundcasts_managed: ', res);
                    return res;
                },
                err => {
                    console.log('ERROR add soundcast to admin.soundcasts_managed: ', err);
                    Promise.reject(err);
                }
            ),
            Axios.post('/api/soundcast', {
                soundcastId: soundcastId,
                publisherId: that.publisherID,
                title: newSoundcast.title,
            }).then(
                res => {
                    return res;
                }
            ).catch(
                err => {
                    console.log('ERROR API post soundcast: ', err);
                    Promise.reject(err)
                }
            )
        ];

        Promise.all(_promises)
        .then(
            res => {
                console.log('completed adding soundcast');
                that.compileUser();
            },
            err => {
                console.log('failed to complete adding soundcast');
            }
        )
        .then(() => {
            history.push('/dashboard/soundcasts');
        });
    }

    _validateForm (firstName, lastName, email, password, isFBauth) {
        if(firstName.length < 1 || lastName.length < 1) {
            alert('Please enter your name!');
            return false;
        } else if (email.indexOf('@') < 0) {
            alert ('Please enter a valid email!');
            return false;
        } else if (password.length < 1 && !isFBauth ) {
            alert('Please enter a passowrd!');
            return false;
        } else {
            return true;
        }
    }

    async _signUp () {
        const { match, history, signupUser } = this.props;
        const {firstName, lastName, email, password, pic_url, isFBauth} = this.state;
        let authArr = [];
        try {
            authArr = await firebase.auth().fetchProvidersForEmail(email);
        } catch(err) {
            console.log(err);
        }

        // console.log('authArr: ', authArr);

        if(authArr.length > 0) {
            if(match.params.id) {
              history.push(`/signin/admin/${match.params.id}`, {text: 'This account already exists. Please sign in instead'});
              return;
            } else {
              history.push('/signin', {text: 'This account already exists. Please sign in instead'});
            }
        }

        try {
            if (!isFBauth) {
                await firebase.auth().createUserWithEmailAndPassword(email, password);
            }
            this.setState({message: "account created"});
            this.signUpUser();
            return true;
        } catch (error) {
            this.setState({
                message: error.toString()
            });
            console.log(error.toString());
            Promise.reject(error);
        }
    }

    signUpUser (userToSignUP) {
        // console.log('signUpUser called');
        const { match, history, signupUser } = this.props;
        if(history.location.state && history.location.state.soundcast) {
          const {soundcast, soundcastID, checked, sumTotal} = history.location.state;
        }
        let firstName, lastName, email, pic_url;

        if(userToSignUP) {
            firstName = userToSignUP.firstName;
            lastName = userToSignUP.lastName;
            email = userToSignUP.email;
            pic_url = userToSignUP.pic_url;

        } else {
            firstName = this.state.firstName;
            lastName = this.state.lastName;
            email = this.state.email;
            pic_url = this.state.pic_url;
        }

        let userId;

        firebase.auth().onAuthStateChanged(user => {
            if(user) {
                userId = user.uid;

                const userToSave = { firstName, lastName, email: { 0: email }, pic_url };
                // add admin fields
                if (match.params.mode === 'admin') {
                    userToSave.admin = true;
                    userToSave.publisherID = this.publisherID;
                }

                firebase.database().ref('users/' + userId).set(userToSave);

                const _user = { userId, firstName, lastName, picURL: pic_url || '' };
                // TODO: _user.picURL = false
                Axios.post('/api/user', _user)
                    .then(res => {
                        // console.log('userToSave: ', userToSave);
                        // console.log('success save user');
                        signupUser(userToSave);
                        // for user -> goTo myPrograms, for admin need to register publisher first
                        if (match.params.mode !== 'admin' && match.params.mode !== 'soundcast_user') {
                            history.push('/myprograms');
                        } else if(match.params.mode == 'soundcast_user' && history.location.state) {
                            history.push('/soundcast_checkout', {
                                soundcast: history.location.state.soundcast,
                                soundcastID: history.location.state.soundcastID,
                                checked: history.location.state.checked,
                                sumTotal: history.location.state.sumTotal,
                            });
                        }
                    })
                    .catch(err => {
                        console.log('user saving failed: ', err);
                        signupUser(userToSave);
                        // for user -> goTo myPrograms, for admin need to register publisher first
                        if (match.params.mode !== 'admin' && match.params.mode !== 'soundcast_user') {
                            history.push('/myprograms');
                        } else if(match.params.mode == 'soundcast_user' && history.location.state) {
                            history.push('/soundcast_checkout', {
                                soundcast: history.location.state.soundcast,
                                soundcastID: history.location.state.soundcastID,
                                checked: history.location.state.checked,
                                sumTotal: history.location.state.sumTotal,
                            });
                        }
                    })
            }
        })
    }

    handleChange(prop, e) {
        this.setState({
            [prop]: e.target.value
        })
    }

    handleFBAuth() {
        const { match, history, signupUser, signinUser } = this.props;
        const that = this;
        this.setState({ isFBauth: true });

        firebase.auth().signInWithPopup(provider)
            .then(function(result) {
                // This gives you a Facebook Access Token. You can use it to access the Facebook API.
                // The signed-in user info.
              // console.log('result.user: ', JSON.parse(JSON.stringify(result.user)));
              const userId = firebase.auth().currentUser.uid;
              // console.log('userid: ', userId);
              firebase.database().ref('users/' + userId)
                .once('value')
                .then(snapshot => {
                    if(snapshot.val() && typeof(snapshot.val().firstName) !== 'undefined') { // if user already exists
                        console.log('user already exists');
                        let updates = {};
                        updates['/users/' + userId + '/pic_url/'] = snapshot.val().pic_url;
                        firebase.database().ref().update(updates);

                        let _user = snapshot.val();
                        _user.pic_url = _user.photoURL;
                        delete _user.photoURL;
                        signinUser(_user);

                        that.setState({
                            firstName: _user.firstName,
                            lastName: _user.lastName,
                            email: _user.email[0],
                            pic_url: _user.pic_url,
                        });

                        if (_user.admin && !match.params.id) {
                            history.push('/dashboard/soundcasts');
                        } else if (match.params.id) {
                            that.signUpInvitedAdmin();
                        } else  if (_user.soundcasts) {
                            history.push('/mysoundcasts');
                        } else  {
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
                        if (match.params.mode === 'admin' && !match.params.id) {
                            that.setState({
                                firstName: name[0],
                                lastName: name[1],
                                email,
                                pic_url: photoURL ? photoURL : '../images/smiley_face.jpg',
                                isPublisherFormShown: true,
                            });
                        } else if(match.params.id) {
                            that.signUpInvitedAdmin(user);
                        } else {
                            that.signUpUser(user);
                        }

                    }
                })
            })
            .catch(function(error) {
                // Handle Errors here.
                if (error.code === 'auth/account-exists-with-different-credential') {
                    // Step 2.
                    // User's email already exists.
                    // The pending Facebook credential.
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
                                return user.link(pendingCred);
                            }).then(function() {
                                // Facebook account successfully linked to the existing Firebase user.
                                const userId = firebase.auth().currentUser.uid;
                                firebase.database().ref('users/' + userId)
                                    .once('value')
                                    .then(snapshot => {
                                        const { firstName, lastName, email, pic_url } = snapshot.val();
                                        const user = {
                                            firstName,
                                            lastName,
                                            email,
                                            pic_url
                                        };
                                        that.setState({ firstName, lastName, email, pic_url });
                                        if (match.params.mode === 'admin' && !match.params.id) {
                                            that.setState({isPublisherFormShown: true});
                                        } else if(match.params.id) {
                                            that.signUpInvitedAdmin(user);
                                        } else {
                                            that.signUpUser(user);
                                        }
                                    });
                            })
                        }
                    })
                }
            });
    }

    render() {
        const { match, history } = this.props;
        // console.log('history.location.state: ', history.location.state);

        if(history.location.state) {
            let {soundcast, checked, sumTotal} = history.location.state;
            // console.log('soundcast: ', soundcast);
        }

        const { firstName, lastName, email, password, redirectToReferrer, isPublisherFormShown, publisher_name } = this.state;
        const { from } = this.props.location.state || { from: { pathname: '/courses' } };

        if(redirectToReferrer) {
            return (
                <Redirect to={from} />
			)
		}
		return (
            <div className="row" style={{...styles.row, height: window.innerHeight}}>
				{
					!isPublisherFormShown
					&&
                    <div className="col-lg-4 col-md-6 col-sm-8 col-xs-12 center-col text-center">
                        <img alt="Soundwise Logo" src="/images/soundwiselogo.svg" style={styles.logo}/>
                        <div style={styles.containerWrapper}>
                            <div style={styles.container} className="center-col text-center">
                                <div style={styles.title}>Let's get started!</div>
                                <button
                                    onClick={() => this.handleFBAuth()}
                                    className="text-white btn btn-medium propClone btn-3d width-60 builder-bg tz-text bg-blue tz-background-color"
                                    style={styles.fb}
                                >
                                    <i
                                        className="fa fa-facebook icon-extra-small margin-four-right tz-icon-color vertical-align-sub"
                                        style={styles.fbIcon}
                                    ></i>
                                    <span className="tz-text">SIGN UP with FACEBOOK</span>
                                </button>
                                <hr />
                                <span style={styles.withEmailText}>or with email</span>
                            </div>
                            <div style={styles.container} className="col-lg-6 col-md-6 col-sm-12 col-xs-12">
                                <GreyInput
                                    type="text"
                                    styles={{}}
                                    wrapperStyles={styles.inputTitleWrapper}
                                    placeholder={'First name'}
                                    onChange={this.handleChange.bind(this, 'firstName')}
                                    value={firstName}
                                    validators={[minLengthValidator.bind(null, 1)]}
                                />
                            </div>
                            <div style={styles.container} className="col-lg-6 col-md-6 col-sm-12 col-xs-12">
                                <GreyInput
                                    type="text"
                                    styles={{}}
                                    wrapperStyles={styles.inputTitleWrapper}
                                    placeholder={'Last name'}
                                    onChange={this.handleChange.bind(this, 'lastName')}
                                    value={lastName}
                                    validators={[minLengthValidator.bind(null, 1)]}
                                />
                            </div>
                            <div style={styles.container} className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                <GreyInput
                                    type="email"
                                    styles={{}}
                                    wrapperStyles={styles.inputTitleWrapper}
                                    placeholder={'Email'}
                                    onChange={this.handleChange.bind(this, 'email')}
                                    value={email}
                                    validators={[minLengthValidator.bind(null, 1), emailValidator]}
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
                                <div>
                                    {/*<input*/}
                                        {/*type="checkbox"*/}
                                        {/*onChange={(e) => {this.setState({isAccepted: e.target.checked});}}*/}
                                        {/*checked={isAccepted}*/}
                                        {/*style={styles.checkbox}*/}
                                    {/*/>*/}
                                    <span style={styles.acceptText}>
                                        By signing up I accept the terms of use and <Link to="/privacy">privacy policy</Link>.
                                    </span>
                                </div>
                                {
                                    match.params.mode === 'admin'
                                    && !match.params.id
                                    &&
                                    <OrangeSubmitButton
                                        label="NEXT"
                                        onClick={this.signUp.bind(this)}
                                    />
                                    ||
                                    <OrangeSubmitButton
                                        label="CREATE ACCOUNT"
                                        onClick={this.signUp.bind(this)}
                                        styles={styles.submitButton}
                                    />
                                }
                                <hr />
                                <div>
                                    <span style={styles.italicText}>Already have an account? </span>
                                    {
                                        !history.location.state &&
                                        <Link
                                          to='/signin'
                                          style={{...styles.italicText, color: Colors.link, marginLeft: 5}}> Sign in >
                                        </Link>
                                        ||
                                        <Link
                                          to={{
                                            pathname: '/signin',
                                            state: {
                                                soundcast: history.location.state.soundcast,
                                                soundcastID: history.location.state.soundcastID,
                                                checked: history.location.state.checked,
                                                sumTotal: history.location.state.sumTotal
                                            }
                                          }}
                                          style={{...styles.italicText, color: Colors.link, marginLeft: 5}}> Sign in >
                                        </Link>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    ||
                    <div className="col-lg-4 col-md-6 col-sm-8 col-xs-12 center-col">
                        <div className="center-col text-center">
                            <img alt="Soundwise Logo" src="/images/soundwiselogo.svg" style={styles.logo}/>
                        </div>
                        <div style={styles.containerWrapper}>
                            <div style={styles.container} className="center-col text-center">
                                <div style={{...styles.title, marginBottom: 10}}>Create Your Publisher Account</div>
                            </div>
                            <div style={styles.container} className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                <div style={styles.inputLabel}>Publisher name</div>
                                <div style={styles.italicText}>(this can be the name of your company, team, group, etc)</div>
                                <GreyInput
                                    type="email"
                                    styles={styles.greyInputText}
                                    wrapperStyles={styles.inputTitleWrapper}
                                    placeholder={'Publisher name'}
                                    onChange={this.handleChange.bind(this, 'publisher_name')}
                                    value={publisher_name}
                                    validators={[minLengthValidator.bind(null, 1)]}
                                />
                                <div style={styles.inputLabel}>Upload a publisher picture</div>
                                <div style={styles.italicText}>(i.e. your company logo, at least 133px by 133px)</div>
                                <ImageS3Uploader
                                    cb={this.getUrl.bind(this)}
                                    fileName={this.publisherID}
                                    title={'Publisher picture (square image)'}
                                />
                                <OrangeSubmitButton
                                    label="CREATE ACCOUNT"
                                    onClick={this.signUpAdmin.bind(this)}
                                    styles={styles.submitButton}
                                />
                            </div>
                        </div>
                    </div>
                }
            </div>
        )
    }
}

_AppSignup.propTypes = {
    match: PropTypes.object, // path info
};

const styles = {
    row: {
        backgroundColor: Colors.window,
        paddingTop: 26,
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
        paddingBottom: 20,
        fontSize: 26,
        color: Colors.fontBlack,
    },
    fb: {
        width: 212,
        height: 44,
        marginTop: 22,
        marginBottom: 16
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
        fontSize: 11,
        fontStyle: 'Italic',
        marginBottom: 10,
        display: 'inline-block',
        height: 11,
        lineHeight: '11px',
    },

    inputLabel: {
        fontSize: 16,
        marginBottom: 3,
        marginTop: 0,
        position: 'relative',
        top: 10,
    },
    greyInputText: {
        fontSize: 16,
    },
};

function mapDispatchToProps(dispatch) {
    return bindActionCreators({ signupUser, signinUser }, dispatch)
}

const mapStateToProps = state => {
    const { userInfo, isLoggedIn } = state.user;
    return {
        userInfo, isLoggedIn
    }
};

const AppSignup_worouter = connect(mapStateToProps, mapDispatchToProps)(_AppSignup);

export const AppSignup = withRouter(AppSignup_worouter);
