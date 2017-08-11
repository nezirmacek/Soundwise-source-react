/**
 * Created by developer on 10.08.17.
 */
import React, { Component } from 'react';
import Colors from '../../styles/colors';
import PropTypes from 'prop-types';

const props = {
    label: PropTypes.string,
    onClick: PropTypes.func,
    styles: PropTypes.object,
};

export const OrangeSubmitButton = (props) => {
    const { label, onClick, styles } = props;
    return (
        <div style={{..._styles.orangeSubmitButton, ...(styles || {}) }} onClick={onClick}>{label}</div>
    );
};
OrangeSubmitButton.propTypes = props;

export const TransparentShortSubmitButton = (props) => {
    const { label, onClick, styles } = props;
    return (
        <div style={{..._styles.orangeSubmitButton, ..._styles.transparentShortSubmitButton, ...(styles || {}) }} onClick={onClick}>{label}</div>
    );
};
TransparentShortSubmitButton.propTypes = props;

const _styles = {
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
        borderColor: Colors.mainOrange,
        borderWidth: 1,
        borderStyle: 'solid',
    },
    transparentShortSubmitButton: {
        backgroundColor: 'transparent',
        width: 97,
        color: Colors.darkGrey,
        borderColor: Colors.darkGrey,
    },
};
