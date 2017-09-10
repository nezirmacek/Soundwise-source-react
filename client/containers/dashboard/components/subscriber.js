import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import ReactCrop from 'react-image-crop';
import Axios from 'axios';
import firebase from 'firebase';
import {Bar} from 'react-chartjs-2';

import {minLengthValidator, maxLengthValidator} from '../../../helpers/validators';
import {getDateArray} from '../../../helpers/get_date_array';

import ValidatedInput from '../../../components/inputs/validatedInput';
import Colors from '../../../styles/colors';
import { OrangeSubmitButton, TransparentShortSubmitButton } from '../../../components/buttons/buttons';

export default class Subscriber extends Component {
  constructor(props) {
    super(props);
    this.state = {
      startDate: '2017-01-01',
      endDate: new Date().toISOString().slice(0, 10),
      data: {
        labels: [],
        datasets: [
          {
            label: 'Total minutes listened',
            backgroundColor: 'rgba(97, 225, 251, 0.2)',
            borderColor: 'rgba(97, 225, 251, 1)',
            borderWidth: 1,
            hoverBackgroundColor: 'rgba(97, 225, 251, 0.4)',
            hoverBorderColor: 'rgba(97, 225, 251, 1)',
            data: [],
          }
        ]
      },
    };
    this.getListeningStats = this.getListeningStats.bind(this);
  }

  componentDidMount() {
    const {subscriber, soundcast} = this.props.history.location.state;
    this.getListeningStats(subscriber.id, soundcast.publisherId);
  }

  getListeningStats(userId, publisherId) {
    Axios.get('https://mysoundwise.com/api/stats_by_user_publisher', {
      params: {
        userId,
        publisherId,
        startDate: this.state.startDate,
        endDate: this.state.endDate
      }
    })
    .then(res => {
      this.countListenings(res.data);
    })
  }

  countListenings(rawDataArr) {
      const labels = getDateArray(this.state.startDate, this.state.endDate, 1);
      let episodes = {};
      const statsByDate = Array(labels.length).fill({
        listens: 0,
        length: 0
      });
      rawDataArr.forEach(session => {

        //calculate episodes
        if(!episodes[session.episodeId]) {
          episodes[session.episodeId] = {
            date: session.date,
            percentCompleted: session.percentCompleted
          }
        } else if(episodes[session.episodeId]) {
          const {date, percentCompleted} = episodes[session.episodeId];
          episodes[session.episodeId] = {
            date: date >= session.date ? date : session.date,
            percentCompleted: Math.max(percentCompleted, session.percentCompleted)
          }
        }

        //calculate stats by date
        const {listens, length} = statsByDate[labels.indexOf(session.date)];
        statsByDate[labels.indexOf(session.date)] = {
          listens: listens + 1,
          length: length + session.sessionDuration,
        };
      });

      const statsByDate_length = statsByDate.map(obj => {
        if(obj.listens == undefined) {
          return obj;
        } else {
          return obj.length;
        }
      });

      this.compileEpisodeList(episodes);

      this.setState({
        data: {
          labels,
          datasets: [
            {
              label: 'Total # of listens',
              backgroundColor: 'rgba(97, 225, 251, 0.2)',
              borderColor: 'rgba(97, 225, 251, 1)',
              borderWidth: 1,
              hoverBackgroundColor: 'rgba(97, 225, 251, 0.4)',
              hoverBorderColor: 'rgba(97, 225, 251, 1)',
              data: statsByDate_length,
            }
          ]
        },
      });
  }

  compileEpisodeList(episodes) {

  }

  render() {
    const {data} = this.state;

    return (
      <div className='padding-30px-tb'>
        <div >
            <div className='padding-bottom-20px'>
              <span className='title-medium '>
                  Subscriber Stats
              </span>
            </div>
            <div style={styles.chartWrapper}>
              <Bar
                data={data}
                width={100}
                height={400}
                options={{
                  maintainAspectRatio: false,
                  scales: {
                    xAxes: [
                      {
                        gridLines: {
                          display: false
                        }
                      }
                    ]
                  }
                }}
              />
            </div>
        </div>
      </div>
    )
  }
}

const styles = {
  chartWrapper: {
    backgroundColor: Colors.mainWhite,
    // marginTop: 20,
    padding: 20,
  },
}