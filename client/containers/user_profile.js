import React, {Component} from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Link, Switch } from 'react-router-dom';
import firebase from 'firebase';
import moment from 'moment';
import Axios from 'axios';
import Dots from 'react-activity/lib/Dots';

import Footer from '../components/footer';
import {SoundwiseHeader} from '../components/soundwise_header';
import Colors from '../styles/colors';

class _UserProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  render() {
    return (

    )
  }
}




const mapStateToProps = state => {
    const { userInfo, isLoggedIn } = state.user;
    return { userInfo, isLoggedIn, };
};

export const UserProfile = connect(mapStateToProps, null)(_UserProfile);