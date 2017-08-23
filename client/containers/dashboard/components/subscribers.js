import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import ReactCrop from 'react-image-crop';
import axios from 'axios';
import firebase from 'firebase';

import {minLengthValidator, maxLengthValidator} from '../../../helpers/validators';
import ValidatedInput from '../../../components/inputs/validatedInput';
import Colors from '../../../styles/colors';
import { OrangeSubmitButton, TransparentShortSubmitButton } from '../../../components/buttons/buttons';
import InviteSubscribersModal from './invite_subscribers_modal'

export default class Subscribers extends Component {
  constructor(props) {
    super(props)

    this.state = {
      currentSoundcastID: null,
      currentSoundcast: null,
      soundcasts_managed: [],
      subscribers: [],
      checked: false,
      toBeUnsubscribed: [],
      showModal: false
    }

    this.subscribers = [];

    this.retrieveSubscriberInfo = this.retrieveSubscriberInfo.bind(this);
    this.handleCheck = this.handleCheck.bind(this);
    this.deleteSubscriber = this.deleteSubscriber.bind(this);
    this.handleModal = this.handleModal.bind(this);
  }

  componentDidMount() {
    const { userInfo } = this.props;
    const _subscribers = [];
    const _soundcasts_managed = [];
    for (let id in userInfo.soundcasts_managed) {
        const _soundcast = JSON.parse(JSON.stringify(userInfo.soundcasts_managed[id]));
        if (_soundcast.title) {
            _soundcast.id = id;
            _soundcasts_managed.push(_soundcast);
        }
    }

    for(let userId in _soundcasts_managed[0].subscribed) {
      this.retrieveSubscriberInfo(userId);
    }

    this.setState({
      soundcasts_managed: _soundcasts_managed,
      currentSoundcastID: _soundcasts_managed[0].id,
      currentSoundcast: _soundcasts_managed[0],
      subscribers: this.subscribers
    })
  }

  handleModal() {
    if(!this.state.showModal) {
      this.setState({
        showModal: true,
      })
    } else {
      this.setState({
        showModal: false
      })
    }
  }

  retrieveSubscriberInfo(userId) {
    const that = this;
    return firebase.database().ref('users/'+userId)
            .on('value', snapshot => {
              that.subscribers.push({...JSON.parse(JSON.stringify(snapshot.val())), id: userId});
            })
  }

  changeSoundcastId (e) {
    this.setState({
      currentSoundcastID: e.target.value
    });

    this.subscribers = [];
    const { soundcasts_managed, currentSoundcastID } = this.state;
    let currentSoundcast;

    soundcasts_managed.forEach(soundcast => {
      if(soundcast.id == e.target.value) {
        currentSoundcast = soundcast;
      }
    })

    for(let userId in currentSoundcast.subscribed) {
      this.retrieveSubscriberInfo(userId);
    }

    this.setState({
      subscribers: this.subscribers,
      currentSoundcast
    })
  }

  handleCheck(e) {
    this.setState({
      checked: e.target.checked
    })

    const toBeUnsubscribed = this.state.toBeUnsubscribed.slice(0);
    toBeUnsubscribed.push(e.target.name);
    this.setState({
      toBeUnsubscribed: toBeUnsubscribed
    })
  }

  deleteSubscriber() {
    if(confirm(`Are you sure you want to unsubscribe these listeners from ${this.state.currentSoundcast.title}?`)){

      // remove user-soundcast from both soundcast node and user node
      this.state.toBeUnsubscribed.forEach(listenerID => {
        firebase.database().ref('soundcasts/' + this.state.currentSoundcastID + '/subscribed/' + listenerID).remove()
          // .then(function() {
          //   console.log("Remove succeeded.")
          // })
          // .catch(function(error) {
          //   console.log("Remove failed: " + error.message)
          // });

        firebase.database().ref('users/' + listenerID + '/subscriptions/' + this.state.currentSoundcastID).remove();

        for(var i = this.subscribers.length - 1; i>=0; i-=1) {
          if(this.subscribers[i].id == listenerID) {
            this.subscribers.splice(i,1);
          }
        }
        this.setState({
          subscribers: this.subscribers
        })

      })

    }
  }


