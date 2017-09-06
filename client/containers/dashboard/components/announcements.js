import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import ReactCrop from 'react-image-crop';
import axios from 'axios';
import firebase from 'firebase';

import {minLengthValidator, maxLengthValidator} from '../../../helpers/validators';
import ValidatedInput from '../../../components/inputs/validatedInput';
import {sendNotifications} from '../../../helpers/send_notifications';
import Colors from '../../../styles/colors';
import { OrangeSubmitButton, TransparentShortSubmitButton } from '../../../components/buttons/buttons';

export default class Announcements extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentSoundcastID: null,
      currentSoundcast: null,
      soundcasts_managed: [],
      message: '',
      announcementsArr: [],
    }

    this.handlePublish = this.handlePublish.bind(this);
    this.sortAnnouncements = this.sortAnnouncements.bind(this);
  }

  componentDidMount() {
    const { userInfo } = this.props;
    const _subscribers = [];
    const _soundcasts_managed = [];
    console.log('userInfo: ', userInfo);

    for (let id in userInfo.soundcasts_managed) {
        const _soundcast = JSON.parse(JSON.stringify(userInfo.soundcasts_managed[id]));
        if (_soundcast.title) {
            _soundcast.id = id;
            _soundcasts_managed.push(_soundcast);
        }
    }

    this.setState({
      soundcasts_managed: _soundcasts_managed,
      currentSoundcastID: _soundcasts_managed[0].id,
      currentSoundcast: _soundcasts_managed[0],
    });

    this.sortAnnouncements(_soundcasts_managed[0].id);
  }


  sortAnnouncements(id) {
    const that = this;
    firebase.database().ref(`soundcasts/${id}`)
      .on('value', snapshot => {
        const announcements = snapshot.val().announcements;
        if(announcements) {
          const announcementsArr = Object.keys(announcements)
            .map(key => announcements[key]);

          // sort published announcements, latest one comes first
          announcementsArr.sort((a, b) => b.date_created - a.date_created);

          that.setState({
            announcementsArr
          })
        }
      })
  }

  changeSoundcastId (e) {
    console.log('currentSoundcastID: ', e.target.value);
    this.setState({
      currentSoundcastID: e.target.value
    });

    const { soundcasts_managed, currentSoundcastID } = this.state;
    let currentSoundcast;

    soundcasts_managed.forEach(soundcast => {
      if(soundcast.id == e.target.value) {
        currentSoundcast = soundcast;
      }
    })

    // for(let userId in currentSoundcast.subscribed) {
    //   this.retrieveSubscriberInfo(userId);
    // }

    this.setState({
      // subscribers: this.subscribers,
      currentSoundcast
    });

    this.sortAnnouncements(e.target.value);
  }

  handlePublish() {
    const that = this;
    const {currentSoundcastID, message} = this.state;
    const {userInfo} = this.props;
    const announcementID = `${moment().format('x')}a`;

    const newAnnouncement = {
      content: message,
      date_created: moment().format('X'),
      creatorID: firebase.auth().currentUser.uid,
      publisherID: this.props.userInfo.publisherID,
      soundcastID: currentSoundcastID,
      isPublished: true,
      id: announcementID,
    }

    firebase.database().ref(`soundcasts/${currentSoundcastID}/announcements/${announcementID}`)
    .set(newAnnouncement).then(
      res => {
          that.setState({
            message: ''
          });

          firebase.database().ref(`soundcasts/${currentSoundcastID}/subscribed`)
          .on('value', snapshot => {
            let registrationTokens = [];
            // get an array of device tokens
            Object.keys(snapshot.val()).forEach(user => {
              if(typeof snapshot.val()[user] == 'object') {
                  registrationTokens.push(snapshot.val()[user][0]) //basic version: only allow one devise per user
              }
            });
            const payload = {
              notification: {
                title: `${userInfo.firstName} ${userInfo.lastName} sent you a message`,
                body: `${message.slice(0, 50)}...`
              }
            };
            sendNotifications(registrationTokens, payload); //sent push notificaiton
          })
      },
      err => {
          console.log('ERROR adding announcement: ', err);
      }
  );


  }

  render() {
    const { soundcasts_managed, announcementsArr } = this.state;

    return (
      <div className='padding-30px-tb'>
        <div className='padding-bottom-20px'>
          <span className='title-medium '>
              Announcements
          </span>
          <div style={styles.soundcastSelectWrapper}>
              <select style={styles.soundcastSelect} onChange={(e) => {this.changeSoundcastId(e);}}>
                  <optgroup>
                    {
                        soundcasts_managed.map((souncast, i) => {
                            return (
                                <option style={styles.option} value={souncast.id} key={i}>{souncast.title}</option>
                            );
                        })
                    }
                  </optgroup>
              </select>
          </div>
        </div>
        <div style={styles.announcementWrap}>
          <textarea
              style={styles.inputAnnouncement}
              placeholder={'Make a new announcement'}
              onChange={(e) => {this.setState({message: e.target.value})}}
              value={this.state.message}
          >
          </textarea>
          <div style={styles.publishButtonWrap}>
              <div
                  style={{...styles.button}}
                  onClick={this.handlePublish}>
                  Publish
              </div>
          </div>
        </div>
        <div style={styles.announcementsWrap}>
          <div className='title-small' style={styles.publishedTitles}>
            Published announcements
          </div>
          <div>
            {
              announcementsArr.map((announcement, i) => {
                return (
                  <div style={styles.existingAnnouncement} key={i}>
                    <div style={styles.announcementContainer}>
                      <div style={styles.date}>{moment.unix(announcement.date_created).format("dddd, MMMM Do YYYY, h:mm a")}</div>
                      <div style={styles.content} className='text-large'>
                        {announcement.content}
                      </div>
                      <div style={styles.likes}>0 likes  0 comments</div>
                    </div>
                  </div>
                )
              })
            }
          </div>
        </div>
      </div>
    )
  }
}

