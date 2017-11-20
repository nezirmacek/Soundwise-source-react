import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import axios from 'axios';
import firebase from 'firebase';

import EpisodeStatsModal from './episode_stats_modal';
import Colors from '../../../styles/colors';

export default class Soundcast extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showStatsModal: false,
      currentEpisode: null,
      userInfo: {soundcasts_managed: {}},
    };
    this.handleStatsModal = this.handleStatsModal.bind(this);
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
                  <th style={{...styles.th, textAlign: 'center'}}>PUBLISHED ON</th>
                  <th style={{...styles.th, textAlign: 'center'}}>LENGTH</th>
                  <th style={{...styles.th, textAlign: 'center'}}>CREATOR</th>
                  <th style={{...styles.th, textAlign: 'center'}}>ANALYTICS</th>
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
        // height: 46,
        // float: 'left',
        // width: '65%',
    },
    soundcastTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        // display: 'block',
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