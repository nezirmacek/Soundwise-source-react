import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactCrop from 'react-image-crop';
import axios from 'axios';
import firebase from 'firebase';
import moment from 'moment';

import {minLengthValidator, maxLengthValidator} from '../../../helpers/validators';
import {inviteListeners} from '../../../helpers/invite_listeners';

import ValidatedInput from '../../../components/inputs/validatedInput';
import Colors from '../../../styles/colors';
import { OrangeSubmitButton, TransparentShortSubmitButton } from '../../../components/buttons/buttons';

export default class InviteSubscribersModal extends Component {
  constructor(props) {
    super(props);
    this.state={
      inviteeList: '',
      submitted: false
    }

    this.closeModal = this.closeModal.bind(this);
    this.inviteListeners = this.inviteListeners.bind(this);
  }

  inviteListeners() {
    const inviteeArr = this.state.inviteeList.split(',');
    const that = this;
    const { soundcast, userInfo } = this.props;

    for(var i = inviteeArr.length -1; i >= 0; i--) {
        if (inviteeArr[i].indexOf('@') == -1) {
            inviteeArr.splice(i, 1);
        }
    }

    // send email invitations to invited listeners
    const subject = `${userInfo.firstName} ${userInfo.lastName} invites you to subscribe to ${soundcast.title}`;
    const content = `<p>Hi there!</p><p></p><p>${userInfo.firstName} ${userInfo.lastName} has invited you to subscribe to <a href="${soundcast.landingPage ? 'https://mysoundwise.com/soundcasts/'+soundcast.id : ''}" target="_blank">${soundcast.title}</a> on Soundwise. If you don't already have the Soundwise app on your phone--</p><p><strong>iPhone user: <strong>Download the app <a href="https://itunes.apple.com/us/app/soundwise-learn-on-the-go/id1290299134?ls=1&mt=8">here</a>.</p><p><strong>Android user: <strong>Download the app <a href="https://play.google.com/store/apps/details?id=com.soundwisecms_mobile_android">here</a>.</p><p></p><p>If you've already installed Soundwise on your phone, your new soundcast should be loaded automatically.</p><p>The Soundwise Team</p>`;
    inviteListeners(inviteeArr, subject, content);

    inviteeArr.forEach(email => {
        let _email = email.replace(/\./g, "(dot)");
        _email = _email.trim().toLowerCase();
        if(_email) {
          firebase.database().ref(`soundcasts/${this.props.soundcast.id}/invited/${_email}`).set(moment().format('X'));
          //invited listeners are different from subscribers. Subscribers are invited listeners who've accepted the invitation and signed up via mobile app
          firebase.database().ref(`invitations/${_email}`)
          .once('value')
          .then(snapshot => {
            if(snapshot.val()) {
              const update = {...snapshot.val(), [that.props.soundcast.id]: true};
              firebase.database().ref(`invitations/${_email}`).update(update);
            } else {
              firebase.database().ref(`invitations/${_email}/${that.props.soundcast.id}`).set(true);
            }
          })
        }
    });
    this.setState({
      submitted: true
    });
  }

  closeModal() {
    this.setState({
      submitted: false
    });

    this.props.onClose();
  }

  render() {
    const { soundcast, userInfo } = this.props;

    if(!this.props.isShown) {
      return null;
    }

    if(this.state.submitted) {
      return (
      <div>
        <div
          style={styles.backDrop}
          onClick={this.closeModal}>
        </div>
        <div style={styles.modal}>
          <div className='title-medium'
            style={styles.successText}>
            Your invitee list has been submitted
          </div>
          <div style={styles.successButtonWrap}>
              <div
                  style={{...styles.button}}
                  onClick={this.closeModal}>
                  Close
              </div>
          </div>
        </div>
      </div>
      )
    }

    return (
      <div>
        <div
          style={styles.backDrop}
          onClick={this.closeModal}>
        </div>
        <div style={styles.modal}>
          <div style={styles.titleText}>
            <div
              className='title-medium'>
                {`Invite subscribers to ${soundcast.title}`}
            </div>
          </div>
          <textarea
              style={styles.inputDescription}
              placeholder={'Enter listener email addresses, separated by commas'}
              onChange={(e) => {this.setState({inviteeList: e.target.value})}}
              value={this.state.subscribers}
          >
          </textarea>
          <div style={styles.buttonsWrap}>
            <div
                style={{...styles.button, ...styles.submitButton}}
                onClick={this.inviteListeners}>
                Submit
            </div>
            <div
                style={styles.button}
                onClick={this.closeModal}>
                Cancel
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const styles = {
  backDrop: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: '0px',
    left: '0px',
    zIndex: '9998',
    background: 'rgba(0, 0, 0, 0.3)'
  },
  modal: {
    position: 'absolute',
    top: '30%',
    left: '50%',
    width: '60%',
    height: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: '9999',
    background: '#fff'
  },
  successText:{
    height: '50%',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  successButtonWrap: {
    height: 50,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  titleText: {
    marginTop: 30,
    marginBottom: 20,
    marginLeft: 20
  },
  inputDescription: {
    height: '50%',
    width: '90%',
    paddingLeft: 20,
    marginLeft: 20,
    // padding: '10px 10px',
    fontSize: 16,
    borderRadius: 4,

  },
  buttonsWrap: {
  },
  button: {
    height: 35,
    display: 'inline-block',
    float: 'right',
    borderRadius: 23,
    overflow: 'hidden',
    // margin: '40px auto',
    fontSize: 14,
    letterSpacing: 2.5,
    wordSpacing: 5,
    marginRight: 20,
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
  submitButton: {
    backgroundColor: Colors.mainOrange,
    color: Colors.mainWhite,
    borderColor: Colors.mainOrange
  }
}