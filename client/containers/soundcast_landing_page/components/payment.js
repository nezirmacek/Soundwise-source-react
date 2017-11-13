import React, {Component} from 'react';
import Axios from 'axios';
import { Link, Redirect } from 'react-router-dom';
import Dots from 'react-activity/lib/Dots';

import * as firebase from 'firebase';
import moment from 'moment';

import  PageHeader  from './page_header';
import Colors from '../../../styles/colors';

import {inviteListeners} from '../../../helpers/invite_listeners';
let stripe, elements;

export default class Payment extends Component {
    constructor(props) {
        super(props);

        this.state={
            paymentError: '',
            submitDisabled: false,
            number: '',
            cvc: '',
            exp_month: '0',
            exp_year: new Date().getFullYear(),
            totalPay: 0,
            paid: false,
            startPaymentSubmission: false,
            stripe_id: '',
            userInfo: null,
        };

        this.onSubmit = this.onSubmit.bind(this);
        this.stripeTokenHandler = this.stripeTokenHandler.bind(this);
        this.renderProgressBar = this.renderProgressBar.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount() {
        // stripe = Stripe.setPublishableKey('pk_test_BwjUV9yHQNcgRzx59dSA3Mjt');
        stripe = Stripe.setPublishableKey('pk_live_Ocr32GQOuvASmfyz14B7nsRP');
        this.setState({
            totalPay: this.props.total
        });
        const that = this;
        if(this.props.userInfo && this.props.userInfo.email) {
            this.setState({
                userInfo: that.props.userInfo
            });
            if(this.props.total == 0 || this.props.total == 'free') {
                this.addSoundcastToUser();
            }
        }
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.userInfo && nextProps.userInfo.email) { //if it's free course, then no need for credit card info. add soundcast to user and then redirect
            this.setState({
                userInfo: nextProps.userInfo
            });
            if(nextProps.total === 0 || nextProps.total == 'free') {
              this.addSoundcastToUser(nextProps.userInfo);
            }
        }
        this.setState({
            totalPay: nextProps.total
        });
    }

    handleChange(e) {
        this.setState({
          [e.target.name]: e.target.value
        })
    }

    addSoundcastToUser(charge) {
        // console.log('charge: ', charge);
        const that = this;
        const {soundcastID, soundcast, checked} = this.props;
        const userInfo = this.state.userInfo || this.props.userInfo;
        let _email;

        if(userInfo) {
            // console.log('userInfo: ', userInfo);
            _email = userInfo.email[0].replace(/\./g, "(dot)");

            const {billingCycle, paymentPlan, price} = soundcast.prices[checked];
            let current_period_end = 4638902400;

            const paymentID = charge && charge.id ? charge.id : null;
            const planID = charge && charge.plan ? charge.plan.id : null;
            current_period_end = charge && charge.current_period_end ? charge.current_period_end : current_period_end ; //if it's not a recurring billing ('one time'), set the end period to 2117/1/1.

            // send email invitations to subscribers
            const subject = `${userInfo.firstName}, thanks for subscribing! Here's how to access your soundcast`;
            const content = `<p>Hi ${userInfo.firstName}!</p><p></p><p>Thanks for subscribing to ${soundcast.title}. If you don't have the Soundwise mobile app installed on your phone, please access your soundcast by downloading the app first--</p><p><strong>iPhone user: <strong>Download the app <a href="https://itunes.apple.com/us/app/soundwise-learn-on-the-go/id1290299134?ls=1&mt=8">here</a>.</p><p><strong>Android user: <strong>Download the app <a href="https://play.google.com/store/apps/details?id=com.soundwisecms_mobile_android">here</a>.</p><p></p><p>...and then sign in to the app with the same credential you used to subscribe to this soundcast.</p><p></p><p>If you've already installed the app, your new soundcast should be loaded automatically.</p><p>The Soundwise Team</p>`;
            inviteListeners([userInfo.email[0]], subject, content);

            firebase.auth().onAuthStateChanged(function(user) {
                if (user) {
                    const userId = user.uid;
                    // add soundcast to user
                    firebase.database().ref(`users/${userId}/soundcasts/${soundcastID}`)
                    .set({
                        subscribed: true,
                        paymentID: paymentID ? paymentID : null,
                        current_period_end, //this will be null if one time payment
                        billingCycle: billingCycle ? billingCycle : null,
                        planID: planID ? planID : null,
                        date_subscribed: moment().format('X')
                    });
                    // add stripe_id to user data if not already exists
                    if(charge) {
                        if(!userInfo.stripe_id && charge.customer && charge.customer.length > 0) {
                            firebase.database().ref(`users/${userId}/stripe_id`)
                            .set(charge.customer);
                        }
                    }
                    //add user to soundcast
                    firebase.database().ref(`soundcasts/${soundcastID}/subscribed/${userId}`)
                    .set(moment().format('X'));
                    //remove from invited list
                    firebase.database().ref(`soundcasts/${soundcastID}/invited/${_email}`)
                    .remove();

                    that.props.handlePaymentSuccess();
                }
            });
        }
    }

