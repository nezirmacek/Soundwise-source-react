/**
 * Created by developer on 01.08.17.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import firebase from 'firebase';
import Microm from 'microm';
import { ReactMic } from 'react-mic';
import Loader from 'react-loader';
import ReactS3Uploader from 'react-s3-uploader';
import rp from 'request-promise';

import Colors from '../../../styles/colors';

const microm = new Microm(); // from microm module
let mp3 = null;
let stream = null;
microm.on('timeupdate', (time) => {});
microm.on('loadedmetadata', (duration) => {});
microm.on('play', () => {});
microm.on('pause', () => {});

// function _forceDownload(){
//     console.log('forceDownload');
//     //var blob = new Blob(mp3Data, {type:'audio/mpeg'});
//     var url = (window.URL || window.webkitURL).createObjectURL(blob);
//     var link = window.document.createElement('a');
//     link.href = url;
//     link.download = 'output.mp3';
//     var click = document.createEvent("Event");
//     click.initEvent("click", true, true);
//     link.dispatchEvent(click);
// }

export default class CreateEpisode extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isRecording: false,
            isRecorded: false,
            isPlaying: false,
            isLoading: false,

            uploaded: false,

            title: '',
            description: '',
            actions: '',
        };

        this.audio = null;
        this.notes = null;
    }

    componentDidMount () {
        microm.on('ended', () => {
            this.setState({isPlaying: false});
        });
    }

    recordOrStop () {
        const _self = this;

        if (!this.state.isRecording) {
            microm.record()
                .then(function(s) {
                    stream = s;
                    console.log('recording...')
                })
                .catch(function() {
                    console.log('error recording');
                });
        } else {
            this.setState({isLoading: true});
            microm.stop()
                .then(function(result) {
                    // stream.getAudioTracks().forEach(track => track.stop()); // removes the red icon // TODO: fix
                    mp3 = result;
                    console.log(mp3.url, mp3.blob, mp3.buffer);

                    _self.setState({isRecorded: true, isLoading: false});
                });
        }
        this.setState({isRecording: !this.state.isRecording});
    }

    play () {
        if (this.state.isRecorded) {
            microm.play();
            this.setState({isPlaying: true});
        }
    }

    pause () {
        microm.pause();
        this.setState({isPlaying: false});
    }

    save () {
        microm.getMp3().then(res => {
            console.log('>>>>>>>>>>', res);
            //upload file to aws s3
        });
    }

    setFileName (type, e) {
        if (e.target.value) {
            if (type === 'audio') {
                this.setState({uploaded: true});
            }
            this[type] = e.target; // TODO: check what we need to keep here
        }
        document.getElementById(type).value = e.target.value;
    }

    upload () {
        //upload file to aws s3
        const _rpOptions = {
            method: 'POST',
            uri: 'http://localhost:3000/api/fileUploads/upload',
            body: {
                file: this.audio
            },
            // json: true, // Automatically stringifies the body to JSON
            headers: {
                /* 'content-type': 'application/x-www-form-urlencoded' */ // Is set automatically
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
            }
        };
        rp(_rpOptions)
            .then(function (body) {
                // POST succeeded...
                console.log('>>>>>>>>>>SUCCESS');
            })
            .catch(function (err) {
                // POST failed...
                console.log('>>>>>>>>>>ERROR: ', err);
            });
    }

    uploadNotes () {
        //upload file to aws s3
    }

    onUploadStart (file, next) {
        console.log('>>>>>>>>>>START', file);
        this.audio = file;
        // next(file); // if this is uncommented, then file will be uploaded immediately
    }
    onUploadProgress () {}
    onUploadError () {}
    onUploadFinish () {}

    render() {
        const {isRecording, isRecorded, isPlaying, isLoading, uploaded} = this.state;
        return (
            <div>
                <span style={styles.titleText}>
                    Add New Episode
                </span>
                <div className="row">
                    <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12">
                        <div style={styles.recorder}>
                            <div style={styles.recordTitleText}>Record</div>
                            <div style={styles.recordButton} onClick={(e) => this.recordOrStop(e)}>
                                <i
                                    className={`fa fa-${isRecording && 'stop' || 'microphone'}`}
                                    style={styles.recordIcon}
                                ></i>
                            </div>
                            <div style={styles.micWrapper}>
                                <ReactMic
                                    record={isRecording}
                                    className="sound-wave"
                                    onStop={() => {}}
                                    strokeColor={Colors.mainWhite}
                                    backgroundColor={Colors.lightGrey}
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
                        </div>
                    </div>
                    <div className="col-lg-1 col-md-1 col-sm-12 col-xs-12">
                        OR
                    </div>
                    <div className="col-lg-5 col-md-5 col-sm-12 col-xs-12">
                        <div style={styles.recorder}>
                            <span>Upload</span>
                            <div style={styles.inputFileWrapper}>
                                {/*<input*/}
                                    {/*type="file"*/}
                                    {/*name="upload"*/}
                                    {/*id="upload_hidden_audio"*/}
                                    {/*onChange={this.setFileName.bind(this, 'audio')}*/}
                                    {/*style={styles.inputFileHidden}*/}
                                {/*/>*/}
                                <ReactS3Uploader
                                    className={'react-uploader'}
                                    signingUrl="/s3/sign"
                                    signingUrlMethod="GET"
                                    accept="image/*"
                                    preprocess={this.onUploadStart.bind(this)}
                                    onProgress={this.onUploadProgress.bind(this)}
                                    onError={this.onUploadError.bind(this)}
                                    onFinish={this.onUploadFinish.bind(this)}
                                    uploadRequestHeaders={{ 'x-amz-acl': 'public-read' }}
                                    contentDisposition="auto"
                                    scrubFilename={(filename) => filename.replace(/[^\w\d_\-.]+/ig, '')}
                                    server="http://cross-origin-server.com"
                                />
                                {/*<input*/}
                                    {/*type="text"*/}
                                    {/*readOnly="1"*/}
                                    {/*id="audio"*/}
                                    {/*style={styles.inputFileVisible}*/}
                                    {/*placeholder={'No Audio File Selected'}*/}
                                    {/*onClick={() => {document.getElementById('upload_hidden_audio').click();}}*/}
                                {/*/>*/}
                                {/*<button*/}
                                    {/*onClick={() => {this.upload.bind(this)}}*/}
                                    {/*style={{...styles.uploadButton, backgroundColor: uploaded && Colors.mainOrange || Colors.lightGrey}}*/}
                                {/*>*/}
                                    {/*Upload*/}
                                {/*</button>*/}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-lg-9 col-md-9 col-sm-12 col-xs-12">
                        <input
                            type="text"
                            style={styles.inputTitle}
                            placeholder={'Title*'}
                            onChange={(e) => {this.setState({title: e.target.value})}}
                            value={this.state.title}
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
                                <button
                                    onClick={() => {this.uploadNotes.bind(this)}}
                                    style={{...styles.uploadButton, backgroundColor: uploaded && Colors.mainOrange || Colors.lightGrey}}
                                >
                                    Upload
                                </button>
                            </div>
                            <span style={styles.fileTypesLabel}>.pdf, .jpg or .png files accepted</span>
                        </div>
                        <div style={styles.souncastSelectWrapper}>
                            <span style={styles.notesLabel}>Publish in</span>
                            <select style={styles.souncastSelect}>
                                <option value="0">cast 1</option>
                                <option value="1">cast 1</option>
                                <option value="2">cast 1</option>
                                <option value="3">cast 1</option>
                            </select>
                        </div>
                    </div>
                    <div className="col-lg-3 col-md-3 col-sm-12 col-xs-12">
                        <div className="col-lg-12 col-md-12 col-sm-6 col-xs-6">
                            <div style={styles.draftButton}>Save draft</div>
                        </div>
                        <div className="col-lg-12 col-md-12 col-sm-6 col-xs-6">
                            <div style={{...styles.draftButton, ...styles.publishButton}}>Publish</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
};

CreateEpisode.propTypes = {

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
    },
    trashWrapper: {
        float: 'left',
        width: 15,
        position: 'relative',
        top: 9,
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
    },

    inputTitle: {
        height: 25,
        backgroundColor: Colors.mainWhite,
        width: '100%',
        fontSize: 12,
        marginTop: 20,
        borderRadius: 4,
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
    },
    publishButton: {
        backgroundColor: Colors.mainOrange,
        color: Colors.mainWhite,
    },
};
