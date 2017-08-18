/**
 * Created by developer on 11.08.17.
 */
import React from 'react';
import PropTypes from 'prop-types';

import Colors from '../../styles/colors';
import ValidatedInput from '../../components/inputs/validatedInput';

export const GreyInput = (props) => {
        const { validators, styles, type, placeholder, onChange, value, wrapperStyles } = props;

        return (
            <ValidatedInput
                type={type}
                styles={{..._styles.input, ...styles}}
                wrapperStyles={wrapperStyles}
                placeholder={placeholder}
                onChange={onChange}
                value={value}
                validators={validators}
                errorStyles={_styles.errorStyles}
            />
        );
};

GreyInput.propTypes = {
    validators: PropTypes.array,
    styles: PropTypes.object,
    wrapperStyles: PropTypes.object,
    type: PropTypes.string,
    placeholder: PropTypes.string,
    onChange: PropTypes.func,
    value: PropTypes.string,
};

const _styles = {
    input: {
        backgroundColor: Colors.window,
        fontSize: 16,
        height: 42,
        borderRadius: 3,
        boxShadow: '0 -1px 2px rgba(0, 0, 0, 0.5)',
    },
    errorStyles: {
        fontSize: 11,
        position: 'relative',
        bottom: 20,
    },
};
