import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import Axios from 'axios';
import firebase from 'firebase';
import { Link } from 'react-router-dom';

import {minLengthValidator, maxLengthValidator} from '../../../helpers/validators';
import {inviteListeners} from '../../../helpers/invite_listeners';
import Settings from './settings';
import Transactions from './transactions';
import Payouts from './payouts';

import ValidatedInput from '../../../components/inputs/validatedInput';
import Colors from '../../../styles/colors';
import { OrangeSubmitButton, TransparentShortSubmitButton } from '../../../components/buttons/buttons';

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
    const { publisherImg, publisherName, publisherEmail, publisherSaved, fileUploaded, admins, adminFormShow, inviteeFirstName, inviteeLastName, inviteeEmail, inviteSent } = this.state;
    const that = this;
    const {userInfo} = this.props;

    if(this.props.match.params.id == 'transactions') {
      return <Transactions
                {...this.props}
                userInfo={userInfo}
                history={this.props.history}
                id={this.props.match.params.id}
             />
    } else if(this.props.match.params.id == 'payouts') {
      return <Payouts
                {...this.props}
                userInfo={userInfo}
                id={this.props.match.params.id}
             />
    } else {
      return <Settings
                {...this.props}
                userInfo={userInfo}
                history={this.props.history}
                id={this.props.match.params.id}
             />
    }
  }
}

const styles = {
    titleText: {
        fontSize: 16,
        fontWeight: 600,
    },
    inputTitleWrapper: {
        width: '100%',
        marginTop: 10,
        marginBottom: 20,
    },
    inputTitle: {
        height: 40,
        backgroundColor: Colors.mainWhite,
        width: '100%',
        fontSize: 16,
        borderRadius: 4,
        marginBottom: 0,
    },
    inputDescription: {
        height: 80,
        backgroundColor: Colors.mainWhite,
        width: '100%',
        fontSize: 16,
        borderRadius: 4,
        marginTop: 10,
        marginBottom: 20
    },
    editorStyle: {
        padding: '5px',
        borderRadius: 4,
        height: '300px',
        width: '100%',
        backgroundColor: Colors.mainWhite,
      },
    wrapperStyle: {
        borderRadius: 4,
        marginBottom: 25,
        marginTop: 15,
    },
    image: {
        width: 133,
        height: 133,
        float: 'left',
        backgroundColor: Colors.mainWhite,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: Colors.lightGrey,
    },
    loaderWrapper: {
        height: 133,
        paddingTop: 20,
        paddingRight: 0,
        paddingBottom: 0,
        paddingLeft: 20,
        width: 'calc(100% - 133px)',
        float: 'left',
    },
    inputFileWrapper: {
        margin: 10,
        width: 'calc(100% - 20px)',
        height: 60,
        // backgroundColor: Colors.mainWhite,
        overflow: 'hidden',
        marginBottom: 0,
        float: 'left',
    },
    inputFileHidden: {
        position: 'absolute',
        display: 'block',
        overflow: 'hidden',
        width: 0,
        height: 0,
        border: 0,
        padding: 0,
    },
    uploadButton: {
        backgroundColor: Colors.link,
        width: 80,
        height: 30,
        // float: 'left',
        color: Colors.mainWhite,
        fontSize: 14,
        border: 0,
        marginTop: 5

    },
    cancelImg: {
      color: Colors.link,
      marginLeft: 20,
      fontSize: 14,
      cursor: 'pointer'
    },
    fileTypesLabel: {
        fontSize: 11,
        marginLeft: 0,
        display: 'block',
    },
    addAdmin: {
        fontSize: 16,
        // marginLeft: 10,
        marginTop: 20,
        marginBottom: 10,
        color: Colors.link,
        cursor: 'pointer',
    },
}