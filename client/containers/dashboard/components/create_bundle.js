/**
 * Created by developer on 10.08.17.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import Axios from 'axios';
import { Link } from 'react-router-dom'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import Checkbox from 'material-ui/Checkbox';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import firebase from 'firebase';
import { Editor } from 'react-draft-wysiwyg';
import { convertFromRaw, convertToRaw, EditorState, convertFromHTML, createFromBlockArray, ContentState} from 'draft-js';
import Toggle from 'material-ui/Toggle';

import ImageCropModal from './image_crop_modal';
import {minLengthValidator, maxLengthValidator} from '../../../helpers/validators';
import {inviteListeners} from '../../../helpers/invite_listeners';
import ValidatedInput from '../../../components/inputs/validatedInput';
import Colors from '../../../styles/colors';
import { OrangeSubmitButton, TransparentShortSubmitButton } from '../../../components/buttons/buttons';

const subscriptionConfirmEmailHtml = `<div style="font-size:18px;"><p>Hi [subscriber first name],</p>
<p></p>
<p>Thanks for signing up to [title]. If you don't have the Soundwise mobile app installed on your phone, please access your soundcast by downloading the app first--</p>
<p><strong>
<span>iPhone user: Download the app </span>
<a href="https://itunes.apple.com/us/app/soundwise-learn-on-the-go/id1290299134?ls=1&mt=8"><span style="border-bottom: 2px solid currentColor;">here</span></a>.
</strong></p>
<p><strong>
<span>Android user: Download the app <span>
<a href="https://play.google.com/store/apps/details?id=com.soundwisecms_mobile_android"><span style="border-bottom: 2px solid currentColor;" >here</span></a>.
</strong></p><p></p>
<p>...and then sign in to the app with the same credential you used to subscribe to this soundcast.</p><p></p><p>If you've already installed the app, your new soundcast should be loaded automatically.</p>
</div>`;
const subscriptionConfirmationEmail = convertFromHTML(subscriptionConfirmEmailHtml);
const confirmationEmail = ContentState.createFromBlockArray(
  subscriptionConfirmationEmail.contentBlocks,
  subscriptionConfirmationEmail.entityMap
);

export default class CreateBundle extends Component {
  constructor (props) {
    super(props);

    this.state = {
      title: '',
      subscribers: '',
      short_description: '',
      long_description: EditorState.createEmpty(),
      imageURL: '',
      fileUploaded: false,
      landingPage: true,
      features: [''],
      hostName: '',
      hostBio: '',
      hostImageURL: 'https://s3.amazonaws.com/soundwiseinc/user_profile_pic_placeholder.png',
      hostImgUploaded: '',
      forSale: false,
      prices: [],
      modalOpen: false,
      paypalEmail: '',
      confirmationEmail: EditorState.createWithContent(confirmationEmail),
    };

    this.soundcastId = `${moment().format('x')}s`;
    this.fileInputRef = null;
    this.hostImgInputRef = null;
    this.currentImageRef = null;
    this.firebaseListener = null;
    this.addFeature = this.addFeature.bind(this);
  }

  _uploadToAws (file, hostImg) {
    const _self = this;
    let data = new FormData();
    const splittedFileName = file.type.split('/');
    const ext = (splittedFileName)[splittedFileName.length - 1];
    let fileName = '';
    if(hostImg) {
      fileName = `host-image-${moment().format('x')}.${ext}`;
    } else {
      fileName = `${moment().format('x')}.${ext}`;
    }
    data.append('file', file, fileName);
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

        if(hostImg) {
          _self.setState({hostImageURL: url});
        } else {
          _self.setState({imageURL: url});
        }
      })
      .catch(function (err) {
        // POST failed...
        console.log('ERROR upload to aws s3: ', err);
      });
  }

  setFileName (hostImg, e) {
        // console.log('this.fileInputRef.files: ', this.fileInputRef.files);
        if(hostImg) {
            // this._uploadToAws(this.hostImgInputRef.files[0], true);
            if(this.hostImgInputRef.files[0]) {
                this.setState({
                  hostImgUploaded: true,
                  hostImg: true,
                });
                this.currentImageRef = this.hostImgInputRef.files[0];
            }
        } else {
            // this._uploadToAws(this.fileInputRef.files[0], null)
            if (this.fileInputRef.files[0]) {
                this.setState({
                  fileUploaded: true,
                  hostImg: false,
                });
                this.currentImageRef = this.fileInputRef.files[0];
            }
        }

        const allowedFileTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif"];
        if(allowedFileTypes.indexOf(this.currentImageRef.type) < 0) {
          alert('Only .png or .jpeg files are accepted. Please upload a new file.');
          if(hostImg) {
            this.setState({
              hostImgUploaded: false,
            })
          } else {
            this.setState({
              fileUploaded: false,
            })
          }
          return;
        }
        this.handleModalOpen();
  }

  getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  submit (publish) {
    let { title, imageURL, subscribers, short_description,
      long_description, landingPage,
      features, hostName, hostBio, hostImageURL,
      forSale, prices, confirmationEmail} = this.state;
    if(title.length == 0) {
      alert('Please enter a bundle title before saving.');
      return;
    }
    if(short_description == 0) {
      alert('Please enter a short description for the bundle before saving.');
      return;
    }
    if(prices.length === 0) { //if pricing isn't specified, then this is a free soundcast
      prices = [{price: 'free'}];
    }
    const { userInfo, history } = this.props;
    // const host = [{hostName, hostBio, hostImageURL}];
    const that = this;

    // need to remove all spaces
    subscribers = subscribers.replace(/\s/g, '');

    const subscribersArr = subscribers.split(',');
    for(var i = subscribersArr.length -1; i >= 0; i--) {
      if (subscribersArr[i].indexOf('@') === -1) {
        subscribersArr.splice(i, 1);
      }
    }

    // send email invitations to invited listeners
    const subject = `${userInfo.publisher.name} invites you to subscribe to ${title}`;
   const content = `<p>Hi there!</p><p></p><p>${userInfo.publisher.name} has invited you to subscribe to <a href="${landingPage ? 'https://mysoundwise.com/soundcasts/'+that.soundcastId : ''}" target="_blank">${title}</a> on Soundwise. If you don't already have the Soundwise app on your phone--</p><p><strong>iPhone user: <strong>Download the app <a href="https://itunes.apple.com/us/app/soundwise-learn-on-the-go/id1290299134?ls=1&mt=8">here</a>.</p><p><strong>Android user: <strong>Download the app <a href="https://play.google.com/store/apps/details?id=com.soundwisecms_mobile_android">here</a>.</p><p></p><p>Once you have the app, simply log in using the email address that this email was sent to. Your new soundcast will be loaded automatically.</p><p>The Soundwise Team</p>`;
    inviteListeners(subscribersArr, subject, content, userInfo.publisher.name, userInfo.publisher.imageUrl);

    const invited = {};
    const inviteeArr = [];
    subscribersArr.map((email, i) => {
      let _email = email.replace(/\./g, "(dot)");
      _email = _email.trim().toLowerCase();
      invited[_email] = moment().format('X');  //invited listeners are different from subscribers. Subscribers are invited listeners who've accepted the invitation and signed up via mobile app
      inviteeArr[i] = _email;
    });

    this.firebaseListener = firebase.auth().onAuthStateChanged(function(user) {
          if (user && that.firebaseListener) {
              const creatorID = user.uid;
              const newSoundcast = {
                title,
                bundle: true,
                imageURL: imageURL ? imageURL : `https://dummyimage.com/300.png/${that.getRandomColor()}/ffffff&text=${encodeURIComponent(title)}`,
                creatorID,
                short_description,
                long_description: JSON.stringify(convertToRaw(long_description.getCurrentContent())),
                confirmationEmail: JSON.stringify(convertToRaw(confirmationEmail.getCurrentContent())),
                date_created: moment().format('X'),
                publisherID: userInfo.publisherID,
                invited,
                landingPage,
                features,
                hostName,
                hostBio,
                hostImageURL,
                forSale,
                prices,
                published: publish,
              };

              let _promises_1 = [
                // add soundcast
                firebase.database().ref(`soundcasts/${that.soundcastId}`).set(newSoundcast).then(
                  res => {
                    // console.log('success add soundcast: ', res);
                    return res;
                  },
                  err => {
                    console.log('ERROR add soundcast: ', err);
                    Promise.reject(err);
                  }
                ),
                // add soundcast to publisher
                firebase.database().ref(`publishers/${userInfo.publisherID}/soundcasts/${that.soundcastId}`).set(true).then(
                  res => {
                    // console.log('success add soundcast to publisher: ', res);
                    return res;
                  },
                  err => {
                    console.log('ERROR add soundcast to publisher: ', err);
                    Promise.reject(err);
                  }
                ),
                // add soundcast to admin
                firebase.database().ref(`users/${creatorID}/soundcasts_managed/${that.soundcastId}`).set(true).then(
                    res => {
                        // console.log('success add soundcast to admin.soundcasts_managed: ', res);
                        return res;
                    },
                    err => {
                        console.log('ERROR add soundcast to admin.soundcasts_managed: ', err);
                        Promise.reject(err);
                    }
                ),
                Axios.post('/api/soundcast', {
                  soundcastId: that.soundcastId,
                  publisherId: userInfo.publisherID,
                  title
                }).then(
                  res => {
                    return res;
                  }
                ).catch(
                  err => {
                    console.log('ERROR API post soundcast: ', err);
                    Promise.reject(err)
                  }
                )
              ];

              //add soundcast to admins
              let adminArr = Object.keys(userInfo.publisher.administrators);

              let _promises_2 = adminArr.map(adminId => {
                return firebase.database().ref(`users/${adminId}/soundcasts_managed/${that.soundcastId}`).set(true)
                  .then(
                    res => {
                      // console.log('success add soundcast to admin.soundcasts_managed: ', res);
                      return res;
                    },
                    err => {
                      console.log('ERROR add soundcast to admin.soundcasts_managed: ', err);
                      Promise.reject(err);
                    })
              });

              // let _promises = _promises_1.concat(_promises_2, _promises_3);
              let _promises = _promises_1.concat(_promises_2);
              Promise.all(_promises).then(
                res => {
                  console.log('completed adding soundcast');
                  alert('New bundle created.');
                  history.goBack();
                },
                err => {
                  console.log('failed to complete adding soundcast');
                }
              );
          } else {
              // alert('Soundcast saving failed. Please try again later.');
          }
    });
    this.firebaseListener && this.firebaseListener();
  }

  componentWillUnmount() {
      this.firebaseListener = null;
  }

  handleCheck() {
    const {landingPage} = this.state;
    this.setState({
      landingPage: !landingPage,
    })
  }

  setFeatures(i, event) {
    const features = [...this.state.features];
    features[i] = event.target.value;
    this.setState({
      features
    })
  }

  deleteFeature(i, event) {
    const features = [...this.state.features];
    if(features.length >= 2) {
      features.splice(i, 1);
    } else {
      features[0] = '';
    }
    this.setState({
      features
    })
  }

  addFeature() {
    const features = [...this.state.features];
    features.push('');
    this.setState({
      features
    })
  }

  handleChargeOption() {
    const {forSale} = this.state;
    const {userInfo} = this.props;

    if(!forSale) {
      if(!userInfo.publisher.stripe_user_id) {
        this.submit.bind(this, false);
        this.setState({
          paypalModalOpen: true,
        });
      } else {
        this.setState({
          forSale: !forSale,
          prices: [{paymentPlan: '', billingCycle: '', price: '0'}]
        })
      }
    } else {
      this.setState({
        forSale: !forSale,
        prices: [{price: 'free'}],
      })
    }
  }

  handlePaypalModalClose() {
    if(this.state.paypalModalOpen) {
      this.setState({
        paypalModalOpen: false,
      })
    }
  }

  handlePaypalInput() {
    const {paypalEmail, forSale} = this.state;
    const {userInfo} = this.props;
    firebase.database().ref(`publishers/${userInfo.publisherID}/paypalEmail`)
    .set(paypalEmail);
    this.setState({
      paypalModalOpen: false,
      forSale: !forSale,
      prices: [{paymentPlan: '', billingCycle: 'monthly', price: ''}],
    })
  }

  onEditorStateChange(editorState, confirmationEmail) {
      this.setState({
        long_description: editorState,
      })

  }

  onConfirmationStateChange(editorState) {
      this.setState({
        confirmationEmail: editorState,
      })
  }

  renderAdditionalInputs() {
    const featureNum = this.state.features.length;
    const {hostImageURL, long_description, hostImgUploaded, landingPage, forSale, prices, confirmationEmail} = this.state;
    const {userInfo} = this.props;
    const that = this;
    const actions = [
      <FlatButton
        label="OK"
        labelStyle={{color: Colors.mainOrange, fontSize: 17}}
        onClick={this.handlePaypalModalClose.bind(this)}
      />,
    ];

    return (
      <div style={{marginTop: 25, marginBottom: 25,}}>
        {/*What Listeners Will Get*/}
        <span style={{...styles.titleText, marginBottom: 5}}>
          What Listeners Will Get
                </span>
        <span>
          <i>
            {` (list the main benefits and features of this soundcast)`}
          </i>
                </span>
        <div style={{width: '100%', marginBottom: 30}}>
          {
            this.state.features.map((feature, i) => {
              return (
                <div key={i} style={styles.inputTitleWrapper}>
                  <span style={styles.titleText}>{`${i + 1}. `}</span>
                  <input
                    type="text"
                    style={{...styles.inputTitle, width: '85%'}}
                    placeholder={'e.g. Learn how to analyze financial statement with ease'}
                    onChange={this.setFeatures.bind(this,i)}
                    value={this.state.features[i]}
                  />
                  <span
                    style={{marginLeft: 5, cursor: 'pointer'}}
                    onClick={this.deleteFeature.bind(this, i)}
                  >
                    <i className="fa fa-times " aria-hidden="true"></i>
                  </span>
                  {
                    i == featureNum -1
                    &&
                    <span style={styles.addFeature} onClick={this.addFeature}>
                      Add
                    </span>
                    ||
                    null
                  }
                </div>
              )
            })
          }
        </div>

        {/*Long Description*/}
        <span style={{...styles.titleText, marginBottom: 5}}>
                    Long Description
                </span>
        <div>
          <Editor
            editorState = {long_description}
            editorStyle={styles.editorStyle}
            wrapperStyle={styles.wrapperStyle}
            onEditorStateChange={this.onEditorStateChange.bind(this)}
          />
        </div>

        {/*Pricing*/}
        { landingPage &&
        <div>
          <span style={styles.titleText}>Pricing</span>
          <div style={{marginTop: 15, marginBottom: 15,}}>
            <Toggle
              label="Charge for this bundle?"
              toggled={this.state.forSale}
              onClick={this.handleChargeOption.bind(this)}
              thumbSwitchedStyle={styles.thumbSwitched}
              trackSwitchedStyle={styles.trackSwitched}
              style={{fontSize: 20, width: '50%'}}
            />
            <Dialog
              title={`Hold on, ${userInfo.firstName}! Please set up payout first. `}
              actions={actions}
              modal={true}
              open={this.state.paypalModalOpen}
              onRequestClose={this.handlePaypalModalClose}
            >
              <div style={{fontSize: 17,}}>
                <span>You need a payout account so that we could send you your sales proceeds. Please save this soundcast, and go to publisher setting to enter your payout method, before setting up pricing.</span>
              </div>
            </Dialog>
          </div>
          {
            forSale &&
            <div style={{width: '100%,'}}>
              {
                prices.map((price, i) => (
                  <div key={i} className='' style={{marginBottom: 10}}>
                    <div style={{width: '100%'}}>
                      <span style={styles.titleText}>{`${i + 1}. `}</span>
                      <div style={{width: '45%', display: 'inline-block', marginRight: 10,}}>
                        <span>Payment Plan Name</span>
                        <input
                          type="text"
                          style={styles.inputTitle}
                          name="paymentPlan"
                          placeholder='e.g. 3 day access, monthly subscription, etc'
                          onChange={this.handlePriceInputs.bind(this, i)}
                          value={prices[i].paymentPlan}
                        />
                      </div>
                      <div style={{width: '25%', display: 'inline-block', marginRight: 10,}}>
                        <span>Billing</span>
                        <select
                          type="text"
                          style={styles.inputTitle}
                          name="billingCycle"
                          onChange={this.handlePriceInputs.bind(this, i)}
                          value={prices[i].billingCycle}
                        >
                          <option value='one time'>one time purchase</option>
                          <option value='rental'>one time rental</option>
                          <option value='monthly'>monthly subscription</option>
                          <option value='quarterly'>quarterly subscription</option>
                          <option value='annual'>annual subscription</option>

                        </select>
                      </div>
                      <div style={{width: '20%', display: 'inline-block',}}>
                        <span>Price</span>
                        <div>
                          <span style={{fontSize: 18}}>{`$ `}</span>
                          <input
                            type="text"
                            style={{...styles.inputTitle, width: '85%'}}
                            name="price"
                            placeholder={''}
                            onChange={this.handlePriceInputs.bind(this, i)}
                            value={prices[i].price}
                          />
                        </div>
                      </div>
                      <span
                        style={{marginLeft: 5, cursor: 'pointer', fontSize:20}}
                        onClick={this.deletePriceOption.bind(this, i)}>
                                      <i className="fa fa-times " aria-hidden="true"></i>
                      </span>
                    </div>
                    {
                      prices[i].billingCycle == 'rental' &&
                      <div className='col-md-12' style={{marginTop: 10, marginBottom: 15, }}>
                        <div className='col-md-4 col-md-offset-6' style={{marginRight: 10,}}>
                          <span>Rental period</span>
                          <div>
                            <input
                              type="text"
                              style={{...styles.inputTitle, width: '70%'}}
                              name="rentalPeriod"
                              placeholder={'2'}
                              onChange={this.handlePriceInputs.bind(this, i)}
                              value={prices[i].rentalPeriod}
                            />
                            <span style={{fontSize: 18,}}>{` days`}</span>
                          </div>
                        </div>
                      </div>
                      || null
                    }
                  </div>
                ) )
              }
              <div
                onClick={this.addPriceOption.bind(this)}
                style={styles.addFeature}
              >
                Add another price option
              </div>
            </div>
          }
        </div>
        }

      </div>
    )

  }

  handlePriceInputs(i, e) {
    let prices = [...this.state.prices];
    prices[i][e.target.name] = e.target.value;
    this.setState({
      prices
    })
  }

  addPriceOption() {
    let prices = [...this.state.prices];
    const price = {
      paymentPlan: '',
      billingCycle: 'one time',
      price: '0'
    }
    prices.push(price);
    this.setState({
      prices
    })
  }

  deletePriceOption(i) {
    let prices = [...this.state.prices];
    if(prices.length > 1) {
      prices.splice(i, 1);
    } else {
      prices[0] = {
        paymentPlan: '',
        billingCycle: 'monthly',
        price: ''
      }
    }
    this.setState({
      prices
    })
  }

  handleModalOpen() {
    this.setState({
      modalOpen: true,
    })
  }

  handleModalClose() {
    this.setState({
      modalOpen: false,
    });
    if(this.state.hostImg) {
      this.setState({
        hostImgUploaded: false,
      });
      document.getElementById('upload_hidden_cover_2').value = null;
    } else {
      this.setState({
        fileUploaded: false,
      });
      document.getElementById('upload_hidden_cover').value = null;
    }
  }

  uploadViaModal(fileBlob, hostImg) {
    this.setState({
      fileCropped: true,
      modalOpen: false,
    });
    if(hostImg) {
      this.setState({
        hostImgUploaded: true,
      })
    } else {
      this.setState({
        fileUploaded: true,
      })
    }
    this._uploadToAws(fileBlob, hostImg);
  }

  render() {
    const { imageURL, title, subscribers, fileUploaded,landingPage, modalOpen, hostImg } = this.state;
    const { userInfo, history } = this.props;
    const that = this;

    return (
      <MuiThemeProvider >
        <div className='padding-30px-tb'>
          <ImageCropModal
            open={modalOpen}
            handleClose={this.handleModalClose.bind(this)}
            upload={this.uploadViaModal.bind(this)}
            hostImg={hostImg}
            file={this.currentImageRef}
          />
          <div className='padding-bottom-20px'>
                    <span className='title-medium '>
                        Create A Multi-Soundcast Bundle
                    </span>
          </div>
          <div className="col-lg-10 col-md-11 col-sm-12 col-xs-12">
            {/*The landing page*/}
            <div style={{marginTop: 15, marginBottom: 15}}>
              <Toggle
                label="Add a public landing page for this bundle"
                toggled={this.state.landingPage}
                onClick={this.handleCheck.bind(this)}
                thumbSwitchedStyle={styles.thumbSwitched}
                trackSwitchedStyle={styles.trackSwitched}
                style={{fontSize: 20, width: '60%'}}
              />
            </div>
            {landingPage &&
            <div style={{marginBottom: 20, fontSize: 20}}>
              <span>The landing page will be published at </span>
              <span >
                <a
                  target="_blank"
                  style={{color: Colors.mainOrange}}
                  href={`https://mysoundwise.com/soundcasts/${this.soundcastId}`}>
                  {`https://mysoundwise.com/soundcasts/${this.soundcastId}`}
                            </a>
                        </span>
            </div>}

            {/*Title*/}
            <span style={styles.titleText}>Bundle Title</span>
            <span style={{...styles.titleText, color: 'red'}}>*</span>
            <span style={{fontSize: 17}}><i> (60 characters max)</i></span>
            <ValidatedInput
              type="text"
              styles={styles.inputTitle}
              wrapperStyles={styles.inputTitleWrapper}
              placeholder={'e.g. The Insight Meditation Masterclass'}
              onChange={(e) => {this.setState({title: e.target.value})}}
              value={this.state.title}
              validators={[minLengthValidator.bind(null, 1), maxLengthValidator.bind(null, 60)]}
            />

            {/*Short Description*/}
            <span style={styles.titleText}>
              Short Description
            </span>
            <span style={{...styles.titleText, color: 'red'}}>*</span>
            <span style={{fontSize: 17}}>
              <i> (300 characters max)</i>
            </span>

            <div style={styles.inputTitleWrapper}>
              <textarea
                type="text"
                style={styles.inputDescription}
                placeholder={'A short description of this bundle'}
                onChange={(e) => {this.setState({short_description: e.target.value})}}
                value={this.state.short_description}
              />
            </div>

            {/*Soundcast cover art*/}
            <div style={{marginBottom: 30, marginTop: 30,}} className='row'>
              <div className='col-md-3'>
                <div style={styles.image}>
                  <img src={imageURL} />
                </div>
              </div>
              <div className='col-md-9'>
                <div style={styles.loaderWrapper}>
                  <div style={{...styles.titleText, marginLeft: 10}}>
                      Bundle cover art
                  </div>
                  <div style={{...styles.inputFileWrapper, marginTop: 0}}>
                    <input
                      type="file"
                      name="upload"
                      id="upload_hidden_cover"
                      accept="image/*"
                      onChange={this.setFileName.bind(this, null)}
                      style={styles.inputFileHidden}
                      ref={input => this.fileInputRef = input}
                    />
                    {
                      fileUploaded
                      &&
                      <div>
                        <span>{this.fileInputRef.files[0].name}</span>
                        <span style={styles.cancelImg}
                            onClick={() => {
                              that.setState({fileUploaded: false, imageURL: ''});
                              document.getElementById('upload_hidden_cover').value = null;
                            }}>Cancel</span>
                      </div>
                      ||
                      <div>
                        <button
                          onClick={() => {document.getElementById('upload_hidden_cover').click();}}
                          style={{...styles.uploadButton, backgroundColor:  Colors.link}}
                        >
                          Upload
                        </button>
                        <div style={styles.fileTypesLabel}><span>(jpg or png files accepted; square image, recommended at least 800px by 800px)</span>
                        </div>
                      </div>
                    }
                  </div>
                </div>
              </div>
            </div>
            {this.renderAdditionalInputs()}

            {/*Confirmation email*/}
            <div style={{borderTop: '0.3px solid #9b9b9b', paddingTop: 25, borderBottom: '0.3px solid #9b9b9b', paddingBottom: 25,}}>
              <div>
                <span style={styles.titleText}>
                  Subsciption Confirmation Message
                </span>
                <Editor
                  editorState = {this.state.confirmationEmail}
                  editorStyle={styles.editorStyle}
                  wrapperStyle={styles.wrapperStyle}
                  onEditorStateChange={this.onConfirmationStateChange.bind(this)}
                />
              </div>
            </div>

            {/*Bubmission buttons*/}
            <div className='row'>
              <div className="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                  <OrangeSubmitButton
                      label="Save Draft"
                      styles={{backgroundColor: Colors.link, borderColor: Colors.link}}
                      onClick={this.submit.bind(this, false)}
                  />
              </div>
              <div className="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                <OrangeSubmitButton
                  label="Publish"
                  onClick={this.submit.bind(this, true)}
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
      </MuiThemeProvider>
    );
  }
};

