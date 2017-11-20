/**
 * Created by developer on 09.08.17.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import firebase from 'firebase';
import moment from 'moment';
import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom';
import EditSoundcast from './edit_soundcast';
import InviteSubscribersModal from './invite_subscribers_modal';
import EpisodeStatsModal from './episode_stats_modal';
import Colors from '../../../styles/colors';
import { OrangeSubmitButton } from '../../../components/buttons/buttons';

export default class SoundcastsManaged extends Component {
  constructor(props) {
    super(props)

    this.state = {
      showModal: false,
      currentSoundcastID: '',
      currentSoundcast: null,
      showStatsModal: false,
      currentEpisode: null,
      userInfo: {soundcasts_managed: {}},
    }

    this.editSoundcast = this.editSoundcast.bind(this);
    this.handleModal = this.handleModal.bind(this);
    this.handleStatsModal = this.handleStatsModal.bind(this);
    this.deleteEpisode = this.deleteEpisode.bind(this);
  }

  componentDidMount() {
    if(this.props.userInfo) {
      const { userInfo } = this.props;
      this.setState({
        userInfo
      })
    }
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.userInfo) {
      const { userInfo } = nextProps;
      this.setState({
        userInfo
      })
    }
  }

  editSoundcast(soundcastId, soundcast) {
    const { userInfo, history, id } = this.props;
    history.push({
      pathname: `/dashboard/edit/${soundcastId}`,
      state: {
        id: soundcastId,
        soundcast
      }
    })
  }

  editEpisode(episode) {
    const { userInfo, history, id } = this.props;
    history.push({
      pathname: `/dashboard/edit_episode/${episode.id}`,
      state: {
        id: episode.id,
        episode
      }
    })
  }

  handleModal(soundcast) {
    // console.log('handleModal called');
    if(!this.state.showModal) {
      this.setState({
        showModal: true,
        currentSoundcastID: soundcast.id,
        currentSoundcast: soundcast
      })
    } else {
      this.setState({
        showModal: false
      })
    }
  }

  handleStatsModal() {
    if(!this.state.showStatsModal) {
      this.setState({
        showStatsModal: true,
      })
    } else {
      this.setState({
        showStatsModal: false
      })
    }
  }

  setCurrentEpisode(episode) {
    this.setState({
      currentEpisode: episode,
    });
    this.handleStatsModal();
  }

  deleteEpisode(episode) {
    const title = episode.title;
    if(confirm(`Are you sure you want to delete ${title}? You won't be able to go back.`)) {
      firebase.database().ref(`soundcasts/${episode.soundcastID}/episodes/${episode.id}`).remove();
      firebase.database().ref(`episodes/${episode.id}`).remove();
      alert(`${title} has been deleted`);
      return;
    }
  }

  render() {
    const { userInfo } = this.state;
    const { history, id } = this.props;

    if (!id) {
			const _soundcasts_managed = [];
			for (let id in userInfo.soundcasts_managed) {
				const _soundcast = JSON.parse(JSON.stringify(userInfo.soundcasts_managed[id]));
				if (_soundcast.title) {
					_soundcast.id = id;
					if (_soundcast.episodes) {
						_soundcast.last_update = 0;
						for (let episodeId in _soundcast.episodes) {
							if (+_soundcast.episodes[episodeId].date_created > _soundcast.last_update) {
								_soundcast.last_update = +_soundcast.episodes[episodeId].date_created;
							}
						}
					}
					_soundcasts_managed.push(_soundcast);
				}
			}

			return (
				<div className='padding-30px-tb container-fluid'>
          <InviteSubscribersModal
            isShown={this.state.showModal}
            soundcast={this.state.currentSoundcast}
            onClose={this.handleModal}
            userInfo={userInfo}
          />
          <div className='padding-bottom-20px row'>
              <span className='title-medium '>
                  Soundcasts
              </span>
          </div>
					{
						_soundcasts_managed.map((soundcast, i) => {
							return (
								<div className="row" key={i} style={{...styles.row,        overflowX: 'auto',whiteSpace: 'nowrap',}}>
									<div className=" col-lg-6 col-md-6 col-sm-12 col-xs-12" style={styles.soundcastInfo}>
                    <div className='row'>
                      <div className='col-md-2 col-sm-2 col-xs-12'>
  										  <img src={soundcast.imageURL} style={styles.soundcastImage} />
                      </div>
  										<div className='col-md-6 col-sm-6 col-xs-12'
                        style={styles.soundcastDescription}>
  											<div style={styles.soundcastTitle}>{soundcast.title}</div>
  											{
  												soundcast.last_update
  												&&
  												<div style={styles.soundcastUpdated}>
                                                  Last updated: {moment(soundcast.last_update * 1000).format('MMM DD YYYY')}
                                              </div>
  												||
  												null
  											}
  										</div>
  										<div className='col-md-4'
                        style={{...styles.subscribers, textAlign:'center'}}>
                        <span style={styles.soundcastUpdated}>
                            {soundcast.subscribed && Object.keys(soundcast.subscribed).length || 0} subscribed
                        </span>
  											<span
                          onClick={() => this.handleModal(soundcast)}
                          style={styles.addLink}>
                          Add
                        </span>
  										</div>
                    </div>
									</div>
									<div className="col-lg-6 col-md-6 col-sm-12 col-xs-12" style={styles.soundcastInfo}>
										<div style={{...styles.button, borderColor: Colors.link}} onClick={() => history.push(`/dashboard/soundcasts/${soundcast.id}`)}>Episodes</div>
										<div onClick={() => history.push({
                      pathname: '/dashboard/analytics',
                      state: {
                        soundcastId: soundcast.id,
                      }
                    })} style={{...styles.button, borderColor: Colors.mainOrange}}>Analytics</div>
										<div
                      style={{...styles.button, borderColor: Colors.mainGrey}}
                      onClick={() => history.push('/dashboard/add_episode')}
                    >
                      Add new episode
                    </div>
                    <div style={styles.edit}>
                      <span style={styles.editLink} onClick={() => this.editSoundcast(soundcast.id, soundcast)}>
                        Edit
                      </span>
                    </div>
									</div>
								</div>
							);
						})
					}
					<div className="row" style={{...styles.row, backgroundColor: 'transparent'}}>
						<div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
							<OrangeSubmitButton
								label="Add New Soundcast"
								onClick={() => {history.push('/dashboard/add_soundcast');}}
							/>
						</div>
					</div>
				</div>
			);
		} else if(id) {
        	let _soundcast = {};
          if(userInfo.soundcasts_managed[id]) {
            _soundcast = userInfo.soundcasts_managed[id];
          };
        	const _episodes = [];
          if(_soundcast.episodes) {
            for (let id in _soundcast.episodes) {
              const _episode = _soundcast.episodes[id];
              if (typeof(_episode)==='object') {
                _episode.id = id;
                _episodes.push(_episode);
              }
            }
          }

          _episodes.sort((a, b) => {
            return b.date_created - a.date_created;
          });

  			return (
  				<div className='container-fluid' style={styles.itemContainer}>
            <EpisodeStatsModal
              isShown={this.state.showStatsModal}
              episode={this.state.currentEpisode}
              onClose={this.handleStatsModal}
              userInfo={this.props.userInfo}
            />
  					<div className='row ' style={styles.itemHeader}>
  						<div className='col-lg-9 col-md-9 col-sm-8 col-xs-12'
                style={styles.itemTitle}>{_soundcast.title} - Episodes</div>
  						<div className='col-lg-3 col-md-3 col-sm-4 col-xs-12'
                style={styles.addEpisodeLink} onClick={() => history.push('/dashboard/add_episode')}>Add episode</div>
  					</div>
            <div className='table-responsive' style={styles.tableWrapper}>
    					<table className='table table-hover'>
                <thead>
      						<tr style={styles.tr}>
      							<th style={{...styles.th, }}>
                      TITLE
                    </th>
      							<th style={{...styles.th, }}>PUBLISHED ON</th>
      							<th style={{...styles.th, }}>LENGTH</th>
      							<th style={{...styles.th, }}>CREATOR</th>
      							<th style={{...styles.th, }}>ANALYTICS</th>
      						</tr>
                </thead>
                <tbody>
      						{
      							_episodes.map((episode, i) => {
      								episode.creator = userInfo.publisher.administrators[episode.creatorID];

      								return (
      									<tr key={i} style={{...styles.tr}}>
      										<td style={styles.td}>
                            <div style={{marginRight: 20}}>
                              <div style={{marginTop: 24}}>{episode.title}</div>
                              <div style={{marginBottom: 5}}>
                                <span
                                  style={{marginRight: 10, cursor: 'pointer', fontSize: 15, color: 'red'}}
                                  onClick={() => this.deleteEpisode(episode)}>
                                    Delete
                                </span>
                                <span
                                  style={{marginRight: 10, cursor: 'pointer', fontSize: 15, color: Colors.link}}
                                  onClick={() => this.editEpisode(episode)}>
                                  Edit
                                </span>
                                {
                                  episode.publicEpisode &&
                                  <a target='_blank' href={`https://mysoundwise.com/episodes/${episode.id}`}>
                                    <span className='text-dark-gray'
                                      style={{cursor: 'pointer', fontSize: 15}}>
                                      View
                                    </span>
                                  </a>
                                  || null
                                }
                              </div>
                            </div>
                          </td>
      										<td style={{...styles.td, textAlign: 'center'}}>{moment(episode.date_created * 1000).format('MMM DD YYYY')}</td>
      										<td style={{...styles.td, textAlign: 'center'}}>{episode.duration && `${Math.round(episode.duration / 60)} minutes` || '-'}</td>
      										<td style={{...styles.td, textAlign: 'center'}}>{episode.creator.firstName} {episode.creator.lastName}</td>
      										<td style={{...styles.td, textAlign: 'center'}}>
      											<i onClick={() => this.setCurrentEpisode(episode)} className="fa fa-2x fa-line-chart" style={styles.itemChartIcon}></i>
      										</td>
      									</tr>
      								);
      							})
      						}
                </tbody>
    					</table>
            </div>
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
        backgroundColor: Colors.mainWhite,
    },
    soundcastInfo: {
        // height: 96,
        backgroundColor: Colors.mainWhite,
        paddingTop: 15,
        paddingBottom: 15,
    },
    soundcastImage: {
        width: '100%',
        height: '100%',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
        // marginRight: 30,
        // float: 'left',
    },
    soundcastDescription: {
        height: 46,
        // float: 'left',
        // width: '65%',
    },
    soundcastTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        display: 'block',
    },
    soundcastUpdated: {
        fontSize: 16,
    },
    edit: {
      height: 30,
      display: 'inline-block'
    },
    editLink: {
      paddingTop: 15,
      paddingLeft: 20,
      fontSize: 16,
      color: Colors.link,
      float: 'right',
      cursor: 'pointer'
      // display: 'block'
    },
    subscribers: {
        paddingTop: 10,
        // float: 'right',
        fontSize: 15,
        display: 'block',
    },
    addLink: {
        color: Colors.link,
        fontSize: 15,
        display: 'block',
        // height: 11,
        // lineHeight: '11px',
        position: 'relative',
        bottom: 5,
        // width: 17,
        margin: '0 auto',
        paddingTop: 6,
        cursor: 'pointer'
    },
    button: {
        height: 30,
        borderRadius: 14,
        fontSize: 12,
        letterSpacing: 2,
        wordSpacing: 4,
        display: 'inline-block',
        paddintTop: 5,
        paddingRight: 15,
        paddingBottom: 5,
        paddingLeft: 15,
        borderWidth: 3,
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
		// height: 22,
		marginLeft: 15,
    marginTop: 10,
    marginBottom: 25,
    display: 'flex',
    justifyContent: 'start',
    alignItems: 'center',

	},
	itemTitle: {
    fontSize: 24,
		// float: 'left',
		// height: 22,
		// lineHeight: '22px',
	},
	addEpisodeLink: {
    	// float: 'left',
		fontSize: 16,
		color: Colors.mainOrange,
		// marginLeft: 20,
		// height: 22,
		// lineHeight: '22px',
		cursor: 'pointer',
	},
  tableWrapper: {
    padding: 20,
  },
	tr: {
    	borderBottomWidth: 1,
		borderBottomColor: Colors.lightBorder,
		borderBottomStyle: 'solid',
	},
	th: {
    fontSize: 17,
		color: Colors.fontGrey,
		height: 35,
		fontWeight: 'regular',
		verticalAlign: 'middle',
	},
	td: {
    	color: Colors.fontDarkGrey,
		fontSize: 17,
    color: 'black',
		height: 40,
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap',
    verticalAlign: 'middle',
	},
	itemCheckbox: {
    	marginTop: 7,
	},
	itemChartIcon: {
    	// fontSize: 12,
		color: Colors.fontBlack,
		cursor: 'pointer',
	},
};
