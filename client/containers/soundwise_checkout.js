import React, {Component} from 'react';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Colors from '../styles/colors';
import Axios from 'axios';
import moment from 'moment';
import Dots from 'react-activity/lib/Dots';
import firebase from 'firebase';

import {SoundwiseHeader} from '../components/soundwise_header';
// import Payment from '../components/payment';

class _SoundwiseCheckout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      success: false,
      enterPromoCode: false,
      promoCode: '',
      promoCodeError: null,
      total: '',
      number: '',
      cvc: '',
      exp_month: 0,
      exp_year: new Date().getFullYear(),
      submitted: false,
      startPaymentSubmission: false,
    }
    this.applyPromoCode = this.applyPromoCode.bind(this);
    this.handlePaymentSuccess = this.handlePaymentSuccess.bind(this);
    this.stripeTokenHandler = this.stripeTokenHandler.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  componentDidMount() {
    Stripe.setPublishableKey('pk_live_Ocr32GQOuvASmfyz14B7nsRP');
    // Stripe.setPublishableKey('pk_test_BwjUV9yHQNcgRzx59dSA3Mjt');
    const {plan, frequency, price} = this.props.history.location.state;
    this.setState({
      total: frequency == 'annual' ? price * 12 : price,
      frequency,
      plan
    });
  }

  handleChange(e) {
      this.setState({
        [e.target.name]: e.target.value
      })
  }

  handlePaymentSuccess(charge) {
    const {plan, frequency, promoCodeError, promoCode} = this.state;
    this.setState({
      success: true,
      startPaymentSubmission: false,
    });
    alert(`You've been upgraded to the ${plan.toUpperCase()} plan!`);

    if(this.props.userInfo.publisherID) {
      firebase.database().ref(`publishers/${this.props.userInfo.publisherID}/plan`).set(plan);
      firebase.database().ref(`publishers/${this.props.userInfo.publisherID}/frequency`).set(frequency);
      firebase.database().ref(`publishers/${this.props.userInfo.publisherID}/current_period_end`).set(charge.data.current_period_end);
      firebase.database().ref(`publishers/${this.props.userInfo.publisherID}/subscriptionID`).set(charge.id);
      if(promoCode && !promoCodeError) {
        firebase.database().ref(`publishers/${this.props.userInfo.publisherID}/coupon`).set(promoCode);
      }
      this.props.history.push({
        pathname: '/dashboard/soundcasts',
      });
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

  applyPromoCode() {
    this.setState({
      promoCodeError: '',
    });
    const {promoCode, total} = this.state;
    const {plan, frequency, price} = this.props.history.location.state;
    if(promoCode == 'OFF50') {
      this.setState({
        total: frequency == 'annual' ? price * 12 / 2 : price,
      });
    } else {
      this.setState({
        promoCodeError: 'Hmm...this promo code doesn\'t exist',
      });
    }
  }

  async onSubmit(event) {
      event.preventDefault();
      const that = this;
      this.setState({
          startPaymentSubmission: true,
          submitted: true,
      });
      const {number, cvc} = this.state;
      const exp_month = Number(this.state.exp_month) + 1;
      const exp_year = Number(this.state.exp_year);
      this.setState({ submitted: true, paymentError: null });
      Stripe.card.createToken({number, cvc, exp_month, exp_year}, this.stripeTokenHandler);
  }

  stripeTokenHandler(status, response) {
    const amount = Number(this.state.total).toFixed(2) * 100; // in cents
    const {email, stripe_id, publisherID, publisher} = this.props.userInfo;
    const {plan, frequency, promoCodeError, promoCode} = this.state;
    const that = this;
    const coupon = promoCode && !promoCodeError ? promoCode : null;

    if(response.error) {
        this.setState({
            paymentError: response.error.message,
            submitted: false,
            startPaymentSubmission: false
        })
    } else {
      Axios.post('/api/buy', {
          amount,
          source: response.id,
          currency: 'usd',
          receipt_email: email[0],
          customer: stripe_id,
          subscriptionID: publisher.subscriptionID,
          coupon,
          publisherID: publisherID,
          plan: `${plan}-${frequency}`,
          statement_descriptor: `Soundwise ${plan} plan: ${frequency}`,
      })
      .then(response => {
        that.handlePaymentSuccess(response);
      })
      .catch(err => {
        console.log('error: ', err);
        that.setState({
          paymentError: 'Oops! There is an error processing your payment. please try again later.',
          startPaymentSubmission: false,
          submitted: false,
        });
      });
    }
  }

  render() {
    const that = this;
    const {plan, frequency, price} = this.props.history.location.state;
    const title = plan == 'pro' ? 'Pro Plan' : 'Plus Plan';
    const interval = frequency == 'annual' ? 'Billed annually' : 'Billed monthly';
    const {total, submitted} = this.state;
    const displayedPrice = `$${price}/month`;
    const {userInfo} = this.props;
    const monthOptions = [];
    const yearOptions = [];
    for (let i=0; i<12; i++) {
        monthOptions.push(<option value={i} key={i}>{moment().month(i).format('MMM (MM)')}</option>);
        yearOptions.push(<option value={i + +moment().format('YYYY')} key={i}>{i + +moment().format('YYYY')}</option>);
    }
    return (
      <div>
        <SoundwiseHeader />
        <section className="bg-white border-none">
            <div className="container">
                <div className="row">
                    <section className="bg-white" id="content-section23" >
                        <div className="container">
                            <div className="row equalize sm-equalize-auto equalize-display-inherit">
                                <div className="col-md-6 col-sm-12 center-col sm-no-margin" style={{height: ''}}>
                                  <div className="row" style={styles.course}>
                                      <div className="col-md-12 col-sm-12 col-xs-12">
                                          <div style={styles.courseText}>
                                              <p style={styles.courseName}>
                                                  {title}
                                              </p>
                                              <div style={styles.underName}>
                                                  <div>
                                                      <span>{interval}</span>
                                                  </div>
                                                  <div style={styles.feeRow}>
                                                      <div className="" style={styles.priceWrapper}>
                                                          <span
                                                              className="margin-five-bottom"
                                                              style={styles.price}
                                                          >
                                                              {displayedPrice}
                                                          </span>
                                                      </div>
                                                  </div>
                                              </div>
                                          </div>
                                      </div>
                                      <div className="col-md-12 col-sm-12 col-xs-12">
                                      {
                                        !this.state.enterPromoCode &&
                                        <span
                                          style={{cursor: 'pointer'}}
                                          onClick={() => that.setState({
                                            enterPromoCode: true
                                          })}>Have a promo code?</span>
                                        ||
                                        <div>
                                          <input
                                              onChange={(e) => that.setState({
                                                promoCode: e.target.value,
                                              })}
                                              className='border-radius-4'
                                              size='20'
                                              type='text'
                                              name='promo'
                                              placeholder="Enter promo code"
                                              value={this.state.promoCode}
                                              style={{width: '50%', fontSize: 14, height: 35}}
                                          />
                                          <button
                                            onClick={this.applyPromoCode}
                                            type="button"
                                            className="btn"
                                            style={{color: Colors.link}}>Apply</button>
                                          <div style={{color: 'red'}}>{this.state.promoCodeError}</div>
                                        </div>
                                      }
                                      </div>
                                  </div>
                                </div>
                                <div className="row">
                                  <div className="col-md-12 col-sm-12 col-xs-12">
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
                                                    <form onSubmit={!submitted ? this.onSubmit : (event)=>{event.preventDefault();}}>
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
                                                            <img src="../images/card_types.png" style={styles.cardsImage} />
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
                                                                || null
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
                                                                <img src="../images/powered_by_stripe.png" style={styles.stripeImage}/>
                                                            </div>
                                                            {this.renderProgressBar()}
                                                        </div>
                                                    </form>
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                  </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </section>
      </div>
    )

  }
}

const styles = {
    course: {
        marginBottom: 10,
    },
    courseImage: {
        width: 46,
        height: 46,
        float: 'left',
        marginRight: '15px',
    },
    courseText: {
        width: '100%',
        float: 'left',
    },
    courseName: {
        fontSize: 17,
        lineHeight: '17px',
        fontWeight: 'bold',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        height: 19,
        marginBottom: 3,
        width: '100%',
        color: Colors.fontBlack,
    },
    underName: {
        height: 24,
    },
    couponWrapper: {
        position: 'relative',
        overflow: 'hidden',
        width: '67%',
        float: 'left',
    },
    couponInput: {
        width: '100%',
        fontSize: 10,
        padding: '0 5px 0 5px',
        margin: 0,
        borderTopLeftRadius: 4,
        borderBottomLeftRadius: 4,
    },
    applyCouponButton: {
        backgroundColor: '#61e1fb',
        width: 42,
        height: 24,
        position: 'absolute',
        right: 0,
        top: 0,
        fontSize: 10,
        align: 'center',
        paddingLeft: 5,
        color: Colors.fontBlack,
    },
    priceWrapper: {
        height: 24,
        width: '33%',
        float: 'right',
    },
    price: {
        lineHeight: '24px',
        height: '24px',
        display: 'block',
        float: 'right',
        marginRight: '10px',
        fontWeight: 'bold',
        fontSize: 14,
        color: Colors.fontBlack,
    },
    feeRow: {
        height: 22,
    },
    feeWrapper: {
        float: 'right',
        marginRight: 0,
        fontWeight: 'bold',
        fontSize: 14,
        width: '100%',
        color: Colors.fontBlack,
    },
    feeText: {
        // width: 40,
        marginRight: 60,
        float: 'right',
    },
    feePriceText: {
        width: 53,
        float: 'right',
        textAlign: 'right',
    },
    trash: {
        float: 'right',
        color: Colors.fontBlack,
    },
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
}

const mapStateToProps = state => {
    const { userInfo, isLoggedIn, isEmailSent } = state.user;
    return { userInfo, isLoggedIn, isEmailSent};
};

// function mapDispatchToProps(dispatch) {
//     return bindActionCreators({ sendEmail }, dispatch);
// }

const Checkout_worouter = connect(mapStateToProps, null)(_SoundwiseCheckout);

export const SoundwiseCheckout = withRouter(Checkout_worouter);