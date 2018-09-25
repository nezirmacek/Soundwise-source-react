import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import Axios from 'axios';
import firebase from 'firebase';
import { CSVLink, CSVDownload } from 'react-csv';

import {
  minLengthValidator,
  maxLengthValidator,
} from '../../../helpers/validators';
import ValidatedInput from '../../../components/inputs/validatedInput';
import Colors from '../../../styles/colors';
import commonStyles from '../../../styles/commonStyles';
import {
  OrangeSubmitButton,
  TransparentShortSubmitButton,
} from '../../../components/buttons/buttons';
import InviteSubscribersModal from './invite_subscribers_modal';
import Subscriber from './subscriber';
import PendingInviteModal from './pending_invite_modal';
import EmailListModal from './email_list_modal';

export default class Subscribers extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentSoundcastID: null,
      currentSoundcast: { invited: {}, title: '' },
      soundcasts_managed: [],
      subscribers: [{}],
      checked: false,
      toBeUnsubscribed: [],
      showModal: false,
      showPendingInvite: false,
      showEmailList: false,
      modalOpen: false,
    };

    this.subscribers = [];

    this.retrieveSubscriberInfo = this.retrieveSubscriberInfo.bind(this);
    this.handleCheck = this.handleCheck.bind(this);
    this.deleteSubscriber = this.deleteSubscriber.bind(this);
    this.handleModal = this.handleModal.bind(this);
    this.handlePendingInvite = this.handlePendingInvite.bind(this);
    this.handleEmailList = this.handleEmailList.bind(this);
  }

  componentDidMount() {
    const that = this;
    const { userInfo } = this.props;
    if (userInfo.publisher) {
      if (
        (!userInfo.publisher.plan && !userInfo.publisher.beta) ||
        (userInfo.publisher.plan &&
          userInfo.publisher.current_period_end < moment().format('X'))
      ) {
        this.setState({
          modalOpen: true,
        });
      }
    }
    if (
      this.props.userInfo.soundcasts_managed &&
      this.props.userInfo.publisher
    ) {
      if (
        typeof Object.values(this.props.userInfo.soundcasts_managed)[0] ==
        'object'
      ) {
        const that = this;
        const { userInfo } = this.props;
        const _subscribers = [];
        const _soundcasts_managed = [];

        for (let id in userInfo.soundcasts_managed) {
          const _soundcast = JSON.parse(
            JSON.stringify(userInfo.soundcasts_managed[id])
          );
          if (_soundcast.title) {
            _soundcast.id = id;
            _soundcasts_managed.push(_soundcast);
          }
        }
        // console.log('_soundcasts_managed: ', _soundcasts_managed);
        this.setState({
          soundcasts_managed: _soundcasts_managed,
        });
        const promises = [];

        if (!this.state.currentSoundcastID) {
          //if loading for the first time, retrieve subscribers
          for (let userId in _soundcasts_managed[0].subscribed) {
            promises.push(this.retrieveSubscriberInfo(userId));
          }

          Promise.all(promises).then(
            res => {
              const currentSoundcastID = _soundcasts_managed[0].id;
              res.sort((a, b) => {
                if (
                  a.soundcasts &&
                  b.soundcasts &&
                  b.soundcasts[currentSoundcastID] &&
                  a.soundcasts[currentSoundcastID]
                ) {
                  return (
                    b.soundcasts[currentSoundcastID].date_subscribed -
                    a.soundcasts[currentSoundcastID].date_subscribed
                  );
                }
              });
              that.setState({
                soundcasts_managed: _soundcasts_managed,
                currentSoundcastID: _soundcasts_managed[0].id,
                currentSoundcast: _soundcasts_managed[0],
                // subscribers: that.subscribers,
                subscribers: res,
              });
              // that.subscribers = [];
            },
            err => {
              console.log('promise error: ', err);
            }
          );
        }
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    const that = this;
    const { userInfo } = nextProps;
    if (userInfo.publisher) {
      if (
        (!userInfo.publisher.plan && !userInfo.publisher.beta) ||
        (userInfo.publisher.plan &&
          userInfo.publisher.current_period_end < moment().format('X'))
      ) {
        this.setState({
          modalOpen: true,
        });
      }
    }
    if (nextProps.userInfo.soundcasts_managed && nextProps.userInfo.publisher) {
      if (
        typeof Object.values(nextProps.userInfo.soundcasts_managed)[0] ==
        'object'
      ) {
        const that = this;
        const { userInfo } = nextProps;
        const _subscribers = [];
        const _soundcasts_managed = [];

        for (let id in userInfo.soundcasts_managed) {
          const _soundcast = JSON.parse(
            JSON.stringify(userInfo.soundcasts_managed[id])
          );
          if (_soundcast.title) {
            _soundcast.id = id;
            _soundcasts_managed.push(_soundcast);
          }
        }
        this.setState({
          soundcasts_managed: _soundcasts_managed,
        });
        const promises = [];

        if (!this.state.currentSoundcastID) {
          for (let userId in _soundcasts_managed[0].subscribed) {
            promises.push(this.retrieveSubscriberInfo(userId));
          }

          Promise.all(promises).then(
            res => {
              const currentSoundcastID = _soundcasts_managed[0].id;
              res.sort((a, b) => {
                if (
                  a.soundcasts &&
                  b.soundcasts &&
                  b.soundcasts[currentSoundcastID] &&
                  a.soundcasts[currentSoundcastID]
                ) {
                  return (
                    b.soundcasts[currentSoundcastID].date_subscribed -
                    a.soundcasts[currentSoundcastID].date_subscribed
                  );
                } else {
                  return -1;
                }
              });
              that.setState({
                currentSoundcastID,
                currentSoundcast: _soundcasts_managed[0],
                // subscribers: that.subscribers,
                subscribers: res,
              });
              // that.subscribers = [];
            },
            err => {
              console.log('promise error: ', err);
            }
          );
        }
      }
    }
  }

  handleModal() {
    if (!this.state.showModal) {
      this.setState({
        showModal: true,
      });
    } else {
      this.setState({
        showModal: false,
      });
    }
  }

  handlePendingInvite() {
    if (!this.state.showPendingInvite) {
      this.setState({
        showPendingInvite: true,
      });
    } else {
      this.setState({
        showPendingInvite: false,
      });
    }
  }

  handleEmailList() {
    if (!this.state.showEmailList) {
      this.setState({
        showEmailList: true,
      });
    } else {
      this.setState({
        showEmailList: false,
      });
    }
  }


  retrieveSubscriberInfo(userId) {
    const that = this;
    const { currentSoundcastID } = this.state;
    return firebase
      .database()
      .ref('users/' + userId)
      .once('value')
      .then(snapshot => {
        // that.subscribers.push({...JSON.parse(JSON.stringify(snapshot.val())), id: userId});
        return { ...JSON.parse(JSON.stringify(snapshot.val())), id: userId };
      })
      .then(res => res, err => console.log(err));
  }

  changeSoundcastId(e) {
    const that = this;
    const currentSoundcastID = e.target.value;
    this.setState({
      currentSoundcastID,
      toBeUnsubscribed: [],
    });

    const { soundcasts_managed } = this.state;
    let currentSoundcast;

    soundcasts_managed.forEach(soundcast => {
      if (soundcast.id == e.target.value) {
        currentSoundcast = soundcast;
      }
    });

    const promises = [];
    for (let userId in currentSoundcast.subscribed) {
      promises.push(this.retrieveSubscriberInfo(userId));
    }
    
    Promise.all(promises).then(
      res => {
        res.sort((a, b) => {
          if (
            a.soundcasts &&
            b.soundcasts &&
            b.soundcasts[currentSoundcastID] &&
            a.soundcasts[currentSoundcastID]
          ) {
            return (
              b.soundcasts[currentSoundcastID].date_subscribed -
              a.soundcasts[currentSoundcastID].date_subscribed
            );
          } else {
            return -1;
          }
        });
        that.setState({
          subscribers: res,
          currentSoundcast,
        });
      },
      err => {
        console.log('promise error: ', err);
      }
    );
  }

  handleCheck(e) {
    this.setState({
      checked: e.target.checked,
    });
    const id = e.target.name.split('-')[0];
    const toBeUnsubscribed = this.state.toBeUnsubscribed.slice(0);
    if (e.target.checked) {
      toBeUnsubscribed.push(id);
    } else {
      const position = toBeUnsubscribed.indexOf(id);
      if (position > -1) {
        toBeUnsubscribed.splice(position, 1);
      }
    }
    // console.log('toBeUnsubscribed: ', toBeUnsubscribed);
    this.setState({
      toBeUnsubscribed: toBeUnsubscribed,
    });
  }

  deleteSubscriber() {
    const { currentSoundcastID, currentSoundcast, subscribers } = this.state;
    const { userInfo } = this.props;
    const publisherID = userInfo.publisherID;
    if (this.state.toBeUnsubscribed.length === 0) {
      confirm(
        `Please select the listeners to unsubscribe`
      )
      return;
    } 

    this.subscribers = subscribers.slice(0);
    if (
      confirm(
        `Are you sure you want to unsubscribe these listeners from ${
          this.state.currentSoundcast.title
        }? There is no going back!`
      )
    ) {
      // remove user-soundcast from both soundcast node and user node
      this.state.toBeUnsubscribed.forEach(listenerID => {
        firebase
          .database()
          .ref(
            'soundcasts/' +
              this.state.currentSoundcastID +
              '/subscribed/' +
              listenerID
          )
          .remove();

        firebase
          .database()
          .ref(
            'users/' +
              listenerID +
              '/soundcasts/' +
              this.state.currentSoundcastID +
              '/subscribed'
          )
          .set(false);

        firebase
          .database()
          .ref(
            'users/' +
              listenerID +
              '/soundcasts/' +
              this.state.currentSoundcastID +
              '/current_period_end'
          )
          .set(moment().format('X'));

        firebase
          .database()
          .ref(
            `publishers/${publisherID}/freeSubscribers/${listenerID}/${
              this.state.currentSoundcastID
            }`
          )
          .remove();

        firebase
          .database()
          .ref(`publishers/${publisherID}/freeSubscribers/${listenerID}`)
          .once('value')
          .then(snapshot => {
            if (!snapshot.val()) {
              firebase
                .database()
                .ref(`publishers/${publisherID}/freeSubscriberCount`)
                .once('value')
                .then(snapshot => {
                  if (snapshot.val()) {
                    const count = snapshot.val();
                    // console.log('free subscriber count: ', count);
                    firebase
                      .database()
                      .ref(`publishers/${publisherID}/freeSubscriberCount`)
                      .set(count - 1);
                    console.log('subscriber count reduced by 1');
                  }
                });
            }
          });

        if (currentSoundcast.subscriberEmailList) {
          // delete email from email list
          firebase
            .database()
            .ref(`users/${listenerID}`)
            .once('value')
            .then(snapshot => {
              Axios.post('/api/delete_emails', {
                emails: [snapshot.val().email[0]],
                emailListId: currentSoundcast.subscriberEmailList,
              });
            });
        }

        for (var i = this.subscribers.length - 1; i >= 0; i -= 1) {
          if (this.subscribers[i].id == listenerID) {
            this.subscribers.splice(i, 1);
          }
        }
        this.subscribers.sort((a, b) => {
          if (
            a.soundcasts &&
            b.soundcasts &&
            b.soundcasts[currentSoundcastID] &&
            a.soundcasts[currentSoundcastID]
          ) {
            return (
              b.soundcasts[currentSoundcastID].date_subscribed -
              a.soundcasts[currentSoundcastID].date_subscribed
            );
          } else {
            return -1;
          }
        });
        this.setState({
          subscribers: this.subscribers,
          checked: false,
          currentSoundcast,
          currentSoundcastID,
          toBeUnsubscribed: [],
        });
      });
    }
  }

  render() {
    const {
      soundcasts_managed,
      subscribers,
      checked,
      currentSoundcast,
      currentSoundcastID,
      modalOpen,
    } = this.state;
    const that = this;
    const { history } = this.props;

    let csvData = [['First Name', 'Last Name', 'Email']];

    subscribers.forEach(subscriber => {
      if (subscriber.email && subscriber.email[0]) {
        csvData.push([
          subscriber.firstName,
          subscriber.lastName,
          subscriber.email[0],
        ]);
      }
    });

    return (
      <div className="padding-30px-tb">
        <InviteSubscribersModal
          isShown={this.state.showModal}
          soundcast={this.state.currentSoundcast}
          onClose={this.handleModal}
          userInfo={this.props.userInfo}
        />
        <PendingInviteModal
          isShown={this.state.showPendingInvite}
          soundcast={this.state.currentSoundcast}
          userInfo={this.props.userInfo}
          onClose={this.handlePendingInvite}
        />
        <EmailListModal
          isShown={this.state.showEmailList}
          currentSoundcastID={this.state.currentSoundcastID}
          userInfo={this.props.userInfo}
          onClose={this.handleEmailList}
          soundcasts={soundcasts_managed}
        />

        <div
          style={{
            display: modalOpen ? '' : 'none',
            background: 'rgba(0, 0, 0, 0.7)',
            top: 0,
            left: 0,
            height: '100%',
            width: '100%',
            position: 'absolute',
            zIndex: 100,
          }}
        >
          <div
            style={{
              transform: 'translate(-50%)',
              backgroundColor: 'white',
              top: 150,
              left: '50%',
              position: 'absolute',
              width: '70%',
              zIndex: 103,
            }}
          >
            <div
              className="title-medium"
              style={{ margin: 25, fontWeight: 800 }}
            >
              Upgrade to view subscribers
            </div>
            <div className="title-small" style={{ margin: 25 }}>
              Subscriber data is available on PLUS and PRO plans. Please upgrade
              to access the feature.
            </div>
            <div className="center-col">
              <OrangeSubmitButton
                label="Upgrade"
                onClick={() =>
                  that.props.history.push({ pathname: '/pricing' })
                }
                styles={{ width: '60%' }}
              />
            </div>
          </div>
        </div>
        <div style={{}}>
          <row className="padding-bottom-20px ">
            <div className="col-md-2 col-sm-4 col-xs-12">
              <span className="title-medium ">Subscribers</span>
            </div>
            <div
              className="col-md-6 col-sm-8 col-xs-12"
              style={styles.soundcastSelectWrapper}
            >
              <select
                style={styles.soundcastSelect}
                value={currentSoundcastID}
                onChange={e => {
                  this.changeSoundcastId(e);
                }}
              >
                {soundcasts_managed.map((souncast, i) => {
                  return (
                    <option style={styles.option} value={souncast.id} key={i}>
                      {souncast.title}
                    </option>
                  );
                })}
              </select>
            </div>
            <div
              className="col-md-4 col-sm-12 col-xs-12"
              style={styles.searchWrap}
            >
              <input
                type="text"
                style={styles.searchTerm}
                placeholder="Search subscribers"
              />
              <button type="submit" style={styles.searchButton}>
                <i className="fa fa-search" />
              </button>
            </div>
          </row>
          <row style={{ marginBottom: 25 }}>
            <div className="col-md-2 col-sm-6 col-xs-12" style={styles.button}>
              <span
                style={{ color: Colors.mainOrange }}
                onClick={this.handleModal}
              >
                Invite Subscribers
              </span>
            </div>
            <div className="col-md-2 col-sm-6 col-xs-12" style={styles.button}>
              <span
                style={{ color: Colors.link }}
                onClick={this.handlePendingInvite}
              >
                See Pending Invites
              </span>
            </div>
            <div className="col-md-2 col-sm-6 col-xs-12" style={styles.button}>
              <CSVLink
                data={csvData}
                filename={`${currentSoundcast.title} subscribers.csv`}
              >
                <span>Download Subscribers</span>
              </CSVLink>
            </div>
            <div className="col-md-2 col-sm-6 col-xs-12" style={styles.button}>
              <span
                style={{ color: Colors.link }}
                onClick={this.handleEmailList}
              >
                Connect Email List
              </span>
            </div>
            <div className="col-md-2 col-sm-6 col-xs-12">
                <div
                  style={{ ...styles.button, color: this.state.toBeUnsubscribed.length > 0 ? 'red' : Colors.fontDarkGrey }}
                  onClick={this.deleteSubscriber}
                >
                  Unsubscribe
                </div>
            </div>
          </row>
          <row>
            <div
              className="col-md-12 col-sm-12 col-xs-12 table-responsive"
              style={styles.tableWrapper}
            >
              <table className="table table-condensed">
                <thead>
                  <tr style={styles.tr}>
                    <th style={{ ...styles.th }} />
                    <th style={{ ...styles.th }}>NAME</th>
                    <th style={{ ...styles.th }}>EMAIL</th>
                    <th style={{ ...styles.th }}>SUBSCRIBED ON</th>
                    <th style={{ ...styles.th }}>STATS</th>
                    <th style={{ ...styles.th }} />
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((subscriber, i) => {
                    if (subscriber.email) {
                      return (
                        <tr key={i} style={styles.tr}>
                          <td style={{ ...styles.td }} />
                          <td style={{ ...styles.td }}>{`${
                            subscriber.firstName
                          } ${subscriber.lastName}`}</td>
                          <td style={{ ...styles.td }}>
                            <a
                              style={{
                                color: 'blue',
                                textDecoration: 'underline',
                              }}
                              href={`mailto:${subscriber.email[0]}`}
                            >
                              {subscriber.email[0]}
                            </a>
                          </td>
                          <td style={{ ...styles.td }}>
                            {(subscriber.soundcasts &&
                              subscriber.soundcasts[currentSoundcastID] &&
                              subscriber.soundcasts[currentSoundcastID]
                                .date_subscribed &&
                              moment(
                                subscriber.soundcasts[currentSoundcastID]
                                  .date_subscribed * 1000
                              ).format('YYYY-MM-DD')) ||
                              '__'}
                          </td>
                          <td style={{ ...styles.td }}>
                            <span
                              onClick={() => {
                                history.push({
                                  pathname: `/dashboard/subscriber/${
                                    subscriber.id
                                  }`,
                                  state: {
                                    subscriber,
                                    soundcast: currentSoundcast,
                                  },
                                });
                              }}
                            >
                              <i
                                className="far fa-chart-bar"
                                style={styles.itemChartIcon}
                              />
                            </span>
                          </td>
                          <td style={{ ...styles.td }}>
                            <input
                              type="checkbox"
                              id={`${subscriber.id}-${currentSoundcastID}`}
                              value={`${subscriber.id}-${currentSoundcastID}`}
                              name={`${subscriber.id}-${currentSoundcastID}`}
                              onClick={this.handleCheck}
                              style={styles.itemCheckbox}
                            />
                          </td>
                        </tr>
                      );
                    } else {
                      return null;
                    }
                  })}
                </tbody>
              </table>
            </div>
          </row>
        </div>
      </div>
    );
  }
}

