import React, { Component } from 'react';
import PropTypes from 'prop-types';
import firebase from 'firebase';
import Loader from 'react-loader';
import rp from 'request-promise';
import Axios from 'axios';
import moment from 'moment';
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import faMicrophone from '@fortawesome/fontawesome-free-solid/faMicrophone'
import faStop from '@fortawesome/fontawesome-free-solid/faStop'
import faCircle from '@fortawesome/fontawesome-free-solid/faCircle'
import faPlayCircle from '@fortawesome/fontawesome-free-solid/faPlayCircle'
import faStopCircle from '@fortawesome/fontawesome-free-solid/faStopCircle'

import { withRouter } from 'react-router';
import Toggle from 'react-toggle';
import Dots from 'react-activity/lib/Dots';
import ReactS3Uploader from 'react-s3-uploader'
import LinearProgress from 'material-ui/LinearProgress';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import {minLengthValidator, maxLengthValidator} from '../../../helpers/validators';
import ValidatedInput from '../../../components/inputs/validatedInput';
import AudiojsRecordPlayer from '../../../components/audiojs_record_player';
import Colors from '../../../styles/colors';
import {sendNotifications} from '../../../helpers/send_notifications';
import {sendMarketingEmails} from '../../../helpers/sendMarketingEmails';

window.URL = window.URL || window.webkitURL;

class _CreateEpisode extends Component {
    constructor(props) {
        super(props);

        this.state = {
            currentsoundcast: null,
            isRecording: false,
            isRecorded: false,
            isPlaying: false,
            isLoading: false,
            isSaved: false,
            startProcessingEpisode: false,
            doneProcessingEpisode: false,
            podcastError: null,

            recordingStartTime: 0,
            currentRecordingDuration: 0,
            playingStartTime: 0,
            currentPlayingDuration: 0,

            audioUploaded: false,
            notesUploaded: false,
            coverArtUploaded: false,
            coverArtUrl: '',
            coverArtUploading: false,
            audioUploadProgress: 0,
            notesUploadProgress: 0,
            audioUploadError: null,
            notesUploadError: null,
            audioUploading: false,
            notesUploading: false,
            wrongFileTypeFor: null,

            recordedAudioUrl: '', // linkto uploaded file aws s3
            uploadedAudioUrl: '',
            blob: {}, // to play audio from react-mic
            notesUrl: '', // linkto uploaded file aws s3
            audioDuration: 0,

            title: '',
            description: '',
            actions: '',
            publicEpisode: false,
            index: null,

            audioNormalization: false,
            trimSilence: false,
            reduceSilence: false,
            addIntroOutro: false,
            silentPeriod: 0.5,
            immediatePublish: true,

            sendEmails: false,
        };

        this.audio = null;
        this.notes = null;
        this.player = null;
        this.recorder = null;
        this.mediaObject = null;
        this.recordingInterval = null;
        this.playingInterval = null;
        this.uploadAudioInput = null;
        this.uploadNotesInput = null;
        this.uploadCoverArtInput = null;
        this.currentSoundcastId = null;
        this.firebaseListener = null;

        this.renderPlayAndSave = this.renderPlayAndSave.bind(this)
        this.renderRecorder = this.renderRecorder.bind(this)
        this.notifySubscribers = this.notifySubscribers.bind(this);
        this.saveEpisode = this.saveEpisode.bind(this);
        this.emailListeners = this.emailListeners.bind(this);

        // if (props.userInfo.soundcasts_managed && props.userInfo.soundcasts_managed[props.currentSoundcastId]) {
        //     const _titleArray = props.userInfo.soundcasts_managed[props.currentSoundcastId].title.split(' ');
        //     let _transformedTitle = '';
        //     _titleArray.map(word => _transformedTitle += word);
        //     _transformedTitle = _transformedTitle.substr(0, 20);
        this.episodeId = `${moment().format('x')}e`;
        // }
    }

    componentDidMount () {
        // console.log('create_episode is mounted');
        const that = this;
        const {userInfo} = this.props;
        if(userInfo.soundcasts_managed) {
            this.currentSoundcastId = Object.keys(userInfo.soundcasts_managed)[0];
            firebase.database().ref(`soundcasts/${this.currentSoundcastId}`)
            .once('value')
            .then(snapshot => {
                if(snapshot.val()) {
                    that.setState({
                        publicEpisode: snapshot.val().landingPage ? true : false,
                        currentsoundcast: snapshot.val(),
                    });
                }
            });
        }

        if(this.props.location.state && this.props.location.state.soundcastID) {
            if(this.props.userInfo.soundcasts_managed) {
                this.changeSoundcastId(this.props.location.state.soundcastID);
            }
        }
  }

    componentWillReceiveProps(nextProps) {
        const {userInfo} = nextProps;
        if(userInfo.soundcasts_managed) {
            const soundcastArr = Object.keys(userInfo.soundcasts_managed);
            if(typeof userInfo.soundcasts_managed[soundcastArr[0]] == 'object' && userInfo.soundcasts_managed[soundcastArr[0]].title && !this.currentSoundcastId) {
                this.changeSoundcastId(soundcastArr[0], userInfo);
            }
        }
    }

    record () {
        const that = this;
        this.recorder = this.mediaObject.record();
        this.recorder.getDevice(); // triggers 'deviceReady'

        this.recordingInterval = setInterval(() => {
            const { recordingStartTime } = that.state;
            if (that.state.isRecording == false) {
                clearInterval(that.recordingInterval);
                return;
            }
            that.setState({
                currentRecordingDuration: moment().diff(recordingStartTime) //recording duration in millliseconds
            })
        }, 1000);
  }

    stop (blobObject) {
        const that = this;
        this.recorder.stop(); // triggers 'finishRecord'
        // clearInterval(recordingInterval);
        // console.log('interval cleared')
    }

    play () {
        const that = this;
        this.wavesurfer.surfer.play();

        if (this.state.isRecorded) {
            this.setState({
                isPlaying: true,
                playingStartTime: moment()
            });
        }

        this.playingInterval = setInterval(() => {
            const { playingStartTime } = that.state
            if(!that.state.isPlaying) {
                clearInterval(that.playingInterval)
            }
            that.setState({
                currentPlayingDuration: moment().diff(playingStartTime) //recording duration in millliseconds
            })
        }, 1000);
    }

    pause () {
        this.wavesurfer.surfer.pause();
        this.setState({
            isPlaying: false,
            currentPlayingDuration: 0
        });
        this.player.currentTime(0);
    }

    save () {
        let _self = this;
        // console.log('start converting to mp3');
        this.setState({
            currentPlayingDuration: 0,
            isPlaying: false,
        });
        clearInterval(this.recordingInterval);
        clearInterval(this.playingInterval);
        this.player.pause();
        this.player.currentTime(0);
        //upload file to aws s3
        this._uploadToAws(this.state.blob.blob, 'audio');
        this.setState({
            audioUploading: true,
            isSaved: true,
        })
    }

