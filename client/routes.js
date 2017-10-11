import React, {Component} from 'react';
import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom';
import firebase from 'firebase';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {Helmet} from 'react-helmet';
import { browserHistory } from 'react-router';
import Butter from 'buttercms';
const butter = Butter('4ac51854da790bffc513d38911d2b677c19481f8');
import injectTapEventPlugin from 'react-tap-event-plugin';
// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

import { config, awsConfig } from '../config';
import { loadCourses, subscribeToCategories, signinUser } from './actions/index';
import Page from './components/page';
import PageRealEstate from './components/page_realestate';
import PageExperts from './components/page_experts';
import About from './components/about';
import Referral from './components/referral';
import TrialRequest from './components/trialrequest'
import CreatorTerms from './components/creator_terms';
import Privacy from './components/privacy';
import Terms from './components/terms_of_use';
import TermsFreeContent from './components/terms_free_content_May2017';
import { OrderConfirmation } from './components/order_confirmation';
import {AppSignup} from './containers/app_signup';
import {AppSignin} from './containers/app_signin';
import {Courses} from './containers/courses';
import {MyCourses} from './containers/mycourses';
import {MySoundcasts} from './containers/mysoundcasts';
import {Course} from './containers/course_page';
import {Staged_Course} from './containers/staged_course_page';
import {Course_Purchased} from './containers/course_page_purchased';
import {Cart} from './containers/cart/cart';
import {Checkout} from './containers/checkout';
import {CoursesCatalog} from './containers/courses_catalog/courses_catalog';
import {Dashboard} from './containers/dashboard/dashboard';
import {SoundcastPage} from './containers/soundcast_landing_page/soundcast_page';
import {SoundcastCheckout} from './containers/soundcast_landing_page/soundcast_checkout';
import NotFound from './components/page_404';
import PassRecovery from './components/pass_recovery';
import ScrollToTop from './components/scroll_to_top';

class _Routes extends Component {
    constructor(props) {
      super(props);

      props.subscribeToCategories();
    }

