import React, {Component} from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Link, Switch } from 'react-router-dom';
import firebase from 'firebase';

import Footer from '../components/footer';
import {SoundwiseHeader} from '../components/soundwise_header';
import Colors from '../styles/colors';


class _MySoundcasts extends Component {
    constructor (props) {
        super(props);

        this.state = {
            cardHeight: 0,
            userSoundcasts: [],
        };
    }

    componentWillMount () {
        let userSoundcasts = [];
        const that = this;
        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                const userId = firebase.auth().currentUser.uid;
                let userSoundcasts = [];
                firebase.database().ref('users/' + userId + '/soundcasts')
                .once('value')
                .then(snapshot => {
                    if (snapshot.val()) {
                        const soundcastIDs = Object.keys(snapshot.val());
                        const promises = soundcastIDs.map((id, i) => {
                            firebase.database().ref('soundcasts/' + id)
                                .once('value')
                                .then(snapshot => {
                                    userSoundcasts[i] = {
                                        soundcastId: id,
                                        title: snapshot.val().title,
                                        hostName: snapshot.val().hostName,
                                        imageURL: snapshot.val().imageURL,
                                    };
                                 } )
                                .then(res => console.log('res: ', res), err => console.log(err));
                        });

                        Promise.all(promises)
                        .then(res => {
                            that.setState({
                                userSoundcasts,
                            });
                        }, err => {
                            console.log('promise error: ', err);
                        })

                    }
                })
            }
        })
    }

    alignCardsHeights (height) {
        if (this.state.cardHeight < height) {
            this.setState({ cardHeight: height });
        }
    }

    render () {
        const userSoundcasts = this.state.userSoundcasts;
        const isLoggedIn = this.props.isLoggedIn;

        if (isLoggedIn === false) {
            return (
                <div>
                    <SoundwiseHeader />
                    <section className="padding-110px-tb bg-white builder-bg xs-padding-60px-tb" id="feature-section14">
                        <div className="container">
                            <div className="row">
                                <div className="col-md-12 col-sm-12 col-xs-12 text-center">
                                    <h2 className="section-title-large sm-section-title-medium xs-section-title-large text-dark-gray font-weight-600 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text">PLEASE LOG IN FIRST</h2>
                                </div>
                            </div>
                        </div>
                    </section>
                    <div style={styles.footer}>
                      <Footer />
                    </div>
                </div>
            )
        }

        return (
            <div>
                <SoundwiseHeader />
                <section className="padding-110px-tb bg-white builder-bg xs-padding-60px-tb" id="feature-section14">
                    <div className="container">
                        <div className="row">
                            <div className="col-md-12 col-sm-12 col-xs-12 text-center">
                                <h2 className="section-title-large sm-section-title-medium xs-section-title-large text-dark-gray font-weight-600 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text">
                                    {userSoundcasts.length && 'MY SOUNDCASTS' || `YOU HAVEN'T SUBSCRIBED TO ANY SOUNDCASTS YET`}
                                </h2>
                            </div>
                            <div>
                                {userSoundcasts.map((soundcast, i) => (
                                    <div className="row" key={i} style={styles.row}>
                                        <div className="col-lg-7 col-md-7 col-sm-12 col-xs-12" style={styles.soundcastInfo}>
                                            <img src={soundcast.imageURL} style={styles.soundcastImage} />
                                            <div style={styles.soundcastDescription}>
                                                <label style={styles.soundcastTitle}>{soundcast.title}</label>
                                            </div>
                                        </div>
                                        <div className="col-lg-5 col-md-5 col-sm-12 col-xs-12" style={styles.soundcastInfo}>
                                            <div style={{...styles.button, borderColor: Colors.link}} onClick={() => history.push(`/dashboard/soundcasts/${soundcast.soundcastId}`)}>Unsubscribe</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
                <div style={styles.footer}>
                  <Footer />
                </div>
            </div>
        )
    }
}

const styles = {
    titleText: {
        fontSize: 12,
    },
    row: {
        marginTop: 10,
        marginRight: 10,
        marginBottom: 10,
        marginLeft: 0,
    },
    soundcastInfo: {
        height: 100,
        backgroundColor: Colors.mainWhite,
        paddingTop: 15,
        paddingBottom: 15,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    soundcastImage: {
        width: 75,
        height: 75,
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
        marginRight: 30,
        float: 'left',
    },
    soundcastDescription: {
        height: 46,
        float: 'left',
    },
    soundcastTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        display: 'block',
    },
    soundcastUpdated: {
        fontSize: 16,
    },
    edit: {
      height: 30,
      display: 'inline-block'
    },
    editLink: {
      paddingTop: 15,
      paddingLeft: 20,
      fontSize: 16,
      color: Colors.link,
      float: 'right',
      cursor: 'pointer'
      // display: 'block'
    },
    subscribers: {
        paddingTop: 10,
        float: 'right',
        fontSize: 14,
    },
    addLink: {
        color: Colors.link,
        fontSize: 14,
        display: 'block',
        float: 'none',
        height: 11,
        lineHeight: '11px',
        position: 'relative',
        bottom: 5,
        width: 16,
        margin: '0 auto',
        paddingTop: 6,
        cursor: 'pointer'
    },
    button: {
        height: 30,
        borderRadius: 14,
        fontSize: 12,
        letterSpacing: 2,
        wordSpacing: 4,
        display: 'inline-block',
        paddintTop: 5,
        paddingRight: 15,
        paddingBottom: 5,
        paddingLeft: 15,
        borderWidth: 3,
        marginTop: 10,
        marginRight: 15,
        borderStyle: 'solid',
        cursor: 'pointer',
    },
    footer: {
        position: 'fixed',
        bottom: 0,
        width: '100%',
    }
};


const mapStateToProps = state => {
    const { userInfo, isLoggedIn } = state.user;
    return { userInfo, isLoggedIn, };
};

export const MySoundcasts = connect(mapStateToProps, null)(_MySoundcasts);