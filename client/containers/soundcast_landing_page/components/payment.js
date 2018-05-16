import React, {Component} from 'react';
import Axios from 'axios';
import { Link, Redirect } from 'react-router-dom';
import Dots from 'react-activity/lib/Dots';
import draftToHtml from 'draftjs-to-html';
import * as firebase from 'firebase';
import moment from 'moment';

import  PageHeader  from './page_header';
import Colors from '../../../styles/colors';
import {inviteListeners} from '../../../helpers/invite_listeners';
import {addToEmailList} from '../../../helpers/addToEmailList';

export default class Payment extends Component {
    constructor(props) {
        super(props);

        this.state={
            paymentError: '',
            submitDisabled: false,
            firstName: '',
            lastName: '',
            email: '',
            number: '',
            cvc: '',
            exp_month: 0,
            exp_year: new Date().getFullYear(),
            totalPay: 0,
            paid: false,
            startPaymentSubmission: false,
            stripe_id: '',
            userInfo: null,
            confirmationEmailSent: false,
        };

        this.onSubmit = this.onSubmit.bind(this);
        this.stripeTokenHandler = this.stripeTokenHandler.bind(this);
        this.addSoundcastToUser = this.addSoundcastToUser.bind(this);
        this.renderProgressBar = this.renderProgressBar.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount() {
        // Stripe.setPublishableKey('pk_live_Ocr32GQOuvASmfyz14B7nsRP');
        Stripe.setPublishableKey('pk_test_BwjUV9yHQNcgRzx59dSA3Mjt');

        this.setState({
            totalPay: this.props.total
        });
        if(this.props.userInfo && this.props.userInfo.email) {
            this.setState({
                userInfo: this.props.userInfo
            });
            if(this.props.total == 0 || this.props.total == 'free') {
                this.addSoundcastToUser(null, this.props.userInfo);
            } else if (this.props.userInfo.stripe_id) { // have stripe_id
                this.stripeTokenHandler(null, {}); // charge user
            }
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            totalPay: nextProps.total
        });
        if(nextProps.userInfo && nextProps.userInfo.email && !this.props.userInfo.email) {
            this.setState({
                userInfo: nextProps.userInfo
            });
            if(nextProps.total === 0 || nextProps.total == 'free') {
                // if it's free course, then no need for credit card info.
                // add soundcast to user and then redirect
                this.addSoundcastToUser(null, nextProps.userInfo);
            } else if (nextProps.userInfo.stripe_id) { // have stripe_id
                this.stripeTokenHandler(null, {}); // charge user
            }
        }
    }

    shouldComponentUpdate(nextProps) {
        if(  this.props.isEmailSent != nextProps.isEmailSent || this.props.total != nextProps.total ){
            // this.setState({confirmationEmailSent : true})
            return true;
        }
        else {
            return false
        }
    }

    componentWillUnmount() {
        // console.log('payment component will unmount');
    }

    handleChange(e) {
        this.setState({
          [e.target.name]: e.target.value
        })
    }