    async onSubmit(event) {
        event.preventDefault();

        this.setState({
            startPaymentSubmission: true
        });
        const {number, cvc} = this.state;
        const exp_month = Number(this.state.exp_month) + 1;
        const exp_year = Number(this.state.exp_year);
        this.setState({ submitDisabled: true, paymentError: null });
        Stripe.card.createToken({number, cvc, exp_month, exp_year}, this.stripeTokenHandler);
    }

    stripeTokenHandler(status, response) {
        const amount = this.state.totalPay * 100; // in cents
        const {email, stripe_id} = this.props.userInfo;
        const {soundcast, checked, soundcastID} = this.props;
        const {billingCycle, paymentPlan, price} = soundcast.prices[checked];
        const that = this;

        if(response.error) {
            this.setState({
                paymentError: response.error.message,
                submitDisabled: false,
                startPaymentSubmission: false
            })
        } else {
            if(billingCycle == 'one time') { //if one time charge, post to api/charge
                Axios.post('/api/handleOnetimeCharge', {
                    amount,
                    source: response.id,
                    currency: 'usd',
                    receipt_email: email[0],
                    customer: stripe_id,
                    billingCycle,
                    publisherID: soundcast.publisherID,
                    soundcastID,
                    planID: `${soundcast.publisherID}-${soundcastID}-${soundcast.title}-${billingCycle}-${price}`,
                    description: `${soundcast.title}: ${paymentPlan}`,
                    statement_descriptor: `${soundcast.title}: ${paymentPlan}`,
                })
                .then(function (response) {

                    const paid = response.data.paid; //boolean
                    const customer = response.data.customer;

                    if(paid) {  // if payment made, push course to user data, and redirect to a thank you page
                        that.setState({
                            paid,
                            startPaymentSubmission: false
                        });

                        that.addSoundcastToUser(response.data) //add soundcast to user database and redirect
                    }
                })
                .catch(function (error) {
                    console.log('error from stripe: ', error)
                    that.setState({
                        paymentError: 'Your payment is declined :( Please check your credit card information.',
                        startPaymentSubmission: false
                    })
                })
            } else {  //if subscription, post to api/recurring_charge
                Axios.post('/api/recurring_charge', {
                    amount,
                    source: response.id,
                    currency: 'usd',
                    receipt_email: email[0],
                    customer: stripe_id,
                    billingCycle,
                    planID: `${soundcast.publisherID}-${soundcastID}-${soundcast.title}-${billingCycle}-${price}`,
                    description: `${soundcast.title}: ${paymentPlan}`,
                    statement_descriptor: `${soundcast.title}: ${paymentPlan}`,
                })
                .then(function (response) {

                    const subscription = response.data; //boolean
                    const customer = response.data.customer;
                    // console.log('subscription: ', subscription);

                    if(subscription.plan) {  // if payment made, push course to user data, and redirect to a thank you page
                        that.setState({
                            paid: true,
                            startPaymentSubmission: false
                        });

                        that.addSoundcastToUser(subscription) //add soundcast to user database and redirect
                    }
                })
                .catch(function (error) {
                    console.log('error from stripe: ', error)
                    that.setState({
                        paymentError: 'Your payment is declined :( Please check your credit card information.',
                        startPaymentSubmission: false
                    })
                })
            }
        }
    }

    renderProgressBar() {
        if(this.state.startPaymentSubmission) {
            return (
                <div style={{width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '1em'}}>
                    <Dots style={{display: 'flex'}} color="#727981" size={32} speed={1}/>
                </div>
            )
        }
    }

