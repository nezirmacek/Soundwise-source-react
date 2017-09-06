/**
 * Created by developer on 01.08.17.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import firebase from 'firebase';
import { ReactMic } from 'react-mic';
import Loader from 'react-loader';
import rp from 'request-promise';
import axios from 'axios';
import moment from 'moment';

import {minLengthValidator, maxLengthValidator} from '../../../helpers/validators';
import ValidatedInput from '../../../components/inputs/validatedInput';
import Colors from '../../../styles/colors';
import {sendNotifications} from '../../../helpers/send_notifications';

export default class CreateEpisode extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isRecording: false,
            isRecorded: false,
            isPlaying: false,
            isLoading: false,
            isSaved: false,

            recordingStartTime: null,
            currentRecordingDuration: 0,
            playingStartTime: null,
            currentPlayingDuration: 0,

            audioUploaded: false,
            notesUploaded: false,

            title: '',
            description: '',
            actions: '',

            audioUrl: '', // linkto uploaded file aws s3
			blob: {}, // to play audio from react-mic
            notesUrl: '', // linkto uploaded file aws s3
        };

        this.audio = null;
        this.notes = null;
		this.player = null;
        this.recordingInterval = null;
        this.playingInterval = null;

        this.currentSoundcastId = null;

        this.renderPlayAndSave = this.renderPlayAndSave.bind(this)
        this.renderRecorder = this.renderRecorder.bind(this)
        this.notifySubscribers = this.notifySubscribers.bind(this);

        // if (props.userInfo.soundcasts_managed && props.userInfo.soundcasts_managed[props.currentSoundcastId]) {
        //     const _titleArray = props.userInfo.soundcasts_managed[props.currentSoundcastId].title.split(' ');
        //     let _transformedTitle = '';
        //     _titleArray.map(word => _transformedTitle += word);
        //     _transformedTitle = _transformedTitle.substr(0, 20);
            this.episodeId = `${moment().format('x')}e`;
        // }
    }

    componentDidMount () {
		this.player.onended = () => this.setState({isPlaying: false});
	}

    record () {
        const that = this;

		this.setState({
			isRecording: true,
            recordingStartTime: moment()
		});

        this.recordingInterval = setInterval(() => {
            const { recordingStartTime } = that.state

            if(!that.state.isRecording && that.state.isRecorded) {
                clearInterval(that.recordingInterval)
            }

            that.setState({
                currentRecordingDuration: moment().diff(recordingStartTime) //recording duration in millliseconds
            })

        }, 1000);
	}

    stop (blobObject) {
        const that = this;
		this.setState({
			blob : blobObject,
			isRecorded: true,
			isLoading: false,
			isRecording: false,
		});

        // clearInterval(recordingInterval);
        // console.log('interval cleared')
    }



    play () {
        const that = this;

		this.player.play();
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
		this.player.pause();
        this.setState({
            isPlaying: false,
            currentPlayingDuration: 0
        });
        this.player.currentTime = 0;
    }

    save () {
        let _self = this;
        console.log('start converting to mp3');
		//upload file to aws s3
		this._uploadToAws(this.state.blob.blob, 'audio');
        this.setState({isSaved: true})
    }

    _uploadToAws (file, type) {
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
        axios.post('http://localhost:3000/api/fileUploads/upload', data)
            .then(function (res) {
                // POST succeeded...
                console.log('success upload to aws s3: ', res);
                _self.setState({[`${type}Url`]: (JSON.parse(res.data))[0].url});
            })
            .catch(function (err) {
                // POST failed...
                console.log('ERROR upload to aws s3: ', err);
            });
    }

    setFileName (type, e) {
        if (e.target.value) {
            this.setState({[`${type}Uploaded`]: true});
            this[type] = [e.target.files[0]];
        }
        document.getElementById(type).value = e.target.value;
    }

    saveEpisode (isPublished) {
        const { title, description, actions, audioUrl, notesUrl, currentRecordingDuration } = this.state;
        const { userInfo } = this.props;

        if (userInfo.soundcasts_managed[this.currentSoundcastId]) { // check ifsoundcast in soundcasts_managed
            const newEpisode = {
                title,
                description,
                actionstep: actions,
                date_created: moment().format('X'),
                creatorID: firebase.auth().currentUser.uid,
                publisherID: userInfo.publisherID,
                url: audioUrl,
                duration: currentRecordingDuration / 1000,  //convert duration to seconds
                notes: notesUrl,
                soundcastID: this.currentSoundcastId,
                isPublished: isPublished,
            };

            firebase.database().ref(`episodes/${this.episodeId}`).set(newEpisode).then(
                res => {
                    console.log('success add episode: ', res);
                },
                err => {
                    console.log('ERROR add episode: ', err);
                }
            );

            firebase.database().ref(`soundcasts/${this.currentSoundcastId}/episodes/${this.episodeId}`).set(true).then(
                res => {
                    console.log('success add episodeID to soundcast: ', res);
                    this.notifySubscribers();
                },
                err => {
                    console.log('ERROR add episodeID to soundcast: ', err);
                }
            );
        }
    }

    notifySubscribers() {
          firebase.database().ref(`soundcasts/${this.currentSoundcastID}`)
          .on('value', snapshot => {
            let registrationTokens = [];
            // get an array of device tokens
            Object.keys(snapshot.val().subscribed).forEach(user => {
              if(typeof snapshot.val().subscribed[user] == 'object') {
                  registrationTokens.push(snapshot.val().subscribed[user][0]) //basic version: only allow one devise per user
              }
            });
            const payload = {
              notification: {
                title: `Just published on ${snapshot.val()[title]}:`,
                body: `${this.state.title}`
              }
            };
            sendNotifications(registrationTokens, payload); //sent push notificaiton
          })
    }

    renderRecorder() {
        const { isRecording, isRecorded, isPlaying, isLoading, audioUploaded, notesUploaded, audioUrl, notesUrl, isSaved, currentRecordingDuration, currentPlayingDuration } = this.state;
        if(isSaved) {
            return (
                <div style={{textAlign: 'center'}}>
                    <div className='title-small'>
                        Audio file saved to
                    </div>
                    <div className='text-small'>
                        {audioUrl}
                    </div>
                </div>
            )
        } else {
            return (
                <div>
                    {
                        !isRecording
                        &&
                        <div style={styles.recordButton}   onClick={(e) => this.record(e)}>
                            <span className="fa-stack fa-2x">
                              <i className="fa fa-circle fa-stack-2x" style={{color: Colors.mainOrange}}></i>
                              <i className="fa fa-microphone fa-stack-1x fa-inverse"></i>
                            </span>
                        </div>
                        ||
                        <div style={styles.recordButton} onClick={(e) => this.stop(e)}>
                            <span className="fa-stack fa-2x">
                              <i className="fa fa-stop-circle fa-2x" style={{color: Colors.mainOrange}}></i>
                            </span>
                        </div>
                    }
                    <div style={styles.micWrapper}>
                        <ReactMic
                            record={isRecording}
                            className="sound-wave"
                            onStart={this.record.bind(this)}
                            onStop={this.stop.bind(this)}
                            strokeColor={Colors.mainWhite}
                            backgroundColor={Colors.lightGrey}
                            audioBitsPerSecond={192000}
                        />
                    </div>
                    <div style={styles.time}>
                        <span>{isRecording && moment.utc(currentRecordingDuration).format('HH:mm:ss') || moment.utc(currentPlayingDuration).format('HH:mm:ss')}</span>
                    </div>
                    {this.renderPlayAndSave()}
                    <div style={{width: 0, height: 0, overflow: 'hidden'}}>
                        <audio ref={player => this.player = player} controls="controls" src={this.state.blob.blobURL}></audio>
                    </div>
                </div>
            )
        }
    }

    renderPlayAndSave() {
        const { isRecording, isRecorded, isPlaying, isLoading, audioUploaded, notesUploaded, audioUrl, notesUrl } = this.state;
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
                                <i
                                    className="fa fa-play-circle-o"
                                    style={{
                                        ...styles.playIcon,
                                        color: isRecorded && Colors.mainOrange || Colors.fontGrey
                                    }}
                                ></i>
                                ||
                                <Loader loaded={!isLoading} options={loaderOptions}></Loader>
                            }
                        </div>
                        ||
                        <div style={styles.playButtonWrapper} onClick={this.pause.bind(this)}>
                            <i
                                className="fa fa-stop-circle-o"
                                style={{
                                    ...styles.playIcon,
                                    color: isRecorded && Colors.mainOrange || Colors.fontGrey
                                }}
                            ></i>
                        </div>
                    }
                    <div style={styles.saveText} onClick={this.save.bind(this)}>Save</div>
                    <div style={styles.trashWrapper} onClick={() => {this.setState({isRecorded: false, currentPlayingDuration: 0, currentRecordingDuration: 0, playingStartTime: null, recordingStartTime: null})}}>
                        Discard
                    </div>
                </div>
            )
        }

    }

    changeSoundcastId (e) {
        this.currentSoundcastId = e.target.value;
    }

    render() {
        const { isRecording, isRecorded, isPlaying, isLoading, audioUploaded, notesUploaded, audioUrl, notesUrl } = this.state;
        const { userInfo } = this.props;
        console.log('>>>>>>>>>>', isRecorded);

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
                <div className="row">
                    <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 ">
                        <div style={styles.recorder}>
                            <div style={styles.recordTitleText}>Record</div>
                            {this.renderRecorder()}
                        </div>
                    </div>
                    <div className="col-lg-1 col-md-1 col-sm-12 col-xs-12 text-extra-large  text-center padding-nine-top">
                        OR
                    </div>
                    <div className="col-lg-5 col-md-5 col-sm-12 col-xs-12">
                        <div style={styles.recorder}>
                            <div style={styles.recordTitleText}>Upload</div>
                            <div style={styles.inputFileWrapper}>
                                <input
                                    type="file"
                                    name="upload"
                                    id="upload_hidden_audio"
                                    onChange={this.setFileName.bind(this, 'audio')}
                                    style={styles.inputFileHidden}
                                />
                                <input
                                    type="text"
                                    readOnly="1"
                                    id="audio"
                                    style={styles.inputFileVisible}
                                    placeholder={'No Audio File Selected'}
                                    onClick={() => {document.getElementById('upload_hidden_audio').click();}}
                                />
                                {
                                    !audioUrl
                                    &&
                                    <button
                                        onClick={() => {audioUploaded && this._uploadToAws(document.getElementById('upload_hidden_audio').files[0], 'audio');}}
                                        style={{...styles.uploadButton, backgroundColor: audioUploaded && Colors.mainOrange || Colors.lightGrey}}
                                    >
                                        Upload
                                    </button>
                                    ||
                                    null
                                }

                            </div>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-lg-9 col-md-9 col-sm-12 col-xs-12">
                        <ValidatedInput
                            type="text"
                            styles={styles.inputTitle}
                            wrapperStyles={styles.inputTitleWrapper}
                            placeholder={'Title*'}
                            onChange={(e) => {this.setState({title: e.target.value})}}
                            value={this.state.title}
                            validators={[minLengthValidator.bind(null, 1), maxLengthValidator.bind(null, 40)]}
                        />
                        <textarea
                            style={styles.inputDescription}
                            placeholder={'Description'}
                            onChange={(e) => {this.setState({description: e.target.value})}}
                            value={this.state.description}
                        >
                        </textarea>
                        <textarea
                            style={styles.inputActions}
                            placeholder={'Action step'}
                            onChange={(e) => {this.setState({actions: e.target.value})}}
                            value={this.state.actions}
                        >
                        </textarea>
                        <div style={styles.notes}>
                            <div style={styles.notesLabel}>Notes</div>
                            <div style={{...styles.inputFileWrapper, marginTop: 0}}>
                                <input
                                    type="file"
                                    name="upload"
                                    id="upload_hidden_notes"
                                    onChange={this.setFileName.bind(this, 'notes')}
                                    style={styles.inputFileHidden}
                                />
                                <input
                                    type="text"
                                    readOnly="1"
                                    id="notes"
                                    style={styles.inputFileVisible}
                                    placeholder={'No File Selected'}
                                    onClick={() => {document.getElementById('upload_hidden_notes').click();}}
                                />
                                {
                                    !notesUrl
                                    &&
                                    <button
                                        onClick={() => {notesUploaded && this._uploadToAws(document.getElementById('upload_hidden_notes').files[0], 'notes');}}
                                        style={{...styles.uploadButton, backgroundColor: notesUploaded && Colors.mainOrange || Colors.lightGrey}}
                                    >
                                        Upload
                                    </button>
                                    ||
                                    null
                                }
                            </div>
                            <span style={styles.fileTypesLabel}>.pdf, .jpg or .png files accepted</span>
                        </div>
                        <div style={styles.soundcastSelectWrapper}>
                            <div style={styles.notesLabel}>Publish in</div>
                            <select style={styles.soundcastSelect} onChange={(e) => {this.changeSoundcastId(e);}}>
                                {
                                    _soundcasts_managed.map((souncast, i) => {
                                        return (
                                            <option value={souncast.id} key={i}>{souncast.title}</option>
                                        );
                                    })
                                }
                            </select>
                        </div>
                    </div>
                    <div className="col-lg-3 col-md-3 col-sm-12 col-xs-12">
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
                    </div>
                </div>
            </div>
        );
    }
};

CreateEpisode.propTypes = {
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
        fontSize: 16,
    },
    recorder: {
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
        width: '100%',
        paddingTop: 10,
        paddingBottom: 10
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
        width: 45,
        height: 45,
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
        top: 10,
        marginLeft: 15,
        marginright: 15,
		cursor: 'pointer',
    },
    trashWrapper: {
        float: 'left',
        width: 15,
        fontSize: 16,
        position: 'relative',
        top: 9,
        marginLeft: 15,
        marginright: 15,
		cursor: 'pointer',

    },
    trashIcon: {
        fontSize: 20,
        color: Colors.mainOrange,
        marginLeft: 10,
    },

    inputFileWrapper: {
        margin: 10,
        width: 'calc(100% - 20px)',
        height: 35,
        backgroundColor: Colors.mainWhite,
        overflow: 'hidden',
        marginBottom: 0,
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
    uploadButton: {
        backgroundColor: Colors.mainOrange,
        width: 70,
        height: 40,
        float: 'left',
        color: Colors.mainWhite,
        fontSize: 14,
        border: 0,
		cursor: 'pointer',
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
        marginBottom: 10
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
        backgroundColor: Colors.mainWhite,
    },
    notesLabel: {
        marginLeft: 10,
        paddingTop: 12,
        paddingBottom: 6,
        fontSize: 16
    },
    fileTypesLabel: {
        fontSize: 11,
        marginLeft: 10,
        marginTop: 10
    },
    soundcastSelectWrapper: {
        height: 92,
        backgroundColor: Colors.mainWhite,
        marginTop: 15,
    },
    soundcastSelect: {
        backgroundColor: 'transparent',
        width: 'calc(100% - 20px)',
        height: 35,
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
        textAlign: 'center',
        paddingTop: 5,
		cursor: 'pointer',
    },
    publishButton: {
        backgroundColor: Colors.mainOrange,
        color: Colors.mainWhite,
    },
};
