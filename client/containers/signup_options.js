import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as firebase from "firebase";
import Axios from 'axios';
import 'url-search-params-polyfill';
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
import Colors from '../styles/colors';
import { GreyInput } from '../components/inputs/greyInput';
import { inviteListeners } from '../helpers/invite_listeners';
import { addToEmailList } from '../helpers/addToEmailList';
import { OrangeSubmitButton } from '../components/buttons/buttons';

export default class SignupOptions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      importFeed: false,
      podcastTitle: 'Test Title',
      feedUrl: 'http://feeds.feedburner.com/TheAllTurtlesPodcast' // test
    }
    this.submitFeed = this.submitFeed.bind(this);
  }

  handleFeedSubmission(type, e) {
    this.setState({
        [type]: e.target.value
    })
  }

  async submitFeed() {
    const that = this;
    const { podcastTitle, feedUrl } = this.state;
    // 1. Search for the podcast title under 'importedFeeds' node in our firebase db
    const podcast = await firebase.database().ref('importedfeeds')
                            .orderByChild('title').equalTo(podcastTitle).once('value');
    debugger
      
      // , podcast => {
      //   debugger
      //   if (podcast) {
      //     // 2. If podcast is found
      //     //    - create confirmation code
      //     //    - send confirmation email
      //     //    - change to confirmation screen
      // 
      //   } else {
      //     // 3. If podcast is not found in firebase, make post request
      //     //    to ‘api/parse_feed’ with the rss feed Url the user
      //     //    submitted, and a new soundcastId and publisherId
      //     // 4. server parses the rss feed (server/scripts/parseFeed.js),
      //     //    create a new soundcast, and associated episodes from the feed information
      //     // 5. server sends confirmation email to user with the
      //     //    confirmation code, to verify that the user is the owner of the feed
      //     Axios.post('/api/parse_feed', { podcastTitle, feedUrl }).then(res => {
      //       debugger
      //     }).catch(err => {
      //       console.log('parse feed request failed', err, err && err.response && err.response.data);
      //       alert('Hmm...there is a problem parsing the feed. Please try again later.');
      //     });
      //   }
      // });
  }

  render() {
    const { importFeed, podcastTitle, feedUrl, } = this.state;
    const that = this;
    return (
      <div className="row" style={{...styles.row, height: Math.max(window.innerHeight, 700), overflow: 'auto'}}>
        {
          importFeed &&
          <div className="col-lg-4 col-md-6 col-sm-8 col-xs-12 center-col text-center">
              <img className='' alt="Soundwise Logo" src="/images/soundwiselogo.svg" style={styles.logo}/>
              <div style={{...styles.containerWrapper, padding: 20}}>
                  <div style={{...styles.container, paddingBottom: 30}} className="center-col text-center">
                      <div style={styles.title}>Submit your podcast feed</div>
                  </div>
                  <div style={styles.container} className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                    <span style={styles.greyInputText}>Podcast Title</span>
                    <input
                        type="text"
                        style={styles.input}
                        wrapperStyles={styles.inputTitleWrapper}
                        // placeholder={''}
                        onChange={this.handleFeedSubmission.bind(this, 'podcastTitle')}
                        value={podcastTitle}
                    />
                  </div>
                  <div style={styles.container} className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                    <span style={styles.greyInputText}>Podcast RSS Feed URL</span>
                    <input
                        type="text"
                        style={styles.input}
                        wrapperStyles={styles.inputTitleWrapper}
                        // placeholder={''}
                        onChange={this.handleFeedSubmission.bind(this, 'feedUrl')}
                        value={feedUrl}
                    />
                  </div>
                  <div style={{marginTop: 20}} className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                    <OrangeSubmitButton
                        styles={{marginTop: 15, marginBottom: 15}}
                        label="Submit"
                        onClick={this.submitFeed.bind(this)}
                    />
                  </div>
              </div>
          </div>
          ||
          <div className="col-lg-4 col-md-6 col-sm-8 col-xs-12 center-col text-center">
              <img className='' alt="Soundwise Logo" src="/images/soundwiselogo.svg" style={styles.logo}/>
              <div style={{...styles.containerWrapper, padding: 20}}>
                  <div style={styles.container} className="center-col text-center">
                      <div style={styles.title}>Choose your adventure</div>
                  </div>
                  <div style={styles.container} className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                    <OrangeSubmitButton
                      styles={{width: '100%', height: 'auto', margin: '40px auto'}}
                      label="I have an existing podcast feed to submit"
                      onClick={() => {that.setState({
                        importFeed: true
                      })}}
                    />
                  </div>
                  <div style={styles.container} className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                    <Link to='/signup/admin'>
                      <OrangeSubmitButton
                        styles={{backgroundColor: Colors.link, borderColor: Colors.link, width: '100%', height: 'auto', margin: '20px auto'}}
                        label="I'm starting a new podcast / audio program"
                      />
                    </Link>
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
        height: 50,
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
        marginTop: 10,
        marginBottom: 10
    },
    fbIcon: {
        marginLeft: 0,
        marginRight: 20,
        position: 'relative',
        bottom: 2,
        right: '10px',
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
        marginTop: 15,
        marginBottom: 15,
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
        fontSize: 16,
        marginBottom: 3,
        marginTop: 0,
        position: 'relative',
        // top: 10,
    },
    greyInputText: {
        fontSize: 16,
        float: 'left',
        paddingBottom: 5
    },
    input: {
        backgroundColor: Colors.window,
        fontSize: 16,
        height: 42,
        borderRadius: 3,
        boxShadow: '0 -1px 2px rgba(0, 0, 0, 0.5)',
    },
};
