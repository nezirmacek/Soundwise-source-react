/**
 * Created by developer on 10.08.17.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import ReactCrop from 'react-image-crop';
import axios from 'axios';
import firebase from 'firebase';

import {minLengthValidator, maxLengthValidator} from '../../../helpers/validators';
import ValidatedInput from '../../../components/inputs/validatedInput';
import Colors from '../../../styles/colors';
import { OrangeSubmitButton } from '../../../components/buttons/buttons';

export default class AddSoundcast extends Component {
    constructor (props) {
        super(props);
        
        this.state = {
            title: '',
            subscribers: '',
            imageUrl: '',
            fileUploaded: false,
        };
    
        this.soundcastId = `${moment().format('x')}s`;
    }
    
    _uploadToAws (file) {
        const _self = this;
        let data = new FormData();
        const splittedFileName = file.name.split('.');
        const ext = (splittedFileName)[splittedFileName.length - 1];
        data.append('file', file, `${this.soundcastId}.${ext}`);
        // axios.post('http://localhost:3000/upload/images', data) // - alternative address (need to uncomment on backend)
        axios.post('http://localhost:3000/api/fileUploads/upload', data)
            .then(function (res) {
                // POST succeeded...
                console.log('success upload to aws s3: ', res);
                _self.setState({imageUrl: (JSON.parse(res.data))[0].url});
            })
            .catch(function (err) {
                // POST failed...
                console.log('ERROR upload to aws s3: ', err);
            });
    }
    
    setFileName (e) {
        if (e.target.value) {
            this.setState({fileUploaded: true});
        }
        document.getElementById('file').value = e.target.value;
    }
    
    submit () {
        const { title, imageUrl, subscribers } = this.state;
        const { userInfo, history } = this.props;
    
        const subscribersArr = subscribers.split(',');
        const subscribed = {};
        subscribersArr.map(email => {
            const _email = email.replace(/\./g, "(dot)");
            subscribed[_email] = true;
        });
        
        const creatorID = firebase.auth().currentUser.uid;
        
        const newSoundcast = {
            title,
            imageUrl,
            creatorID,
            publisherID: userInfo.publisherID,
            subscribed,
        };
    
        let _promises = [
        // add soundcast
            firebase.database().ref(`soundcasts/${this.soundcastId}`).set(newSoundcast).then(
                res => {
                    console.log('success add soundcast: ', res);
                    return res;
                },
                err => {
                    console.log('ERROR add soundcast: ', err);
                    Promise.reject(err);
                }
            ),
            // add soundcast to publisher
            firebase.database().ref(`publishers/${userInfo.publisherID}/soundcasts/${this.soundcastId}`).set(true).then(
                res => {
                    console.log('success add soundcast to publisher: ', res);
                    return res;
                },
                err => {
                    console.log('ERROR add soundcast to publisher: ', err);
                    Promise.reject(err);
                }
            ),
            // add soundcast to admin
            firebase.database().ref(`users/${creatorID}/soundcasts_managed/${this.soundcastId}`).set(true).then(
                res => {
                    console.log('success add soundcast to admin.soundcasts_managed: ', res);
                    return res;
                },
                err => {
                    console.log('ERROR add soundcast to admin.soundcasts_managed: ', err);
                    Promise.reject(err);
                }
            ),
        ];
        
        Promise.all(_promises).then(
            res => {
                console.log('complete add soundcast');
                history.goBack();
            },
            err => {
                console.log('failed complete add soundcast');
            }
        );
    }
    
    render() {
        const { imageUrl, title, subscribers, fileUploaded } = this.state;
        const { userInfo, history } = this.props;
        
        return (
            <div>
                <span style={styles.titleText}>
                    Add New Soundcast
                </span>
                <div className="row">
                    <div className="col-lg-9 col-md-9 col-sm-12 col-xs-12">
                        <ValidatedInput
                            type="text"
                            styles={styles.inputTitle}
                            wrapperStyles={styles.inputTitleWrapper}
                            placeholder={'Soundcast title*'}
                            onChange={(e) => {this.setState({title: e.target.value})}}
                            value={this.state.title}
                            validators={[minLengthValidator.bind(null, 1), maxLengthValidator.bind(null, 40)]}
                        />
                        <span style={styles.titleText}>
                            Add Subscribers
                        </span>
                        <textarea
                            style={styles.inputDescription}
                            placeholder={'Enter subscriber email addresses, separated by commas'}
                            onChange={(e) => {this.setState({subscribers: e.target.value})}}
                            value={this.state.subscribers}
                        >
                        </textarea>
                        <div>
                            <div style={styles.image}></div>
                            <div style={styles.loaderWrapper}>
                                <span style={{...styles.titleText, marginLeft: 10}}>
                                    Soundcast cover art (square image)
                                </span>
                                <div style={{...styles.inputFileWrapper, marginTop: 0}}>
                                    <input
                                        type="file"
                                        name="upload"
                                        id="upload_hidden_cover"
                                        onChange={this.setFileName.bind(this)}
                                        style={styles.inputFileHidden}
                                    />
                                    <input
                                        type="text"
                                        readOnly="1"
                                        id="file"
                                        style={styles.inputFileVisible}
                                        placeholder={'No File Selected'}
                                        onClick={() => {document.getElementById('upload_hidden_cover').click();}}
                                    />
                                    {
                                        !imageUrl
                                        &&
                                        <button
                                            onClick={() => {fileUploaded && this._uploadToAws(document.getElementById('upload_hidden_cover').files[0]);}}
                                            style={{...styles.uploadButton, backgroundColor: fileUploaded && Colors.mainOrange || Colors.lightGrey}}
                                        >
                                            Upload
                                        </button>
                                        ||
                                        null
                                    }
                                </div>
                                <span style={styles.fileTypesLabel}>.pdf, .jpg or .png files accepted</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-lg-8 col-md-8 col-sm-12 col-xs-12">
                        <OrangeSubmitButton
                            label="Add New Soundcast"
                            onClick={this.submit.bind(this)}
                        />
                    </div>
                    <div className="col-lg-4 col-md-4 col-sm-12 col-xs-12">
    
                    </div>
                </div>
            </div>
        );
    }
};

AddSoundcast.propTypes = {
    userInfo: PropTypes.object,
    history: PropTypes.object,
};

const styles = {
    titleText: {
        fontSize: 12,
    },
    inputTitleWrapper: {
        width: '100%',
        marginTop: 10,
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
    },
    image: {
        width: 133,
        height: 133,
        float: 'left',
        backgroundColor: Colors.mainWhite,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: Colors.lightGrey,
    },
    loaderWrapper: {
        height: 133,
        paddingTop: 20,
        paddingRight: 0,
        paddingBottom: 0,
        paddingLeft: 20,
        width: 'calc(100% - 133px)',
        float: 'left',
    },
    
    // TODO: move to separate component if functions are the same as in create_episode
    inputFileWrapper: {
        margin: 10,
        width: 'calc(100% - 20px)',
        height: 25,
        backgroundColor: Colors.mainWhite,
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
    
    fileTypesLabel: {
        fontSize: 9,
        marginLeft: 10,
        display: 'block',
    },
};
