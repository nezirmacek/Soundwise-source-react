/**
 * Created by developer on 10.08.17.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import ReactCrop from 'react-image-crop';
import Axios from 'axios';
import firebase from 'firebase';

import {minLengthValidator, maxLengthValidator} from '../../../helpers/validators';
import {inviteListeners} from '../../../helpers/invite_listeners';
import ValidatedInput from '../../../components/inputs/validatedInput';
import Colors from '../../../styles/colors';
import { OrangeSubmitButton, TransparentShortSubmitButton } from '../../../components/buttons/buttons';

export default class AddSoundcast extends Component {
    constructor (props) {
        super(props);

        this.state = {
            title: '',
            subscribers: '',
            imageURL: '',
            fileUploaded: false,
        };

        this.soundcastId = `${moment().format('x')}s`;
        this.fileInputRef = null;
    }

    _uploadToAws (file) {
        const _self = this;
        let data = new FormData();
        const splittedFileName = file.name.split('.');
        const ext = (splittedFileName)[splittedFileName.length - 1];
        data.append('file', file, `${this.soundcastId}.${ext}`);
        // axios.post('http://localhost:3000/upload/images', data) // - alternative address (need to uncomment on backend)
        Axios.post('/api/fileUploads/upload', data)
            .then(function (res) {
                // POST succeeded...
                console.log('success upload to aws s3: ', res);
                _self.setState({imageURL: (JSON.parse(res.data))[0].url});
            })
            .catch(function (err) {
                // POST failed...
                console.log('ERROR upload to aws s3: ', err);
            });
    }

    setFileName (e) {
        // if (e.target.value) {
        //     this.setState({fileUploaded: true});
        // }
        // document.getElementById('file').value = e.target.value;
        this._uploadToAws(this.fileInputRef.files[0])
        if (this.fileInputRef.files[0]) {
            this.setState({fileUploaded: true});
        }
    }

    submit () {
        const { title, imageURL, subscribers } = this.state;
        const { userInfo, history } = this.props;

        const subscribersArr = subscribers.split(',');
        for(var i = subscribersArr.length -1; i >= 0; i--) {
            if (subscribersArr[i].indexOf('@') == -1) {
                subscribersArr.splice(i, 1);
            }
        }

        // send email invitations to invited listeners
        inviteListeners(subscribersArr, title, userInfo.firstName, userInfo.lastName);

        const invited = {};
        subscribersArr.map(email => {
            const _email = email.replace(/\./g, "(dot)");
            invited[_email] = true;  //invited listeners are different from subscribers. Subscribers are invited listeners who've accepted the invitation and signed up via mobile app
        });

        const creatorID = firebase.auth().currentUser.uid;

        const newSoundcast = {
            title,
            imageURL,
            creatorID,
            date_created: moment().format('X'),
            publisherID: userInfo.publisherID,
            invited,
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
                console.log('completed adding soundcast');
                history.goBack();
            },
            err => {
                console.log('failed to complete adding soundcast');
            }
        );
    }

    render() {
        const { imageURL, title, subscribers, fileUploaded } = this.state;
        const { userInfo, history } = this.props;
        const that = this;

        return (
            <div className='padding-30px-tb'>
              <div className='padding-bottom-20px'>
                  <span className='title-medium '>
                      Add A Soundcast
                  </span>
              </div>
                <div className="row">
                    <div className="col-lg-9 col-md-9 col-sm-12 col-xs-12">
                        <span style={styles.titleText}>
                            Title*
                        </span>
                        <ValidatedInput
                            type="text"
                            styles={styles.inputTitle}
                            wrapperStyles={styles.inputTitleWrapper}
                            placeholder={'Soundcast title'}
                            onChange={(e) => {this.setState({title: e.target.value})}}
                            value={this.state.title}
                            validators={[minLengthValidator.bind(null, 1), maxLengthValidator.bind(null, 40)]}
                        />
                        <span style={styles.titleText}>
                            Short Description
                        </span>

                        <div style={styles.inputTitleWrapper}>
                          <input
                              type="text"
                              style={styles.inputTitle}
                              placeholder={'A short description of this soundcast (300 characters max)'}
                              onChange={(e) => {this.setState({short_description: e.target.value})}}
                              value={this.state.short_description}
                          />
                        </div>
                        <span style={styles.titleText}>
                            Long Description
                        </span>
                        <textarea
                            style={styles.inputDescription}
                            placeholder={'A longer description of the soundcast'}
                            onChange={(e) => {this.setState({long_description: e.target.value})}}
                            value={this.state.long_description}
                        >
                        </textarea>
                        <span style={styles.titleText}>
                            Invite subscribers
                        </span>
                        <textarea
                            style={styles.inputDescription}
                            placeholder={'Enter listener email addresses, separated by commas'}
                            onChange={(e) => {this.setState({subscribers: e.target.value})}}
                            value={this.state.subscribers}
                        >
                        </textarea>
                        <div>
                            <div style={styles.image}>
                                <img src={imageURL} />
                            </div>
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
                                        ref={input => this.fileInputRef = input}
                                    />
                                    {
                                      fileUploaded &&
                                      <div>
                                        <span>{this.fileInputRef.files[0].name}</span>
                                        <span style={styles.cancelImg}
                                          onClick={() => that.setState({fileUploaded: false, imageURL: ''})}>Cancel</span>
                                      </div>
                                      ||
                                      !fileUploaded &&
                                      <div>
                                        <button
                                            onClick={() => {document.getElementById('upload_hidden_cover').click();}}
                                            style={{...styles.uploadButton, backgroundColor:  Colors.link}}
                                        >
                                            Upload
                                        </button>
                                        <span style={styles.fileTypesLabel}>.pdf, .jpg or .png files accepted</span>
                                      </div>
                                    }
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-8 col-md-8 col-sm-12 col-xs-12">
                            <OrangeSubmitButton
                                label="Add New Soundcast"
                                onClick={this.submit.bind(this)}
                            />
                        </div>
                        <div className="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                            <TransparentShortSubmitButton
                                label="Cancel"
                                onClick={() => history.goBack()}
                            />
                        </div>
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
        fontSize: 16,
    },
    inputTitleWrapper: {
        width: '100%',
        marginTop: 10,
        marginBottom: 20,
    },
    inputTitle: {
        height: 40,
        backgroundColor: Colors.mainWhite,
        width: '100%',
        fontSize: 16,
        borderRadius: 4,
        marginBottom: 0,
    },
    inputDescription: {
        height: 80,
        fontSize: 16,
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
        height: 60,
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
        height: 40,
        float: 'left',
    },
    uploadButton: {
        backgroundColor: Colors.link,
        width: 80,
        height: 30,
        // float: 'left',
        color: Colors.mainWhite,
        fontSize: 14,
        border: 0,
        marginTop: 5
    },
    cancelImg: {
      color: Colors.link,
      marginLeft: 20,
      fontSize: 14,
      cursor: 'pointer'
    },
    fileTypesLabel: {
        fontSize: 11,
        marginLeft: 0,
        display: 'block',
    },
};
