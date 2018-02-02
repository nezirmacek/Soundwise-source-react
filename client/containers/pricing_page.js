import React, { Component } from 'react';
import PropTypes from 'prop-types';
import firebase from 'firebase';
import moment from 'moment';
import {Helmet} from 'react-helmet';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

import {SoundwiseHeader} from '../components/soundwise_header';
import Footer from '../components/footer'
import Pricing from '../components/pricing'

export default class PricingPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      popupOpen: false,
      creditCardError: '',
      planChosen: null,
    };
    this.paymentPopup = this.paymentPopup.bind(this);
  }

  paymentPopup() {
    const that = this;
    const monthOptions = [];
    const yearOptions = [];
    for (let i=0; i<12; i++) {
        monthOptions.push(<option value={i} key={i}>{moment().month(i).format('MMM (MM)')}</option>);
        yearOptions.push(<option value={i + +moment().format('YYYY')} key={i}>{i + +moment().format('YYYY')}</option>);
    }

    const actions = [
      <FlatButton
        label="Cancel"
        primary={false}
        onClick={() => that.setState({
          popupOpen: false,
          creditCardError: '',
          card: '',
          exp_month: '',
          exp_year: '',
          cvc: '',
        })}
      />,
      <FlatButton
        label="Submit"
        primary={true}
        keyboardFocused={true}
        onClick={this.submitPayment}
      />,
    ];

    return (
      <div>
        <MuiThemeProvider>
          <Dialog
            title='Update Credit Card'
            actions={actions}
            modal={false}
            open={this.state.popupOpen}
            onRequestClose={() => that.setState({
              popupOpen: false,
              creditCardError: '',
            })}
          >
            <div className='col-md-12' style={{...styles.relativeBlock, paddingLeft: 0}}>
                <input
                    onChange={(e) => {that.setState({newCard: e.target.value})}}
                    required
                    className='border-radius-4'
                    size='20'
                    type='text'
                    name='number'
                    value={that.state.newCard}
                    placeholder="Card Number"
                    style={styles.input}
                />
                <img className='hidden-xs' src="../../../images/card_types.png" style={styles.cardsImage} />
            </div>

            {/*Expiration*/}
            <div className='col-md-9 col-xs-12' style={{paddingLeft: 0, paddingRight: 0}}>
                {/*month*/}
                <div style={styles.selectBlock} className="border-radius-4" >
                    <label style={styles.selectLabel}>Exp Month</label>
                    <select
                        onChange={(e) => {that.setState({exp_month_new: e.target.value})}}
                        name="exp_month"
                        id="expiry-month"
                        value={that.state.exp_month_new }
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
                        onChange={(e) => {that.setState({exp_year_new: e.target.value})}}
                        name="exp_year"
                        value={that.state.exp_year_new}
                        style={styles.select}
                    >
                        {
                            yearOptions.map(item => item)
                        }
                    </select>
                </div>
            </div>
            <div className='col-md-3 col-xs-12' style={{paddingLeft: 0}}>
                {/*cvv/cvc*/}
                <input
                    onChange={(e) => {that.setState({cvc: e.target.value})}}
                    required
                    className='border-radius-4'
                    size='3'
                    type='password'
                    name='cvc'
                    placeholder="CVC"
                    value={that.state.cvc}
                    style={Object.assign({}, styles.input, styles.cvc)}
                />
            </div>
            {
                this.state.creditCardError &&
                <div className='col-md-12' style={{color: 'red'}}>{ this.state.creditCardError }</div>
                || null
            }
            {/*button*/}
            <div style={styles.buttonWrapper}>
                <div style={styles.securedTextWrapper}>
                    <i className="ti-lock" style={styles.securedTextIcon} />
                    Transactions are secure and encrypted.
                </div>
                <div style={styles.stripeImageWrapper}>
                    <img src="../../../images/powered_by_stripe.png" style={styles.stripeImage}/>
                </div>
            </div>
          </Dialog>
        </MuiThemeProvider>
      </div>
    );
  }

  render() {
    return (
      <div>
        <Helmet>
          <title>{'Plans and pricing | Soundwise'}</title>
          <meta property="og:url" content='https://mysoundwise.com/pricing' />
          <meta property="fb:app_id" content='1726664310980105' />
          <meta property="og:title" content='Plans and pricing | Soundwise'/>
          <meta property="og:description" content={"Learn About Features & Pricing. Find the Plan That's Right For You."}/>
          <meta property="og:image" content="https://mysoundwise.com/images/soundwise_homepage.png" />
          <meta name="description" content={"Learn About Features & Pricing. Find the Plan That's Right For You."} />
          <meta name="keywords" content="soundwise, training, online education, education software, subscription, soundwise inc, real estate, real estate broker, real estate agents, real estate brokerage, real estate training, audio publishing, content management system, audio, mobile application, learning, online learning, online course, podcast, mobile app" />
          <meta name="twitter:title" content='Plans and pricing | Soundwise'/>
          <meta name="twitter:description" content="Learn About Features & Pricing. Find the Plan That's Right For You."/>
          <meta name="twitter:image" content="https://mysoundwise.com/images/soundwise_homepage.png"/>
          <meta name="twitter:card" content="https://mysoundwise.com/images/soundwise_homepage.png" />
        </Helmet>
        <SoundwiseHeader />
        <Pricing />
        {this.paymentPopup()}
        <Footer />
      </div>
    )
  }
}