
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import Axios from 'axios';
import firebase from 'firebase';
import { Editor } from 'react-draft-wysiwyg';
import { convertFromRaw, convertToRaw, EditorState } from 'draft-js';
import Dots from 'react-activity/lib/Dots';
import Toggle from 'react-toggle'

import {minLengthValidator, maxLengthValidator} from '../../../helpers/validators';
import ValidatedInput from '../../../components/inputs/validatedInput';
import AudiojsRecordPlayer from '../../../components/audiojs_record_player';
import Colors from '../../../styles/colors';
import { OrangeSubmitButton, TransparentShortSubmitButton } from '../../../components/buttons/buttons';
import {sendNotifications} from '../../../helpers/send_notifications';
import {sendMarketingEmails} from '../../../helpers/sendMarketingEmails';

export default class EditEpisode extends Component {
    constructor (props) {
        super(props);

        this.state = {
            id: '',
            title: '',
            description: '',
            actionstep: '',
            notes: '',
            notesUploaded: false,
            notesName: '',
            notesUploading: false,
            publicEpisode: true,
            isPublished: null,
            soundcastID: '',
            coverartUploaded: false,
            coverartUrl: '',
            coverArtUploading: false,
            sendEmails: false,
            startProcessingEpisode : false,
            doneProcessingEpisode: false,
            podcastError: null,
        };
        this.uploadCoverArtInput = null;
    }

    componentDidMount() {
      const { id, episode } = this.props.history.location.state;
      const {title, description, actionstep, notes, publicEpisode, isPublished, soundcastID, coverArtUrl, date_created} = episode;

      this.setState({
        id,
        title,
        publicEpisode,
        isPublished,
        soundcastID,
        date_created,
        coverartUrl: coverArtUrl ? coverArtUrl : '',
      })
      if(description) {
        this.setState({
            description
        })
      }
      if(notes) {
        this.setState({
          notes
        })
      }
      if(actionstep) {
        this.setState({
          actionstep
        })
      }
    }

    componentWillUnmount() {
        const { id } = this.state;
        const { content_saved, handleContentSaving } = this.props;
        handleContentSaving(id, false);

    }

    _uploadToAws (file, type) {
        console.log('file: ', file);
        const { id } = this.props.history.location.state;
        const _self = this;
        let data = new FormData();
        const splittedFileName = file.name.split('.');
        const ext = (splittedFileName)[splittedFileName.length - 1];
        if(ext !== 'png' && ext !=='jpg' && ext !== 'jpeg' && ext !== 'pdf') {
          alert('Only png, jpg, or pdf files are accepted. please upload a new file.');
          return;
        }
        data.append('file', file, `${id}.${ext}`);
        // axios.post('http://localhost:3000/upload/images', data) // - alternative address (need to uncomment on backend)
        Axios.post('/api/upload', data)
            .then(function (res) {
                // POST succeeded...
                console.log('success upload to aws s3: ', res);

                //replace 'http' with 'https'
                let url = res.data[0].url;
                if(url.slice(0, 5) !== 'https') {
                    url = url.replace(/http/i, 'https');
                }
                if(type == 'notes') {
                  _self.setState({
                    notes: url,
                    notesUploaded: true,
                    notesUploading: false
                  });
                } else if(type == 'coverart') {
                _self.setState({
                  coverartUrl: url,
                  coverartUploaded: true,
                  coverArtUploading: false
                });
                }

            })
            .catch(function (err) {
                // POST failed...
                console.log('ERROR upload to aws s3: ', err);
            });
    }

    setFileName (type, e) {
        // console.log('this.fileInputRef.files: ', this.fileInputRef.files);
        let file;
        if(type=='notes') {
          file = document.getElementById('upload_hidden_notes').files[0];
        } else if(type=='coverart') {
          file = document.getElementById('upload_hidden_cover3').files[0];
        }
        this._uploadToAws(file, type);
        if (file && type=='notes') {
            this.setState({
              notesName: file.name,
              notesUploading: true,
            });
        } else if(file && type=='coverart') {
            this.setState({
              coverArtUploading: true,
            })
        }
    }

