import React, {Component} from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Link, Switch } from 'react-router-dom';
import firebase from 'firebase';
import moment from 'moment';
import Axios from 'axios';
import Dots from 'react-activity/lib/Dots';

import ImageCropModal from './dashboard/components/image_crop_modal';
import Footer from '../components/footer';
import {SoundwiseHeader} from '../components/soundwise_header';
import Colors from '../styles/colors';
import { OrangeSubmitButton } from '../components/buttons/buttons';

class _UserProfile extends Component {
    constructor (props) {
        super(props);
        this.state = {
            firstName: '',
            lastName: '',
            pic_url: false,
            profileImgUploaded: false,
            profileSaved: false,
        };
        this.profileImgInputRef = null;
        this.currentImageRef = null;
        this.submit = this.submit.bind(this);
    }

  componentDidMount() {
    const that = this;
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            if(that.props.userInfo.firstName) {
                that.setState({
                    firstName: that.props.userInfo.firstName,
                    lastName: that.props.userInfo.lastName,
                    pic_url: that.props.userInfo.pic_url,
                });
            }
        } else {
            that.props.history.push('/signin');
        }
    });
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.userInfo && nextProps.userInfo.firstName) {
      this.setState({
          firstName: nextProps.userInfo.firstName,
          lastName: nextProps.userInfo.lastName,
          pic_url: nextProps.userInfo.pic_url,
      });
    }
  }

  _uploadToAws (file) {
      const _self = this;
      const {firstName, lastName} = this.state;
      let data = new FormData();
      const splittedFileName = file.type.split('/');
      const ext = (splittedFileName)[splittedFileName.length - 1];
      let fileName = encodeURIComponent(`${firstName}-${lastName}`) + `-${moment().format('X')}.${ext}`;

      data.append('file', file, fileName);
      // axios.post('http://localhost:3000/upload/images', data) // - alternative address (need to uncomment on backend)
      Axios.post('/api/upload', data)
          .then(function (res) {
              // POST succeeded...
              // console.log('success upload to aws s3: ', res);
              //replace 'http' with 'https'
              let url = res.data[0].url;
              if(url.slice(0, 5) !== 'https') {
                  url = url.replace(/http/i, 'https');
              }

              _self.setState({pic_url: url});
          })
          .catch(function (err) {
              // POST failed...
              console.log('ERROR upload to aws s3: ', err);
          });
  }

  setFileName (e) {
      // console.log('this.fileInputRef.files: ', this.fileInputRef.files);
      if (this.profileImgInputRef.files[0]) {
          // this._uploadToAws(this.profileImgInputRef.files[0]);
          const allowedFileTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif"];
          if(allowedFileTypes.indexOf(this.profileImgInputRef.files[0].type) < 0) {
            alert('Only .png or .jpeg files are accepted. Please upload a new file.');
            this.setState({profileImgUploaded: false});
            return;
          }
          this.setState({profileImgUploaded: true});
          this.currentImageRef = this.profileImgInputRef.files[0];
          this.handleModalOpen();
      }
  }

  submit () {
      const {firstName, lastName, pic_url} = this.state;
      const { userInfo, history } = this.props;
      const that = this;
      // const userID = firebase.auth().currentUser.uid;
      firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                const userID = user.uid;
                firebase.database().ref(`users/${userID}/firstName`).set(firstName);
                firebase.database().ref(`users/${userID}/lastName`).set(lastName);
                firebase.database().ref(`users/${userID}/pic_url`).set(pic_url);
                alert('Profile change saved.');
            } else {
                // alert('profile saving failed. Please try again later.');
                // Raven.captureMessage('profile saving failed!')
            }
      });
  }

  handleModalOpen() {
    this.setState({
      modalOpen: true,
    })
  }

  handleModalClose() {
    this.setState({
      modalOpen: false,
      profileImgUploaded: false,
    });
    document.getElementById('upload_hidden_cover_2').value = null;
  }

  uploadViaModal(fileBlob, hostImg) {
    this.setState({
      fileCropped: true,
      modalOpen: false,
      profileImgUploaded: true,
    });
    this._uploadToAws(fileBlob, hostImg);
  }

  render() {
    const {firstName, lastName, pic_url, profileImgUploaded, profileSaved, modalOpen} = this.state;
    const that = this;
    return (
            <div>
                <SoundwiseHeader />
                <section className="padding-110px-tb bg-white builder-bg xs-padding-60px-tb" id="feature-section14">
                    <div className="container">
                    <ImageCropModal
                      open={modalOpen}
                      handleClose={this.handleModalClose.bind(this)}
                      upload={this.uploadViaModal.bind(this)}
                      hostImg={false}
                      file={this.currentImageRef}
                    />
                        <div className="row">
                            <div className="col-md-12 col-sm-12 col-xs-12 text-center">
                                <h2 className="section-title-large sm-section-title-medium xs-section-title-large text-dark-gray font-weight-600 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text">
                                    MY PROFILE
                                </h2>
                            </div>
                        </div>
                        <div className="row" style={{paddingTop: 30}}>
                          <div className='col-md-6 col-sm-8 col-xs-12 center-col'>
                            <div className='col-md-6 col-sm-6 col-xs-12'>
                                <span style={styles.titleText}>
                                    First Name
                                </span>
                                <div style={{...styles.inputTitleWrapper}}>
                                  <input
                                      type="text"
                                      style={styles.inputTitle}
                                      placeholder={''}
                                      onChange={(e) => {this.setState({firstName: e.target.value})}}
                                      value={firstName}
                                  />
                                </div>
                            </div>
                            <div className='col-md-6 col-sm-6 col-xs-12'>
                                <span style={styles.titleText}>
                                    Last Name
                                </span>
                                <div style={{...styles.inputTitleWrapper}}>
                                  <input
                                      type="text"
                                      style={styles.inputTitle}
                                      placeholder={''}
                                      onChange={(e) => {this.setState({lastName: e.target.value})}}
                                      value={lastName}
                                  />
                                </div>
                            </div>
                            <div className='col-md-12 col-sm-12 col-xs-12' style={{height: 150, paddingTop: 30}}>
                                <div style={{marginBottom: 10}}>
                                    <span style={styles.titleText}>
                                        Profile Picture
                                    </span>
                                </div>
                                <div style={{...styles.profileImage, backgroundImage: `url(${pic_url ? pic_url : ''})`}}>

                                </div>
                                <div style={styles.loaderWrapper}>
                                    <div style={{...styles.inputFileWrapper, marginTop: 0}}>
                                        <input
                                            type="file"
                                            name="upload"
                                            id="upload_hidden_cover_2"
                                            onChange={this.setFileName.bind(this)}
                                            style={styles.inputFileHidden}
                                            ref={input => this.profileImgInputRef = input}
                                        />
                                        {
                                          profileImgUploaded &&
                                          <div>
                                            <span>{this.profileImgInputRef.files[0].name}</span>
                                            <span style={styles.cancelImg}
                                              onClick={() => {
                                                that.setState({profileImgUploaded: false, pic_url: false});
                                                document.getElementById('upload_hidden_cover_2').value = null;
                                              }}>Cancel</span>
                                          </div>
                                          ||
                                          !profileImgUploaded &&
                                          <div>
                                            <button
                                                onClick={() => {document.getElementById('upload_hidden_cover_2').click();}}
                                                style={{...styles.uploadButton, backgroundColor:  Colors.mainOrange}}
                                            >
                                                Upload
                                            </button>
                                            <span style={styles.fileTypesLabel}>.jpg or .png files accepted</span>
                                          </div>
                                        }
                                    </div>
                                </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-lg-8 col-md-8 col-sm-12 col-xs-12 center-col text-center" style={{paddingTop: 35}}>
                            {
                              profileSaved &&
                              <div style={{fontSize: 16, color: Colors.mainOrange}}>
                                Profile Saved
                              </div>
                              ||
                              <OrangeSubmitButton
                                  label="Save"
                                  onClick={this.submit}
                              />
                            }
                        </div>
                    </div>
                </section>
                <Footer />
            </div>
    )
  }
}

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
    profileImage: {
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
}


const mapStateToProps = state => {
    const { userInfo, isLoggedIn } = state.user;
    return { userInfo, isLoggedIn, };
};

export const UserProfile = connect(mapStateToProps, null)(_UserProfile);