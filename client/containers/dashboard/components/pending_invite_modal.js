import React, { Component } from 'react';
import moment from 'moment';

import {minLengthValidator, maxLengthValidator} from '../../../helpers/validators';
import {inviteListeners} from '../../../helpers/invite_listeners';

import ValidatedInput from '../../../components/inputs/validatedInput';
import Colors from '../../../styles/colors';
import { OrangeSubmitButton, TransparentShortSubmitButton } from '../../../components/buttons/buttons';

export default class PendingInviteModal extends Component {
  constructor(props) {
    super(props);

    this.closeModal = this.closeModal.bind(this);
  }

  closeModal() {
    this.props.onClose();
  }

  render() {
    const invitees = [];
    const {invited} = this.props.soundcast;
    let email;
    for(var key in invited) {
      if(invited[key]) {
        email = key.replace('(dot)', '.');
        invitees.push({
          email,
          date: invited[key]
        })
      }
    }

    if(!this.props.isShown) {
      return null;
    } else {
      return (
      <div>
        <div
          style={styles.backDrop}
          onClick={this.closeModal}>
        </div>
        <div style={styles.modal}>
          <div style={{padding: 25}}>
            <div className='row'>
              <div className='title-small' style={styles.headingText}>
                {`Pending Invite List for ${this.props.soundcast.title}`}
              </div>
              <div style={styles.closeButtonWrap}>
                  <div
                      style={{cursor: 'pointer'}}
                      onClick={this.closeModal.bind(this)}>
                      <i className='fa fa-times fa-2x' style={{color: 'red'}}></i>
                  </div>
              </div>
            </div>
            <div style={styles.table}>
              <table >
                <tr style={styles.tr}>
                  <th style={{...styles.th, width: 37}}></th>
                  <th style={{...styles.th, width: 350}}>EMAIL</th>
                  <th style={{...styles.th, width: 150}}>INVITED ON</th>
                </tr>
                {
                  invitees.map((invitee, i) => {
                    return (
                      <tr key={i} style={styles.tr}>
                        <td style={{...styles.td, width: 37}}></td>
                        <td style={{...styles.td, width: 350}}>{invitee.email}</td>
                        <td style={{...styles.td, width: 150}}>{typeof invitee.date == 'boolean' ? '__' : moment.unix(invitee.date).format('MMM DD YYYY')}</td>
                      </tr>
                    )
                  })
                }
              </table>
            </div>
          </div>
        </div>
      </div>
      )
    }
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
  table: {
    display: 'flex',
    justifyContent: 'center',
  },
  headingText:{
    width: '89%',
    margin: 20,
    paddingLeft: 20,
    float: 'left',
    display: 'inline-block',
  },
  closeButtonWrap: {
    // marginTop: 20,
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
}