    submit (toPublish) {
        const { title, description, actionstep, notes, publicEpisode, isPublished, soundcastID, coverartUrl, date_created} = this.state;
        const { userInfo, history } = this.props;
        const soundcast = userInfo.soundcasts_managed[soundcastID];
        const {itunesCategory, itunesExplicit, itunesImage, podcastFeedVersion} = soundcast; // only available if the soundcast has been submitted as a podcast;
        const { id } = history.location.state;
        const that = this;
        if(toPublish || isPublished) {
          this.setState({
            startProcessingEpisode: true,
            doneProcessingEpisode: false,
          });
        }
        const editedEpisode = {
            title,
            soundcastID,
            description: description.length > 0 ? description : null,
            actionstep: actionstep.length > 0 ? actionstep : null,
            notes,
            publicEpisode,
            date_created: toPublish ? moment().format('X') : date_created,
            isPublished: toPublish ? true : isPublished,
            coverArtUrl: coverartUrl,
        };

        // edit episode in database
        firebase.database().ref(`episodes/${id}`)
        .once('value')
        .then(snapshot => {
          const changedEpisode = Object.assign({}, snapshot.val(), editedEpisode);
          const oldSoundcastID = snapshot.val().soundcastID;
          if(oldSoundcastID !== soundcastID) {
            firebase.database().ref(`soundcasts/${oldSoundcastID}/episodes/${id}`).remove();
            firebase.database().ref(`soundcasts/${soundcastID}/episodes/${id}`).set(true);
          }

          firebase.database().ref(`episodes/${id}`)
          .set(changedEpisode).then(
            res => {
                // history.goBack();
                if(podcastFeedVersion) {
                  firebase.database().ref(`episodes/${id}/id3Tagged`)
                  .set(false)
                  .then(() => {
                    Axios.post('/api/create_feed', {
                      soundcastId: soundcastID,
                      itunesExplicit,
                      itunesImage,
                      itunesCategory,
                      email: userInfo.publisher.email,
                      firstName: userInfo.firstName,
                    })
                    .then(response => {
                      that.setState({
                        startProcessingEpisode: false,
                        doneProcessingEpisode: true,
                      });
                      alert('Episode is processed and saved.');
                      if(toPublish && !isPublished) {
                        that.notifySubscribers();
                        history.goBack();
                      }
                    })
                    .catch(err => {
                      that.setState({
                        startProcessingEpisode: false,
                        doneProcessingEpisode: true,
                        podcastError: err.toString(),
                      });
                      console.log(err);
                    });
                  })
                } else {
                  if(toPublish && !isPublished) { // if publishing for the first time
                    that.setState({
                      startProcessingEpisode: false,
                      doneProcessingEpisode: true,
                    });
                    alert('Episode is published.');
                    that.notifySubscribers();
                    history.goBack();
                  } else  {
                    that.setState({
                      startProcessingEpisode: false,
                      doneProcessingEpisode: true,
                    });
                    alert('The edited episode is saved');
                    // history.goBack();
                  }
                }
            },
            err => {
                console.log('ERROR edit episode: ', err);
            }
          );
        });
    }


    changeSoundcastId (e) {
        this.setState({
            soundcastID: e.target.value,
        })
    }

