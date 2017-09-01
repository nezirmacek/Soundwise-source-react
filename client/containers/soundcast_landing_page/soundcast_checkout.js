import React, {Component} from 'react';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import  PageHeader  from './components/page_header';
import Payment from './components/payment';
import SoundcastInCart from './components/soundcast_in_cart';

class _SoundcastCheckout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      success: false,
    }

    this.handlePaymentSuccess = this.handlePaymentSuccess.bind(this);
  }

  componentDidMount() {

  }

  handlePaymentSuccess() {
    this.setState({
      success: true,
    })
  }

  render() {

    const {soundcast, soundcastID, checked, sumTotal} = this.props.location.state;
    const totalPrice = Math.floor(soundcast.prices[checked].price * 1.03 * 100) / 100;

    if(!soundcast) {
      return (
                <div>
                    <PageHeader />
                    <section className="padding-110px-tb xs-padding-60px-tb bg-white builder-bg border-none" id="title-section1">
                        <div className="container">
                            <div className="row">
                                <div className="col-md-12 col-sm-12 col-xs-12 text-center">
                                    <h2 className="section-title-large sm-section-title-medium text-dark-gray font-weight-600 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text">YOUR CART IS EMPTY</h2>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
      )
    } else if (soundcast && this.state.success) {
      return (
        <div>
          <PageHeader />
            <section className="padding-110px-tb xs-padding-60px-tb bg-white builder-bg border-none" id="title-section1">
                <div className="container">
                    <div className="row">
                        <div className="col-md-12 col-sm-12 col-xs-12 text-center">
                            <h2 className="section-title-large sm-section-title-medium text-dark-gray font-weight-600 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text">{`You've successfully subscribed to ${soundcast.title}. Please check your email for download instructions.`}</h2>
                        </div>
                    </div>
                </div>
            </section>
        </div>
      )
    } else if(soundcast && !this.state.success) {
      return (
                <div>
                    <PageHeader />
                    <section className="bg-white border-none">
                        <div className="container">
                            <div className="row">
                                <section className="bg-white" id="content-section23" >
                                    <div className="container">
                                        <div className="row equalize sm-equalize-auto equalize-display-inherit">
                                            <div className="col-md-6 col-sm-12 center-col sm-no-margin" style={{height: ''}}>
                                                <SoundcastInCart
                                                    soundcast={soundcast}
                                                    checked={checked}
                                                    sumTotal={sumTotal}
                                                />
                                            </div>
                                            <div className="row">
                                                <div className="col-md-12 col-sm-12 col-xs-12">

                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </section>
                    <Payment
                      soundcast={soundcast}
                      soundcastID={soundcastID}
                      checked={checked}
                      total={totalPrice}
                      userInfo={this.props.userInfo}
                      handlePaymentSuccess={this.handlePaymentSuccess}
                    />
                </div>
      )
    }
  }
}

const mapStateToProps = state => {
    const { userInfo, isLoggedIn } = state.user;
    return {
        userInfo, isLoggedIn
    }
};

const Checkout_worouter = connect(mapStateToProps, null)(_SoundcastCheckout);

export const SoundcastCheckout = withRouter(Checkout_worouter);