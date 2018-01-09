import React, {Component} from 'react';
// import { bindActionCreators } from 'redux';
// import { connect } from 'react-redux';
import { Route, Link, Switch } from 'react-router-dom';
import firebase from 'firebase';
import moment from 'moment';
import Axios from 'axios';
import Dots from 'react-activity/lib/Dots';

import Footer from './footer';
import {SoundwiseHeader} from './soundwise_header';
import Colors from '../styles/colors';

export default class Publisher extends Component {
    constructor (props) {
        super(props);

        this.state = {
          publisher: '',
          soundcasts: [],
          loading: false,
        };
    }

    async componentDidMount() {
      const publisherID = this.props.match.params.id;
      const {history} = this.props;
      const that = this;
      const soundcasts = [];

      const publisher = await firebase.database().ref('publishers/' + publisherID).once('value');

      if(!publisher.val()) {
        history.push('/notfound');
      } else {
        const soundcastsArr = Object.keys(publisher.val().soundcasts);
        this.setState({
          publisher: publisher.val(),
          loading: true,
        });

        let soundcast;
        for(let i = 0; i < soundcastsArr.length; i++) {
          soundcast = await firebase.database().ref(`soundcasts/${soundcastsArr[i]}`).once('value');
          if(soundcast.val().landingPage && soundcast.val().published) {
            soundcasts.push({...soundcast.val(), id: soundcastsArr[i]});
          }
        }
        this.setState({
          soundcasts,
          loading: false,
        });
      }
    }

    render() {
      const {publisher} = this.state;

      return (
        <div>
            <SoundwiseHeader />
            <section className="padding-70px-tb bg-white builder-bg xs-padding-60px-tb" id="feature-section14">
                <div className="container">
                    <div className="row margin-five-bottom" >
                        <div className="col-md-9 col-sm-10 col-xs-12 center-col  ">
                          <div className='col-md-4 col-sm-6 col-xs-12 xs-padding-bottom-15px'
                            style={{display: 'flex', justifyContent: 'center'}}>
                              <div alt={`${publisher.name}`}
                                   className="img-round-160"
                                   style={{backgroundImage: `url(${publisher.imageUrl})`}}>
                              </div>
                          </div>
                          <div className='col-md-8 col-sm-6 col-xs-12' style={{textAlign: 'center'}}>
                            <div className="col-md-12 section-title-medium sm-section-title-medium xs-section-title-large text-dark-gray font-weight-600 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text">
                                {this.state.publisher.name}
                            </div>
                            <div className='col-md-12 social social-icon-color' style={{marginTop: '1em', marginBottom: '1em'}}>
                              {
                                publisher.website &&
                                <a className='margin-eight-right'>
                                  <i className="icon-small sm-icon-extra-small fa fa-link tz-icon-color"></i>
                                </a> || null
                              }
                              {
                                publisher.facebook &&
                                <a className='margin-eight-right'>
                                  <i className="icon-small sm-icon-extra-small fa fa-facebook tz-icon-color"></i>
                                </a> || null
                              }
                              {
                                publisher.twitter &&
                                <a className='margin-eight-right'>
                                  <i className="icon-small sm-icon-extra-small fa fa-twitter tz-icon-color"></i>
                                </a> || null
                              }
                              {
                                publisher.linkedin &&
                                <a className='margin-eight-right'>
                                  <i className="icon-small sm-icon-extra-small fa fa-linkedin tz-icon-color"></i>
                                </a>
                              }
                              {
                                publisher.instagram &&
                                <a className='margin-eight-right'>
                                  <i className="icon-small sm-icon-extra-small fa fa-instagram tz-icon-color"></i>
                                </a>
                              }
                            </div>
                            <div className='tz-text text-medium col-md-12'>
                              <span>{publisher.publisherInfo}</span>
                            </div>
                          </div>
                        </div>
                    </div>
                    {
                      this.state.loading &&
                      <div className='col-md-12' style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '1em'}}>
                          <Dots style={{display: 'flex'}} color="#727981" size={32} speed={1}/>
                      </div> || null
                    }
                    <div className='col-md-12' style={{borderTop: 'solid 0.05em #f4f2f2', paddingTop: 45}}>
                      {
                        this.state.soundcasts.map((soundcast, i) => {
                          let price = soundcast.prices[0].price;
                          price = Number(price) == 0 ? 'free' : price;
                          const pre = soundcast.prices.length > 1 ? 'From ' : '';
                          let post = '';
                          if(soundcast.prices[0].billingCycle == 'monthly') {
                            post = ' / month';
                          } else if(soundcast.prices[0].billingCycle == 'quarterly') {
                            post = ' / month';
                            price = Math.floor(price / 3 *100) / 100;
                          } else if(soundcast.prices[0].billingCycle == 'annual') {
                            post = ' / month';
                            price = Math.floor(price.price / 12 *100) / 100;
                          }
                          return (
                            <div key={i} className="col-md-4 col-sm-6 col-xs-12 padding-five  xs-padding-nineteen">
                              <Link to={`/soundcasts/${soundcast.id}`}>
                                <div className="blog-post">
                                    <div className="blog-image margin-twenty-bottom sm-margin-ten-bottom">
                                        <img className="img100" alt="" src={soundcast.imageURL}/>
                                    </div>
                                    <div className="post-details">
                                        <div className="tz-text text-dark-gray  title-large sm-title-large font-weight-800 display-block margin-ten-bottom xs-margin-five-bottom">{soundcast.title}</div>
                                        <div className="tz-text text-dark-gray title-medium sm-title-medium  display-block margin-ten-bottom xs-margin-five-bottom" style={{fontWeight: 800}}>
                                          {`${pre}${price == 'free' ? '' : '$'}${price}${post}`}
                                        </div>
                                        <div className="text-medium tz-text"><p>{soundcast.short_description}</p></div>
                                    </div>
                                </div>
                              </Link>
                            </div>
                          )
                        })
                      }
                    </div>
                </div>
            </section>
            <div style={{bottom: 0, width: '100%', position: this.state.soundcasts.length > 0 ? 'static': 'absolute'}}>
              <Footer />
            </div>
        </div>
      )
    }
};

const styles = {
    footer: {
        // position: 'fixed',
        bottom: 0,
        width: '100%',
    }
};