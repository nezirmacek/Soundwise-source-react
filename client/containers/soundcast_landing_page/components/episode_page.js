import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import {Helmet} from "react-helmet"
import firebase from 'firebase'
import moment from 'moment'
import { withRouter } from 'react-router'
import { Redirect } from 'react-router-dom'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import Axios from 'axios'
import Footer from '../../../components/footer'
import  PageHeader  from './page_header'
import AudioPlayer from 'react-responsive-audio-player'
import {SoundwiseHeader} from '../../../components/soundwise_header'
import Colors from '../../../styles/colors';

class _EpisodePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      episodeID: '',
      title: '',
      url: '',
      date_created: 0,
      description: '',
      duration: '',
      likes: '',
      listens: '',
      soundcastID: '',
      soundcastTitle: '',
      subscribable: false,
      soundcastImageURL: '',
      publisherImageURL: '',
      publisherID: '',
      coverArtUrl: '',
      publisherName: '',
      publicEpisode: true,
      liked: false,
      webID: `web-${moment().format('x')}`,
      startPosition: 0,
      endPosition: null,
      showTimeStamps: false,
    };
    this.audio = null;
  }

  componentDidMount() {
    const that = this;
    const episodeID = this.props.match.params.id;
    // console.log('soundcastID: ', soundcastID);
    firebase.database().ref('episodes/' + episodeID)
      .on('value', snapshot => {
        if(snapshot.val()) {
            that.setState({
              episodeID,
              title: snapshot.val().title,
              url: snapshot.val().url,
              date_created: snapshot.val().date_created,
              description: snapshot.val().description,
              duration: snapshot.val().duration,
              likes: snapshot.val().likes ? Object.keys(snapshot.val().likes).length : 0,
              listens: snapshot.val().totalListens ? snapshot.val().totalListens : 0,
              publicEpisode: snapshot.val().publicEpisode ? true : false,
              soundcastID: snapshot.val().soundcastID,
              publisherID: snapshot.val().publisherID,
              coverArtUrl: snapshot.val().coverArtUrl ? snapshot.val().coverArtUrl : '',
            });

            firebase.database().ref('publishers/' + that.state.publisherID)
            .once('value')
            .then(snapshot => {
              if(snapshot.val()) {
                that.setState({
                  publisherName: snapshot.val().name,
                  publisherImageURL: snapshot.val().imageUrl,
                })
              }
            })
            .then(() => {
              firebase.database().ref('soundcasts/' + that.state.soundcastID)
              .once('value')
              .then(snapshot => {
                if(snapshot.val()) {
                  that.setState({
                    subscribable: snapshot.val().landingPage,
                    soundcastTitle: snapshot.val().title,
                    soundcastImageURL: snapshot.val().imageURL,
                    showTimeStamps: snapshot.val().showTimeStamps ? snapshot.val().showTimeStamps : false,
                  })
                }
              })
            })
        }
      })

  }

  getTime_hoursMins (seconds) {
      if (seconds > 0) {
          const _hours = Math.floor(seconds / 3600);
          const _minutes = Math.floor((seconds - _hours * 3600) / 60);
          return `${_hours && `${_hours} hour` || ''}${_hours > 1 && 's' || ''} ${_minutes < 10 && `0${_minutes} min` || `${_minutes} min`}${_minutes > 1 && 's' || ''}`;
      } else {
          return '0 mins';
      }
  }

  recordPlaying() {
    // console.log('recordPlaying fired');
    const {episodeID, listens, startPosition} = this.state;
    if(this.audio) {
      this.setState({
        startPosition: this.audio.currentTime,
      })
    }

  }

  sendToDatabase(event) {
    const {soundcastID, publisherID, episodeID, startPosition, listens} = this.state;
    const _date = moment().utc().format();

    firebase.database().ref(`episodes/${episodeID}/totalListens`)
    .set(listens + 1);

    if(event == 'pause') {
      this.setState({
        endPosition: this.audio.currentTime,
      });
    } else if(event == 'ended') {
      this.setState({
        endPosition: this.audio.duration,
      })
    }

    const listeningSession = {
            soundcastId: soundcastID,
            publisherId: publisherID,
            episodeId: episodeID,
            userId: 'guest_listening',
            date: _date,
            startPosition: Math.floor(startPosition),
            endPosition: Math.floor(this.state.endPosition >= startPosition ? this.state.endPosition : startPosition),
            percentCompleted: Math.round(this.state.endPosition / this.audio.duration * 100 || 100),
            sessionDuration: this.state.endPosition - startPosition,
            createdAt: _date,
            updatedAt: _date,
    };

        if (this.state.endPosition - startPosition > 0) { // save only with positive duration
            Axios.post('/api/listening_session', listeningSession)
                .then(res => {
                    // console.log('success save listeningSessions: ', res)
                })
                .catch(err => console.log(err));
        }
  }

  changeLike() {
    const {episodeID, likes, webID, liked} = this.state;

    if(!liked) {
      firebase.database().ref(`episodes/${episodeID}/likes/${webID}`)
      .set(moment().format('X'))
      .then(() => {

          // console.log('success set like');
      })
      .catch((err) => {
          alert('ERROR: like save: ' + err.toString());
      });
    } else {
      firebase.database().ref(`episodes/${episodeID}/likes/${webID}`)
      .remove()
    }
    this.setState({
      liked: !liked
    });
  }

  render() {
    const that = this;
    const { episodeID, title, url, date_created, description, duration, likes, listens, soundcastID, soundcastTitle, subscribable, soundcastImageURL, coverArtUrl, publisherImageURL, publisherID, publisherName, publicEpisode, liked, showTimeStamps } = this.state;
    const playlist = [{
      url,
      displayText: title
    }];

    if(!publicEpisode) {
      return (
        <div>
          <PageHeader/>
          <section className="padding-110px-tb bg-white builder-bg xs-padding-60px-tb" id="feature-section14">
              <div className="container">
                  <div className="row">
                      <div className="col-md-12 col-sm-12 col-xs-12 text-center">
                          <h2 className="section-title-large sm-section-title-medium xs-section-title-large text-dark-gray font-weight-600 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text">SORRY, THIS EPISODE IS NOT PUBLIC!</h2>
                      </div>
                  </div>
              </div>
          </section>
          <div style={{position:'absolute', bottom: 0, width: '100%'}}>
            <Footer />
          </div>
        </div>
      )
    }

    return (
      <div>
        <Helmet>
          <title>{`${title} | Soundwise`}</title>
          <meta property="og:url" content={`https://mysoundwise.com/episodes/${episodeID}`} />
          <meta property="fb:app_id" content='1726664310980105' />
          <meta property="og:title" content={`${title} - ${soundcastTitle}`}/>
          <meta property="og:description" content={description}/>
          <meta property="og:image" content={coverArtUrl || soundcastImageURL} />
          <meta name="description" content={description} />
          <meta name="twitter:title" content={`${title} - ${soundcastTitle}`}/>
          <meta name="twitter:description" content={description}/>
          <meta name="twitter:image" content={coverArtUrl || soundcastImageURL}/>
          <meta name="twitter:card" content={coverArtUrl || soundcastImageURL} />
        </Helmet>
        <MuiThemeProvider >
          <div>
            <SoundwiseHeader
              soundcastID = {soundcastID}
            />
            <div>
                <section className="padding-90px-tb bg-white builder-bg xs-padding-60px-tb" id="feature-section14">
                    <div className="container">
                        <div className="row">
                            <div className="col-md-12 col-sm-12 col-xs-12 text-center">
                                <h2 className="section-title-medium sm-section-title-medium xs-section-title-large text-dark-gray font-weight-600 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text">
                                    {title}
                                </h2>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-12 col-sm-12 col-xs-12 text-center margin-three-bottom xs-margin-fifteen-bottom">
                              {
                               subscribable &&
                               <div>
                                 <a target='_blank' href={`https://mysoundwise.com/soundcasts/${soundcastID}`}>
                                    <span className="section-title-small sm-section-title-small xs-section-title-medium  font-weight-400 alt-font  tz-text" style={{color: '#F76B1C'}}>
                                        {`${soundcastTitle} `}</span>
                                </a>
                                <span className="section-title-small sm-section-title-small xs-section-title-medium text-dark-gray font-weight-400 alt-font tz-text">{`by `}</span>
                                <a target='_blank' href={`https://mysoundwise.com/publishers/${publisherID}`}>
                                    <span className="section-title-small sm-section-title-small xs-section-title-medium font-weight-400 alt-font  tz-text" style={{color: Colors.link}}>{`${publisherName}`}</span>
                                 </a>
                               </div>
                               ||
                               <div>
                                <span className="section-title-small sm-section-title-small xs-section-title-medium text-dark-gray font-weight-400 alt-font tz-text">
                                    {`${soundcastTitle} by `}
                                </span>
                                <span className="section-title-small sm-section-title-small xs-section-title-medium font-weight-400 alt-font  tz-text" style={{color: Colors.link}}>
                                    {`${publisherName}`}
                                </span>
                               </div>
                              }
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-5 col-sm-5 col-xs-12 text-center center-col" style={{}}>
                              <img
                                  src={coverArtUrl || soundcastImageURL}
                                  alt={soundcastTitle}
                                  style={{}}
                              />
                            </div>
                        </div>
                        <div className="row">
                          <div className="col-md-12 col-sm-12 col-xs-12 text-center center-col " style={{display: 'flex', justifyContent: 'center', marginTop: 20}}>
                            <a href={`https://mysoundwise.com/soundcasts/${soundcastID}`} target='_blank' className="btn-medium btn btn-circle text-white no-letter-spacing" onClick={this.props.openModal} style={{backgroundColor: '#61E1FB'}}
                            >
                              <span className="text-extra-large sm-text-extra-large tz-text">SUBSCRIBE</span>
                            </a>
                          </div>
                        </div>
                        <div className="row">
                            <div className="col-md-12 col-sm-12 col-xs-12 text-center center-col" style={{display: 'flex', justifyContent: 'center', marginTop: 20}}>
                              <h2 className="section-title-small sm-section-title-small xs-section-title-medium text-dark-gray font-weight-400 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text">
                                {
                                  showTimeStamps &&
                                  `${moment(date_created * 1000).format('MMM DD YYYY')} ${String.fromCharCode(183)} ${this.getTime_hoursMins(duration)}`
                                  ||
                                  `${this.getTime_hoursMins(duration)}`
                                }
                              </h2>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-12 col-sm-12 col-xs-12 text-center center-col" style={{display: 'flex', justifyContent: 'center', marginTop: 10}}>
                              {
                                <span className="section-title-small sm-section-title-small xs-section-title-medium text-dark-gray font-weight-400 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text" style={{marginRight: 35}}>
                                  <i
                                    className="fa fa-heart" aria-hidden="true"
                                    style={{color: liked ? 'red' : 'black'}}
                                    onClick={this.changeLike.bind(this)}></i>
                                  {` ${likes || 0} ${likes && likes > 1 ? 'likes' : 'like'}` }
                                </span>
                              }
                              {
                                <span className="section-title-small sm-section-title-small xs-section-title-medium text-dark-gray font-weight-400 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text">
                                  <i className="fa fa-headphones" aria-hidden="true"></i>
                                  {` ${listens || 0} ${listens && listens > 1 ? 'listens' : 'listen'}` }
                                </span>
                              }
                            </div>
                        </div>
                        <div className="row">
                          <div className="col-md-12 col-sm-12 col-xs-12 text-center center-col" style={{display: 'flex', justifyContent: 'center', marginTop: 20, marginBottom: 10}}>
                            <AudioPlayer
                              playlist={playlist}
                              hideBackSkip={true}
                              hideForwardSkip={true}
                              audioElementRef={(elem) => that.audio = elem}
                              onMediaEvent={{
                                play: this.recordPlaying.bind(this),
                                pause: this.sendToDatabase.bind(this, 'pause'),
                                ended: this.sendToDatabase.bind(this, 'ended')
                              }}
                              style={{width: '70%'}}
                            />
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-md-9 col-sm-9 col-xs-12  center-col" style={{ marginTop: 20, marginBottom: 10}}>
                            <p className="text-large text-dark-gray" style={{whiteSpace: 'pre-wrap', textAligh: 'left'}}>{description}</p>
                          </div>
                        </div>
                    </div>
                </section>
            </div>
            <Footer
              soundcastID = {soundcastID}
            />
          </div>
        </MuiThemeProvider>
      </div>
    )
  }
}

// const EP_worouter = connect(mapStateToProps, null)(_EpisodePage)

export const EpisodePage = withRouter(_EpisodePage)

