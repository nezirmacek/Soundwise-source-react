import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import ReactCrop from 'react-image-crop';
import Axios from 'axios';
import firebase from 'firebase';
import {Bar} from 'react-chartjs-2';

import {minLengthValidator, maxLengthValidator} from '../../../helpers/validators';
import ValidatedInput from '../../../components/inputs/validatedInput';
import Colors from '../../../styles/colors';
import { OrangeSubmitButton, TransparentShortSubmitButton } from '../../../components/buttons/buttons';

export default class Analytics extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentSoundcastID: null,
      currentSoundcast: null,
      soundcasts_managed: [],
      data: {
        labels: [],
        datasets: [
          {
            data: [],
          }
        ]
      }
    }

    this.getListeningStats = this.getListeningStats.bind(this);
  }

  componentDidMount() {
    const { userInfo } = this.props;
    const _subscribers = [];
    const _soundcasts_managed = [];

    for (let id in userInfo.soundcasts_managed) {
        const _soundcast = JSON.parse(JSON.stringify(userInfo.soundcasts_managed[id]));
        if (_soundcast.title) {
            _soundcast.id = id;
            _soundcasts_managed.push(_soundcast);
        }
    }

    this.setState({
      soundcasts_managed: _soundcasts_managed,
      currentSoundcastID: _soundcasts_managed[0].id,
      currentSoundcast: _soundcasts_managed[0],
    });

    this.getListeningStats(_soundcasts_managed[0].id);
  }

  getListeningStats(soundcastId) {
    Axios.get('/api/stats_by_soundcast', {
      params: {
        soundcastId: soundcastId,
        startDate: '2017-01-01',
        endDate: '2017-09-03'
      }
    })
    .then(res => {
      console.log('res.data: ', res.data);
    })
  }

  changeSoundcastId (e) {
    this.setState({
      currentSoundcastID: e.target.value
    });

    const { soundcasts_managed, currentSoundcastID } = this.state;
    let currentSoundcast;

    soundcasts_managed.forEach(soundcast => {
      if(soundcast.id == e.target.value) {
        currentSoundcast = soundcast;
      }
    })

    this.setState({
      currentSoundcast
    });
    this.getListeningStats(e.target.value);
  }

  render() {
    const { soundcasts_managed, data } = this.state;

    return (
      <div className='padding-30px-tb'>
        <div className='padding-bottom-20px'>
          <span className='title-medium '>
              Analytics
          </span>
          <div style={styles.soundcastSelectWrapper}>
              <select style={styles.soundcastSelect} onChange={(e) => {this.changeSoundcastId(e);}}>
                  <optgroup>
                    {
                        soundcasts_managed.map((souncast, i) => {
                            return (
                                <option style={styles.option} value={souncast.id} key={i}>{souncast.title}</option>
                            );
                        })
                    }
                  </optgroup>
              </select>
          </div>
          <div style={styles.chartWrapper}>
            <Bar
              data={data}
              width={100}
              height={50}
              options={{
                maintainAspectRatio: false
              }}
            />
          </div>
        </div>
      </div>
    )
  }
};

const styles = {
  soundcastSelectWrapper: {
      height: 40,
      width: 300,
      marginTop: 0,
      marginLeft: 30,
      marginRight: 30,
      display: 'inline-block'
  },
  soundcastSelect: {
      backgroundColor: Colors.mainWhite,
      width: 'calc(100% - 20px)',
      height: 35,
      marginLeft: 10,
      marginRight: 10,
      marginTop: 0,
      fontSize: 16
  },
  option: {
    fontSize: 16
  },
};