    _uploadToAws (file, type, uploadedAudio) {
        if(uploadedAudio) {
            this.setAudioDuration(file);
        }

        const _self = this;
        let data = new FormData();
        let ext = '';
        if (file.name) {
            const splittedFileName = file.name.split('.');
            ext = (splittedFileName)[splittedFileName.length - 1];
        } else {
            ext = 'mp3';
        }
        data.append('file', file, `${this.episodeId}.${ext}`);
        // axios.post('http://localhost:3000/upload/images', data) // - alternative address (need to uncomment on backend)
        Axios.post('/api/upload', data)
            .then(function (res) {
                // POST succeeded...
                // console.log('success upload to aws s3: ', res);

                //replace 'http' with 'https'
                let url = res.data[0].url;
                // console.log('url: ', url);
                if(url.slice(0, 5) !== 'https') {
                    url = url.replace(/http/i, 'https');
                }

                _self.setState({
                    [`${type}Uploading`]: false,
                    wrongFileTypeFor: null,
                });

                if(type == 'audio' && !uploadedAudio) {
                    _self.setState({
                        recordedAudioUrl: `https://mysoundwise.com/tracks/${_self.episodeId}.${ext}`,
                    })
                } else if(type == 'audio' && uploadedAudio) {
                    _self.setState({
                        uploadedAudioUrl: `https://mysoundwise.com/tracks/${_self.episodeId}.${ext}`,
                    })
                } else if(type == 'notes' || type == 'coverart') {
                    _self.setState({
                        [`${type}Url`]: url,
                    })
                }
            })
            .catch(function (err) {
                // POST failed...
                // console.log('ERROR upload to storage: ', err);
            });
    }

    setAudioDuration(file) {
        let audio = document.createElement('audio');
        const that = this;
        audio.preload = 'metadata';
        audio.onloadedmetadata = function() {
            window.URL.revokeObjectURL(this.src);
            let duration = audio.duration;
            that.setState({
                audioDuration: duration,
            });
            // console.log('duration of audio: ', duration);
        };
        audio.src = URL.createObjectURL(file);
    }

    setFileName (type, e) {
        if (e.target.value) {
            this[type] = [e.target.files[0]];
            let ext = '';
            let file = document.getElementById(type === 'audio' && 'upload_hidden_audio' || (type == 'notes' && 'upload_hidden_notes') || (type == 'coverart' && 'upload_hidden_cover3')).files[0];

            if (file.name) {

                const splittedFileName = file.name.split('.');
                ext = (splittedFileName)[splittedFileName.length - 1];
                if((type == 'audio' && (ext == 'mp3' || ext == 'm4a')) || (type == 'notes' && (ext == 'pdf' || ext == 'jpg' || ext == 'png' || ext == 'jpeg')) || (type == 'coverart' && (ext == 'jpg' || ext == 'png' || ext == 'jpeg'))) {
                    this.setState({
                        [`${type}Uploaded`]: true,
                        [`${type}Uploading`]: true,
                        [`${type}Name`]: file.name,
                    });
                    if(type== 'audio') {
                        this._uploadToAws(file, type, true);
                    } else if(type == 'notes' || type == 'coverart') {
                        this._uploadToAws(file, type);
                    }
                } else {
                    this.setState({
                        wrongFileTypeFor: type
                    })
                }
            }

        }
        // document.getElementById(type).value = e.target.value;
    }