    addSoundcastToUser(charge, userInfoFromProp) {
        const userInfo = userInfoFromProp ? userInfoFromProp : (this.state.userInfo || this.props.userInfo);
        if(userInfo && userInfo.email) { // if logged in
            const that = this;
            const {soundcastID, soundcast, checked} = this.props;
            const {confirmationEmail} = soundcast;
            const {totalPay} = this.state;
            let _email, content;

            // console.log('userInfo: ', userInfo);
            _email = userInfo.email[0].replace(/\./g, "(dot)");

            const {billingCycle, paymentPlan, price, rentalPeriod} = soundcast.prices[checked];
            let current_period_end = rentalPeriod ? moment().add(Number(rentalPeriod), 'days').format('X') : 4638902400; // rental period or forever (2117/1/1 )

            const paymentID = charge && charge.id ? charge.id : null;
            const planID = charge && charge.plan ? charge.plan.id : null;
            current_period_end = charge && charge.current_period_end ? charge.current_period_end : current_period_end ; //if it's not a recurring billing ('one time' or 'rental'), set the end period to 2117/1/1 or rental expiration date.

            // send email invitations to subscribers
            const subject = `${userInfo.firstName}, thanks for subscribing! Here's how to access your soundcast`;
            if(confirmationEmail) {
                const editorState = JSON.parse(confirmationEmail);
                const confirmEmailHTML = draftToHtml(editorState);
                content = confirmEmailHTML.replace('[subscriber first name]', userInfo.firstName);
                content = content.replace('[soundcast title]', soundcast.title);
            } else {
                content = `<p>Hi ${userInfo.firstName}!</p><p></p><p>Thanks for subscribing to ${soundcast.title}. If you don't have the Soundwise mobile app installed on your phone, please access your soundcast by downloading the app first--</p><p><strong>iPhone user: </strong>Download the app <a href="https://itunes.apple.com/us/app/soundwise-learn-on-the-go/id1290299134?ls=1&mt=8">here</a>.</p><p><strong>Android user: </strong>Download the app <a href="https://play.google.com/store/apps/details?id=com.soundwisecms_mobile_android">here</a>.</p><p></p><p>...and then sign in to the app with the same credential you used to subscribe to this soundcast.</p><p></p><p>If you've already installed the app, your new soundcast should be loaded automatically.</p>`;
            }

            if(!that.props.isEmailSent && !that.state.confirmationEmailSent) {
                that.setState({
                    confirmationEmailSent: true,
                });
                that.props.sendEmail();
                firebase.database().ref(`publishers/${soundcast.publisherID}`)
                .once('value', snapshot => {
                    const publisherEmail = snapshot.val().email || snapshot.val().paypalEmail;
                    addToEmailList(soundcastID, [{email: userInfo.email[0], firstName: userInfo.firstName, lastName: userInfo.lastName}], 'subscriberEmailList', soundcast.subscriberEmailList)
                    .then(listId => {
                      inviteListeners([userInfo.email[0]], subject, content, snapshot.val().name, snapshot.val().imageUrl, publisherEmail); // use transactional email for this
                    });
                })
            }

            firebase.auth().onAuthStateChanged(function(user) {
                if (user) {
                    const userId = user.uid;
                    const connectedCustomer = charge && charge.connectedCustomer ? charge.connectedCustomer : null;
                    // console.log('charge: ', charge);
                    const platformCustomer = charge ? (charge.platformCustomer || charge.stripe_id) : null;
                    // add soundcast to user
                    firebase.database().ref(`users/${userId}/soundcasts/${soundcastID}`)
                    .set({
                        subscribed: true,
                        paymentID: paymentID ? paymentID : null,
                        customerID: connectedCustomer,
                        current_period_end,
                        billingCycle: billingCycle ? billingCycle : null,
                        planID: planID ? planID : null,
                        date_subscribed: moment().format('X')
                    });

                    // add stripe_id to user data if not already exists
                    if(platformCustomer) {
                        firebase.database().ref(`users/${userId}/stripe_id`)
                        .set(platformCustomer);
                    }

                    //add user to soundcast
                    firebase.database().ref(`soundcasts/${soundcastID}/subscribed/${userId}`)
                    .set(moment().format('X'));
                    //remove from invited list
                    firebase.database().ref(`soundcasts/${soundcastID}/invited/${_email}`)
                    .remove();

                    //if it's a free soundcast, add subscriber to publisher
                    if(totalPay == 0 || totalPay == 'free') {
                        firebase.database().ref(`publishers/${soundcast.publisherID}/freeSubscribers/${userId}`)
                        .once('value')
                        .then(snapshot => {
                            if(!snapshot.val()) {
                                firebase.database().ref(`publishers/${soundcast.publisherID}/freeSubscribers/${userId}/${soundcastID}`)
                                .set(true)
                                .then(() => {
                                    firebase.database().ref(`publishers/${soundcast.publisherID}/freeSubscriberCount`)
                                    .once('value').then(snapshot => {
                                        if(snapshot.val()) {
                                            firebase.database().ref(`publishers/${soundcast.publisherID}/freeSubscriberCount`)
                                            .set(snapshot.val() + 1);
                                        } else {
                                            firebase.database().ref(`publishers/${soundcast.publisherID}/freeSubscriberCount`)
                                            .set(1);
                                        }
                                    })
                                })
                            } else {
                                firebase.database().ref(`publishers/${soundcast.publisherID}/freeSubscribers/${userId}/${soundcastID}`)
                                .set(true);
                            }
                        })
                    }
                }
            });
        }
    }

