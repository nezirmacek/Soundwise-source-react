import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import Axios from 'axios';
import firebase from 'firebase';
import { Link } from 'react-router-dom';

import {minLengthValidator, maxLengthValidator} from '../../../helpers/validators';
import {inviteListeners} from '../../../helpers/invite_listeners';

import ValidatedInput from '../../../components/inputs/validatedInput';
import Colors from '../../../styles/colors';
import { OrangeSubmitButton, TransparentShortSubmitButton } from '../../../components/buttons/buttons';

export default class Billing extends Component {
  constructor(props) {
    super(props);
    this.state = {
      payouts: [{
        createdAt: '',
        amount: 0,
      }],
      affiliate: false,
    };
    this.handlePlanCancel = this.handlePlanCancel.bind(this);
    this.handleAffiliate = this.handleAffiliate.bind(this);
  }

  componentDidMount() {
    if(this.props.userInfo.publisher) {

    }
  }

  componentWillReceiveProps(nextProps) {

  }

  handlePlanCancel() {
    const {userInfo} = this.props;
    if(userInfo.publisher) {
      const {plan, frequency, current_period_end, auto_renewal, stripe_customer_id, subscriptionID} = userInfo.publisher;
      const cancelling = confirm(`Are you sure you want to cancel your ${plan.toUpperCase()} subscription?`);
      if(cancelling) {
        Axios.post('/api/cancel_plan', {subscriptionID})
        .then(response => {
          firebase.database().ref(`publishers/${userInfo.publisherID}/auto_renewal`).set(false);
          alert(`Your ${plan.toUpperCase()} plan auto renewal has been canceled. You still have access to ${plan.toUpperCase()} features till ${moment(current_period_end * 1000).format('YYYY-MM-DD')}.`);
        })
        .catch(err => {
          alert('Oops! There is an error canceling your subscription. Please contact Soundwise support at support@mysoundwise.com.');
        });
      }
    }
  }

  async handleAffiliate(){
    const {userInfo} = this.props;
    if (!userInfo || !userInfo.publisher) {
      return alert('Empty user/publisher value');
    }
    if (!userInfo.publisher.stripe_user_id) {
      // If the publisher does not have a connected stripe payout account yet (stripe_user_id under the publisher node in firebase == null), the screen should alert user that a payout account should be set up first
      alert('Error: payout account should be set up first');
    } else {
      // if the publisher has a stripe_user_id already, an affiliate id should be generated (use this format: affiliate id = [publisher id]-[stripe_user_id] of the referrer)
      await firebase.database().ref(`publishers/${userInfo.publisher.publisherID}/affiliate`)
      .set(true);
      this.setState({ affiliate: true });
    }
  }

  affiliateClick(e) {
    e.target.setSelectionRange(0, e.target.value.length)
  }

  render() {
    const {userInfo} = this.props;
    const that = this;
    const affiliate = userInfo.publisher && userInfo.publisher.affiliate || this.state.affiliate;
    if(userInfo.publisher) {
      const {plan, frequency, current_period_end, auto_renewal, stripe_customer_id} = userInfo.publisher;
      return (
              <div className='padding-30px-tb'>
                  <div className='padding-bottom-20px'>
                      <span className='title-medium '>
                          Publisher
                      </span>
                      <Link to={`/publishers/${userInfo.publisherID}`}>
                        <span className='text-medium' style={{marginLeft: 15, color: Colors.mainOrange}}><strong>View Publisher Page</strong></span>
                      </Link>
                  </div>
                  <ul className="nav nav-pills">
                    <li role="presentation" ><Link to='/dashboard/publisher'><span style={{fontSize: 15, fontWeight: 600}}>Profile</span></Link></li>
                    <li role="presentation" ><Link to="/dashboard/publisher/transactions"><span style={{fontSize: 15, fontWeight: 600}}>Transactions</span></Link></li>
                    <li role="presentation" ><Link   to="/dashboard/publisher/payouts"><span style={{fontSize: 15, fontWeight: 600}}>Payouts</span></Link></li>
                    <li role="presentation" className="active"><Link style={{backgroundColor: 'transparent'}} to="/dashboard/publisher/settings"><span style={{fontSize: 15, fontWeight: 600, color: Colors.mainOrange}}>Settings</span></Link></li>
                  </ul>
                  <div className='container' style={{minHeight: 700}}>
                    <div  className="row">
                      <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                        <div style={{marginTop: 20, textAlign: 'center'}}>
                          <span style={{...styles.titleText, marginTop: 20,}}>
                              Current Plan
                          </span>
                          <div>
                            <span style={{...styles.titleText, color: Colors.mainOrange, marginTop: 20,}}>{`Soundwise ${plan ? plan.toUpperCase() : 'BASIC'} ${frequency ? `- ${frequency.toUpperCase()}` : ''}`}</span>
                          </div>
                          {
                            current_period_end && auto_renewal &&
                            <div>
                              <span style={{fontSize: 16}}>{`Your plan will automatically renew on ${moment(current_period_end * 1000).format('YYYY-MM-DD')}`}</span>
                            </div>
                            || current_period_end && !auto_renewal &&
                            <div>
                              <span style={{fontSize: 16}}>{`You have access to ${plan.toUpperCase()} features until your subscription ends on ${moment(current_period_end * 1000).format('YYYY-MM-DD')}`}</span>
                            </div>
                            || null
                          }
                          <div>
                            <OrangeSubmitButton
                                label="Change Plan"
                                onClick={() => that.props.history.push({
                                  pathname: '/pricing'
                                })}
                                styles={{margin: '20px auto', backgroundColor: Colors.link, borderWidth: '0px'}}
                            />
                          </div>
                          {
                            current_period_end && auto_renewal &&
                            <div style={{marginTop: 25}}>
                              <span
                                onClick={this.handlePlanCancel}
                                style={{cursor: 'pointer', fontSize: 16}}>Cancel plan</span>
                            </div>
                            || null
                          }
                          { affiliate
                            && <div>
                                <div style={{...styles.titleText, marginTop: 20,marginBottom: 7}}>
                                  Affiliate link:
                                </div>
                                <input readOnly onClick={this.affiliateClick}
                                  style={{width:350,textAlign:'center',cursor:'pointer'}}
                                  value={
                                  `https://mysoundwise.com/?a_id=${userInfo.publisher.publisherID}-${userInfo.publisher.stripe_user_id}`
                                }></input>
                              </div>
                           || <div>
                                <OrangeSubmitButton
                                    label="Become an affiliate"
                                    onClick={this.handleAffiliate}
                                    styles={{margin: '20px auto', borderWidth: '0px'}}
                                />
                              </div>
                          }
                        </div>
                      </div>
                    </div>
                  </div>
              </div>
      )
    } else {
      return (
        <div>
          Loading...
        </div>
      )
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
  tableWrapper: {
    marginTop: 25,
    backgroundColor: Colors.mainWhite,
    padding: 25,
    overflow: 'auto',
    maxHeight: 650,
  },
  tr: {
      borderBottomWidth: 1,
    borderBottomColor: Colors.lightBorder,
    borderBottomStyle: 'solid',
  },
  th: {
    fontSize: 16,
    color: Colors.fontGrey,
    // height: 35,
    fontWeight: 'regular',
    verticalAlign: 'middle',
    wordWrap: 'break-word',
  },
  td: {
      color: Colors.softBlack,
    fontSize: 16,
    // height: 40,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    verticalAlign: 'middle',
    wordWrap: 'break-word',
  },


}
