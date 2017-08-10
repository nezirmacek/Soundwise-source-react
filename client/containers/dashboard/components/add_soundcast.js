/**
 * Created by developer on 10.08.17.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import Colors from '../../../styles/colors';

export default class AddSoundcast extends Component {
    render() {
        // const {  } = this.state;
        const { userInfo } = this.props;
        
        return (
            <div>
                <span style={styles.titleText}>
                    Add New Soundcast
                </span>
                
            </div>
        );
    }
};

AddSoundcast.propTypes = {
    userInfo: PropTypes.object,
    history: PropTypes.object,
};

const styles = {
    titleText: {
        fontSize: 12,
    },
    
};
