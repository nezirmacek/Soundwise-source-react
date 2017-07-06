import React, {Component} from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';
import { withRouter } from 'react-router';
import * as _ from 'lodash';

import { SoundwiseHeader } from '../../components/soundwise_header';
import {deleteCourseFromCart, openSignupbox} from '../../actions/index';
import {CourseSignup} from '../course_signup';
import {Checkout} from '../checkout';
import Footer from '../../components/footer';
import CourseInCart from './components/CourseInCart';

class _Cart extends Component {
    constructor(props) {
        super(props);

        // add discountedPrice field to courses
        let _shoppingCart = JSON.parse(JSON.stringify(props.shoppingCart)); // to not mutate props
        _shoppingCart.map(course => course.discountedPrice = course.price);
        this.state = {
            redirectToCheckout: false,
            shoppingCart: _shoppingCart, // to change courses locally
        };
    }

    componentWillReceiveProps (nextProps) {
        // add discountedPrice field to courses
        let _shoppingCart = JSON.parse(JSON.stringify(nextProps.shoppingCart)); // to not mutate props
        _shoppingCart.map(course => {
            let _oldCourse = _.find(this.state.shoppingCart, {id: course.id});
            course.discountedPrice = _oldCourse && _oldCourse.discountedPrice|| _oldCourse && _oldCourse.price || 0;
        });
        this.setState({shoppingCart: _shoppingCart});
    }

    setCourseDiscountedPrice (courseId, discountedPrice) {
        let _newState = JSON.parse(JSON.stringify(this.state)); // to not mutate state
        let _course = _.find(_newState.shoppingCart, {id: courseId});
        if (_course) {
            _course.discountedPrice = discountedPrice;
            this.setState(_newState);
        }
    }

    render() {
        const items_num = this.state.shoppingCart.length;
        let total = 0;
        this.state.shoppingCart.map(course => total += course.discountedPrice);

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
                    <section className="bg-white border-none">
                        <div className="container">
                            <div className="row">
                                <section className="bg-white" id="content-section23" >
                                    <div className="container">
                                        <div className="row equalize sm-equalize-auto equalize-display-inherit">
                                            <div className="col-md-6 col-sm-12 center-col sm-no-margin" style={{height: ''}}>
                                                {
                                                    this.state.shoppingCart.map((course, i) => {
                                                        return (
                                                            <CourseInCart
                                                                course={course}
                                                                key={i}
                                                                setDiscountedPrise={this.setCourseDiscountedPrice.bind(this)}
                                                                deleteCourseFromCart={this.props.deleteCourseFromCart}
                                                            />
                                                        )
                                                    })
                                                }
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
                    <Checkout total={total * 100}/>
                    <Footer />
                </div>
            );
        }
    }
}

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
