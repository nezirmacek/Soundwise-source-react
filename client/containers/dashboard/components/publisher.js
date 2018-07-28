import React, {Component} from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import Axios from 'axios';
import firebase from 'firebase';
import {Link} from 'react-router-dom';

import {
  minLengthValidator,
  maxLengthValidator,
} from '../../../helpers/validators';
import {inviteListeners} from '../../../helpers/invite_listeners';
import Profile from './settings';
import Transactions from './transactions';
import Payouts from './payouts';
import Billing from './billing';

import ValidatedInput from '../../../components/inputs/validatedInput';
import {
  OrangeSubmitButton,
  TransparentShortSubmitButton,
} from '../../../components/buttons/buttons';

export default class Publisher extends Component {
  constructor(props) {
    super(props);
    this.state = {
      publisherName: '',
      publisherImg: '',
      publisherPaypal: '',
      fileUploaded: false,
      admins: [],
      adminFormShow: false,
      inviteSent: false,
      inviteeEmail: '',
      inviteeFirstName: '',
      inviteeLastName: '',
      publisherSaved: false,
    };
  }

  render() {
    const {
      publisherImg,
      publisherName,
      publisherEmail,
      publisherSaved,
      fileUploaded,
      admins,
      adminFormShow,
      inviteeFirstName,
      inviteeLastName,
      inviteeEmail,
      inviteSent,
    } = this.state;
    const that = this;
    const {userInfo} = this.props;

    if (this.props.match.params.id == 'transactions') {
      return (
        <Transactions
          {...this.props}
          userInfo={userInfo}
          history={this.props.history}
          id={this.props.match.params.id}
        />
      );
    } else if (this.props.match.params.id == 'payouts') {
      return (
        <Payouts
          {...this.props}
          userInfo={userInfo}
          id={this.props.match.params.id}
        />
      );
    } else if (this.props.match.params.id == 'settings') {
      return (
        <Billing
          {...this.props}
          userInfo={userInfo}
          id={this.props.match.params.id}
        />
      );
    } else {
      return (
        <Profile
          {...this.props}
          userInfo={userInfo}
          history={this.props.history}
          id={this.props.match.params.id}
        />
      );
    }
  }
}