    async onSubmit(event) {
        event.preventDefault();
        if (this.state.startPaymentSubmission) { return }
        const lastSubmitDate = Number(localStorage.getItem('paymentPaidBilCycleOneTimeRental') || 0);
        if ((Date.now() - lastSubmitDate) < 10000) { // 10 seconds since last success call not passed
          return
        }
        const lastSubmitDate2 = Number(localStorage.getItem('paymentPaid') || 0);
        if ((Date.now() - lastSubmitDate2) < 10000) { // 10 seconds since last success call not passed
          return
        }
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
        const amount = Number(this.state.totalPay || this.props.total).toFixed(2) * 100; // in cents
        const {email, stripe_id} = this.props.userInfo;
        const receipt_email = (email && email[0]) || this.state.email;
        const {soundcast, checked, soundcastID, handleStripeId} = this.props;
        const userInfo = this.state.userInfo || this.props.userInfo;
        const {billingCycle, paymentPlan, price} = soundcast.prices[checked];
        const that = this;

        if(response.error) {
            this.setState({
                paymentError: response.error.message,
                submitDisabled: false,
                startPaymentSubmission: false
            })
        } else {
            firebase.database().ref(`publishers/${soundcast.publisherID}`)
            .once('value')
            .then(snapshot => {
               if(snapshot.val() && snapshot.val().stripe_user_id) {
                    const stripe_user_id = snapshot.val().stripe_user_id; // publisher's id for stripe connected account
                    if(billingCycle == 'one time' || billingCycle == 'rental') { //if purchase or rental, post to api/charge
                        Axios.post('/api/transactions/handleOnetimeCharge', {
                            amount,
                            source: response.id,
                            currency: 'usd',
                            receipt_email,
                            customer: stripe_id,
                            billingCycle,
                            publisherID: soundcast.publisherID,
                            stripe_user_id,
                            soundcastID,
                            planID: `${soundcast.publisherID}-${soundcastID}-${soundcast.title}-${billingCycle}-${price}`,
                            description: `${soundcast.title}: ${paymentPlan || billingCycle}`,
                            statement_descriptor: `${soundcast.title}: ${paymentPlan}`,
                        })
                        .then(function (response) {
                            const paid = response.data.res.paid; //boolean
                            if(paid) {  // if payment made, push course to user data, and redirect to a thank you page
                                localStorage.setItem('paymentPaidBilCycleOneTimeRental', Date.now());
                                that.setState({
                                    paid,
                                    startPaymentSubmission: false
                                });
                                if (userInfo && userInfo.email) { // logged in
                                  that.addSoundcastToUser(response.data.res); //add soundcast to user database and redirect
                                } else {
                                  handleStripeId && handleStripeId(
                                    response.data.res, userInfo, that.state, that.addSoundcastToUse
                                  );
                                }
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
                            publisherID: soundcast.publisherID,
                            stripe_user_id,
                            soundcastID,
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
                                localStorage.setItem('paymentPaid', Date.now());
                                that.setState({
                                    paid: true,
                                    startPaymentSubmission: false
                                });
                                if (userInfo && userInfo.email) { // logged in
                                  that.addSoundcastToUser(subscription); //add soundcast to user database and redirect
                                } else {
                                  handleStripeId && handleStripeId(
                                    subscription, userInfo, that.state, that.addSoundcastToUse
                                  );
                                }
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
               } else {
                    this.setState({
                        paymentError: "Unable to process this payment. Sorry!",
                        submitDisabled: false,
                        startPaymentSubmission: false
                    })
               }
            })
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
        const showInputs = !(this.state.userInfo && this.state.userInfo.firstName);

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
                                        <div style={styles.totalPriceText}>{`$${Number(total).toFixed(2)}`}</div>
                                    </div>
                                </div>
                                <form onSubmit={this.onSubmit}>
                                    {/* lastName, firstName, email, card number*/}
                                    <div style={styles.relativeBlock}>
                                      {showInputs &&
                                        <div className='col-md-6 col-sm-12 inputFirstName'>
                                          <input
                                              onChange={this.handleChange}
                                              required
                                              className='border-radius-4'
                                              type='text'
                                              name='firstName'
                                              placeholder='First Name'
                                              style={{ ...styles.input, margin: '20px 0 0 0' }}
                                          />
                                        </div>
                                      }
                                      {showInputs &&
                                        <div className='col-md-6 col-sm-12 inputLastName'>
                                          <input
                                              onChange={this.handleChange}
                                              required
                                              className='border-radius-4'
                                              type='text'
                                              name='lastName'
                                              placeholder='Last Name'
                                              style={{ ...styles.input, margin: '20px 0 0 0' }}
                                          />
                                        </div>
                                      }
                                      {showInputs &&
                                        <input
                                            onChange={this.handleChange}
                                            required
                                            className='border-radius-4 col-md-12'
                                            type='email'
                                            name='email'
                                            placeholder='Email'
                                            style={{ ...styles.input, margin: '20px 0 0 0' }}
                                        />
                                      }
                                        <input
                                            onChange={this.handleChange}
                                            required
                                            className='border-radius-4'
                                            size='20'
                                            type='text'
                                            name='number'
                                            placeholder='Card Number'
                                            autoComplete='new-password'
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
                                            placeholder='CVC'
                                            autoComplete='new-password'
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
        marginTop: 10,
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