CreateBundle.propTypes = {
  userInfo: PropTypes.object,
  history: PropTypes.object,
};



const styles = {
  titleText: {
    fontSize: 20,
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
    fontSize: 18,
    borderRadius: 4,
    marginBottom: 0,
  },
  inputDescription: {
    height: 100,
    fontSize: 18,
    borderRadius: 4,
    marginTop: 10,
    marginBottom: 20,
    resize: 'vertical',
    overflow: 'auto',
  },
  editorStyle: {
    padding: '5px',
    fontSize: 16,
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
    // float: 'left',
    backgroundColor: Colors.mainWhite,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.lightGrey,
  },
  hostImage: {
    width: 100,
    height: 100,
    // float: 'left',
    marginLeft: 10,
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
    // width: 'calc(100% - 133px)',
    // float: 'left',
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
    fontSize: 20,
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
    // overflow: 'hidden',
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
    fontSize: 18,
    border: 0,
    marginTop: 5
  },
  cancelImg: {
    color: Colors.link,
    marginLeft: 20,
    fontSize: 16,
    cursor: 'pointer'
  },
  fileTypesLabel: {
    fontSize: 16,
    marginLeft: 0,
    display: 'block',
  },
  radioButton: {
    marginBottom: 16,
  },
  thumbSwitched: {
    backgroundColor: Colors.link,
  },
  trackSwitched: {
    backgroundColor: Colors.link,
  },
};
