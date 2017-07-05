import React, {Component} from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';
import { withRouter } from 'react-router';

import { SoundwiseHeader } from '../components/soundwise_header';
import {deleteCourseFromCart, openSignupbox} from '../actions/index';
import {CourseSignup} from './course_signup';
import {Checkout} from './checkout';
import Footer from '../components/footer';
import Colors from '../styles/colors';

class _Cart extends Component {
    constructor(props) {
        super(props);
        this.state = {
            redirectToCheckout: false
        };
        this.renderItem = this.renderItem.bind(this);
        // this.checkOut = this.checkOut.bind(this)
    }

    renderItem(course) {
        return (
            <div className="row" style={styles.course}>
                <div className="col-md-12 col-sm-12 col-xs-12">
                    <img src={course.img_url_mobile}
                         alt=""
                         style={styles.courseImage}
                    />
                    <div style={styles.courseText}>
                        <p style={styles.courseName}>
                            {course.name}
                        </p>
                        <div style={styles.underName}>
                            <div style={styles.couponWrapper} className="border-radius-4">
                                <input
                                    size='20'
                                    type='text'
                                    name='coupon'
                                    placeholder="Coupon Code"
                                    style={styles.couponInput}
                                />
                                <div
                                    style={styles.applyCouponButton}
                                >
                                    Apply
                                </div>
                            </div>
                            <div className="feature-box-details-second pull-right" style={styles.priceWrapper}>
                                <a onClick={() => this.props.deleteCourseFromCart(course)} style={styles.trash}>
                                    <i className="fa fa-trash fa-2x"
                                       aria-hidden="true"
                                    />
                                </a>
                                <span
                                    className="margin-five-bottom"
                                    style={styles.price}
                                >
                                    {`$${course.price}`}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    render() {
        const items_num = this.props.shoppingCart.length;
        const subtotal = this.props.shoppingCart.reduce((cumm, course) => {
            return cumm + course.price
        }, 0);

        if(items_num === 0) {
            return (
                <div>
                    <SoundwiseHeader />
                    <section className="padding-110px-tb xs-padding-60px-tb bg-white builder-bg border-none" id="title-section1">
                        <div className="container">
                            <div className="row">
                                <div className="col-md-12 col-sm-12 col-xs-12 text-center">
                                    <h2 className="section-title-large sm-section-title-medium text-dark-gray font-weight-600 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text">YOUR CART IS EMPTY</h2>
                                </div>
                            </div>
                        </div>
                    </section>
                    <Footer />
                </div>
            );
        } else {
            return (
                <div>
                    <SoundwiseHeader />
                    <section className="bg-white border-none" style={{}}>
                        <div className="container">
                            <div className="row">
                                <section className="bg-white" id="content-section23" >
                                    <div className="container">
                                        <div className="row equalize sm-equalize-auto equalize-display-inherit">
                                            <div className="col-md-6 col-sm-12 center-col sm-no-margin" style={{height: ''}}>
                                                {this.props.shoppingCart.map(course => {
                                                    return this.renderItem(course)
                                                })}
                                                <div className="row">
                                                    <div className="col-md-12 col-sm-12 col-xs-12">

                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </section>
                    <Checkout subtotal={subtotal}/>
                    <Footer />
                </div>
            );
        }
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
        width: 'calc(100% - 61px)',
        float: 'left',
    },
    courseName: {
        fontSize: 17,
        lineHeight: '17px',
        fontWeight: 'bold',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        height: 17,
        marginBottom: 5,
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
        width: 'calc(100% - 42px)',
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
    trash: {
        float: 'right',
        color: Colors.fontBlack,
    },
};

function mapDispatchToProps(dispatch) {
    return bindActionCreators({ deleteCourseFromCart, openSignupbox }, dispatch);
}

const mapStateToProps = state => {
    const { userInfo, isLoggedIn } = state.user;
    const { signupFormOpen } = state.signupBox;
    const { shoppingCart } = state.checkoutProcess;
    return {
        isLoggedIn,
        shoppingCart,
        signupFormOpen
    }
};

const Cart_woroute = connect(mapStateToProps, mapDispatchToProps)(_Cart);
export const Cart = withRouter(Cart_woroute);