    render() {

        const {total} = this.props;

        const monthOptions = [];
        const yearOptions = [];
        for (let i=0; i<12; i++) {
            monthOptions.push(<option value={i} key={i}>{moment().month(i).format('MMM (MM)')}</option>);
            yearOptions.push(<option value={i + +moment().format('YYYY')} key={i}>{i + +moment().format('YYYY')}</option>);
        }

        return (
            <div>
                <section className="bg-white builder-bg" id="subscribe-section6">
                    <div className='container' style={{paddingBottom: '70px'}}>
                        <div className="row equalize ">
                            <div className="col-md-6 center-col col-sm-12 ">
                                <div style={styles.totalRow}>
                                    <div style={styles.totalWrapper}>
                                        <div style={styles.totalText}>Total:</div>
                                        <div style={styles.totalPriceText}>{`$${total}`}</div>
                                    </div>
                                </div>
                                <form onSubmit={this.onSubmit}>
                                    {/*card number*/}
                                    <div style={styles.relativeBlock}>
                                        <input
                                            onChange={this.handleChange}
                                            required
                                            className='border-radius-4'
                                            size='20'
                                            type='text'
                                            name='number'
                                            placeholder="Card Number"
                                            style={styles.input}
                                        />
                                        <img src="../../../images/card_types.png" style={styles.cardsImage} />
                                    </div>

                                    {/*Expiration*/}
                                    <div className=''>
                                        {/*month*/}
                                        <div style={styles.selectBlock} className="border-radius-4" >
                                            <label style={styles.selectLabel}>Exp Month</label>
                                            <select
                                                onChange={this.handleChange}
                                                name="exp_month"
                                                id="expiry-month"
                                                style={styles.select}
                                            >
                                                {
                                                    monthOptions.map(item => item)
                                                }
                                            </select>
                                        </div>

                                        {/*year*/}
                                        <div style={styles.selectBlock} className="border-radius-4" >
                                            <label style={styles.selectLabel}>Exp Year</label>
                                            <select
                                                onChange={this.handleChange}
                                                name="exp_year"
                                                style={styles.select}
                                            >
                                                {
                                                    yearOptions.map(item => item)
                                                }
                                            </select>
                                        </div>

                                        {/*cvv/cvc*/}
                                        <input
                                            onChange={this.handleChange}
                                            required
                                            className='border-radius-4'
                                            size='4'
                                            type='password'
                                            name='cvc'
                                            placeholder="CVC"
                                            style={Object.assign({}, styles.input, styles.cvc)}
                                        />
                                    </div>

                                    {/*button*/}
                                    <div style={styles.buttonWrapper}>
                                        {
                                            this.state.paymentError &&
                                            <span style={{color: 'red'}}>{ this.state.paymentError }</span>
                                        }
                                        <button
                                            className='contact-submit btn propClone btn-3d text-white width-100 builder-bg tz-text'
                                            type='submit'
                                            style={styles.button}
                                        >
                                            PAY NOW
                                        </button>
                                        <div style={styles.securedTextWrapper}>
                                            <i className="ti-lock" style={styles.securedTextIcon} />
                                            Transactions are secure and encrypted.
                                        </div>
                                        <div style={styles.stripeImageWrapper}>
                                            <img src="../../../images/powered_by_stripe.png" style={styles.stripeImage}/>
                                        </div>
                                        {this.renderProgressBar()}
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        )
    }
}

const styles = {
    totalRow: {
        borderTop: `1px solid ${Colors.mainGrey}`,
        height: 22,
    },
    totalWrapper: {
        float: 'right',
        marginRight: 10,
        fontWeight: 'bold',
        fontSize: 14,
        color: Colors.fontBlack,
    },
    totalText: {
        width: 40,
        marginRight: 50,
        float: 'left',
    },
    totalPriceText: {
        width: 53,
        float: 'right',
        textAlign: 'right',
    },
    cardsImage: {
        position: 'absolute',
        right: 4,
        top: 10,
        width: 179,
        height: 26,
    },
    input: {
        height: 46,
        fontSize: 14,
        margin: '40px 0 0 0',
    },
    input2: {
        height: 46,
        fontSize: 14,
        margin: '10px 0 0 0',
    },
    selectBlock: {
        width: '35%',
        height: 46,
        float: 'left',
        marginTop: 9,
        border: `1px solid ${Colors.mainGrey}`,
        paddingLeft: 10,
        marginRight: '5%',
    },
    selectLabel: {
        fontWeight: 'normal',
        display: 'block',
        marginBottom: 0,
        color: Colors.fontBlack,
        fontSize: 14,
    },
    select: {
        border: 0,
        backgroundColor: Colors.mainWhite,
        padding: 0,
        margin: 0,
        color: Colors.fontGrey,
        fontSize: 14,
        position: 'relative',
        right: 3,
    },
    cvc: {
        width: '20%',
        marginTop: 9,
    },
    buttonWrapper: {
        margin: '20px 0 0 0',
    },
    stripeImageWrapper: {
        backgroundColor: Colors.mainOrange,
        overflow: 'hidden',
        position: 'relative',
        width: 138,
        height: 32,
        margin: '10px 10px',
        float: 'left',
        borderRadius: 5,
    },
    stripeImage: {
        width: 138,
        height: 32,
        position: 'relative',
        bottom: 0,
    },
    button: {
        height: 46,
        backgroundColor: Colors.mainOrange,
        fontSize: 14,
    },
    securedTextWrapper: {
        marginTop: 15,
        float: 'left',
    },
    securedTextIcon: {
        fontSize: 16,
    },
    securedText: {
        fontSize: 14,
    },

    relativeBlock: {
        position: 'relative',
    },
};