const styles = {
  soundcastSelectWrapper: {
      height: 40,
      width: 300,
      marginTop: 0,
      marginLeft: 30,
      marginRight: 30,
      display: 'inline-block'
  },
  soundcastSelect: {
      backgroundColor: Colors.mainWhite,
      width: 'calc(100% - 20px)',
      height: 35,
      marginLeft: 10,
      marginRight: 10,
      marginTop: 0,
      fontSize: 16
  },
  option: {
    fontSize: 16
  },
  announcementWrap: {
    marginLeft: 10,
    width: '95%',
  },
  inputAnnouncement: {
      height: 120,
      fontSize: 16,
      borderRadius: 4,
      marginTop: 0,
      marginBottom: 10
  },
  publishButtonWrap: {
    marginTop: 10,
    marginBottom: 10,
    height: 40,
  },
  publisheTitleWrap: {
    marginLeft: 10,
    marginBottom: 20,
  },
  button: {
    height: 35,
    // display: 'inline-block',
    float: 'right',
    borderRadius: 23,
    overflow: 'hidden',
    // margin: '40px auto',
    fontSize: 14,
    letterSpacing: 2.5,
    wordSpacing: 5,
    marginRight: 0,
    paddingTop: 6,
    paddingRight: 20,
    paddingBottom: 4,
    paddingLeft: 20,
    borderWidth: 1,
    borderStyle: 'solid',
    cursor: 'pointer',
    backgroundColor: Colors.mainOrange,
    color: Colors.mainWhite,
    borderColor: Colors.mainOrange,
  },
  announcementsWrap: {
    marginTop: 15,
    marginBottom: 10
  },
  existingAnnouncement: {
    marginLeft: 10,
    width: '95%',
    backgroundColor: Colors.mainWhite,
    marginBottom: 10,
  },
  publishedTitles: {
    marginBottom: 15,
    marginLeft: 10,
  },
  announcementContainer: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 15,
    paddingRight: 15,
  },
  date: {
    // color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  content: {

  },
  likes: {
    fontSize: 14,
    textAlign: 'right',
  }
}