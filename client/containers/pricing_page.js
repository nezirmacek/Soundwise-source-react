import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import firebase from 'firebase';
import moment from 'moment';
import {Helmet} from 'react-helmet';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import Colors from '../styles/colors';

import {SoundwiseHeader} from '../components/soundwise_header';
import Footer from '../components/footer'
import Pricing from '../components/pricing'

 class _PricingPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      popupOpen: false,
      creditCardError: '',
      planChosen: null,
      frequency: 'annual',
      priceChosen: null,
      prices: {
        annual: {
            pro: 68,
            plus: 28,
        },
        monthly: {
            pro: 113,
            plus: 47,
        }
      }
    };
    this.goToCheckout = this.goToCheckout.bind(this);
    this.changeFrequency = this.changeFrequency.bind(this);
  }

  goToCheckout(plan, frequency, price) {
    this.props.history.push({
      pathname: '/buy',
      state: {
        plan,
        frequency,
        price,
      }
    });
  }

  changeFrequency() {
    if(this.state.frequency == 'annual') {
      this.setState({
        frequency: 'monthly'
      });
    } else if (this.state.frequency == 'monthly') {
      this.setState({
        frequency: 'annual'
      });
    }
  }

  render() {
    const {userInfo, isLoggedIn} = this.props;
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
        <Pricing
           goToCheckout={this.goToCheckout}
           changeFrequency={this.changeFrequency}
           prices={this.state.prices}
           frequency={this.state.frequency}
           isLoggedIn={isLoggedIn}
           userInfo={userInfo}
        />
        <Footer />
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

const mapStateToProps = state => {
    const { userInfo, isLoggedIn } = state.user;
    return { userInfo, isLoggedIn, };
};

export const PricingPage = connect(mapStateToProps, null)(_PricingPage);