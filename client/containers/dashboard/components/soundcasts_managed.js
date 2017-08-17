/**
 * Created by developer on 09.08.17.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom';

import Colors from '../../../styles/colors';
import { OrangeSubmitButton } from '../../../components/buttons/buttons';

export default class SoundcastsManaged extends Component {
    render() {
        const { userInfo, history, id } = this.props;

        if (!id) {
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
				<div className='padding-30px-tb'>
          <div className='padding-bottom-20px'>
              <span className='title-medium '>
                  Soundcasts
              </span>
          </div>
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
										<div style={{...styles.button, borderColor: Colors.link}} onClick={() => history.push(`/dashboard/soundcasts/${soundcast.id}`)}>Episodes</div>
										<div style={{...styles.button, borderColor: Colors.mainOrange}}>Analytics</div>
										<div style={{...styles.button, borderColor: Colors.mainGrey}}>Add new episode</div>
									</div>
								</div>
							);
						})
					}
					<div className="row" style={styles.row}>
						<div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
							<OrangeSubmitButton
								label="Add New Soundcast"
								onClick={() => {history.push('/dashboard/add_soundcast');}}
							/>
						</div>
					</div>
				</div>
			);
		} else {
        	const _soundcast = userInfo.soundcasts_managed[id];
        	const _episodes = [];
        	for (let id in _soundcast.episodes) {
        		const _episode = _soundcast.episodes[id];
				if (typeof(_episode)==='object') {
					_episode.id = id;
					_episodes.push(_episode);
				}
			}
  			return (
  				<div style={styles.itemContainer}>
					<div style={styles.itemHeader}>
						<div style={styles.itemTitle}>{_soundcast.title}</div>
						<div style={styles.addEpisodeLink} onClick={() => history.push('/dashboard/add_episode')}>Add</div>
					</div>
					<table>
						<tr style={styles.tr}>
							<th style={{...styles.th, width: 37}}></th>
							<th style={{...styles.th, width: 150}}>TITLE</th>
							<th style={{...styles.th, width: 60}}>DATE</th>
							<th style={{...styles.th, width: 60}}>LENGTH</th>
							<th style={{...styles.th, width: 120}}>CREATOR</th>
							<th style={{...styles.th, width: 58}}>ANALYTICS</th>
							<th style={{...styles.th, width: 80}}>TOTAL LISTENS</th>
						</tr>
						{
							_episodes.map((episode, i) => {
								episode.creator = userInfo.publisher.administrators[episode.creatorID];

								return (
									<tr key={i} style={styles.tr}>
										<td style={styles.td}>
											<input type="checkbox" style={styles.itemCheckbox} />
										</td>
										<td style={styles.td}>{episode.title}</td>
										<td style={styles.td}>{moment(episode.date_created * 1000).format('MMM DD YYYY')}</td>
										<td style={styles.td}>{episode.duration && `${Math.round(episode.duration / 60)} minutes` || '-'}</td>
										<td style={styles.td}>{episode.creator.firstName} {episode.creator.lastName}</td>
										<td style={styles.td}>
											<i className="fa fa-line-chart" style={styles.itemChartIcon}></i>
										</td>
										<td style={styles.td}>{episode.totalListens || 0}</td>
									</tr>
								);
							})
						}
					</table>
				</div>
			);
		}

    }
};

SoundcastsManaged.propTypes = {
    userInfo: PropTypes.object,
    history: PropTypes.object,
	id: PropTypes.string,
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
        cursor: 'pointer',
    },

	itemContainer: {
    	marginTop: 30,
    	marginRight: 20,
    	marginBottom: 20,
    	marginLeft: 15,
		backgroundColor: Colors.mainWhite,
		paddingTop: 10,
		paddingRight: 0,
		paddingBottom: 10,
		paddingLeft: 0,
	},
	itemHeader: {
		height: 15,
		marginLeft: 10,
	},
	itemTitle: {
    	fontSize: 13,
		float: 'left',
		height: 15,
		lineHeight: '15px',
	},
	addEpisodeLink: {
    	float: 'left',
		fontSize: 13,
		color: Colors.mainOrange,
		marginLeft: 20,
		height: 15,
		lineHeight: '15px',
		cursor: 'pointer',
	},
	tr: {
    	borderBottomWidth: 1,
		borderBottomColor: Colors.lightBorder,
		borderBottomStyle: 'solid',
	},
	th: {
    	fontSize: 9,
		color: Colors.fontGrey,
		height: 35,
		fontWeight: 'regular',
		vAlign: 'middle',
	},
	td: {
    	color: Colors.fontDarkGrey,
		fontSize: 9,
		height: 40,
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap',
	},
	itemCheckbox: {
    	marginTop: 7,
	},
	itemChartIcon: {
    	fontSize: 12,
		color: Colors.fontBlack,
		cursor: 'pointer',
	},
};
