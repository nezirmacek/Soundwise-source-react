/**
 * Created by developer on 09.08.17.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import firebase from 'firebase';
import moment from 'moment';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom';
import EditSoundcast from './edit_soundcast';
import InviteSubscribersModal from './invite_subscribers_modal';
import EpisodeStatsModal from './episode_stats_modal';
import Colors from '../../../styles/colors';
import { OrangeSubmitButton } from '../../../components/buttons/buttons';

export default class SoundcastsBundles extends Component {
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
    this.deleteSoundcast = this.deleteSoundcast.bind(this);
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

  async deleteSoundcast(soundcastId) {
    const soundcastTitle = this.props.userInfo.soundcasts_managed[soundcastId].title;
    const confirmText =  `Are you sure you want to delete ${soundcastTitle}? All information about this soundcast will be deleted, including subscribers' emails and audio files.`;
    if(confirm(confirmText)) {
      await firebase.database().ref(`soundcasts/${soundcastId}`).remove();
      const admins = this.props.userInfo.publisher.administrators;
      for(var key in admins) {
        await firebase.database().ref(`users/${key}/soundcasts_managed/${soundcastId}`).remove();
      }
      const publisherId = this.props.userInfo.publisherID;
      await firebase.database().ref(`publishers/${publisherId}/soundcasts/${soundcastId}`).remove();
      alert('Soundcast has been deleted.');
    }
  }

  render() {
    const { userInfo } = this.state;
    const { history, id } = this.props;
    const that = this;
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
        <div className='padding-30px-tb ' style={{minHeight: 700}}>
          <InviteSubscribersModal
            isShown={this.state.showModal}
            soundcast={this.state.currentSoundcast}
            onClose={this.handleModal}
            userInfo={userInfo}
          />
          <div className='padding-bottom-20px' style={{display: 'flex', alignItems: 'center'}}>
              <span className='title-medium '>
                  Soundcasts
              </span>
          </div>
          <ul className="nav nav-pills">
            <li role="presentation" ><Link to='/dashboard/soundcasts'><span style={{fontSize: 15, fontWeight: 600}}>Individuals</span></Link></li>
            <li role="presentation" className="active"><Link style={{backgroundColor: 'transparent'}} to="/dashboard/soundcasts/bundles"><span style={{fontSize: 15, fontWeight: 600, color: Colors.mainOrange}}>Bundles</span></Link></li>
          </ul>
          <div className="row" style={{...styles.row, backgroundColor: 'transparent'}}>
            <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <OrangeSubmitButton
                label="Create New Bundle"
                onClick={() => {history.push('/dashboard/create_bundle');}}
              />
            </div>
          </div>
        </div>
      );
  }
};

SoundcastsBundles.propTypes = {
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
        // paddingLeft: 0,
        paddingRight: 0,
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
        paddingRight: 0,
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
      display: 'inline-block',
      verticalAlign: 'middle',
      marginTop: 10,
      marginBottom: 10,
    },
    editLink: {
      paddingTop: 10,
      paddingLeft: 20,
      fontSize: 17,
      fontWeight: 700,
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
        paddingLeft: 0,
        paddingRight: 0,
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
        height: 35,
        maxWidth: 150,
        borderRadius: 5,
        fontSize: 16,
        // letterSpacing: 1.5,
        fontWeight: 'bold',
        wordSpacing: 4,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        // paddingTop: 5,
        paddingRight: 10,
        paddingBottom: 5,
        paddingLeft: 10,
        borderWidth: 1.5,
        marginTop: 10,
        marginRight: 7,
        marginLeft: 7,
        borderStyle: 'solid',
        cursor: 'pointer',
        // overflow: 'auto',

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
