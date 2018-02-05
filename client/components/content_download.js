import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import Axios from 'axios';
import {Helmet} from "react-helmet"
import firebase from 'firebase';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
// import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';
import { RadioGroup, RadioButton, ReversedRadioButton } from 'react-radio-buttons';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';

import Colors from '../styles/colors';
import { OrangeSubmitButton, TransparentShortSubmitButton } from '../components/buttons/buttons';
import {SoundwiseHeader} from '../components/soundwise_header';
import Footer from '../components/footer'
import {TextInputs} from '../helpers/texts';

export default class ContentDownload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      image: null,
      email: '',
      firstName: '',
      lastName: '',
      submitted: false,
      content: {},
    }
  }

  componentDidMount() {
    // url format: http://localhost:3000/content_download?image=idea-generation-workbook.png&content=idea-generation-workbook
    const params = new URLSearchParams(this.props.location.search);
    this.setState({
      image: params.get('image'),
      content: TextInputs[params.get('content')],
    });
  }

  componenetWillReceiveProps(nextProps) {
  }

  submit() {
    const {firstName, lastName, email, content} = this.state;
    const that = this;
    Axios.post('/api/add_emails', {
      emailListId: 2910467,
      emailAddressArr: [{firstName, lastName, email}]
    })
    .then(res => {
      that.setState({
        submitted: true,
      });
      window.open(content.link);
    })
    .catch(err => {
      console.log('error: ', err);
      alert(err);
    });
  }

  render() {
    const that = this;
    const {image, content, submitted} = this.state;
    return (
      <div>
        <SoundwiseHeader />
          <section className="padding-40px-tb xs-padding-50px-tb position-relative cover-background tz-builder-bg-image border-none hero-style9" id="hero-section11" data-img-size="(W)1920px X (H)800px" style={{backgroundColor:'#f8f6f2', height: 800}}>
              <div className="container position-relative" style={{}}>
                  <div className="row">
                      <div className='col-md-6 col-sm-6 col-xs-12 ' style={{}}>
                        <div className='center-col'>
                        <img src={`images/${image}`} style={{width: '80%'}}/>
                        </div>
                      </div>
                      <div className="col-md-6 col-sm-6 col-xs-12 builder-bg  xs-height-auto display-table xs-text-center" style={{height: 500}}>
                          <div className="display-table-cell-vertical-middle  no-padding-tb xs-no-padding-lr">
                              <div className=" title-small sm-title-small xs-title-small line-height-34 font-weight-600 tz-text margin-twelve-top sm-margin-six-bottom xs-margin-eleven-bottom sm-margin-nine-bottom">{content.subTitle1}</div>
                              <div className="alt-font title-extra-large-3 md-title-extra-large-3 sm-title-extra-large-3 xs-title-extra-large-2 margin-five-top margin-five-bottom width-90 md-width-100 sm-width-100 tz-text">{content.title}</div>
                              <div className=" title-small sm-title-small xs-title-small line-height-34 font-weight-600 tz-text  sm-margin-six-bottom xs-margin-eleven-bottom sm-margin-nine-bottom">{content.subTitle2}</div>
                          </div>
                      </div>
                  </div>
                  <div className = 'row'>
                      <div className='col-md-10 col-sm-12 col-xs-12 center-col' style={{}}>
                        <div className='col-md-4 col-sm-4 col-xs-12'>
                          <span style={styles.titleText}>First Name</span>
                          <input
                            type="text"
                            style={styles.inputTitle}
                            placeholder={''}
                            onChange={(e) => {that.setState({firstName: e.target.value})}}
                            value={that.state.firstName}
                          />
                        </div>
                        <div className='col-md-4 col-sm-4 col-xs-12'>
                          <span style={styles.titleText}>Last Name</span>
                          <input
                            type="text"
                            style={styles.inputTitle}
                            placeholder={''}
                            onChange={(e) => {that.setState({lastName: e.target.value})}}
                            value={that.state.lastName}
                          />
                        </div>
                        <div className='col-md-4 col-sm-4 col-xs-12'>
                          <span style={styles.titleText}>Email</span>
                          <input
                            type="text"
                            style={styles.inputTitle}
                            placeholder={''}
                            onChange={(e) => {that.setState({email: e.target.value})}}
                            value={that.state.email}
                          />
                        </div>
                      </div>
                  </div>
                  <div className='row'>
                    <div className='col-md-6 col-sm-6 col-xs-12 center-col' style={{marginTop: 25}}>
                      <OrangeSubmitButton
                        label="Submit"
                        onClick={!submitted && this.submit.bind(this) ||null}
                      />
                    </div>
                  </div>
              </div>
          </section>
        <Footer />
      </div>
    )
  }
}

const styles = {
  radioButton: {
    marginBottom: 16,
  },
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
    fontSize: 18,
    borderRadius: 4,
    marginBottom: 0,
  },
}
