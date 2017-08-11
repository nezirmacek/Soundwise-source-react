import React, {Component} from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as firebase from "firebase";
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
import { signupUser } from '../actions/index';
import Colors from '../styles/colors';
import { GreyInput } from '../components/inputs/greyInput';
import {minLengthValidator, emailValidator} from '../helpers/validators';
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
            pic_url: props.match.params.mode === 'admin' && '../images/publisher_image.png' || '../images/smiley_face.jpg',
            publisherImage: null,
            redirectToReferrer: false,
            isAccepted: false,
            isPublisherFormShown: false,
        };
        
        this.publisherName = moment().format('x') + 'p';
    }
    
    signUp() {
        const {firstName, lastName, email, password, pic_url, isAccepted} = this.state;
    
        if (!this._validateForm(firstName, lastName, email, password, isAccepted)) return;
        
        if (!this.props.match.params.mode === 'admin') { // user case
            this._signUp();
        } else { // admin case
            this.setState({isPublisherFormShown: true});
        }
    }
    
    getUrl (url) {
        this.setState({publisherImage: url});
    }
    
    signUpAdmin () {
        const {firstName, lastName, email, password, pic_url, publisher_name, publisherImage, isAccepted} = this.state;
        if(publisher_name.length < 1) {
            alert('Please enter your name!');
            return;
        }
        if (!this._validateForm(firstName, lastName, email, password, isAccepted)) return;
    
        this._signUp();
    
        if (this.props.match.params.mode === 'admin') { // admin case
            let _newPublisher = {
                name: publisher_name,
                imageUrl: publisherImage,
                // TODO: add admins!!!
                // administrators: {
                //     [firebase.auth().currentUser.uid]: true,
                // },
            };
    
            firebase.database().ref(`publishers/${this.publisherName}`).set(_newPublisher).then(
                res => {
                    console.log('success add publisher: ', res);
                },
                err => {
                    console.log('ERROR add publisher: ', err);
                }
            );
        }
    }
    
    async _signUp () {
        const that = this;
        const {firstName, lastName, email, password, pic_url, isAccepted} = this.state;
        try {
            await firebase.auth().createUserWithEmailAndPassword(this.state.email, this.state.password);
            this.setState({message: "account created"});
        
            const userId = firebase.auth().currentUser.uid;
            const userToSave = {firstName, lastName, email, pic_url};
            firebase.database().ref('users/' + userId).set(userToSave);
        
            that.props.signupUser(userToSave);
            that.props.history.push('/myprograms');
        } catch (error) {
            this.setState({
                message: error.toString()
            });
            console.log(error.toString())
        }
    }
    
    _validateForm (firstName, lastName, email, password, isAccepted) {
        if(firstName.length < 1 || lastName.length < 1) {
            alert('Please enter your name!');
            return false;
        } else if (email.indexOf('@') < 0) {
            alert ('Please enter a valid email!');
            return false;
        } else if (password.length < 1 ) {
            alert('Please enter a passowrd!');
            return false;
        } else if (!isAccepted ) {
            alert('Please read and accept terms of use and privacy policy!');
            return false;
        } else {
            return true;
        }
    }
    
    handleChange(prop, e) {
        this.setState({
            [prop]: e.target.value
        })
    }
    
    handleFBAuth() {
        const that = this;
        
        firebase.auth().signInWithPopup(provider)
            .then(function(result) {
                // This gives you a Facebook Access Token. You can use it to access the Facebook API.
                // The signed-in user info.
                const { email, photoURL, displayName } = result.user;
                const name = displayName.split(' ');
                const userToSave = {firstName: name[0], lastName: name[1], email, pic_url: photoURL};
                
                const userId = firebase.auth().currentUser.uid;
                firebase.database().ref('users/' + userId).set(userToSave);
                
                that.props.signupUser(userToSave);
                that.props.history.push('/myprograms')
                
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
                                        that.props.signupUser({firstName, lastName, email, pic_url});
                                        that.props.history.push('/myprograms');
                                    });
                            })
                        }
                        
                    })
                }
            });
    }
    
    render() {
        const { firstName, lastName, email, password, redirectToReferrer, isAccepted, isPublisherFormShown, publisher_name } = this.state;
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
                                    <span className="tz-text">Sign up with Facebook</span>
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
                                    <input
                                        type="checkbox"
                                        onChange={(e) => {this.setState({isAccepted: e.target.checked});}}
                                        checked={isAccepted}
                                        style={styles.checkbox}
                                    />
                                    <span style={styles.acceptText}>
                                        I agree to the terms of use and privacy policy
                                    </span>
                                </div>
                                <OrangeSubmitButton
                                    label="NEXT"
                                    onClick={this.signUp.bind(this)}
                                    styles={styles.submitButton}
                                />
                                <hr />
                                <div>
                                    <span style={styles.italicText}>Already have an account? </span>
                                    <span style={{...styles.italicText, color: Colors.link}}>Sign in ></span>
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
                                <div style={styles.italicText}>(i.e. your company logo)</div>
                                <ImageS3Uploader
                                    cb={this.getUrl.bind(this)}
                                    fileName={this.publisherName}
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
        fontSize: 17,
        color: Colors.fontBlack,
    },
    fb: {
        width: 212,
        height: 44,
        marginTop: 16,
    },
    fbIcon: {
        marginLeft: 0,
        marginRight: 20,
        position: 'relative',
        bottom: 2,
        right: '10%',
    },
    withEmailText: {
        fontSize: 9,
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
        fontSize: 9,
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
        fontSize: 9,
        fontStyle: 'Italic',
        marginBottom: 10,
        display: 'inline-block',
        height: 11,
        lineHeight: '11px',
    },
    
    inputLabel: {
        fontSize: 10,
        marginBottom: 0,
        marginTop: 0,
        position: 'relative',
        top: 10,
    },
    greyInputText: {
        fontSize: 10,
    },
};

function mapDispatchToProps(dispatch) {
    return bindActionCreators({ signupUser }, dispatch)
}

const mapStateToProps = state => {
    const { userInfo, isLoggedIn } = state.user;
    return {
        userInfo, isLoggedIn
    }
};

const AppSignup_worouter = connect(mapStateToProps, mapDispatchToProps)(_AppSignup);

export const AppSignup = withRouter(AppSignup_worouter);
