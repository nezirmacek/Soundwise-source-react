import React, {Component} from 'react';
import { Link } from 'react-router-dom'
import * as firebase from 'firebase';
import {Card, CardHeader} from 'material-ui/Card';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router'

class _PricingModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checked: null,
      sumTotal: null,
    }
  }

  handleCheck(i, e) {
    const {prices} = this.props.soundcast;

    this.setState({
      checked: i,
      sumTotal: `Payment today: $${prices[i].price}`
    })

  }

  handleCheckout() {
    const {history, soundcast, soundcastID} = this.props;
    const {checked, sumTotal} = this.state;

    firebase.auth().onAuthStateChanged(function(user) {
      if(user) {
        history.push('/soundcast_checkout', {soundcast, soundcastID, checked, sumTotal});
      } else {
        history.push('/signup/soundcast_user', {soundcast, soundcastID, checked, sumTotal});
      }
    })
  }

  render() {
    const {open, handleModal, soundcast, soundcastID} = this.props;
    const {prices} = soundcast;
    const {checked, sumTotal} = this.state;

    const actions = [
        <FlatButton
          label="Checkout"
          primary={true}
          onClick={this.handleCheckout.bind(this)}
        />
      ,
      <FlatButton
        label="Cancel"
        primary={false}
        onClick={handleModal}
      />,
    ];

    return (
      <div>
        <Dialog
          title="Select Subscription Option"
          actions={actions}
          modal={false}
          open={open}
          onRequestClose={handleModal}
        >
        {
          prices.map((price, i) => {
            const isChecked = (checked == i);
            let currentPrice = `USD $${price.price} / month`;
            let billing = 'billed monthly';

            if(price.billingCycle == 'annual') {
              currentPrice = `USD $${Math.floor(price.price / 12 * 100) / 100} / month`;
              billing = 'billed annually';
            } else if(price.billingCycle == 'quarterly') {
              currentPrice = `USD $${Math.floor(price.price / 3 * 100) / 100} / month`;
              billing = 'billed quarterly'
            } else if(price.billingCycle == 'one time') {
              currentPrice = `USD $${price.price}`
              billing = 'one time charge'
            }

            return (
              <Card key={i} style={styles.card}>
                <a onClick={this.handleCheck.bind(this, i)}>
                <div style={{marginTop: 15, marginBottom: 15,}}>
                  <div
                    className='title-small'
                    style={styles.titleDiv}>
                    {price.paymentPlan}
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
                        onClick={this.handleCheck.bind(this, i)}
                      />
                    </div>
                  </div>
                </div>
                </a>
              </Card>
            )
          })
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