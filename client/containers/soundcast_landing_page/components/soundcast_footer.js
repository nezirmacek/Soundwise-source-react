import React, {Component} from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as firebase from 'firebase';
import Axios from 'axios';

// import { openSignupbox, openConfirmationbox, addCourseToCart } from '../actions/index';
import { withRouter } from 'react-router';
import {orange50} from 'material-ui/styles/colors';

export default class SoundcastFooter extends Component {
  constructor(props) {
    super(props);

    this.checkOut = this.checkOut.bind(this);
    this.addSoundcastToUser = this.addSoundcastToUser.bind(this);
  }

  addSoundcastToUser() {
    // const that = this;
    // const userId = firebase.auth().currentUser.uid;
    // const {category, id, img_url_mobile, keywords, modules, name, price, run_time, teacher, teacher_bio, teacher_profession, description, teacher_img, teacher_thumbnail} = this.props.course; // TODO: remove general course fields from user/course

    // let sectionProgress = {};
    // this.props.course.modules.forEach(module => {
    //   module.sections.forEach(section => {
    //     sectionProgress[section.section_id] = {
    //       playProgress: 0,
    //       completed: false,
    //       timesRepeated: 0
    //     }
    //   })
    // })

    // const updates = {};
    // updates['/users/' + userId + '/courses/' + this.props.course.id] = {category, id, img_url_mobile, keywords, modules, name, price, run_time, teacher, teacher_bio, teacher_profession, description, teacher_img, teacher_thumbnail, sectionProgress}; // TODO: remove general course fields from user/course

    // updates['/courses/' + this.props.course.id + '/users/' + userId] = userId;
    // firebase.database().ref().update(updates);

    // Axios.post('/api/email_signup', { //handle mailchimp api call
    //   firstName: that.props.userInfo.firstName,
    //   lastName: that.props.userInfo.lastName,
    //   email: that.props.userInfo.email,
    //   courseID: this.props.course.id
    // })
    // .then(() => {
    //   that.props.history.push('/confirmation')
    // })
    // .catch((err) => {
    //   that.props.history.push('/confirmation')
    // })

  }

  checkOut() {
    // if(this.props.isLoggedIn) {
    //   if(this.props.course.price == 0) {
    //     this.addCourseToUser()

    //   } else {
    //     this.props.addCourseToCart(this.props.course)
    //     this.props.history.push('/cart')

    //   }

    // } else {
    //   this.props.openSignupbox(true)
    // }
  }

  render() {
    const {soundcast} = this.props;
    let displayedPrice = 'Free';
    let {prices} = soundcast;

    if(prices && prices.length > 0 && prices[0].price != 'free' ) {
        prices = prices.map(price => {
            if(price.billingCycle == 'one time' || price.billingCycle == 'monthly' ) {
                price.measure = price.price;
            } else if(price.billingCycle == 'quarterly') {
                price.measure = Math.floor(price.price / 3 *100) / 100;
            } else if(price.billingCycle == 'annual') {
                price.measure = Math.floor(price.price / 12 *100) / 100;
            }
            return price;
        });

        prices.sort((a, b) => (
            a.measure - b.measure
        ));
        // console.log('prices: ', prices);
        displayedPrice = prices[0].billingCycle == 'one time' ?
                            `$${prices[0].measure}` :
                            `$${prices[0].measure} / month`;
    }

    return (
            <section className=" builder-bg border-none" id="callto-action2" style={{backgroundColor: '#F76B1C', paddingBottom: '90px', paddingTop: '90px'}}>
                <div className="container">
                    <div className="row equalize">
                        <div className="col-md-12 col-sm-12 col-xs-12 text-center" style={{height: "46px"}}>
                            <div className="display-inline-block sm-display-block vertical-align-middle margin-five-right sm-no-margin-right sm-margin-ten-bottom tz-text alt-font text-white title-large sm-title-large xs-title-large">{`Get This Soundcast for ${displayedPrice}`}</div>
                            <a onClick={this.props.openModal} className="btn-large btn text-white highlight-button-white-border btn-circle"><span className="tz-text" >Get Access</span></a>
                        </div>
                    </div>
                </div>
            </section>
    )
  }
}

