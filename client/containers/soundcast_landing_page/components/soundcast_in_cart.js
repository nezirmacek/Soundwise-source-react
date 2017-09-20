
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as firebase from 'firebase';
import Colors from '../../../styles/colors';

export default class SoundcastInCart extends Component {
    constructor(props) {
        super(props);

        this.state = {
        };
    }

    handleChange(e) {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    render () {
        const { soundcast, sumTotal, checked } = this.props;
        const fee = soundcast.prices[checked].price == 'free' ? 0 : Math.floor(soundcast.prices[checked].price * 0.03 *100) / 100;
        return (
            <div className="row" style={styles.course}>
                <div className="col-md-12 col-sm-12 col-xs-12">
                    <img src={soundcast.imageURL}
                         alt=""
                         style={styles.courseImage}
                    />
                    <div style={styles.courseText}>
                        <p style={styles.courseName}>
                            {soundcast.title}
                        </p>
                        <div style={styles.underName}>
                            <div>
                                <span>{soundcast.prices[checked].paymentPlan}</span>
                            </div>
                            <div style={styles.feeRow}>
                                <div className="" style={styles.priceWrapper}>
                                    <span
                                        className="margin-five-bottom"
                                        style={styles.price}
                                    >
                                        {soundcast.prices[checked].price == 'free' ? 0 : `$${soundcast.prices[checked].price}`}
                                    </span>
                                </div>
                            </div>
                            <div style={styles.feeRow}>
                                <div className="" style={styles.feeWrapper}>
                                    <div style={styles.feePriceText}>
                                        <span
                                            className="margin-five-bottom"
                                            style={styles.price}
                                        >
                                            {`$${fee}`}
                                        </span>
                                    </div>
                                    <div style={styles.feeText}>
                                        Processing fee:
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
};

// CourseInCart.propTypes = {
//     course: PropTypes.object,
//     setDiscountedPrise: PropTypes.func,
//     deleteCourseFromCart: PropTypes.func,
// };

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
};
