/**
 * Created by developer on 10.08.17.
 */
import React, { Component } from 'react';
import Colors from '../../styles/colors';
import PropTypes from 'prop-types';

export const OrangeSubmitButton = (props) => {
    const { label, onClick } = props;
    return (
        <div style={styles.orangeSubmitButton} onClick={onClick}>{label}</div>
    );
};
OrangeSubmitButton.propTypes = {
    label: PropTypes.string,
    onClick: PropTypes.func,
};

const styles = {
    orangeSubmitButton: {
        width: 219,
        height: 30,
        backgroundColor: Colors.mainOrange,
        borderRadius: 15,
        overflow: 'hidden',
        margin: '40px auto',
        fontSize: 13,
        letterSpacing: 2.5,
        wordSpacing: 5,
        color: Colors.mainWhite,
        paddingTop: 4,
        paddingRight: 20,
        paddingBottom: 4,
        paddingLeft: 20,
    },
};