const styles = {
  titleRow: {
    marginBottom: 20,
  },
  soundcastSelectWrapper: {
    height: 40,
    // width: 300,
    // backgroundColor: Colors.mainWhite,
    marginTop: 0,
    // marginLeft: 30,
    // marginRight: 30,
    // display: 'inline-block'
  },
  soundcastSelect: {
    backgroundColor: Colors.mainWhite,
    width: 'calc(100% - 20px)',
    height: 40,
    marginLeft: 10,
    marginRight: 10,
    marginTop: 0,
    fontSize: 16,
  },
  invite: {
    color: Colors.mainOrange,
    fontSize: 18,
    // marginRight: 60,
    cursor: 'pointer',
  },
  option: {
    fontSize: 16,
  },
  searchWrap: {
    // width: '30%',
    // position: 'absolute',
    // float: 'right',
    // display: 'inline-block',
    marginTop: 0,
  },
  search: {
    width: '100%',
    position: 'relative',
  },
  searchTerm: {
    position: 'relative',
    float: 'left',
    width: '100%',
    border: '1px solid ',
    borderColor: Colors.link,
    padding: '5px',
    // marginTop: '2px',
    height: '35px',
    borderRadius: '5px',
    outline: 'none',
    fontSize: 16,
    // color: Colors.link
  },
  searchButton: {
    position: 'absolute',
    right: '-0px',
    // width: '40px',
    height: '35px',
    border: '1px solid',
    borderColor: Colors.link,
    background: Colors.link,
    textAlign: 'center',
    color: '#fff',
    borderRadius: '5px',
    cursor: 'pointer',
    // marginTop: '2px',
    fontSize: '20px',
  },
  pendingInviteWrap: {
    marginTop: 30,
    marginBottom: 25,
    // height: 35
  },
  pendingInvites: {
    fontSize: 16,
    fontStyle: 'italic',
    textDecoration: 'underline',
    cursor: 'pointer',
  },
  deleteButtonWrap: {
    height: 35,
    marginLeft: 25,
    // display: 'inline-block',
    verticalAlign: 'middle',
  },
  unsubscribe: {
    height: 35,
    borderRadius: 23,
    overflow: 'hidden',
    // margin: '40px auto',
    fontSize: 16,
    letterSpacing: 2.5,
    wordSpacing: 5,
    paddingTop: 6,
    paddingRight: 20,
    paddingBottom: 4,
    paddingLeft: 20,
    borderWidth: 1,
    borderStyle: 'solid',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    color: Colors.darkGrey,
    borderColor: Colors.darkGrey,
    textAlign: 'center',
  },
  tableWrapper: { ...commonStyles.tableWrapper, height: 550 },
  tr: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightBorder,
    borderBottomStyle: 'solid',
  },
  th: {
    fontSize: 16,
    color: Colors.fontGrey,
    // height: 35,
    fontWeight: 'regular',
    verticalAlign: 'middle',
    wordWrap: 'break-word',
  },
  td: {
    color: Colors.softBlack,
    fontSize: 16,
    // height: 40,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    verticalAlign: 'middle',
    wordWrap: 'break-word',
  },
  itemCheckbox: {
    marginTop: 0,
    height: 40,
    width: 50,
    // transform: 'scale(1.5)'
  },
  itemChartIcon: {
    fontSize: 16,
    color: Colors.fontBlack,
    cursor: 'pointer',
  },
  button: {
    // height: 35,
    borderRadius: 5,
    fontSize: 16,
    letterSpacing: 1.5,
    fontWeight: 'bold',
    wordSpacing: 4,
    // display: 'inline-block',
    // paddingTop: 5,
    // paddingRight: 15,
    paddingBottom: 5,
    // paddingLeft: 15,
    borderWidth: 0,
    marginTop: 10,
    // marginRight: 7,
    // marginLeft: 7,
    borderStyle: 'solid',
    cursor: 'pointer',
    textAlign: 'center',
    verticalAlign: 'middle',
  },
};
