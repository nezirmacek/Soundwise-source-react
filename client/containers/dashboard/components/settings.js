import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import Axios from 'axios';
import firebase from 'firebase';

import {minLengthValidator, maxLengthValidator} from '../../../helpers/validators';
import {inviteListeners} from '../../../helpers/invite_listeners';

import ValidatedInput from '../../../components/inputs/validatedInput';
import Colors from '../../../styles/colors';
import { OrangeSubmitButton, TransparentShortSubmitButton } from '../../../components/buttons/buttons';

export default class Settings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      publisherName: '',
      publisherImg: '',
      fileUploaded: false,
      admins: [],
      adminFormShow: false,
      inviteSent: false,
      inviteeEmail: '',
      inviteeFirstName: '',
      inviteeLastName: '',
    };
    this.loadFromProp(props.userInfo);
    this.loadFromProp = this.loadFromProp.bind(this);
    this._uploadToAws = this._uploadToAws.bind(this);
  }

  componentDidMount() {
    if(this.props.userInfo.publisher) {
      const { userInfo } = this.props;
      this.loadFromProp(userInfo);
      const that = this;
      const publisherId = userInfo.publisherID;
      let admins = [];
      firebase.database().ref(`publishers/${publisherId}/administrators`)
      .on('value', snapshot => {
          const adminArr = Object.keys(snapshot.val());
          const promises = adminArr.map(adminId => {
              return firebase.database().ref(`users/${adminId}`)
                      .once('value')
                      .then(snapshot => {
                          admins.push({
                              firstName: snapshot.val().firstName,
                              lastName: snapshot.val().lastName,
                              email: snapshot.val().email[0],
                          })
                      })
                      .then(res => res, err => console.log(err));
          });

          Promise.all(promises)
          .then(res => {
              that.setState({
                  admins
              })
          }, err => {
               console.log('promise error: ', err);
          });
      })
    }
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.userInfo.soundcasts_managed && nextProps.userInfo.publisher) {
      const { userInfo } = nextProps;
      this.loadFromProp(userInfo);
      const that = this;
      const publisherId = userInfo.publisherID;
      let admins = [];
      firebase.database().ref(`publishers/${publisherId}/administrators`)
      .on('value', snapshot => {
          const adminArr = Object.keys(snapshot.val());
          const promises = adminArr.map(adminId => {
              return firebase.database().ref(`users/${adminId}`)
                      .once('value')
                      .then(snapshot => {
                          admins.push({
                              firstName: snapshot.val().firstName,
                              lastName: snapshot.val().lastName,
                              email: snapshot.val().email[0],
                          })
                      })
                      .then(res => res, err => console.log(err));
          });

          Promise.all(promises)
          .then(res => {
              that.setState({
                  admins
              })
          }, err => {
               console.log('promise error: ', err);
          });
      })
    }
  }

  loadFromProp(userInfo) {
    if(userInfo.publisher) {
      const publisherId = userInfo.publisherID;
      const {name, imageUrl} = userInfo.publisher;
      this.setState({
        publisherName: name,
        publisherImg: imageUrl,
        publisherId,
      })
    }
  }

  _uploadToAws (file) {
        const _self = this;
        let data = new FormData();
        const splittedFileName = file.name.split('.');
        const ext = (splittedFileName)[splittedFileName.length - 1];
        data.append('file', file, `${this.state.publisherId}.${ext}`);
        Axios.post('/api/upload', data)
            .then(function (res) {
                // POST succeeded...
                console.log('success upload to aws s3: ', res);

                //replace 'http' with 'https'
                let url = res.data[0].url;
                if(url.slice(0, 5) !== 'https') {
                    url = url.replace(/http/i, 'https');
                }

                _self.setState({publisherImg: url});
            })
            .catch(function (err) {
                // POST failed...
                console.log('ERROR upload to aws s3: ', err);
            });
    }

  setFileName (e) {
        // console.log('this.fileInputRef.files: ', this.fileInputRef.files);
            this._uploadToAws(this.fileInputRef.files[0], null)
            if (this.fileInputRef.files[0]) {
                this.setState({fileUploaded: true});
            }
  }

  submit() {
    const { publisher } = this.props.userInfo;
    const { publisherImg, publisherName, publisherId } = this.state;

    const revisedPublisher = {...publisher, name: publisherName, imageUrl: publisherImg};
    firebase.database().ref(`publishers/${publisherId}`)
    .set(revisedPublisher)
    .then(() => {
      console.log('publisher saved');
    })
    .catch(err => {
      console.log(err);
    });
  }

  handleInvite(e) {
    this.setState({
        [e.target.name]: e.target.value
    })
  }

  inviteAdmin() {
    const publisherId = this.props.userInfo.publisherID;
    const userInfo = this.props.userInfo;
    const { inviteeEmail, inviteeFirstName, inviteeLastName, publisherName } = this.state;
    const inviteeArr = [inviteeEmail];
    const subject = `${userInfo.firstName} ${userInfo.lastName} invites you to become an admin for ${publisherName}`;
    const content = `<p>Hi ${inviteeFirstName}!</p><p></p><p>This is an invitation for you to join the admin team of ${publisherName} on Soundwise. You can sign up for your admin account <a href="https://mysoundwise.com/signup/admin/${publisherId}">here</a>.</p><p></p><p>If you already have an account on Soundwise, you can log in and join your team <a href="https://mysoundwise.com/signin/admin/${publisherId}">here</a>.</p><p>These links are unique for you. Please do not share.</p>`;

    inviteListeners(inviteeArr, subject, content);

    const email = inviteeEmail.replace(/\./g, "(dot)");
    firebase.database().ref(`publishers/${publisherId}/invitedAdmins/${email}`)
    .set(true);

    this.setState({
        inviteSent: true,
    });
  }

  render() {
    const { publisherImg, publisherName, fileUploaded, admins, adminFormShow, inviteeFirstName, inviteeLastName, inviteeEmail, inviteSent } = this.state;
    const that = this;
    return (
            <div className='padding-30px-tb'>
                <div className='padding-bottom-20px'>
                    <span className='title-medium '>
                        Publisher Settings
                    </span>
                </div>
                <div className="row">
                  <div className="col-lg-9 col-md-9 col-sm-12 col-xs-12">
                        <div style={{marginTop: 20,}}>
                          <span style={{...styles.titleText, marginTop: 20,}}>
                              Publisher Name
                          </span>
                        </div>
                        <div style={styles.inputTitleWrapper}>
                          <input
                              type="text"
                              style={styles.inputTitle}
                              onChange={(e) => {this.setState({publisherName: e.target.value})}}
                              value={publisherName}
                          />
                        </div>
                        <div style={{height: 150,}}>
                            <div style={styles.image}>
                              <img src={publisherImg} />
                            </div>
                            <div style={styles.loaderWrapper}>
                                <span style={{...styles.titleText, marginLeft: 10}}>
                                    Publisher Profile Image (square image)
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
                                          onClick={() => {
                                            that.setState({fileUploaded: false, imageURL: ''});
                                            document.getElementById('upload_hidden_cover').value = null;
                                          }}>Cancel</span>
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
                                        <span style={styles.fileTypesLabel}>.jpg or .png files accepted</span>
                                      </div>
                                    }
                                </div>
                            </div>
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
                                onClick={this.loadFromProp.bind(this)}
                            />
                        </div>
                        <div style={{marginTop: 20,}}>
                          <span style={{...styles.titleText, marginTop: 20,}}>
                              Admins
                          </span>
                        </div>
                        <div style={{marginTop: 10, marginBottom: 20,}}>
                            <ul style={{listStyle: 'none', paddingLeft: 0,}}>
                                {
                                    admins.map((admin, i) => (
                                        <li key={i}>
                                            <span className='text-large'>{`${admin.firstName} ${admin.lastName} (${admin.email})`}</span>
                                        </li>
                                    ))
                                }
                            </ul>
                        </div>
                        <div>
                          <span style={styles.addAdmin} onClick={() => {that.setState({adminFormShow: true, inviteSent: false, inviteeEmail: '', inviteeFirstName: '', inviteeLastName: '',})}}>
                            Add Another Admin
                          </span>
                        </div>
                        {
                            adminFormShow && !inviteSent &&
                            <div className='row' style={{marginBottom: 10, marginLeft: 5,}}>
                              <div style={{width: '25%', display: 'inline-block', marginRight: 10,}}>
                                <span>First Name</span>
                                <input
                                  type="text"
                                  style={styles.inputTitle}
                                  name="inviteeFirstName"
                                  onChange={this.handleInvite.bind(this)}
                                  value={inviteeFirstName}
                                />
                              </div>
                              <div style={{width: '25%', display: 'inline-block', marginRight: 10,}}>
                                <span>Last Name</span>
                                <input
                                  type="text"
                                  style={styles.inputTitle}
                                  name="inviteeLastName"
                                  onChange={this.handleInvite.bind(this)}
                                  value={inviteeLastName}
                                />
                              </div>
                              <div style={{width: '40%', display: 'inline-block', marginRight: 10,}}>
                                <span>Email</span>
                                <input
                                  type="text"
                                  style={styles.inputTitle}
                                  name="inviteeEmail"
                                  onChange={this.handleInvite.bind(this)}
                                  value={inviteeEmail}
                                />
                              </div>
                              <div>
                                    <button
                                        onClick={this.inviteAdmin.bind(this)}
                                        style={{...styles.uploadButton, backgroundColor:  Colors.link}}
                                    >
                                        Confirm
                                    </button>
                              </div>
                            </div>
                        }
                        {
                            adminFormShow && inviteSent &&
                            <div style={{marginTop: 10,}}>
                                <span className='text-large'><i>{`An email invitation has been sent to ${inviteeEmail}.`}</i></span>
                            </div>
                        }
                  </div>
                </div>

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
    addAdmin: {
        fontSize: 16,
        // marginLeft: 10,
        marginTop: 20,
        marginBottom: 10,
        color: Colors.link,
        cursor: 'pointer',
    },
}