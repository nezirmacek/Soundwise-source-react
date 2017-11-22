import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as firebase from 'firebase';
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
    }

    async signIn() {
        const { firstName, lastName, email, password, pic_url, courses } = this.state;
        const { signinUser, history, userInfo, match } = this.props;
        // let soundcast, checked, sumTotal;

        if(history.location.state && history.location.state.soundcast) {
            let {soundcast, soundcastID, checked, sumTotal} = history.location.state;
        }

        const that = this;
        let _user;

        try {
            await firebase.auth().signInWithEmailAndPassword(email, password);

            const userId = firebase.auth().currentUser.uid;
            firebase.database().ref(`users/${userId}`).once('value').then(snapshot => {
                if (snapshot.val()) {
                    _user = JSON.parse(JSON.stringify(snapshot.val()));
                    signinUser(_user);
                }
            })
            .then(() => {
                    if (history.location.state && history.location.state.soundcast) {
                        that.compileUser(_user);
                        history.push('/soundcast_checkout', {
                            soundcast: history.location.state.soundcast,
                            soundcastID: history.location.state.soundcastID,
                            checked: history.location.state.checked,
                            sumTotal: history.location.state.sumTotal,
                            userInfo: _user,
                        });
                    } else if (_user.admin && !match.params.id) {
                        that.compileUser(_user);
                        history.push('/dashboard/soundcasts');
                    } else if(match.params.id) {
                        this.signInInvitedAdmin();
                    } else if (_user.courses) {
                        that.compileUser(_user);
                        history.push('/myprograms');
                    } else {
                        that.compileUser(_user);
                        history.push('/mysoundcasts');
                    }
            });

        } catch (error) {
            this.setState({
                message: error.toString()
            });
            console.log(error.toString());
        }
    }

    async compileUser(_user) {
        const { signinUser, history, userInfo, match } = this.props;
        let creatorID = firebase.auth().currentUser.uid;

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

    signInInvitedAdmin() {
        const userId = firebase.auth().currentUser.uid;
        const { match, history } = this.props;
        const that = this;

        firebase.database().ref(`publishers/${match.params.id}/administrators/${userId}`).set(true);

        firebase.database().ref(`publishers/${match.params.id}/soundcasts`)
        .once('value')
        .then(snapshot => {
            firebase.database().ref(`users/${userId}/soundcasts_managed`)
            .set(snapshot.val());

            firebase.database().ref(`users/${userId}/admin`).set(true);

            firebase.database().ref(`users/${userId}/publisherID`).set(match.params.id);

            console.log('completed adding publisher to invited admin');
        })
        .then(() => {
            firebase.database().ref(`users/${userId}`)
            .on('value', snapshot => {
                const _user = snapshot.val();
                that.compileUser(_user);
            });
        })
        .then(() => {
            history.push('/dashboard/soundcasts');
        })
    }

    handleChange(field, e) {
        this.setState({
            [field]: e.target.value
        })
    }

    componentWillMount() {
        // const that = this
        // firebase.auth().getRedirectResult().then(function(result) {
        //   // This gives you a Facebook Access Token. You can use it to access the Facebook API.
        //   // The signed-in user info.
        //   const userId = firebase.auth().currentUser.uid
        //   firebase.database().ref('users/' + userId)
        //   .once('value')
        //   .then(snapshot => {
        //     if(snapshot.val().firstName !== undefined) { // if user already exists
        //       const firstName = snapshot.val().firstName
        //       const lastName = snapshot.val().lastName
        //       const email = snapshot.val().email
        //       const courses = snapshot.val().courses || {}
        //       that.props.signinUser({firstName, lastName, email, courses})
        //       that.props.history.push('/myprograms')
        //     } else {  //if it's a new user
        //       const user = result.user
        //       const email = user.email
        //       const name = user.displayName.split(' ')
        //       const firstName = name[0]
        //       const lastName = name[1]
        //       const courses = {}

        //       firebase.database().ref('users/' + userId).set({
        //         firstName,
        //         lastName,
        //         email,
        //         courses
        //       })

        //       that.props.signinUser({firstName, lastName, email, courses})
        //       that.props.history.push('/myprograms')
        //     }

        //   })
        // })
    }

    handleFBAuth() {
        const that = this;
        const { history, userInfo, signinUser, match } = this.props;
        if(history.location.state && history.location.state.soundcast) {
            let {soundcast, soundcastID, checked, sumTotal} = history.location.state;
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
                            that.compileUser(_user);
                            history.push('/soundcast_checkout', {
                                soundcast: history.location.state.soundcast,
                                soundcastID: history.location.state.soundcastID,
                                checked: history.location.state.checked,
                                sumTotal: history.location.state.sumTotal,
                            });
                        } else if (_user.admin) {
                            that.compileUser(_user);
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
                            const userId = firebase.auth().currentUser.uid;
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
                                    // if(courses == undefined) {
                                    //   firebase.database().ref('users/' + userId).set({
                                    //     courses: {}
                                    //   })
                                    // }
                                    that.props.signinUser(_user);

                                    if (soundcast) {
                                        that.compileUser(_user);
                                        history.push('/soundcast_checkout', {soundcast, soundcastID, checked, sumTotal});
                                    } else if (_user.admin && !match.params.id) {
                                        that.compileUser(_user);
                                        history.push('/dashboard/soundcasts');
                                    } else if(match.params.id) {
                                        that.signInInvitedAdmin();
                                    } else {
                                        history.push('/myprograms');
                                    }
                                })
                        })
                    }

                })
            }
        })
    }


    render() {
        const { firstName, lastName, email, password, redirectToReferrer, message } = this.state
        const { from } = this.props.location.state || { from: { pathname: '/courses' } }
        const {history} = this.props;

        if(redirectToReferrer) {
            return (
                <Redirect to={from} />
            )
        }
        return (
			<div className="row" style={{...styles.row, height: window.innerHeight}}>
                {/*<section className="padding-110px-tb xs-padding-60px-tb bg-white builder-bg" id="subscribe-section6">*/}
                    {/*<div className="container">*/}
                        {/*<div className="row">*/}
                            {/*<div className="col-md-8 center-col col-sm-12 text-center">*/}
                                {/*<h2*/}
                                    {/*className="title-extra-large-2 alt-font xs-title-large  margin-four-bottom tz-text"*/}
                                    {/*style={styles.headerText}*/}
                                {/*>*/}
                                    {/*Log In*/}
                                {/*</h2>*/}
                                {/*<div*/}
                                    {/*className="text-extra-large sm-text-extra-large text-medium-gray width-80 xs-width-100 center-col margin-twelve-bottom xs-margin-nineteen-bottom tz-text"*/}
                                {/*>*/}
                                    {/*Need a Soundwise account?*/}
                                    {/*<Link to="/signup/user" className="text-decoration-underline">*/}
                                        {/*Get started here.*/}
                                    {/*</Link>*/}
                                {/*</div>*/}
                            {/*</div>*/}
                            {/*<div*/}
                                {/*className="col-md-6 col-sm-11 col-xs-11 center-col text-center"*/}
                                {/*style={{padding: '1.5em', margin: '2em'}}*/}
                            {/*>*/}
                                {/*<button*/}
                                    {/*onClick={() => this.handleFBAuth()}*/}
                                    {/*className="text-white btn btn-extra-large2 propClone btn-3d text-white width-100 builder-bg tz-text bg-blue tz-background-color"*/}
                                {/*>*/}
                                    {/*<i className="fa fa-facebook icon-medium margin-four-right tz-icon-color vertical-align-sub"></i>*/}
                                    {/*<span className="tz-text">Log in with Facebook</span>*/}
                                {/*</button>*/}
                            {/*</div>*/}
                            {/*<div className="col-md-6 center-col col-sm-12 text-center">*/}
                                {/*<div*/}
                                    {/*className="text-extra-large sm-text-extra-large text-medium-gray width-80 xs-width-100 center-col margin-twelve-bottom xs-margin-nineteen-bottom tz-text"*/}
                                {/*>*/}
                                    {/*Or*/}
                                {/*</div>*/}
                                {/*<h4*/}
                                    {/*className="title-extra-large xs-title-large width-80 xs-width-100 center-col margin-twelve-bottom xs-margin-nineteen-bottom tz-text"*/}
                                {/*>*/}
                                    {/*Sign in with email*/}
                                {/*</h4>*/}
                            {/*</div>*/}
                            {/*<div className="col-md-6 center-col col-sm-12 text-center">*/}
                                {/*<input*/}
                                    {/*onChange={this.handleChange}*/}
                                    {/*value={email}*/}
                                    {/*type="email"*/}
                                    {/*name="email"*/}
                                    {/*id="email"*/}
                                    {/*data-email="required"*/}
                                    {/*placeholder="Email"*/}
                                    {/*className="big-input bg-light-gray alt-font border-radius-4"*/}
                                {/*/>*/}
                                {/*<input*/}
                                    {/*onChange={this.handleChange}*/}
                                    {/*value={password}*/}
                                    {/*type="password"*/}
                                    {/*name="password"*/}
                                    {/*id="password"*/}
                                    {/*data-email="required"*/}
                                    {/*placeholder="Password"*/}
                                    {/*className="big-input bg-light-gray alt-font border-radius-4"*/}
                                {/*/>*/}
                                {/*<button*/}
                                    {/*onClick={this.signIn}*/}
                                    {/*type="submit"*/}
                                    {/*className="contact-submit btn btn-extra-large2 propClone btn-3d text-white width-100 builder-bg tz-text"*/}
                                    {/*style={styles.button}*/}
                                {/*>*/}
                                    {/*Log In*/}
                                {/*</button>*/}
                                {/*<div className="pull-right">*/}
                                    {/*<a href="https://mysoundwise.com/password_reset" target="_blank">Forgot your password?</a>*/}
                                {/*</div>*/}
                                {/*<div style={styles.error}>*/}
                                    {/*{this.state.message}*/}
                                {/*</div>*/}
                            {/*</div>*/}
                        {/*</div>*/}
                    {/*</div>*/}
                {/*</section>*/}




				<div className="col-lg-4 col-md-6 col-sm-8 col-xs-12 center-col text-center">
					<img alt="Soundwise Logo" src="/images/soundwiselogo.svg" style={styles.logo}/>
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
									className="fa fa-facebook icon-extra-small margin-four-right tz-icon-color vertical-align-sub"
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
                            <div><span style={{color: 'red', fontSize: 16,}}>{message}</span></div>
							<OrangeSubmitButton
								label="SIGN IN"
								onClick={this.signIn.bind(this)}
							/>
                            <div style={{fontSize: 14, textDecoration: 'underline'}}>
                              <Link  to='/password_reset'>Forgot your password? </Link>
                            </div>
							<hr />
							<div style={{marginBottom: 10}}>
								<span style={styles.italicText}>Don't have an account? </span>
								<Link to="/signup/user" style={{...styles.italicText, color: Colors.link, marginLeft: 5}}>
									Sign up >
								</Link>
							</div>
						</div>
					</div>
				</div>
            </div>
        )
    }
}

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
		fontSize: 32,
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
		fontSize: 15,
		fontStyle: 'Italic',
		marginBottom: 10,
		display: 'inline-block',
		height: 11,
		lineHeight: '11px',
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
