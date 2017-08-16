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

export default class CreateEpisode extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isRecording: false,
            isRecorded: false,
            isPlaying: false,
            isLoading: false,

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
    
        this.currentSoundcastId = null;
        
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
		this.setState({
			isRecording: true,
		});
	}

    stop (blobObject) {
		this.setState({
			blob : blobObject,
			isRecorded: true,
			isLoading: false,
			isRecording: false,
		});
    }

    play () {
		this.player.play();
        if (this.state.isRecorded) {
            this.setState({isPlaying: true});
        }
    }

    pause () {
		this.player.pause();
        this.setState({isPlaying: false});
    }

    save () {
        let _self = this;
        console.log('start converting to mp3');
		//upload file to aws s3
		this._uploadToAws(this.state.blob.blob, 'audio');
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
        const { title, description, actions, audioUrl, notesUrl } = this.state;
        const { userInfo } = this.props;
        
        if (userInfo.soundcasts_managed[this.currentSoundcastId]) { // check ifsoundcast in soundcasts_managed
            const newEpisode = {
                title,
                description,
                actionstep: actions,
                date_created: moment().format('X'),
                creatorID: firebase.auth().currentUser.uid,
                url: audioUrl,
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
                },
                err => {
                    console.log('ERROR add episodeID to soundcast: ', err);
                }
            );
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
            <div>
                <span style={styles.titleText}>
                    Add New Episode
                </span>
                <div className="row">
                    <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12">
                        <div style={styles.recorder}>
                            <div style={styles.recordTitleText}>Record</div>
							{
								!isRecording
								&&
								<div style={styles.recordButton} onClick={(e) => this.record(e)}>
									<i
										className={'fa fa-microphone'}
										style={styles.recordIcon}
									></i>
								</div>
								||
								<div style={styles.recordButton} onClick={(e) => this.stop(e)}>
									<i
										className={`fa fa-stop`}
										style={styles.recordIcon}
									></i>
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
                                        className="fa fa-pause-circle-o"
                                        style={{
                                            ...styles.playIcon,
                                            color: isRecorded && Colors.mainOrange || Colors.fontGrey
                                        }}
                                    ></i>
                                </div>
                            }
                            <div style={styles.saveText} onClick={this.save.bind(this)}>Save</div>
                            <div style={styles.trashWrapper} onClick={() => {this.setState({isRecorded: false})}}>
                                <i
                                    className="fa fa-trash"
                                    style={{...styles.trashIcon, color: isRecorded && Colors.mainOrange || Colors.fontGrey}}
                                ></i>
                            </div>
							<div style={{width: 0, height: 0, overflow: 'hidden'}}>
								<audio ref={player => this.player = player} controls="controls" src={this.state.blob.blobURL}></audio>
							</div>
                        </div>
                    </div>
                    <div className="col-lg-1 col-md-1 col-sm-12 col-xs-12">
                        OR
                    </div>
                    <div className="col-lg-5 col-md-5 col-sm-12 col-xs-12">
                        <div style={styles.recorder}>
                            <span>Upload</span>
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
                            <span style={styles.notesLabel}>Notes</span>
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
                        <div style={styles.souncastSelectWrapper}>
                            <span style={styles.notesLabel}>Publish in</span>
                            <select style={styles.souncastSelect} onChange={(e) => {this.changeSoundcastId(e);}}>
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
                        <div className="col-lg-12 col-md-12 col-sm-6 col-xs-6">
                            <div
                                style={styles.draftButton}
                                onClick={this.saveEpisode.bind(this, false)}
                            >
                                Save draft
                            </div>
                        </div>
                        <div className="col-lg-12 col-md-12 col-sm-6 col-xs-6">
                            <div
                                style={{...styles.draftButton, ...styles.publishButton}}
                                onClick={this.saveEpisode.bind(this, true)}
                            >
                                Publish
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
        fontSize: 12,
    },
    recorder: {
        boxShadow: '0 0 8px rgba(0, 0, 0, 0.5)',
        borderRadius: 8,
        height: 79,
        marginTop: 20,
        paddingTop: 5,
        paddingRight: 10,
        paddingBottom: 5,
        paddingLeft: 10,
    },
    recordTitleText: {
        fontSize: 12,
        textShadow: '0 1px 3px rgba(0, 0, 0, 0.7)',
        color: Colors.black,
        width: '100%',
    },
    recordButton: {
        backgroundColor: Colors.mainRed,
        width: 36,
        height: 36,
        borderRadius: 18,
        overflow: 'hidden',
        float: 'left',
        cursor: 'pointer',
    },
    recordIcon: {
        color: Colors.mainWhite,
        fontSize: 14,
        paddingTop: 11,
        paddingRight: 13,
        paddingBottom: 11,
        paddingLeft: 13,
    },
    micWrapper: {
        width: 138,
        height: 20,
        position: 'relative',
        top: 8,
        overflow: 'hidden',
        float: 'left',
        borderRadius: 10,
        marginLeft: 15,
    },
    playButtonWrapper: {
        backgroundColor: 'transparent',
        width: 36,
        height: 36,
        overflow: 'hidden',
        float: 'left',
        marginLeft: 15,
        position: 'relative',
		cursor: 'pointer',
    },
    playIcon: {
        fontSize: 40,
        position: 'relative',
        bottom: 1,
    },
    saveText: {
        color: Colors.link,
        fontWeight: 'bold',
        fontSize: 12,
        float: 'left',
        width: 30,
        position: 'relative',
        top: 10,
        marginLeft: 15,
		cursor: 'pointer',
    },
    trashWrapper: {
        float: 'left',
        width: 15,
        position: 'relative',
        top: 9,
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
        height: 25,
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
        width: 'calc(100% - 50px)',
        height: 25,
        float: 'left',
    },
    uploadButton: {
        backgroundColor: Colors.mainOrange,
        width: 50,
        height: 25,
        float: 'left',
        color: Colors.mainWhite,
        fontSize: 9,
        border: 0,
		cursor: 'pointer',
    },
    
    inputTitleWrapper: {
        width: '100%',
        marginTop: 20,
        marginBottom: 20,
    },
    inputTitle: {
        height: 25,
        backgroundColor: Colors.mainWhite,
        width: '100%',
        fontSize: 12,
        borderRadius: 4,
        marginBottom: 0,
    },
    inputDescription: {
        height: 80,
        fontSize: 12,
        borderRadius: 4,
        marginTop: 16,
    },
    inputActions: {
        height: 58,
        fontSize: 12,
        borderRadius: 4,
        marginTop: '-20px',
    },
    notes: {
        height: 72,
        backgroundColor: Colors.mainWhite,
    },
    notesLabel: {
        marginLeft: 10,
    },
    fileTypesLabel: {
        fontSize: 9,
        marginLeft: 10,
    },
    souncastSelectWrapper: {
        height: 72,
        backgroundColor: Colors.mainWhite,
        marginTop: 15,
    },
    souncastSelect: {
        backgroundColor: 'transparent',
        width: 'calc(100% - 20px)',
        marginLeft: 10,
        marginRight: 10,
        marginTop: 5,
    },

    draftButton: {
        backgroundColor: Colors.link,
        color: Colors.fontBlack,
        fontSize: 12,
        width: 110,
        height: 30,
        borderRadius: 15,
        marginTop: 30,
        marginRight: 'auto',
        marginBottom: 30,
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
