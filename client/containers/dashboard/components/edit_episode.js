
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import ReactCrop from 'react-image-crop';
import Axios from 'axios';
import firebase from 'firebase';
import { Editor } from 'react-draft-wysiwyg';
import { convertFromRaw, convertToRaw, EditorState } from 'draft-js';
import Dots from 'react-activity/lib/Dots';

import {minLengthValidator, maxLengthValidator} from '../../../helpers/validators';
import ValidatedInput from '../../../components/inputs/validatedInput';
import Colors from '../../../styles/colors';
import { OrangeSubmitButton, TransparentShortSubmitButton } from '../../../components/buttons/buttons';

export default class EditEpisode extends Component {
    constructor (props) {
        super(props);

        this.state = {
            title: '',
            description: '',
            actionstep: '',
            notes: '',
            notesUploaded: false,
            notesName: '',
            notesUploading: false,
            publicEpisode: '',
        };

    }

    componentDidMount() {
      const { id, episode } = this.props.history.location.state;
      const {title, description, actionstep, notes, publicEpisode} = episode;

      this.setState({
        title,
        publicEpisode,
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

    _uploadToAws (file) {
        console.log('file: ', file);
        const { id } = this.props.history.location.state;
        const _self = this;
        let data = new FormData();
        const splittedFileName = file.name.split('.');
        const ext = (splittedFileName)[splittedFileName.length - 1];
        if(ext !== 'png' && ext !=='jpg' && ext !== 'jpeg' && ext !== 'pdf') {
          alert('Only .png or .jpg files are accepted. please upload a new file.');
          return;
        }
        data.append('file', file, `${this.id}.${ext}`);
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

                _self.setState({
                  notes: url,
                  notesUploaded: true,
                  notesUploading: false
                });
            })
            .catch(function (err) {
                // POST failed...
                console.log('ERROR upload to aws s3: ', err);
            });
    }

    setFileName (e) {
        // console.log('this.fileInputRef.files: ', this.fileInputRef.files);
        let file = document.getElementById('upload_hidden_notes').files[0];
        this._uploadToAws(file);
        if (file) {
            this.setState({
              notesName: file.name,
              notesUploading: true,
            });
        }
    }

    submit () {
        const { title, description, actionstep, notes, publicEpisode} = this.state;
        const { userInfo, history } = this.props;
        const { id } = history.location.state;
        const that = this;
        const creatorID = firebase.auth().currentUser.uid;

        const editedEpisode = {
            title,
            description: description.length > 0 ? description : null,
            actionstep: actionstep.length > 0 ? actionstep : null,
            notes,
            publicEpisode
        };

        // edit episode in database
            firebase.database().ref(`episodes/${id}`)
            .once('value')
            .then(snapshot => {
              const changedEpisode = Object.assign({}, snapshot.val(), editedEpisode);

              firebase.database().ref(`episodes/${id}`)
              .set(changedEpisode).then(
                res => {
                    history.goBack();
                },
                err => {
                    console.log('ERROR edit episode: ', err);
                }
              );
            });
    }

    changeSharingSetting() {
        const {publicEpisode} = this.state;
        this.setState({
            publicEpisode: !publicEpisode
        })
    }

    render() {
        const { description, title, actionstep, notes, notesUploading, notesUploaded, notesName } = this.state;
        const {history} = this.props;

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
                          <input
                              type="text"
                              style={styles.inputTitle}
                              onChange={(e) => {this.setState({description: e.target.value})}}
                              value={this.state.description}
                          />
                        </div>
                        <div style={{marginTop: 20,}}>
                          <span style={{...styles.titleText, marginTop: 20,}}>
                              Action Step
                          </span>
                        </div>
                        <div style={styles.inputTitleWrapper}>
                          <input
                              type="text"
                              style={styles.inputTitle}
                              onChange={(e) => {this.setState({actionstep: e.target.value})}}
                              value={this.state.actionstep}
                          />
                        </div>
                        <div style={styles.notes}>
                            <div style={{...styles.notesLabel, fontWeight: 600}}>Notes</div>
                            <div style={{...styles.inputFileWrapper, marginTop: 0}}>
                                <input
                                    type="file"
                                    name="upload"
                                    id="upload_hidden_notes"
                                    onChange={this.setFileName.bind(this)}
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
                        <div style={{marginTop: 15, marginBottom: 15,}}>
                              <span style={{...styles.titleText, fontWeight: 600, verticalAlign: 'middle'}}>This episode is publicly sharable</span>
                              <input
                                type='checkbox'
                                style={styles.checkbox}
                                checked={this.state.publicEpisode}
                                onClick={this.changeSharingSetting.bind(this)}
                              />
                        </div>
                        <div className="col-lg-8 col-md-8 col-sm-12 col-xs-12">
                            <OrangeSubmitButton
                                label="Save"
                                onClick={this.submit.bind(this)}
                            />
                        </div>
                        <div className="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                            <TransparentShortSubmitButton
                                label="Cancel"
                                onClick={() => {
                                  history.goBack();
                                }}
                            />
                        </div>
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
        height: 80,
        backgroundColor: Colors.mainWhite,
        width: '100%',
        fontSize: 16,
        borderRadius: 4,
        marginTop: 10,
        marginBottom: 20
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
        width: 133,
        height: 133,
        float: 'left',
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
        paddingLeft: 20,
        width: 'calc(100% - 133px)',
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
};