    saveEpisode (isPublished) {
        const that = this;
        const {podcastFeedVersion, itunesImage, itunesExplicit, itunesCategory} = this.state.currentsoundcast; // if this is a  podcast; otherwise these variables would be null
        if(isPublished && podcastFeedVersion) {
          this.setState({
            startProcessingEpisode: true,
            doneProcessingEpisode: false,
          });
        }
        const { title, description, actions, recordedAudioUrl, uploadedAudioUrl, notesUrl, coverArtUrl, currentRecordingDuration, audioDuration, publicEpisode, currentsoundcast } = this.state;
        const { audioNormalization, trimSilence, reduceSilence, addIntroOutro, silentPeriod, immediatePublish} = this.state;
        const { userInfo, history, content_saved, handleContentSaving } = this.props;
        if(!content_saved[this.episodeId]) { // prevent unnecessary rerendering of component
            if(!recordedAudioUrl && !uploadedAudioUrl) {
                alert("Please upload an audio file before saving!");
                return;
            }

            if(!title) {
                alert("Please enter a title for the episode before saving!");
                return;
            }

            if ((recordedAudioUrl || uploadedAudioUrl) && userInfo.soundcasts_managed[this.currentSoundcastId]) { // check if soundcast in soundcasts_managed

              this.firebaseListener = firebase.auth().onAuthStateChanged(function(user) {
                    if (user && that.firebaseListener) {
                        const creatorID = user.uid;
                        const newEpisode = {
                            title,
                            description: description.length > 0 ? description : null,
                            actionstep: actions.length > 0 ? actions : null,
                            date_created: moment().format('X'),
                            creatorID,
                            publisherID: userInfo.publisherID,
                            url: recordedAudioUrl || uploadedAudioUrl,
                            duration: audioDuration > 0 ? audioDuration : currentRecordingDuration / 1000,  // duration is in seconds
                            notes: notesUrl,
                            publicEpisode,
                            soundcastID: that.currentSoundcastId,
                            isPublished: isPublished && immediatePublish ? true : false,
                            coverArtUrl: coverArtUrl,
                        };

                        firebase.database().ref(`soundcasts/${that.currentSoundcastId}`)
                        .once('value')
                        .then(snapshot => {
                            // console.log('this.currentSoundcastId: ', that.currentSoundcastId);
                            let index;
                            if(snapshot.val().episodes) {
                                index = Object.keys(snapshot.val().episodes).length + 1;
                            } else {
                                index = 1;
                            }
                            newEpisode.index = index;
                            firebase.database().ref(`episodes/${that.episodeId}`).set(newEpisode).then(
                                res => {
                                    // console.log('success add episode: ', res);
                                },
                                err => {
                                    console.log('ERROR add episode: ', err);
                                }
                            );

                            firebase.database().ref(`soundcasts/${that.currentSoundcastId}/last_update`).set(newEpisode.date_created);

                            firebase.database().ref(`soundcasts/${that.currentSoundcastId}/episodes/${that.episodeId}`).set(true).then(
                                res => {
                                },
                                err => {
                                    console.log('ERROR add episodeID to soundcast: ', err);
                                }
                            );

                            Axios.post('/api/episode', {
                                episodeId: that.episodeId,
                                soundcastId: that.currentSoundcastId,
                                publisherId: userInfo.publisherID,
                                title,
                                soundcastTitle: userInfo.soundcasts_managed[that.currentSoundcastId].title,
                            }).then(
                                res => {
                                    if(audioNormalization || trimSilence || reduceSilence || addIntroOutro) { // if audio processing is requested
                                        Axios.post('/api/audio_processing', {
                                          epsiodeId: that.episodeId,
                                          soundcastId: that.currentSoundcastId,
                                          publisherEmail: userInfo.publisher.email,
                                          publisherFirstName: userInfo.firstName,
                                          publisherName: userInfo.publisher.name,
                                          publisherImageUrl: userInfo.publisher.imageUrl,
                                          tagging: true,
                                          intro: (addIntroOutro && userInfo.soundcasts_managed[that.currentSoundcastId].intro) || null,
                                          outro: (addIntroOutro && userInfo.soundcasts_managed[that.currentSoundcastId].outro) || null,
                                          overlayDuration: (addIntroOutro && userInfo.soundcasts_managed[that.currentSoundcastId].introOutroOverlay) || 0,
                                          setVolume: audioNormalization,
                                          trim: trimSilence,
                                          removeSilence: (reduceSilence && Number(silentPeriod)|| false),
                                          autoPublish: immediatePublish,
                                          emailListeners: that.state.sendEmails,
                                        }).then(res => {
                                            that.setState({
                                              startProcessingEpisode: false,
                                              doneProcessingEpisode: true,
                                            });
                                            alert('Episode is submitted and will be published after processing is done.');
                                            handleContentSaving(that.episodeId, true);
                                            history.goBack();
                                        })
                                        .catch(err => {
                                            that.setState({
                                              startProcessingEpisode: false,
                                              doneProcessingEpisode: true,
                                              podcastError: err.toString(),
                                            })
                                            console.log(err);
                                        });
                                    } else { // if audio processing is not requested
                                    if(isPublished) {
                                      that.notifySubscribers();
                                      if(podcastFeedVersion) {
                                          Axios.post('/api/create_feed', {
                                            soundcastId: that.currentSoundcastId,
                                            itunesExplicit,
                                            itunesImage,
                                            itunesCategory,
                                            soundcastTitle: userInfo.soundcasts_managed[that.currentSoundcastId].itunesTitle ||  userInfo.soundcasts_managed[that.currentSoundcastId].title,
                                            soundcastHost: userInfo.soundcasts_managed[that.currentSoundcastId].itunesHost ||  userInfo.soundcasts_managed[that.currentSoundcastId].hostName,
                                            firstName: userInfo.firstName,
                                            email: userInfo.email[0],
                                          })
                                          .then(response => {
                                            that.setState({
                                              startProcessingEpisode: false,
                                              doneProcessingEpisode: true,
                                            });
                                            alert('Episode has been processed and published.');
                                            handleContentSaving(that.episodeId, true);
                                            history.goBack();
                                          })
                                          .catch(err => {
                                            that.setState({
                                              startProcessingEpisode: false,
                                              doneProcessingEpisode: true,
                                              podcastError: err.toString(),
                                            });
                                            console.log(err);
                                          });
                                      } else {
                                          that.setState({
                                              startProcessingEpisode: false,
                                              doneProcessingEpisode: true,
                                          });
                                          alert('Episode is published.');
                                          handleContentSaving(that.episodeId, true);
                                          history.goBack();
                                      }
                                    } else {
                                      alert('Episode saved');
                                      history.goBack();
                                    }
                                    }

                                }
                            ).catch(
                                err => {
                                    console.log('episode failed to save to db', err);
                                    alert('Hmm...there is a problem saving the episode. please try again later.');
                                }
                            );
                        });
                    } else {
                        // alert('Episode saving failed. Please try again later.');
                        // Raven.captureMessage('episode saving failed!')
                    }
              });

              this.firebaseListener && this.firebaseListener();
            }
        }
    }

    componentWillUnmount() {
        const { content_saved, handleContentSaving } = this.props;
        handleContentSaving(this.episodeId, false);
        this.firebaseListener = null;
    }

    notifySubscribers() {
        const that = this;
        firebase.database().ref(`soundcasts/${this.currentSoundcastId}/episodes/${this.episodeId}`)
        .once('value', snapshot => {
            if(snapshot.val()) {
              firebase.database().ref(`soundcasts/${that.currentSoundcastId}`)
              .once('value', snapshot => {
                let registrationTokens = [];
                // get an array of device tokens
                // console.log('snapshot.val(): ', snapshot.val());
                if(snapshot.val().subscribed) {
                    Object.keys(snapshot.val().subscribed).forEach(user => {
                      if(typeof snapshot.val().subscribed[user] == 'object') {
                          registrationTokens.push(snapshot.val().subscribed[user][0]) //basic version: only allow one devise per user
                      }
                    });
                    const payload = {
                      notification: {
                        title: `${snapshot.val().title} just published:`,
                        body: `${this.state.title}`,
                        sound: 'default',
                        badge: '1'
                      }
                    };
                    // console.log('notification sending is triggered from create_episode.js');
                    sendNotifications(registrationTokens, payload); //sent push notificaiton
                }
                const soundcast = {...snapshot.val(), id: that.currentSoundcastId};
                if(that.state.sendEmails) {
                  that.emailListeners(soundcast);
                }
              })
            }
        });
    }

    emailListeners(soundcast) {
        let subscribers = [];
        const that = this;
        const {userInfo} = this.props;
        const subject = `${this.state.title} was just published on ${soundcast.title}`;
        if(soundcast.subscribed) {
            // send notification email to subscribers
            const content = `<p>Hi <span>[%first_name | Default Value%]</span>!</p><p></p><p>${userInfo.publisher.name} just published <strong>${this.state.title}</strong> in <a href="${soundcast.landingPage ? 'https://mysoundwise.com/soundcasts/'+soundcast.id : ''}" target="_blank">${soundcast.title}</a>. </p><p></p><p>Go check it out on the Soundwise app!</p>`;
            sendMarketingEmails([soundcast.subscriberEmailList], subject, content, userInfo.publisher.name, userInfo.publisher.imageUrl, userInfo.publisher.email, 4383);
        }

        // send notification email to invitees
        if(soundcast.invited) {
            const content = `<p>Hi there!</p><p></p><p>${userInfo.publisher.name} just published <strong>${this.state.title}</strong> in <a href="${soundcast.landingPage ? 'https://mysoundwise.com/soundcasts/'+soundcast.id : ''}" target="_blank">${soundcast.title}</a>. </p><p></p><p>To listen to the episode, simply accept your invitation to subscribe to <i>${soundcast.title}</i> on the Soundwise app!</p>`;
            sendMarketingEmails([soundcast.inviteeEmailList], subject, content, userInfo.publisher.name, userInfo.publisher.imageUrl, userInfo.publisher.email, 4383);
        }
    }