  render() {
    const { soundcasts_managed, subscribers, checked } = this.state;

    // const _subscribers = [];
    // for (let id in _soundcast.subscribed) {
    //   _subscribers.push(id);
    // }

    return (
      <div className='padding-30px-tb'>
        <InviteSubscribersModal
          isShown={this.state.showModal}
          soundcast={this.state.currentSoundcast}
          onClose={this.handleModal}
          userInfo={this.props.userInfo}
        />
        <div >
            <div className='padding-bottom-20px'>
              <span className='title-medium '>
                  Subscribers
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
              <span
                style={styles.invite}
                onClick={this.handleModal}>
                Invite Subscribers
              </span>
              <div style={styles.searchWrap}>

                    <input type="text" style={styles.searchTerm} placeholder="Search subscribers" />
                    <button type="submit" style={styles.searchButton}>
                      <i className="fa fa-search"></i>
                   </button>

              </div>
            </div>
            <div style={styles.pendingInviteWrap}>
              <span style={styles.pendingInvites}>See pending and accepted invites</span>
              <div style={styles.deleteButtonWrap}>
              {
                checked &&
                    <div
                        style={styles.unsubscribe}
                        onClick={this.deleteSubscriber}
                    >Unsubscribe
                    </div>
              }
              </div>
            </div>
            <div style={styles.tableWrapper}>
              <table>
                <tr style={styles.tr}>
                  <th style={{...styles.th, width: 37}}></th>
                  <th style={{...styles.th, width: 250}}>NAME</th>
                  <th style={{...styles.th, width: 250}}>EMAIL</th>
                  <th style={{...styles.th, width: 170}}>SUBSCRIBED ON</th>
                  <th style={{...styles.th, width: 170}}>TOTAL LISTEN</th>
                  <th style={{...styles.th, width: 170}}>STATS</th>
                  <th style={{...styles.th, width: 100}}></th>
                </tr>
                {
                  this.state.subscribers.map((subscriber, i) => {

                    return (
                      <tr key={i} style={styles.tr}>
                        <td style={{...styles.td, width: 37}}></td>
                        <td style={{...styles.td, width: 250}}>{`${subscriber.firstName} ${subscriber.lastName}`}</td>
                        <td style={{...styles.td, width: 250}}>{subscriber.email}</td>
                        <td style={{...styles.td, width: 170}}>{'__'}</td>
                        <td style={{...styles.td, width: 170}}>{0}</td>
                        <td style={{...styles.td, width: 170}}>
                          <i className="fa fa-line-chart" style={styles.itemChartIcon}></i>
                        </td>
                        <td style={{...styles.td, width: 100}}>
                          <input
                            type="checkbox"
                            name={subscriber.id}
                            onClick={this.handleCheck}
                            style={styles.itemCheckbox} />
                        </td>
                      </tr>
                    );
                  })
                }
              </table>
            </div>
        </div>
      </div>
    )
  }
}

const styles = {
  titleRow: {
    marginBottom: 20
  },
  soundcastSelectWrapper: {
      height: 40,
      width: 300,
      // backgroundColor: Colors.mainWhite,
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
  invite: {
    color: Colors.mainOrange,
    fontSize: 18,
    marginRight: 60,
    cursor: 'pointer'
  },
  option: {
    fontSize: 16
  },
  searchWrap: {
    width: '30%',
    position: 'absolute',
    float: 'right',
    display: 'inline-block',
    marginTop: 0,
  },
  search: {
    width: '100%',
    position: 'relative',
  },
  searchTerm: {
    position: 'relative',
    float: 'left',
    width: '100%',
    border: '1px solid ',
    borderColor: Colors.link,
    padding: '5px',
    marginTop: '2px',
    height: '35px',
    borderRadius: '5px',
    outline: 'none',
    fontSize: 16
    // color: Colors.link
  },
  searchButton: {
    position: 'absolute',
    right: '-0px',
    width: '40px',
    height: '35px',
    border: '1px solid',
    borderColor: Colors.link,
    background: Colors.link,
    textAlign: 'center',
    color: '#fff',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '2px',
    fontSize: '20px'
  },
  pendingInviteWrap: {
    marginTop: 25,
    marginBottom: 25,
    height: 40
  },
  pendingInvites: {
    fontSize: 16,
    fontStyle: 'italic',
    textDecoration: 'underline',
    cursor: 'pointer'
  },
  deleteButtonWrap: {
    marginLeft: 25,
    display: 'inline-block',
    verticalAlign: 'middle'
  },
  unsubscribe: {
    height: 37,
    borderRadius: 23,
    overflow: 'hidden',
    // margin: '40px auto',
    fontSize: 14,
    letterSpacing: 2.5,
    wordSpacing: 5,
    paddingTop: 6,
    paddingRight: 20,
    paddingBottom: 4,
    paddingLeft: 20,
    borderWidth: 1,
    borderStyle: 'solid',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    color: Colors.darkGrey,
    borderColor: Colors.darkGrey,
  },
  tableWrapper: {
    marginTop: 20,
    backgroundColor: Colors.mainWhite
  },
  tr: {
      borderBottomWidth: 1,
    borderBottomColor: Colors.lightBorder,
    borderBottomStyle: 'solid',
  },
  th: {
    fontSize: 14,
    color: Colors.fontGrey,
    height: 35,
    fontWeight: 'regular',
    vAlign: 'middle',
  },
  td: {
      color: Colors.fontDarkGrey,
    fontSize: 14,
    height: 40,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  itemCheckbox: {
      marginTop: 0,
      height: 40,
      width: 50,
      // transform: 'scale(1.5)'
  },
  itemChartIcon: {
      fontSize: 16,
    color: Colors.fontBlack,
    cursor: 'pointer',
  },
}