    componentDidMount() {
        const that = this
        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                const userId = user.uid;
                // watch user
                firebase.database().ref(`users/${userId}`).on('value', async (snapshot) => {
                    if (snapshot.val()) {
                        let _user = JSON.parse(JSON.stringify(snapshot.val()));
                        that.props.signinUser(_user);

                        if (_user.soundcasts_managed && _user.admin) {
                            if (_user.publisherID) {
								// add publisher with admins (without watching)
								firebase.database().ref(`publishers/${_user.publisherID}`).once('value').then(snapshot => {
									if (snapshot.val()) {
										const _publisher = JSON.parse(JSON.stringify(snapshot.val()));
										_publisher.id = _user.publisherID;
										_user.publisher = _publisher;

										if (_user.publisher.administrators) {
										    for (let adminId in _user.publisher.administrators) {
												firebase.database().ref(`users/${adminId}`).once('value').then(snapshot => {
													if (snapshot.val()) {
														const _admin = JSON.parse(JSON.stringify(snapshot.val()));
														_user.publisher.administrators[adminId] = _admin;
													}
												});
                                            }
                                        }
									}
								});
							}

                            for (let key in _user.soundcasts_managed) {
                                // watch managed soundcasts
                                firebase.database().ref(`soundcasts/${key}`).off(); // to avoid error when subscribe twice
								firebase.database().ref(`soundcasts/${key}`).on('value',
									snapshot => {
										if (snapshot.val()) {
											_user = JSON.parse(JSON.stringify(_user));
											const _soundcast = JSON.parse(JSON.stringify(snapshot.val()));
											_user.soundcasts_managed[key] = _soundcast;
											// to not watch the same soundcasts twice
											// fixes problem with .off of managed soundcasts, that are subscribed too
											if (_user.soundcasts[key]) {
												_user.soundcasts[key] = _soundcast;
											}
											that.props.signinUser(_user);
											if (_soundcast.episodes) {
												for (let epkey in _soundcast.episodes) {
													// watch episodes of soundcasts
													firebase.database().ref(`episodes/${epkey}`).off(); // to avoid error when subscribe twice
													firebase.database().ref(`episodes/${epkey}`).on('value', snapshot => {
														if (snapshot.val()) {
															_user = JSON.parse(JSON.stringify(_user));
															_user.soundcasts_managed[key].episodes[epkey] = JSON.parse(JSON.stringify(snapshot.val()));
															that.props.signinUser(_user);
														}
													});
												}
											}
										}
									},
									err => {
										console.log('ERROR on soundcast: ', err);
									}
								);
                            }
                        }

                        if (_user.soundcasts) {
                            for (let key in _user.soundcasts) {
								// to not watch the same soundcasts twice
								// fixes problem with .off of managed soundcasts, that are subscribed too
                                if(_user.soundcasts_managed[key]) {
                                    _user = JSON.parse(JSON.stringify(_user));
                                    _user.soundcasts[key] = _user.soundcasts_managed[key];
                                    that.props.signinUser(_user);
                                }

                            	if (!_user.soundcasts_managed[key]) { // otherwise this soundcast is watched in soundcasts_managed
									// watch soundcasts subscriptions
									firebase.database().ref(`soundcasts/${key}`).off(); // to avoid error when subscribe twice
									firebase.database().ref(`soundcasts/${key}`).on('value',
										snapshot => {
											if (snapshot.val()) {
												_user = JSON.parse(JSON.stringify(_user));
												const _soundcast = JSON.parse(JSON.stringify(snapshot.val()));
												_user.soundcasts[key] = _soundcast;
												that.props.signinUser(_user);
												if (_soundcast.episodes) {
													for (let epkey in _soundcast.episodes) {
														// watch episodes of soundcasts
														firebase.database().ref(`episodes/${epkey}`).off(); // to avoid error when subscribe twice
														firebase.database().ref(`episodes/${epkey}`).on('value', snapshot => {
															if (snapshot.val()) {
																_user = JSON.parse(JSON.stringify(_user));
																_user.soundcasts[key].episodes[epkey] = JSON.parse(JSON.stringify(snapshot.val()));
																that.props.signinUser(_user);
															}
														});
													}
												}
											}
										},
										err => {
											console.log('ERROR on soundcast: ', err);
										}
									);
								}
                            }
                        }
                    }
                });
            }
        });

        firebase.database().ref('courses').on('value', snapshot => {
            this.props.loadCourses(snapshot.val());
        });

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

  render() {
    return (
      <Router history = { browserHistory }>
        <ScrollToTop>
          <div>
            <Helmet>
              <meta property="og:type" content="website"/>
              <meta property="og:url" content="https://mysoundwise.com/" />
              <meta property="og:title" content="Soundwise"/>
              <meta property="fb:app_id" content='1726664310980105' />
              <meta property="og:description" content="Soundwise is an audio content management system that helps organizations and experts engage their audience and provide training on the go."/>
              <meta property="og:image" content="https://mysoundwise.com/images/soundwise_homepage.png" />
              <title>Soundwise: Spread Your Knowledge Fast with Audio</title>
              <meta name="description" content="Soundwise is an audio content management system that helps organizations and experts engage their audience and provide training on the go." />
              <meta name="keywords" content="soundwise, training, online education, education software, subscription, soundwise inc, real estate, real estate broker, real estate agents, real estate brokerage, real estate training, audio publishing, content management system, audio, mobile application, learning, online learning, online course, podcast, mobile app" />
            </Helmet>
            <Switch>
                <Route exact path="/" component={Page}/>
                <Route path="/about" component={About}/>
                <Route path="/realestate" component={PageRealEstate}/>
                <Route path="/experts" component={PageExperts}/>
                <Route exact={true} path='/signup/:mode' component={AppSignup} />
                <Route path='/signup/:mode/:id' component={AppSignup} />
                <Route path='/signin/:mode/:id' component={AppSignin} />
                <Route exact={true} path='/signin' component={AppSignin} />
                <Route path='/trial_request' component={TrialRequest} />
                <Route path="/gift" component={Referral} />
                <Route path="/creator_terms" component={CreatorTerms} />
                <Route path="/privacy" component={Privacy} />
                <Route path="/terms" component={Terms} />
                <Route path="/terms_free_content_May2017" component={TermsFreeContent} />
                <Route exact path="/myprograms" component={MyCourses}/>
                <Route exact path="/mysoundcasts" component={MySoundcasts}/>
                <Route path="/myprograms/:courseId" component={Course_Purchased}/>
                <Route path="/cart" component={Cart} />
                <Route path="/confirmation" component={OrderConfirmation} />
                <Route path="/courses/:courseId" component={Course} />
                <Route path="/staging/:courseId" component={Staged_Course} />
                <Route path="/password_reset" component={PassRecovery} />
                <Route exact path ="/courses" component={CoursesCatalog} />
                <Route exact={true} path="/dashboard/:tab" component={Dashboard} />
                <Route path="/dashboard/:tab/:id" component={Dashboard} />
                <Route path="/soundcasts/:id" component={SoundcastPage} />
                <Route path="/soundcast_checkout" component={SoundcastCheckout} />
                <Route path ="/notfound" component={NotFound} />
                <Route component={NotFound} />
            </Switch>
          </div>
        </ScrollToTop>
      </Router>
    )
  }
}



function mapDispatchToProps(dispatch) {
  return bindActionCreators({ loadCourses, signinUser, subscribeToCategories }, dispatch)
}

export const Routes = connect(null, mapDispatchToProps)(_Routes)