    setMediaObject(mediaObject) {
        this.mediaObject = mediaObject;
        mediaObject.on('deviceReady', () => {
            this.recorder.start(); // start recording
            this.setState({
                isRecording: true,
                recordingStartTime: moment()
            });
        });
        mediaObject.on('deviceError', () => { // error handling
            console.log('device error:', mediaObject.deviceErrorCode);
        });
        mediaObject.on('error', error => console.log('error:', error));
        // user clicked the record button and started recording
        mediaObject.on('startRecord', () => {});
        mediaObject.on('ended', () => this.setState({isPlaying: false}));
        // user completed recording and stream is available
        mediaObject.on('finishRecord', () => {
            // the blob object contains the recorded data that
            // can be downloaded by the user, stored on server etc.
            // console.log('finished recording: ', mediaObject.recordedData);
            this.recorder.stopDevice();
            this.player.src({
                type: 'video/mp4',
                src: URL.createObjectURL(this.mediaObject.recordedData)
            });
            this.setState({
                blob: { blob: mediaObject.recordedData }, // blobObject,
                isRecorded: true,
                isLoading: false,
                isRecording: false,
            });
        });
        this.player = this.mediaObject.player();
        this.wavesurfer = this.mediaObject.wavesurfer();
    }

    handleMicrophone(e) {
        console.log('handleMicrophone called');
       this.state.isRecording ? this.stop(e) : this.record(e);
    }

    renderRecorder() {
        const that = this;
        const { isRecording, isRecorded, isPlaying, isLoading, audioUploaded, notesUploaded, recordedAudioUrl, notesUrl, isSaved, audioUploading, currentRecordingDuration, currentPlayingDuration } = this.state;
        if(isSaved && !audioUploading) {
            return (
                <div style={{textAlign: 'center'}}>
                    <div className='title-small'>
                        Audio file saved!
                    </div>
                </div>
            )
        } else if(isSaved && audioUploading) {
            return (
                <div style={{textAlign: 'center', marginTop: 25}}>
                    <div className='title-small' style={{marginBottom: 5,}}>
                        {`Saving audio file`}
                    </div>
                    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                        <Dots style={{}} color={Colors.mainOrange} size={22} speed={1}/>
                    </div>
                </div>
            )
        } else {
            return (
                <div>
                    <div style={styles.recordButton} onClick={e => that.handleMicrophone(e)}>
                        <span className="fa-layers  fa-4x">
                          <FontAwesomeIcon icon={faCircle} color={Colors.mainOrange}/>
                          <FontAwesomeIcon icon={isRecording ? faStop : faMicrophone} color='white' inverse transform="shrink-8"/>
                        </span>
                    </div>
                    <div style={styles.micWrapper}>
                      <AudiojsRecordPlayer setMediaObject={this.setMediaObject.bind(this)} />
                    </div>
                    <div style={styles.time}>
                        <span>{!isPlaying && currentRecordingDuration && moment.utc(currentRecordingDuration).format('HH:mm:ss') || moment.utc(currentPlayingDuration).format('HH:mm:ss') || moment.utc(0).format('HH:mm:ss')}</span>
                    </div>
                    {this.renderPlayAndSave()}
                </div>
            )
        }
    }

    renderPlayAndSave() {
        const that = this;
        const { isRecording, isRecorded, isPlaying, isLoading, audioUploaded, notesUploaded, recordedAudioUrl, notesUrl } = this.state;
        if(!isRecorded) {
            return (
                <div></div>
            )
        } else {
            return (
                <div>
                    {
                        !isPlaying
                        &&
                        <div style={styles.playButtonWrapper} onClick={this.play.bind(this)}>
                            {
                                !isLoading
                                &&
                                <FontAwesomeIcon icon={faPlayCircle} color={Colors.mainOrange} size="4x"/>
                                ||
                                <Loader loaded={!isLoading} options={loaderOptions}></Loader>
                            }
                        </div>
                        ||
                        <div key='stopPlaying' style={styles.playButtonWrapper} onClick={this.pause.bind(this)}>
                            <FontAwesomeIcon icon={faStopCircle} color={isRecorded && Colors.mainOrange || Colors.fontGrey} size="4x"/>
                        </div>
                    }
                    <div style={styles.saveText} onClick={this.save.bind(this)}>Save</div>
                    <div style={styles.trashWrapper}
                        onClick={() => {
                            that.setState({isRecorded: false, currentPlayingDuration: 0, currentRecordingDuration: 0,
                                playingStartTime: null,
                                recordingStartTime: null,
                                isPlaying: false,});
                            clearInterval(that.recordingInterval);
                            clearInterval(that.playingInterval);
                            that.player.pause();
                            that.player.currentTime(0);
                            return;
                        }}>
                        Discard
                    </div>
                </div>
            )
        }

    }

    changeSoundcastId (value, userObj) {
        const that = this;
        const userInfo = userObj ? userObj : this.props.userInfo;
        this.currentSoundcastId = value;
        this.setState({
            currentsoundcast: userInfo.soundcasts_managed[value],
        })
        firebase.database().ref(`soundcasts/${this.currentSoundcastId}`)
        .once('value')
        .then(snapshot => {
            if(snapshot.val()) {
                that.setState({
                    publicEpisode: snapshot.val().landingPage ? true : false
                })
            }
        })
    }

    changeSharingSetting() {
        const {publicEpisode} = this.state;
        this.setState({
            publicEpisode: !publicEpisode
        })
    }

    preProcess(file, next) {
        this.setAudioDuration(file);
        this.clearInputFile(this.uploadAudioInput);
        this.setState({
            audioName: file.name,
            audioUploading: true,
        })
        next(file);
    }

    onProgress(percent, message) {
        this.setState({
            audioUploadProgress: percent,
        });
    }

    onFinish(signResult) {
        const awsUrl = signResult.signedUrl.split('?')[0];
        const aux = awsUrl.split('.');
        const ext = aux[aux.length - 1];
        this.setState({
            audioUploading: false,
            audioUploaded: true,
            audioUploadProgress: 0,
            uploadedAudioUrl: `https://mysoundwise.com/tracks/${this.episodeId}.${ext}`
        });
    }

    clearInputFile(f){
        if(f.value){
            try{
                f.value = ''; //for IE11, latest Chrome/Firefox/Opera...
            }catch(err){ }
            if(f.value){ //for IE5 ~ IE10
                var form = document.createElement('form'),
                    parentNode = f.parentNode, ref = f.nextSibling;
                form.appendChild(f);
                form.reset();
                parentNode.insertBefore(f,ref);
            }
        }
    }

    onError(message) {
        console.log(`upload error: ` + message);
        this.setState({
            audioUploadError: message,
        })
    }

    notesPreProcess(file, next) {
        this.clearInputFile(this.uploadNotesInput);
        this.setState({
            notesName: file.name,
            notesUploading: true,
        })
        next(file);
    }

    notesOnProgress(percent, message) {
        this.setState({
            notesUploadProgress: percent,
        });
    }