    notifySubscribers() {
        const { episode } = this.props.history.location.state;
        const that = this;
        firebase.database().ref(`soundcasts/${this.state.soundcastID}/episodes/${episode.id}`)
        .once('value', snapshot => {
            if(snapshot.val()) {
              firebase.database().ref(`soundcasts/${this.state.soundcastID}`)
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
                  sendNotifications(registrationTokens, payload); //sent push notificaiton
                }
                const soundcast = {...snapshot.val(), id: that.state.soundcastID};
                if(that.state.sendEmails) {
                  that.emailListeners(soundcast);
                }
              })
            }
        })
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

    changeSharingSetting() {
        const {publicEpisode} = this.state;
        this.setState({
            publicEpisode: !publicEpisode
        })
    }

    setOriginal(mediaObject) { // setMediaObject
        this.mediaObjectOriginal = mediaObject;
        mediaObject.on('deviceReady', () => {
          console.log('mediaObjectOriginal ready')
        });
        mediaObject.on('deviceError', () => { // error handling
          console.log('device error:', mediaObject.deviceErrorCode);
        });
        mediaObject.on('error', error => console.log('error:', error));
        // user clicked the record button and started recording
        mediaObject.on('ended', () => this.setState({isPlaying: false}));
        // user completed recording and stream is available
        this.player = this.mediaObjectOriginal.player();
        this.wavesurfer = this.mediaObjectOriginal.wavesurfer();
    }

    setProcessed(mediaObject) { // setMediaObject
        this.mediaObjectProcessed = mediaObject;
        mediaObject.on('deviceReady', () => {
          console.log('mediaObjectProcessed ready')
        });
        mediaObject.on('deviceError', () => { // error handling
          console.log('device error:', mediaObject.deviceErrorCode);
        });
        mediaObject.on('error', error => console.log('error:', error));
        // user clicked the record button and started recording
        mediaObject.on('ended', () => this.setState({isPlaying: false}));
        // user completed recording and stream is available
        this.player = this.mediaObjectProcessed.player();
        this.wavesurfer = this.mediaObjectProcessed.wavesurfer();
    }

    render() {
        const { description, title, actionstep, notes, notesUploading, notesUploaded, notesName, isPublished, soundcastID, startProcessingEpisode, doneProcessingEpisode, podcastError } = this.state;
        const {history, userInfo} = this.props;
        const { id } = this.props.history.location.state;
        const _soundcasts_managed = [];
        for (let id in userInfo.soundcasts_managed) {
            const _soundcast = JSON.parse(JSON.stringify(userInfo.soundcasts_managed[id]));
            if (_soundcast.title) {
                _soundcast.id = id;
                _soundcasts_managed.push(_soundcast);
            }
        }

        const that = this;

        return (
            <div className='padding-30px-tb'>
              <div className='padding-bottom-20px'>
                  <span className='title-medium '>
                      Edit Episode
                  </span>
              </div>
              <div style={{marginTop: 15, marginBottom: 15,}}>
                  <span style={{...styles.titleText, fontWeight: 600, verticalAlign: 'middle'}}>(You can only edit the metadata of existing episodes. If you want to upload a new audio file, please create a new episode.)</span>
              </div>
                <div className="row">
                    <div className="col-lg-9 col-md-9 col-sm-12 col-xs-12">
                        <div style={{marginBottom: 15}}>
                          <span style={styles.titleText}>Title</span>
                          <span style={{...styles.titleText, color: 'red'}}>*</span>
                          <span style={{fontSize: 14, marginBottom: 15,}}><i> (70 characters max)</i></span>
                        </div>
                        <ValidatedInput
                            type="text"
                            styles={styles.inputTitle}
                            wrapperStyle={styles.inputTitleWrapper}
                            onChange={(e) => {this.setState({title: e.target.value})}}
                            value={this.state.title}
                            validators={[minLengthValidator.bind(null, 1), maxLengthValidator.bind(null, 70)]}
                        />
                        <div style={{marginTop: 20,}}>
                          <span style={{...styles.titleText, marginTop: 20,}}>
                              Description
                          </span>
                        </div>
                        <div style={styles.inputTitleWrapper}>
                          <textarea
                              style={styles.inputDescription}
                              // placeholder={'Description'}
                              onChange={(e) => {this.setState({description: e.target.value})}}
                              value={this.state.description}
                          >
                          </textarea>
                        </div>
                        <div style={{marginTop: 20,}}>
                          <span style={{...styles.titleText, marginTop: 20,}}>
                              Action Step
                          </span>
                        </div>
                        <div style={styles.inputTitleWrapper}>
                          <textarea
                              style={styles.inputDescription}
                              placeholder={'Action step'}
                              onChange={(e) => {this.setState({actionstep: e.target.value})}}
                              value={this.state.actionstep}
                          >
                          </textarea>
                        </div>
                        <div style={styles.notes}>
                            <div style={{...styles.notesLabel, fontWeight: 600}}>Notes</div>
                            <div style={{...styles.inputFileWrapper, marginTop: 0, width: 'calc(100% - 20px)',}}>
                                <input
                                    type="file"
                                    name="upload"
                                    id="upload_hidden_notes"
                                    onChange={this.setFileName.bind(this, 'notes')}
                                    style={styles.inputFileHidden}
                                />
                                {
                                  notesUploading &&
                                  <div style={{textAlign: 'left'}}>
                                    <div className='title-small' style={{marginBottom: 5,}}>
                                        {`Uploading notes`}
                                    </div>
                                    <div style={{display: 'flex', alignItems: 'center'}}>
                                        <Dots style={{}} color="#727981" size={22} speed={1}/>
                                    </div>
                                  </div>
                                  ||
                                  notes && notesUploaded &&
                                    <div style={{}}>
                                        <div className='text-medium'>
                                            {`${notesName} saved`}
                                        </div>
                                        <div
                                          style={styles.cancelImg}
                                          onClick={() => this.setState({notesUploaded: false, notes: ''})}>
                                          Cancel
                                        </div>
                                    </div>
                                  ||
                                  (!notes || (notes && !notesUploaded)) &&
                                  <div style={{}}>
                                    <div>
                                        <button
                                            onClick={() => {document.getElementById('upload_hidden_notes').click();}}
                                            style={{...styles.uploadButton, backgroundColor:  Colors.mainOrange}}
                                        >
                                            <span style={{paddingLeft: 5, paddingRight: 5}}>Upload Notes </span>
                                        </button>
                                    </div>
                                    <div>
                                        <div style={styles.fileTypesLabel}>.pdf, .jpg or .png files accepted</div>
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
                                <span id='share-label' style={styles.toggleLabel}>Make this episode publicly shareable</span>
                            </div>
                            {
                              !isPublished &&
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
                                  <span id='share-label' style={styles.toggleLabel}>Send email notification to subscribers and invitees</span>
                              </div>
                              || null
                            }
                        </div>
                        {
                            this.state.publicEpisode &&
                            <div style={{marginBottom: 25,}}>
                                <span style={{fontSize: 20, fontWeight: 800,}}>Episode link for sharing: </span><span ><a style={{color: Colors.mainOrange, fontSize: 18,}}>{`https://mysoundwise.com/episodes/${id}`}</a></span>
                            </div>
                            || null
                        }
                        {
                            this.state.publicEpisode &&
                            <div style={{height: 165, marginBottom: 10,}}>
                                <div>
                                    <span style={{fontSize: 16, fontWeight: 800,}}>
                                        Episode cover art (for social sharing)
                                    </span>
                                </div>
                                {
                                    this.state.coverartUrl &&
                                    <div style={{...styles.image, marginRight: 10, marginTop: 10,}}>
                                      <img style={styles.image}  src={this.state.coverartUrl} />
                                    </div>
                                    || null
                                }
                                <div style={styles.loaderWrapper}>
                                    <div style={{...styles.inputFileWrapper, marginTop: 0}}>
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
                                          this.state.coverartUploaded &&
                                          <div>
                                            <span>{this.uploadCoverArtInput.files[0].name}</span>
                                            <span style={styles.cancelImg}
                                              onClick={() => {
                                                that.setState({coverartUploaded: false, coverartUrl: ''});
                                                document.getElementById('upload_hidden_cover3').value = null;
                                              }}>Cancel</span>
                                          </div>
                                          ||
                                          !this.state.coverartUploaded &&
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
                        <div style={{ }}>
                          <div style={{marginTop: 20,}}>
                            <span style={{...styles.titleText, marginTop: 20,}}>
                                Audio Processing
                            </span>
                          </div>
                          <div style={{marginTop: 20,}}>
                            <span style={{...styles.titleText, marginTop: 20,}}>
                              Original file:
                            </span>
                          </div>
                          <div style={{ height: 34 }}>
                            <div style={styles.micWrapper}>
                              <AudiojsRecordPlayer setMediaObject={this.setOriginal.bind(this)} />
                            </div>
                          </div>
                          <div style={{marginTop: 20,}}>
                            <span style={{...styles.titleText, marginTop: 20,}}>
                              Processed file:
                            </span>
                          </div>
                          <div style={{ height: 44 }}>
                            <div style={styles.micWrapper}>
                              <AudiojsRecordPlayer setMediaObject={this.setProcessed.bind(this)} />
                            </div>
                          </div>
                          <div style={{display: 'flex', alignItems: 'center', marginTop: 15}}>
                            <Toggle
                              // checked={this.state.}
                              // onChange={this..bind(this)}
                            />
                          <span style={styles.toggleLabel}>Optimize volume</span>
                          </div>
                          <div style={{display: 'flex', alignItems: 'center', marginTop: 15}}>
                            <Toggle
                              // checked={this.state.}
                              // onChange={this..bind(this)}
                            />
                            <span style={styles.toggleLabel}>Trim silence at begining and end</span>
                          </div>
                          <div style={{display: 'flex', alignItems: 'center', marginTop: 15}}>
                            <Toggle
                              // checked={this.state.}
                              // onChange={this..bind(this)}
                            />
                            <span style={styles.toggleLabel}>Remove excessive pauses</span>
                          </div>
                          <div style={{display: 'flex', alignItems: 'center', marginTop: 15}}>
                            <Toggle
                              // checked={this.state.}
                              // onChange={this..bind(this)}
                            />
                            <span style={styles.toggleLabel}>Attach intro / outro</span>
                          </div>
                        </div>
                        <div style={styles.soundcastSelectWrapper}>
                            <div style={{...styles.notesLabel, marginLeft: 10,}}>Publish in</div>
                            <select
                              value = {soundcastID}
                              style={styles.soundcastSelect}
                              onChange={(e) => {this.changeSoundcastId(e);}}>
                                {
                                    _soundcasts_managed.map((soundcast, i) => {
                                        return (
                                            <option value={soundcast.id} key={i}>{soundcast.title}</option>
                                        );
                                    })
                                }
                            </select>
                        </div>
                        {
                          startProcessingEpisode &&
                          <div className="col-lg-12 col-md-12 col-sm-6 col-xs-6"
                                  style={{textAlign: 'center', marginTop: 25}}>
                              <div className='' style={{ fontSize: 17, width: '100%'}}>
                                <span>Processing episode...</span>
                              </div>
                              <div className='' style={{marginTop: 10, width: '100%'}}>
                                <Dots style={{}} color={Colors.mainOrange} size={32} speed={1}/>
                              </div>
                          </div>
                          ||
                          <div>
                            <div className="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                                <OrangeSubmitButton
                                    label={isPublished ? "Update" : "Save draft"}
                                    onClick={this.submit.bind(this, false)}
                                    styles={{backgroundColor: Colors.link, borderWidth: 0}}
                                />
                            </div>
                            {
                                !isPublished &&
                                <div className="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                                  <OrangeSubmitButton
                                    label='Publish'
                                    onClick={this.submit.bind(this, true)}
                                  />
                                </div>
                                || null
                            }
                            <div className="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                                <TransparentShortSubmitButton
                                    label="Cancel"
                                    styles={{width: 229}}
                                    onClick={() => {
                                      history.goBack();
                                    }}
                                />
                            </div>
                            {
                              podcastError &&
                              <div className='col-md-12' style={{fontSize: 16, marginTop: 10, color: 'red'}}>
                               {podcastError}
                              </div>
                              || null
                            }
                          </div>

                        }
                    </div>
                </div>
            </div>
        );
    }
};

EditEpisode.propTypes = {
    userInfo: PropTypes.object,
    history: PropTypes.object,
};

const styles = {
    titleText: {
        fontSize: 16,
        fontWeight: 600,
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
        height: 120,
        fontSize: 16,
        borderRadius: 4,
        marginTop: 0,
        marginBottom: 10,
        resize: 'vertical',
        overflow: 'auto',
    },
    editorStyle: {
        padding: '5px',
        borderRadius: 4,
        height: '300px',
        width: '100%',
        backgroundColor: Colors.mainWhite,
      },
    wrapperStyle: {
        borderRadius: 4,
        marginBottom: 25,
        marginTop: 15,
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
    hostImage: {
        width: 100,
        height: 100,
        float: 'left',
        borderRadius: '50%',
        backgroundColor: Colors.mainWhite,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: Colors.lightGrey,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
        backgroundSize: 'cover',
    },
    loaderWrapper: {
        height: 133,
        paddingTop: 20,
        paddingRight: 0,
        paddingBottom: 0,
        paddingLeft: 0,
        // width: 'calc(100% - 133px)',
        float: 'left',
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
    addFeature: {
        fontSize: 16,
        marginLeft: 10,
        color: Colors.link,
        cursor: 'pointer',
    },

    // TODO: move to separate component if functions are the same as in create_episode
    inputFileWrapper: {
        margin: 10,
        // width: 'calc(100% - 20px)',
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
        // width: 80,
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
    notes: {
        height: 102,
        // marginLeft: 10,
        width: '50%',
        // backgroundColor: Colors.mainWhite,
    },
    notesLabel: {
        // marginLeft: 10,
        paddingTop: 12,
        paddingBottom: 6,
        fontSize: 16
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
    toggleLabel: {
      fontSize: 20,
      fontWeight: 800,
      marginLeft: '0.5em'
    }
};
