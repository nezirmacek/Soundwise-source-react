
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import Axios from 'axios';
import firebase from 'firebase';
import { Editor } from 'react-draft-wysiwyg';
import { convertFromRaw, convertToRaw, EditorState, convertFromHTML, createFromBlockArray, ContentState } from 'draft-js';
// import Toggle from 'material-ui/Toggle';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Toggle from 'react-toggle'
import "react-toggle/style.css"

import {minLengthValidator, maxLengthValidator} from '../../../helpers/validators';
import ValidatedInput from '../../../components/inputs/validatedInput';
import ImageCropModal from './image_crop_modal';
import Colors from '../../../styles/colors';
import { OrangeSubmitButton, TransparentShortSubmitButton } from '../../../components/buttons/buttons';

const subscriptionConfirmEmailHtml = `<div style="font-size:18px;"><p>Hi [subscriber first name],</p>
<p></p>
<p>Thanks for subscribing to [soundcast title]. If you don't have the Soundwise mobile app installed on your phone, please access your soundcast by downloading the app first--</p>
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

export default class EditSoundcast extends Component {
    constructor (props) {
        super(props);

        this.state = {
            title: '',
            imageURL: '',
            short_description: '',
            long_description: EditorState.createEmpty(),
            subscribed: {},
            fileUploaded: false,
            landingPage: false,
            features: [''],
            hostName: '',
            hostBio: '',
            hostImageURL: '',
            hostImg: false,
            hostImgUploaded: '',
            forSale: false,
            prices: [],
            modalOpen: false,
            confirmationEmail: EditorState.createWithContent(confirmationEmail),
        };

        this.fileInputRef = null;
        this.hostImgInputRef = null;
        this.currentImageRef = null;
        this.addFeature = this.addFeature.bind(this);
        this.onEditorStateChange = this.onEditorStateChange.bind(this);
    }

    componentDidMount() {
      let editorState, confirmEmailEditorState;
      const { id, soundcast } = this.props.history.location.state;
      const {title, subscribed, imageURL, short_description,
             long_description, landingPage,
             features, hostName, hostBio, hostImageURL,
             forSale, prices, confirmationEmail} = soundcast;
      // const {title0, subscribed0, imageURL0, short_description0,
      //        long_description0, landingPage0,
      //        features0, hostName0, hostBio0, hostImageURL0,
      //        forSale0, prices0, } = this.state;

      if(long_description) {
        let contentState = convertFromRaw(JSON.parse(long_description));
        editorState = EditorState.createWithContent(contentState);
      } else {
        editorState = EditorState.createEmpty();
      }

      if(confirmationEmail) {
        let confirmEmailText = convertFromRaw(JSON.parse(confirmationEmail.replace('[soundcast title]', title)));
        confirmEmailEditorState = EditorState.createWithContent(confirmEmailText);
      } else {
        confirmEmailEditorState = this.state.confirmationEmail;
      }
      this.setState({
        title,
        imageURL: imageURL ? imageURL : null,
        short_description,
        landingPage,
        hostName: hostName ? hostName : null,
        hostBio: hostBio ? hostBio : null,
        hostImageURL: hostImageURL ? hostImageURL : null,
        forSale: forSale ? forSale : false,
        long_description: editorState ,
        confirmationEmail: confirmEmailEditorState,
      })

      if(subscribed) {
        this.setState({
            subscribed
        })
      }
      if(features) {
        this.setState({
          features
        })
      }
      if(prices) {
        this.setState({
          prices
        })
      }
    }

    _uploadToAws (file, hostImg) {
        const _self = this;
        const { id } = this.props;
        let data = new FormData();
        const splittedFileName = file.type.split('/');
        const ext = (splittedFileName)[splittedFileName.length - 1];
        let fileName = '';
        if(hostImg) {
          fileName = `${id}-host-image-${moment().format('x')}.${ext}`;
        } else {
          fileName = `${id}-${moment().format('x')}.${ext}`;
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
          return;
        }
        this.handleModalOpen();
    }

    submit (publish) {
        const { title, imageURL, subscribed, short_description,
                long_description, landingPage,
                features, hostName, hostBio, hostImageURL,
                forSale, prices, confirmationEmail} = this.state;
        const { userInfo, history } = this.props;
        const that = this;
        const creatorID = firebase.auth().currentUser.uid;

        const editedSoundcast = {
            title,
            short_description,
            long_description: JSON.stringify(convertToRaw(long_description.getCurrentContent())),
            confirmationEmail: JSON.stringify(convertToRaw(confirmationEmail.getCurrentContent())),
            imageURL,
            creatorID,
            publisherID: userInfo.publisherID,
            subscribed,
            landingPage,
            features,
            hostName,
            hostBio,
            hostImageURL,
            forSale,
            prices,
            published: publish,
        };

        // edit soundcast in database
            firebase.database().ref(`soundcasts/${this.props.history.location.state.id}`)
            .once('value')
            .then(snapshot => {
              const changedSoundcast = Object.assign({}, snapshot.val(), editedSoundcast);

              firebase.database().ref(`soundcasts/${that.props.history.location.state.id}`)
              .set(changedSoundcast)
              .then(
                res => {
                      Axios.post('/api/soundcast', {
                        soundcastId: that.props.history.location.state.id,
                        publisherId: that.props.userInfo.publisherID,
                        title
                      })
                      .then(alert('Soundcast changes are saved.'));
                },
                err => {
                    console.log('ERROR add soundcast: ', err);
                }
              );
            });
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
        if(!forSale) {
            this.setState({
                forSale: !forSale,
                prices: [{paymentPlan: '', billingCycle: 'monthly', price: ''}]
            })
        } else {
            this.setState({
                forSale: !forSale,
                prices: []
            })
        }
    }

    onEditorStateChange(editorState) {
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
        const {long_description, hostImageURL, hostImgUploaded, landingPage, forSale, prices} = this.state;
        const that = this;
        return (
            <div style={{marginTop: 25, marginBottom: 25,}}>
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
                                      onClick={this.deleteFeature.bind(this, i)}>
                                    <i className="fa fa-times " aria-hidden="true"></i>
                                  </span>
                                </div>
                            )
                        })
                    }
                    <div>
                      <span style={styles.addFeature} onClick={this.addFeature}>
                        Add
                      </span>
                    </div>
                </div>
                <span style={{...styles.titleText, marginBottom: 5}}>
                    Long Description
                </span>
                <div>
                    <Editor
                      editorState = {long_description}
                      editorStyle={styles.editorStyle}
                      wrapperStyle={styles.wrapperStyle}
                      onEditorStateChange={this.onEditorStateChange}
                    />
                </div>
                <div>
                    <span style={styles.titleText}>
                        Host/Instructor Name
                    </span>
                    <div style={{...styles.inputTitleWrapper, width: '35%'}}>
                      <input
                          type="text"
                          style={styles.inputTitle}
                          placeholder={''}
                          onChange={(e) => {this.setState({hostName: e.target.value})}}
                          value={this.state.hostName}
                      />
                    </div>
                </div>
                <div>
                    <div >
                        <span style={styles.titleText}>
                            Host/Instructor Bio
                        </span>
                    </div>
                    <textarea
                        style={styles.inputDescription}
                        placeholder={'Who will be teaching?'}
                        onChange={(e) => {this.setState({hostBio: e.target.value})}}
                        value={this.state.hostBio}
                    >
                    </textarea>
                </div>
                <div style={{height: 150, width: '100%'}}>
                    <div style={{marginBottom: 10}}>
                        <span style={styles.titleText}>
                            Host/Instructor Profile Picture
                        </span>
                    </div>
                    <div style={{...styles.hostImage, backgroundImage: `url(${hostImageURL})`}}>

                    </div>
                    <div style={styles.loaderWrapper}>
                        <div style={{...styles.inputFileWrapper, marginTop: 0}}>
                            <input
                                type="file"
                                name="upload"
                                id="upload_hidden_cover_2"
                                accept="image/*"
                                onChange={this.setFileName.bind(this, true)}
                                style={styles.inputFileHidden}
                                ref={input => this.hostImgInputRef = input}
                            />
                            {
                              hostImgUploaded &&
                              <div>
                                <span>{this.hostImgInputRef.files[0].name}</span>
                                <span style={styles.cancelImg}
                                  onClick={() => {
                                    that.setState({hostImgUploaded: false, hostImageURL: ''});
                                    document.getElementById('upload_hidden_cover_2').value = null;
                                  }}>Cancel</span>
                              </div>
                              ||
                              !hostImgUploaded &&
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
                { landingPage &&
                    <div>
                      <span style={styles.titleText}>Pricing</span>
                      <div style={{marginTop: 15, marginBottom: 25, display: 'flex', alignItems: 'center'}}>
                          <Toggle
                            id='charging-status'
                            aria-labelledby='charging-label'
                            // label="Charge subscribers for this soundcast?"
                            checked={this.state.forSale}
                            onChange={this.handleChargeOption.bind(this)}
                            // thumbSwitchedStyle={styles.thumbSwitched}
                            // trackSwitchedStyle={styles.trackSwitched}
                            // style={{fontSize: 20, width: '50%'}}
                          />
                          <span id='charging-label' style={{fontSize: 20, fontWeight: 800, marginLeft: '0.5em'}}>Charge subscribers for this soundcast</span>
                      </div>
                      {
                        forSale &&
                      <div style={{width: '100%,'}}>
                        {
                            prices.map((price, i) => {
                                const priceTag = price.price == 'free' ? 0 : price.price;
                                return (
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
                                            value={priceTag}
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
                                )
                            } )
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
            billingCycle: 'monthly',
            price: ''
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
        fileCropped: false,
      })
    }

    handleModalClose() { // image upload is cancelled
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
        const { imageURL, title, subscribed, fileUploaded, landingPage, modalOpen, hostImg } = this.state;
        const { userInfo, history, id } = this.props;
        const that = this;

        return (
          <MuiThemeProvider >
            <div className='padding-30px-tb' style={{}}>
              <ImageCropModal
                open={modalOpen}
                handleClose={this.handleModalClose.bind(this)}
                upload={this.uploadViaModal.bind(this)}
                hostImg={hostImg}
                file={this.currentImageRef}
              />
              <div className='padding-bottom-20px'>
                  <span className='title-medium '>
                      Edit Soundcast
                  </span>
              </div>
              <div className=''
                style={{marginTop: 15, marginBottom: 25, display: 'flex', alignItems: 'center'}}>
                  <Toggle
                    id='landing-status'
                    aria-labelledby='landing-label'
                    checked={this.state.landingPage}
                    onChange={this.handleCheck.bind(this)}
                  />
                  <span id='landing-label' style={{fontSize: 20, fontWeight: 800, marginLeft: '0.5em'}}>Add a public landing page for this soundcast</span>
              </div>
              {landingPage &&
                <div style={{marginBottom: 20, fontSize: 20}}>
                    <span>The landing page will be published at </span>
                    <span >
                      <a
                        target="_blank"
                        style={{color: Colors.mainOrange}}
                        href={`https://mysoundwise.com/soundcasts/${id}`}>
                        {`https://mysoundwise.com/soundcasts/${id}`}
                      </a>
                    </span>
                </div>}
                <div className="row">
                    <div className="col-lg-9 col-md-9 col-sm-12 col-xs-12">
                        <div style={{marginBottom: 15}}>
                          <span style={styles.titleText}>Title</span>
                          <span style={{...styles.titleText, color: 'red'}}>*</span>
                          <span style={{fontSize: 17, marginBottom: 15,}}><i> (60 characters max)</i></span>
                        </div>
                        <ValidatedInput
                            type="text"
                            styles={styles.inputTitle}
                            wrapperStyle={styles.inputTitleWrapper}
                            placeholder={'Soundcast title'}
                            onChange={(e) => {this.setState({title: e.target.value})}}
                            value={this.state.title}
                            validators={[minLengthValidator.bind(null, 1), maxLengthValidator.bind(null, 60)]}
                        />
                        <div style={{marginTop: 20,}}>
                          <span style={{...styles.titleText, marginTop: 20,}}>
                              Short Description
                          </span>
                          <span style={{...styles.titleText, color: 'red'}}>*</span>
                          <span style={{fontSize: 17}}>
                              <i> (300 characters max)</i>
                          </span>
                        </div>
                        <div style={styles.inputTitleWrapper}>
                          <textarea
                              type="text"
                              style={styles.inputDescription}
                              placeholder={'A short description of this soundcast (300 characters max)'}
                              onChange={(e) => {this.setState({short_description: e.target.value})}}
                              value={this.state.short_description}
                          />
                        </div>
                        <div style={{height: 150,}}>
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
                                        accept="image/*"
                                        onChange={this.setFileName.bind(this, null)}
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
                        {
                            this.renderAdditionalInputs()
                        }
                        {/*Invitations*/}
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
                                  onClick={() => {
                                    history.goBack();
                                  }}
                              />
                          </div>
                        </div>
                    </div>
                </div>
            </div>
          </MuiThemeProvider>
        );
    }
};

EditSoundcast.propTypes = {
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
        marginTop: 5,
    },
    inputDescription: {
        height: 80,
        backgroundColor: Colors.mainWhite,
        width: '100%',
        fontSize: 18,
        borderRadius: 4,
        marginTop: 10,
        marginBottom: 20
    },
    editorStyle: {
        padding: '5px',
        borderRadius: 4,
        fontSize: 16,
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