    notesOnFinish(signResult) {
        this.setState({
            notesUploading: false,
            notesUploaded: true,
            notesUploadProgress: 0,
            notesUrl: signResult.signedUrl.split('?')[0],
        });
    }

    notesOnError(message) {
        console.log(`upload error: ` + message);
        this.setState({
            notesUploadError: message,
        })
    }

    render() {
        const { isRecording, isRecorded, isPlaying, isLoading, audioUploaded, notesUploaded, recordedAudioUrl, uploadedAudioUrl, audioName, notesName, notesUrl, audioUploading, notesUploading, audioUploadProgress, notesUploadProgress, wrongFileTypeFor, audioUploadError, notesUploadError, startProcessingEpisode, doneProcessingEpisode, podcastError } = this.state;
        const { userInfo } = this.props;
        const that = this;
        const _soundcasts_managed = [];
        for (let id in userInfo.soundcasts_managed) {
            const _soundcast = JSON.parse(JSON.stringify(userInfo.soundcasts_managed[id]));
            if (_soundcast.title) {
                _soundcast.id = id;
                _soundcasts_managed.push(_soundcast);
            }
        }
        this.currentSoundcastId = this.currentSoundcastId || _soundcasts_managed.length && _soundcasts_managed[0].id || null;

        return (
            <div className='padding-30px-tb'>
                <div className='padding-bottom-20px'>
                    <span className='title-medium '>
                        Add New Episode
                    </span>
                </div>
                <div className='col-md-10 col-sm-12' style={styles.soundcastSelectWrapper}>
                    <div style={{...styles.notesLabel, marginLeft: 10,}}>Publish in</div>
                    <select
                      value = {this.currentSoundcastId || ''}
                      style={styles.soundcastSelect}
                      onChange={(e) => {this.changeSoundcastId(e.target.value);}}>
                        {
                            _soundcasts_managed.map((soundcast, i) => {
                                return (
                                    <option value={soundcast.id} key={i}>{soundcast.title}</option>
                                );
                            })
                        }
                    </select>
                </div>
                <div className="row">
                    <div className="col-lg-7 col-md-7 col-sm-12 col-xs-12 ">
                        <div style={styles.audioRecorder}>
                            <div style={styles.recordTitleText}>Record</div>
                            {this.renderRecorder()}
                        </div>
                    </div>
                    <div className="col-lg-1 col-md-1 col-sm-12 col-xs-12 text-extra-large  text-center padding-nine-top">
                        OR
                    </div>
                    <div className="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                        <div style={styles.audioRecorder}>
                            <div style={{...styles.recordTitleText, paddingBottom: 0,}}>Upload</div>
                            <div style={{...styles.inputFileWrapper, width: '100%'}}>
                                <input
                                    type="file"
                                    name="upload"
                                    id="upload_hidden_audio"
                                    onChange={this.setFileName.bind(this, 'audio')}
                                    style={styles.inputFileHidden}
                                />
                                <div style = {{display: 'none'}}>
                                    <ReactS3Uploader
                                        signingUrl="/s3/sign"
                                        signingUrlMethod="GET"
                                        accept='.mp3,.m4a'
                                        preprocess={this.preProcess.bind(this)}
                                        onProgress={this.onProgress.bind(this)}
                                        onError={this.onError.bind(this)}
                                        onFinish={this.onFinish.bind(this)}
                                        uploadRequestHeaders={{ 'x-amz-acl': 'public-read', }}
                                        contentDisposition="auto"
                                        scrubFilename={(filename) => {
                                            const original = filename.split('.');
                                            const newName = that.episodeId;
                                            return filename.replace(filename.slice(0), `${newName}.${original[original.length -1]}`);
                                        }}
                                        inputRef={cmp => this.uploadAudioInput = cmp}
                                        autoUpload={true}
                                        />
                                </div>
                                {
                                  audioUploading && !isRecorded &&
                                  <div style={{
                                      textAlign: 'center',
                                      marginTop: 25,
                                    }}>
                                    {
                                        audioUploadError &&
                                        <div>
                                          <span style={{color: 'red'}}>{audioUploadError}</span>
                                        </div>
                                        ||
                                        <div>
                                          <div style={{textAlign: 'center', display:'none'}}>
                                            <div className='title-small' style={{marginBottom: 5,}}>
                                                {`Uploading audio file`}
                                            </div>
                                            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                                                <Dots style={{}} color="#727981" size={22} speed={1}/>
                                            </div>
                                          </div>
                                            <div style={{display: ''}}>
                                                <MuiThemeProvider>
                                                  <LinearProgress
                                                    mode="determinate"
                                                    value={audioUploadProgress}
                                                    color={Colors.mainOrange}/>
                                                </MuiThemeProvider>
                                                <div className='text-medium' style={{textAlign: 'center'}}>
                                                    <span>{`uploading ${audioUploadProgress} %`}</span>
                                                </div>
                                            </div>
                                        </div>
                                    }
                                  </div>
                                  ||
                                  uploadedAudioUrl && !isRecorded &&
                                  <div style={{textAlign: 'center',}}>
                                    <div className='text-medium'>
                                        {`${audioName} saved`}
                                    </div>
                                    <div style={styles.cancelImg}
                                      onClick={() => this.setState({audioUploaded: false, uploadedAudioUrl: ''})}>Cancel</div>
                                  </div>
                                  ||
                                  !uploadedAudioUrl &&
                                  <div style={{textAlign: 'center',}}>
                                    <div>
                                        <button
                                            onClick={() => {
                                                // document.getElementById('upload_hidden_audio').click();
                                                this.uploadAudioInput.click();
                                            }}
                                            style={{...styles.uploadButton, backgroundColor:  Colors.mainOrange}}
                                        >
                                            <span style={{paddingLeft: 5, paddingRight: 5}}>Upload Audio File</span>
                                        </button>
                                    </div>
                                    <div>
                                        <div style={styles.fileTypesLabel}>ONLY .mp3 and .m4a files accepted</div>
                                        {wrongFileTypeFor == 'audio' && <div style={{...styles.fileTypesLabel, color: 'red'}}>Wrong file type. Please try again.</div>}
                                    </div>
                                  </div>
                                }

                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-9 col-md-9 col-sm-12 col-xs-12">
                        <ValidatedInput
                            type="text"
                            styles={styles.inputTitle}
                            wrapperStyles={styles.inputTitleWrapper}
                            placeholder={'Title*'}
                            onChange={(e) => {this.setState({title: e.target.value})}}
                            value={this.state.title}
                            validators={[minLengthValidator.bind(null, 1), maxLengthValidator.bind(null, 80)]}
                        />
                        <textarea
                            style={styles.inputDescription}
                            placeholder={'Description'}
                            onChange={(e) => {this.setState({description: e.target.value})}}
                            value={this.state.description}
                        >
                        </textarea>
                        <textarea
                            style={styles.inputDescription}
                            placeholder={'Action step'}
                            onChange={(e) => {this.setState({actions: e.target.value})}}
                            value={this.state.actions}
                        >
                        </textarea>
                        <div style={styles.notes}>
                            <div style={{...styles.recordTitleText, fontWeight: 800}}>Notes</div>
                            <div style={{...styles.inputFileWrapper, marginTop: 0}}>
                                <input
                                    type="file"
                                    name="upload"
                                    id="upload_hidden_notes"
                                    onChange={this.setFileName.bind(this, 'notes')}
                                    style={styles.inputFileHidden}
                                />
                                <div style = {{display: 'none'}}>
                                    <ReactS3Uploader
                                        signingUrl="/s3/sign"
                                        signingUrlMethod="GET"
                                        accept='image/*,.pdf'
                                        preprocess={this.notesPreProcess.bind(this)}
                                        onProgress={this.notesOnProgress.bind(this)}
                                        onError={this.notesOnError.bind(this)}
                                        onFinish={this.notesOnFinish.bind(this)}
                                        uploadRequestHeaders={{ 'x-amz-acl': 'public-read' }}  // this is the default
                                        contentDisposition="auto"
                                        scrubFilename={(filename) => {
                                            const original = filename.split('.');
                                            const newName = `${that.episodeId}-notes`;
                                            return filename.replace(filename.slice(0), `${newName}.${original[original.length -1]}`);
                                        }}
                                        inputRef={cmp => this.uploadNotesInput = cmp}
                                        autoUpload={true}
                                        />
                                </div>
                                {
                                  notesUploading &&
                                  <div style={{textAlign: 'left'}}>
                                    {
                                        notesUploadError &&
                                        <div>
                                          <span style={{color: 'red'}}>{notesUploadError}</span>
                                        </div>
                                        ||
                                        <div style={{marginTop: 15}}>
                                          <div style={{textAlign: 'left', display: 'none'}}>
                                            <div className='title-small' style={{marginBottom: 5,}}>
                                                {`Uploading notes`}
                                            </div>
                                            <div style={{display: 'flex', alignItems: 'center'}}>
                                                <Dots style={{}} color="#727981" size={22} speed={1}/>
                                            </div>
                                          </div>
                                            <div style={{display: ''}}>
                                                <MuiThemeProvider>
                                                  <LinearProgress
                                                    mode="determinate"
                                                    value={notesUploadProgress}
                                                    color={Colors.mainOrange}/>
                                                </MuiThemeProvider>
                                                <div className='text-medium' style={{textAlign: 'center'}}>
                                                    <span>{`uploading ${notesUploadProgress} %`}</span>
                                                </div>
                                            </div>
                                        </div>
                                    }
                                  </div>
                                  ||
                                  notesUrl &&
                                    <div style={{}}>
                                        <div className='text-medium'>
                                            {`${notesName} saved`}
                                        </div>
                                        <div
                                          style={styles.cancelImg}
                                          onClick={() => this.setState({notesUploaded: false, notesUrl: ''})}>
                                          Cancel
                                        </div>
                                    </div>
                                  ||
                                  !notesUrl &&
                                  <div style={{}}>
                                    <div>
                                        <button
                                            onClick={() => {
                                                // document.getElementById('upload_hidden_notes').click();
                                                that.uploadNotesInput.click();
                                            }}
                                            style={{...styles.uploadButton, backgroundColor:  Colors.mainOrange}}
                                        >
                                            <span style={{paddingLeft: 5, paddingRight: 5}}>Upload Notes </span>
                                        </button>
                                    </div>
                                    <div>
                                        <div style={styles.fileTypesLabel}>pdf, jpeg or png files accepted</div>
                                        {wrongFileTypeFor == 'notes' && <div style={{...styles.fileTypesLabel, color: 'red'}}>Wrong file type. Please try again.</div>}
                                    </div>
                                  </div>
                                }
                            </div>
                        </div>
                        <div style={{marginTop: 40, marginBottom: 25, }}>
                            <div style={{display: 'flex', alignItems: 'center'}}>
                                <Toggle
                                  id='share-status'
                                  aria-labelledby='share-label'
                                  // label="Charge subscribers for this soundcast?"
                                  checked={this.state.publicEpisode}
                                  onChange={this.changeSharingSetting.bind(this)}
                                  // thumbSwitchedStyle={styles.thumbSwitched}
                                  // trackSwitchedStyle={styles.trackSwitched}
                                  // style={{fontSize: 20, width: '50%'}}
                                />
                                <span id='share-label' style={{fontSize: 16, fontWeight: 800, marginLeft: '0.5em'}}>Make this episode publicly shareable</span>
                            </div>
                            <div style={{display: 'flex', alignItems: 'center', marginTop: 15,}}>
                                <Toggle
                                  id='share-status'
                                  aria-labelledby='share-label'
                                  // label="Charge subscribers for this soundcast?"
                                  checked={this.state.sendEmails}
                                  onChange={() => {
                                    const sendEmails = !that.state.sendEmails;
                                    that.setState({sendEmails})
                                  }}
                                />
                                <span id='share-label' style={{fontSize: 16, fontWeight: 800, marginLeft: '0.5em'}}>Send email notification to subscribers and invitees after publishing</span>
                            </div>
                        </div>
                        {
                            this.state.publicEpisode &&
                            <div style={{marginBottom: 25,}}>
                                <span style={{fontSize: 16, fontWeight: 800,}}>Episode link for sharing: </span><span ><a style={{color: Colors.mainOrange, fontSize: 18,}}>{`https://mysoundwise.com/episodes/${this.episodeId}`}</a></span>
                            </div>
                            || null
                        }
                        {
                            this.state.publicEpisode &&
                            <div style={{ marginBottom: 10, minHeight: 133}}>
                                <div>
                                    <span style={{...styles.recordTitleText, fontWeight: 800,}}>
                                        Episode cover art (for social sharing)
                                    </span>
                                </div>
                                {
                                    this.state.coverArtUrl &&
                                    <div style={{...styles.image, marginRight: 10, marginTop: 10,}}>
                                      <img style={styles.image}  src={this.state.coverArtUrl} />
                                    </div>
                                    || null
                                }
                                <div style={styles.loaderWrapper}>
                                    <div style={{...styles.inputFileWrapper, marginTop: 0, display: 'block', float: 'none'}}>
                                        <input
                                            type="file"
                                            name="upload"
                                            id="upload_hidden_cover3"
                                            accept="image/*"
                                            onChange={this.setFileName.bind(this, 'coverart')}
                                            style={styles.inputFileHidden}
                                            ref={input => this.uploadCoverArtInput = input}
                                        />
                                        {
                                          this.state.coverArtUploaded &&
                                          <div>
                                            <span>{this.uploadCoverArtInput.files[0].name}</span>
                                            <span style={styles.cancelImg}
                                              onClick={() => {
                                                that.setState({coverArtUploaded: false, coverArtUrl: ''});
                                                document.getElementById('upload_hidden_cover3').value = null;
                                              }}>Cancel</span>
                                          </div>
                                          ||
                                          !this.state.coverArtUploaded &&
                                          <div>
                                            <button
                                                onClick={() => {document.getElementById('upload_hidden_cover3').click();}}
                                                style={{...styles.uploadButton, backgroundColor:  Colors.link}}
                                            >
                                                Upload Cover Art
                                            </button>
                                            <span style={styles.fileTypesLabel}>jpeg or png files accepted</span>
                                          </div>
                                        }
                                    </div>
                                </div>
                            </div>
                            || null
                        }
                        <div style={{marginTop: 50, display: ''}}>
                          <hr style={{border: '0.5px solid lightgray'}}/>
                          <span style={{...styles.recordTitleText,fontSize: 18, fontWeight: 800,}}>Audio Processing Options</span>
                          <div style={{marginTop: 15, display: 'none'}}>
                            <label className='text-dark-gray' style={{fontSize: 16, display: 'flex', alignItems: 'center'}}>
                              <input style={{height: 30, width: 30}} type="checkbox" value={this.state.immediatePublish} checked onChange={() => that.setState({
                                  immediatePublish: that.state.immediatePublish
                              })}/>Automatically publish the episode after processing is done
                            </label>
                          </div>
                          <div style={{marginTop: 20, marginBottom: 25, }}>
                            <div style={{display: 'flex', alignItems: 'center'}}>
                                <Toggle
                                  className='toggle-green'
                                  id='audio-edit-1'
                                  aria-labelledby='audio-edit-1-label'
                                  // label="Charge subscribers for this soundcast?"
                                  checked={this.state.audioNormalization}
                                  onChange={() => {
                                    const audioNormalization = !that.state.audioNormalization;
                                    that.setState({audioNormalization})
                                  }}
                                />
                                <span id='audio-edit-1-label' style={{fontSize: 16, fontWeight: 800, marginLeft: '0.5em'}}>Optimize volume</span><span>(This is to make sure different parts of your audio have consistent volume, and adjust the volume to the most suitable level for mobile and web playing )</span>
                            </div>
                            <div style={{display: 'flex', alignItems: 'center', marginTop: 15}}>
                                <Toggle
                                  className='toggle-green'
                                  id='audio-edit-2'
                                  aria-labelledby='audio-edit-2-label'
                                  checked={this.state.trimSilence}
                                  onChange={() => {
                                    const trimSilence = !that.state.trimSilence;
                                    that.setState({trimSilence})
                                  }}
                                />
                                <span id='audio-edit-2-label' style={{fontSize: 16, fontWeight: 800, marginLeft: '0.5em'}}>Trim silience at the beginning</span>
                            </div>
                            <div style={{display: 'flex', alignItems: 'center', marginTop: 15}}>
                                <Toggle
                                  className='toggle-green'
                                  id='audio-edit-3'
                                  aria-labelledby='audio-edit-3-label'
                                  checked={this.state.reduceSilence}
                                  onChange={() => {
                                    const reduceSilence = !that.state.reduceSilence;
                                    that.setState({reduceSilence})
                                  }}
                                />
                                <span id='audio-edit-3-label' style={{fontSize: 16, fontWeight: 800, marginLeft: '0.5em'}}>Remove excessive silence/pauses throughout</span><span>(This option will remove all silent periods in the recording that're longer than specified seconds. It's good for tightening up your recording. But don't use this if you have silent periods in your recording on purpose.)</span>
                            </div>
                            {
                                this.state.reduceSilence &&
                                <div>
                                  <span style={{fontSize: 14, marginRight: 5}}>Remove silent periods longer than </span>
                                  <input style={{width: 70}} type='text'
                                    value={this.state.silentPeriod}
                                    onChange={(e) => {
                                      if(Number(e.target.value) >= 0.1 && Number(e.target.value) <= 10 ) {
                                        that.setState({silentPeriod: Number(e.target.value)});
                                      } else {
                                        alert('Please enter a number >=0.1 and <= 10.');
                                      }
                                    }}
                                  />
                                  <span style={{paddingLeft: 10, fontSize: 14}}>second(s)</span>
                                </div>
                                || null
                            }
                            <div style={{display: 'flex', alignItems: 'center', marginTop: 15}}>
                                <Toggle
                                  className='toggle-green'
                                  id='audio-edit-4'
                                  aria-labelledby='audio-edit-4-label'
                                  // label="Charge subscribers for this soundcast?"
                                  checked={this.state.addIntroOutro}
                                  onChange={() => {
                                    if(((that.state.currentsoundcast.intro || that.state.currentsoundcast.outro) && !that.state.addIntroOutro) || that.state.addIntroOutro) {
                                        const addIntroOutro = !that.state.addIntroOutro;
                                        that.setState({addIntroOutro})
                                    } else {
                                        alert('Please upload intro/outro clip(s) to your soundcast first!');
                                    }
                                  }}
                                />
                                <span id='audio-edit-4-label' style={{fontSize: 16, fontWeight: 800, marginLeft: '0.5em'}}>Attach intro and outro</span><span> (Please upload an intro and/or outro for your soundcast first)</span>
                            </div>
                          </div>
                        </div>
                </div>
                <div className="col-lg-3 col-md-3 col-sm-12 col-xs-12">
                    {
                        startProcessingEpisode &&
                        <div className="col-lg-12 col-md-12 col-sm-6 col-xs-6"
                                style={{textAlign: 'center'}}>
                            <div className='' style={{ fontSize: 17, width: '100%'}}>
                              <span>Please wait...</span>
                            </div>
                            <div className='' style={{marginTop: 10, width: '100%'}}>
                              <Dots style={{}} color="#727981" size={32} speed={1}/>
                            </div>
                        </div>
                        ||
                        <div>
                            <div className="col-lg-12 col-md-12 col-sm-6 col-xs-6"
                                style={{textAlign: 'center'}}>
                                <div className='btn'
                                    style={styles.draftButton}
                                    onClick={this.saveEpisode.bind(this, false)}
                                >
                                    <span>Save draft</span>
                                </div>
                            </div>
                            <div className="col-lg-12 col-md-12 col-sm-6 col-xs-6"
                                style={{textAlign: 'center'}} >
                                <div className='btn btn-default'
                                    style={{...styles.draftButton, ...styles.publishButton}}
                                    onClick={this.saveEpisode.bind(this, true)}
                                >
                                    <span>Publish</span>
                                </div>
                            </div>
                            {
                                podcastError &&
                                <div style={{fontSize: 16, marginTop: 10, color: 'red'}}>
                                 {podcastError}
                                </div>
                                || null
                            }
                        </div>
                    }
                </div>
            </div>
        );
    }
};

_CreateEpisode.propTypes = {
    userInfo: PropTypes.object,
    history: PropTypes.object,
};

const loaderOptions = {
    lines: 13,
    length: 8,
    width: 3,
    radius: 7,
    scale: 1.00,
    corners: 5,
    color: Colors.lightGrey,
    opacity: 0.1,
    rotate: 0,
    direction: 1,
    speed: 1,
    trail: 60,
    fps: 20,
    zIndex: 2e9,
    top: '50%',
    left: '50%',
    shadow: false,
    hwaccel: false,
    position: 'absolute',
};

const styles = {
    titleText: {
        fontSize: 20,
        fontWeight: 600,
    },
    audioRecorder: {
        boxShadow: '0 0 8px rgba(0, 0, 0, 0.5)',
        borderRadius: 8,
        height: 120,
        marginTop: 20,
        paddingTop: 5,
        paddingRight: 10,
        paddingBottom: 5,
        paddingLeft: 10,
    },
    recordTitleText: {
        fontSize: 18,
        // textShadow: '0 1px 3px rgba(0, 0, 0, 0.7)',
        color: Colors.black,
        fontWeight: 800,
        width: '100%',
        paddingTop: 10,
        paddingBottom: 10,
    },
    recordButton: {
        // backgroundColor: Colors.mainOrange,
        // width: 45,
        // height: 45,
        // borderRadius: '50%',
        overflow: 'hidden',
        float: 'left',
        cursor: 'pointer',

    },
    recordIcon: {
        color: Colors.mainWhite,
        fontSize: 20,
        lineHeight: 'inherit'
        // paddingTop: 14,
        // paddingRight: 17,
        // paddingBottom: 11,
        // paddingLeft: 15,
    },
    micWrapper: {
        width: 138,
        height: 30,
        position: 'relative',
        top: 10,
        overflow: 'hidden',
        float: 'left',
        borderRadius: 10,
        marginLeft: 10,
    },
    time: {
        float: 'left',
        marginLeft: 10,
        marginRight: 10,
        marginTop: 15,
        fontSize: 16,
    },
    playButtonWrapper: {
        backgroundColor: 'transparent',
        width: 55,
        height: 55,
        overflow: 'hidden',
        float: 'left',
        marginLeft: 15,
        position: 'relative',
    cursor: 'pointer',
    },
    playIcon: {
        fontSize: 50,
        position: 'relative',
        bottom: 1,
    },
    saveText: {
        color: Colors.link,
        fontWeight: 'bold',
        fontSize: 20,
        float: 'left',
        width: 70,
        position: 'relative',
        top: 15,
        marginLeft: 15,
        marginright: 15,
    cursor: 'pointer',
    },
    trashWrapper: {
        float: 'left',
        width: 15,
        fontSize: 16,
        position: 'relative',
        top: 15,
        marginLeft: 15,
        marginright: 15,
    cursor: 'pointer',

    },
    trashIcon: {
        fontSize: 20,
        color: Colors.mainOrange,
        marginLeft: 10,
    },
    loaderWrapper: {
        // height: 133,
        paddingTop: 20,
        paddingRight: 0,
        paddingBottom: 0,
        paddingLeft: 0,
        // width: 'calc(100% - 133px)',
        // float: 'left',
    },
    image: {
        height: 133,
        // width: 133,
        float: 'left',
        // marginRight: 10,
        backgroundColor: Colors.mainWhite,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: Colors.lightGrey,
    },
    inputFileWrapper: {
        margin: 1,
        // width: 'calc(100% - 20px)',
        height: 80,
        // backgroundColor: Colors.mainWhite,
        overflow: 'hidden',
        marginBottom: 0,
        float: 'left',
    },
    inputFileHidden: {
        position: 'absolute',
        display: 'block',
        overflow: 'hidden',
        width: 0,
        height: 0,
        border: 0,
        padding: 0,
    },
    inputFileVisible: {
        backgroundColor: 'transparent',
        width: 'calc(100% - 70px)',
        height: 35,
        fontSize: 14,
        float: 'left',
    },

    inputTitleWrapper: {
        width: '100%',
        marginTop: 20,
        marginBottom: 10,
    },
    inputTitle: {
        height: 40,
        backgroundColor: Colors.mainWhite,
        width: '100%',
        fontSize: 16,
        borderRadius: 4,
        marginBottom: 10,
    },
    inputDescription: {
        height: 120,
        fontSize: 16,
        borderRadius: 4,
        marginTop: 0,
        marginBottom: 10,
        resize: 'vertical',
        overflow: 'auto',
    },
    inputActions: {
        height: 58,
        fontSize: 16,
        borderRadius: 4,
        marginTop: 0,
        marginBottom: 10
    },
    notes: {
        height: 102,
        // marginLeft: 10,
        // width: '50%',
        // backgroundColor: Colors.mainWhite,
    },
    notesLabel: {
        // marginLeft: 10,
        paddingTop: 12,
        paddingBottom: 6,
        fontSize: 16
    },
    soundcastSelectWrapper: {
        height: 92,
        backgroundColor: Colors.mainWhite,
        marginTop: 15,
    },
    soundcastSelect: {
        backgroundColor: 'transparent',
        width: 'calc(100% - 20px)',
        height: 40,
        marginLeft: 10,
        marginRight: 10,
        marginTop: 5,
        fontSize: 16
    },

    draftButton: {
        backgroundColor: Colors.link,
        color: Colors.fontBlack,
        fontSize: 16,
        width: '160px',
        height: '40px',
        lineHeight: '40px',
        borderRadius: 10,
        marginTop: 30,
        marginRight: 'auto',
        marginBottom: 0,
        marginLeft: 'auto',
        // textAlign: 'center',
        paddingTop: 5,
    cursor: 'pointer',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    publishButton: {
        backgroundColor: Colors.mainOrange,
        color: Colors.mainWhite,
    },
    uploadButton: {
        backgroundColor: Colors.link,
        // width: 80,
        height: 35,
        // float: 'left',
        color: Colors.mainWhite,
        fontSize: 16,
        border: 0,
        marginTop: 5

    },
    cancelImg: {
      color: Colors.link,
      marginLeft: 20,
      fontSize: 15,
      cursor: 'pointer'
    },
    fileTypesLabel: {
        fontSize: 15,
        marginLeft: 0,
        display: 'block',
    },
    checkbox: {
        display: 'inline-block',
        width: '20px',
        height: '20px',
        verticalAlign: 'middle',
        // WebkitAppearance: 'none',
        // appearance: 'none',
        borderRadius: '1px',
        borderColor: 'black',
        borderWidth: 1,
        boxSizing: 'border-box',
        marginLeft: 10,
    },
};

const CreateEpisode = withRouter(_CreateEpisode);
export default CreateEpisode;
