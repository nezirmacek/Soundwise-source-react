/**
 * Created by developer on 09.08.17.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import Colors from '../../../styles/colors';

export default class SoundcastsManaged extends Component {
    render() {
        // const {  } = this.state;
        const { userInfo } = this.props;
    
        const _soundcasts_managed = [];
        for (let id in userInfo.soundcasts_managed) {
            const _soundcast = JSON.parse(JSON.stringify(userInfo.soundcasts_managed[id]));
            if (_soundcast.title) {
                _soundcast.id = id;
                if (_soundcast.episodes) {
                    _soundcast.last_updated = 0;
                    for (let episodeId in _soundcast.episodes) {
                        if (+_soundcast.episodes[episodeId].date_created > _soundcast.last_updated) {
                            _soundcast.last_updated = +_soundcast.episodes[episodeId].date_created;
                        }
                    }
                }
                _soundcasts_managed.push(_soundcast);
            }
        }
        
        return (
            <div>
                <span style={styles.titleText}>
                    Soundcasts
                </span>
                {
                    _soundcasts_managed.map((soundcast, i) => {
                        return (
                            <div className="row" key={i} style={styles.row}>
                                <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12" style={styles.soundcastInfo}>
                                    <img src={soundcast.imageURL} style={styles.soundcastImage} />
                                    <div style={styles.soundcastDescription}>
                                        <label style={styles.soundcastTitle}>{soundcast.title}</label>
                                        {
                                            soundcast.last_updated
                                            &&
                                            <span style={styles.soundcastUpdated}>
                                                Last updated: {moment(soundcast.last_updated).format('MMMM DD, YYYY')}
                                            </span>
                                            ||
                                            null
                                        }
                                    </div>
                                    <div style={styles.subscribers}>
                                        <span style={styles.soundcastUpdated}>
                                            {soundcast.subscribers && Object.keys(soundcast.subscribers).length || 0} subscribers
                                        </span>
                                        <span style={styles.addLink}>Add</span>
                                    </div>
                                </div>
                                <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12" style={styles.soundcastInfo}>
                                    <div style={{...styles.button, borderColor: Colors.link}}>Episodes</div>
                                    <div style={{...styles.button, borderColor: Colors.mainOrange}}>Analytics</div>
                                    <div style={{...styles.button, borderColor: Colors.mainGrey}}>Add new episode</div>
                                </div>
    
                                <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                    <div style={styles.addButton}>Add New Soundcast</div>
                                </div>
                            </div>
                        );
                    })
                }
            </div>
        );
    }
};

SoundcastsManaged.propTypes = {
    userInfo: PropTypes.object,
    history: PropTypes.object,
};

const styles = {
    titleText: {
        fontSize: 12,
    },
    row: {
        marginTop: 10,
        marginRight: 10,
        marginBottom: 10,
        marginLeft: 0,
    },
    soundcastInfo: {
        height: 76,
        backgroundColor: Colors.mainWhite,
        paddingTop: 15,
        paddingBottom: 15,
    },
    soundcastImage: {
        width: 46,
        height: 46,
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
        marginRight: 30,
        float: 'left',
    },
    soundcastDescription: {
        height: 46,
        float: 'left',
    },
    soundcastTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        display: 'block',
    },
    soundcastUpdated: {
        fontSize: 10,
    },
    subscribers: {
        paddingTop: 10,
        float: 'right',
        fontSize: 9,
    },
    addLink: {
        color: Colors.link,
        fontSize: 9,
        display: 'block',
        float: 'none',
        height: 11,
        lineHeight: '11px',
        position: 'relative',
        bottom: 5,
        width: 16,
        margin: '0 auto',
    },
    button: {
        height: 22,
        borderRadius: 11,
        fontSize: 9,
        letterSpacing: 2,
        wordSpacing: 4,
        display: 'inline-block',
        paddintTop: 5,
        paddingRight: 15,
        paddingBottom: 5,
        paddingLeft: 15,
        borderWidth: 1,
        marginTop: 10,
        marginRight: 15,
        borderStyle: 'solid',
    },
    addButton: {
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
