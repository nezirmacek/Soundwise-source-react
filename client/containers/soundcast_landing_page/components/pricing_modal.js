import React, {Component} from 'react';
import { Link } from 'react-router-dom'
import * as firebase from 'firebase';
import {Card, CardHeader} from 'material-ui/Card';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router'

import Colors from '../../../styles/colors';

class _PricingModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checked: 0,
      sumTotal: null,
    }
  }

  componentDidMount() {
    if(this.props.soundcast && this.props.soundcast.prices[0].price) {
      const {prices} = this.props.soundcast;
      const {checked} = this.state;
      this.setState({
        sumTotal: prices[checked].price == 'free' ? '' : `Total today: $${Number(prices[checked].price).toFixed(2)}`
      })
    }
  }

  componentWillReceiveProps(nextProps) {
    if(!this.props.soundcast.prices[0].price && nextProps.soundcast.prices[0].price) {
      const {prices} = nextProps.soundcast;
      const {checked} = this.state;
      // console.log('prices[checked].price: ', prices[checked].price);
      this.setState({
        sumTotal: prices[checked].price == 'free' ? '' : `Total today: $${Number(prices[checked].price).toFixed(2)}`
      })
    }
  }

  handleCheck(i, e) {
    const {prices} = this.props.soundcast;
    this.setState({
      checked: i,
      sumTotal: prices[i].price == 'free' ? '' : `Total today: $${Number(prices[i].price).toFixed(2)}`
    })
  }

  handleCheckout() {
    const {history, soundcast, soundcastID} = this.props;
    const {checked, sumTotal} = this.state;

    firebase.auth().onAuthStateChanged(function(user) {
      if(user) {
        history.push('/soundcast_checkout', {soundcast, soundcastID, checked, sumTotal});
      } else {
        // console.log('soundcast: ', soundcast);
        if (soundcast.forSale) {
          history.push('/soundcast_checkout', {soundcast, soundcastID, checked, sumTotal});
        } else {
          history.push('/signup/soundcast_user', {soundcast, soundcastID, checked, sumTotal});
        }
      }
    })
  }

  handleModalClose() {
    this.setState({
      checked: 0,
      sumTotal: null,
    });
    this.props.handleModal();
  }

  render() {
    const {open, soundcast, soundcastID} = this.props;
    const {checked, sumTotal} = this.state;
    const {prices} = soundcast;

    const actions = [
        <FlatButton
          label="Checkout"
          // primary={true}
          labelStyle={{color: Colors.mainOrange}}
          onClick={this.handleCheckout.bind(this)}
        />
      ,
      <FlatButton
        label="Cancel"
        primary={false}
        onClick={this.handleModalClose.bind(this)}
      />,
    ];

    return (
      <div>
        <Dialog
          title="Select Access Option"
          actions={actions}
          modal={true}
          open={open}
          autoScrollBodyContent={true}
          onRequestClose={this.handleModalClose.bind(this)}
        >
         {
          prices && prices.length > 0 && prices[0].price &&
          prices.map((price, i) => {
            const isChecked = (checked == i);
            let currentPrice = `USD $${Number(price.price).toFixed(2)} / month`;
            let billing = 'billed monthly';
            let paymentPlan = price.paymentPlan || 'Free Access';
            if(price.billingCycle == 'annual') {
              currentPrice = `USD $${(Math.floor(price.price / 12 * 100) / 100).toFixed(2)} / month`;
              billing = 'billed annually';
              paymentPlan = price.paymentPlan || 'Annual Subscription';
            } else if(price.billingCycle == 'quarterly') {
              currentPrice = `USD $${(Math.floor(price.price / 3 * 100) / 100).toFixed(2)} / month`;
              billing = 'billed quarterly';
              paymentPlan = price.paymentPlan || 'Annual Subscription';
            } else if(price.billingCycle == 'one time') {
              currentPrice = `USD $${Number(price.price).toFixed(2)}`
              billing = 'one time charge';
              paymentPlan = price.paymentPlan || 'Permanent Access';
            } else if(price.billingCycle == 'rental') {
              currentPrice = `USD $${Number(price.price).toFixed(2)}`
              billing = `one time charge (${price.rentalPeriod}-day access)`;
              paymentPlan = price.paymentPlan || `${price.rentalPeriod}-Day Access`;
            }

            if(price.price == 'free') {
              currentPrice = 'Free';
              billing = '';
            }

            return (
              <Card key={i} style={styles.card}>
                <a onClick={this.handleCheck.bind(this, i)}>
                <div style={{marginTop: 15, marginBottom: 15,}}>
                  <div
                    className='title-small'
                    style={styles.titleDiv}>
                    {paymentPlan}
                  </div>
                  <div>
                    <div style={styles.priceDiv}>
                      <div style={styles.price}>{currentPrice}</div>
                    </div>
                    <div style={{display: 'inline-block', width: '30%', fontSize: 16}}>
                      <span>{billing}</span>
                    </div>
                    <div style={{display: 'inline-block', width: '10%'}}>
                      <input
                        type='checkbox'
                        checked = {isChecked}
                        onChange={this.handleCheck.bind(this, i)}
                      />
                    </div>
                  </div>
                </div>
                </a>
              </Card>
            )
          })
          ||
          null
         }
        <div style={styles.sumTotal}>
          <span style={{fontSize: 18}}>{sumTotal}</span>
        </div>
        </Dialog>
      </div>
    )
  }
}

const styles = {
  card: {
    marginTop: 15,
    marginBottom: 15,
    borderColor: '#f8f8f8',
    borderWidth: 1,
  },
  titleDiv: {
    marginBottom: 10,
    paddingTop: 15,
    marginTop: 10,
    marginLeft: 15,
  },
  priceDiv: {
    marginBottom: 10,
    marginTop: 10,
    marginLeft: 15,
    display: 'inline-block',
    width: '50%',
  },
  price: {
    fontSize: 16,
  },
  sumTotal: {
    marginBottom: 15,
    marginTop: 25,
    marginLeft: 15,
    fontSize: 16,
  }
}

export const PricingModal = withRouter(_PricingModal);
