import React, {Component} from 'react';
// import { bindActionCreators } from 'redux';
// import { connect } from 'react-redux';
import { Route, Link, Switch } from 'react-router-dom';
import firebase from 'firebase';
import moment from 'moment';
import Axios from 'axios';

import Footer from './footer';
import {SoundwiseHeader} from './soundwise_header';
import Colors from '../styles/colors';

export default class Publisher extends Component {
    constructor (props) {
        super(props);

        this.state = {
          publisher: '',
          soundcasts: [],
        };
    }

    componentDidMount() {
      const publisherID = this.props.match.params.id;
      const {history} = this.props;
      const that = this;
      const soundcasts = [];
      firebase.database().ref('publishers/' + publisherID)
        .once('value', snapshot => {
          if(snapshot.val()) {
            that.setState({
              publisher: snapshot.val(),
            });
            const soundcastsArr = (Object.keys(snapshot.val().soundcasts));
              firebase.database().ref(`soundcasts/1508293913676s`)
              .once('value')
              .then(soundcastSnapshot => {
                console.log('soundcastSnapshot: ', soundcastSnapshot.val());
                if(soundcastSnapshot.val().published) {
                  soundcasts.push(soundcastSnapshot.val());
                }
              })
              .catch(err => console.log(err));
            const promises = soundcastsArr.map(soundcastId => {
                  return firebase.database().ref(`soundcasts/${soundcastId}`)
                        .once('value')
                        .then(soundcastSnapshot => {
                          console.log('soundcastSnapshot: ', soundcastSnapshot.val());
                          if(soundcastSnapshot.val().published) {
                            soundcasts.push(soundcastSnapshot.val());
                          }
                        });
            });
            console.log('promises: ', promises);
            Promise.all(promises).then(() => {
              console.log('promises finished');
              that.setState({
                soundcasts,
              });
            })
            .catch(err => console.log('err: ', err));
          } else {
              history.push('/notfound');
          }
        });
    }

    render() {
      return (
        <div>
            <SoundwiseHeader />
            <section className="padding-70px-tb bg-white builder-bg xs-padding-60px-tb" id="feature-section14">
                <div className="container">
                    <div className="row">
                        <div className="col-md-12 col-sm-12 col-xs-12 text-center">
                            <h2 className="section-title-large sm-section-title-medium xs-section-title-large text-dark-gray font-weight-600 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text">
                                {this.state.publisher.name}
                            </h2>
                        </div>
                        <div className='col-md-12'>
                          {
                            this.state.soundcasts.map((soundcast, i) => {
                              return (
                                <div className="col-md-4 col-sm-6 col-xs-12 sm-margin-thirteen-bottom xs-margin-nineteen-bottom">
                                    <div className="blog-post">
                                        <div className="blog-image margin-twenty-bottom sm-margin-ten-bottom">
                                            <img className="img100" alt="" src={soundcast.imageURL}/>
                                        </div>
                                        <div className="post-details">
                                            <div className="tz-text text-dark-gray blog-post-title text-large font-weight-600 display-block margin-ten-bottom xs-margin-five-bottom">{soundcast.title}</div>
                                            <div className="text-medium tz-text"><p>{soundcast.description}</p></div>
                                        </div>
                                    </div>
                                </div>
                              )
                            })
                          }
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
};

const styles = {
    footer: {
        // position: 'fixed',
        bottom: 0,
        width: '100%',
    }
};