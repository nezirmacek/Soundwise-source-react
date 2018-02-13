import React from 'react';
import { Link } from 'react-router-dom';
import Toggle from 'react-toggle';
import moment from 'moment';

import Colors from '../styles/colors';

const Pricing = (props) => (
  <div>
    <section className="xs-padding-30px-tb bg-white builder-bg" id="pricing-table5" style={{ paddingBottom: 80, paddingTop: 30,}}>
        <div className="container">
            <div className="row">
                <div className="col-md-12 col-sm-12 col-xs-12 text-center">
                    <h2 className="section-title-large sm-section-title-medium xs-section-title-large text-dark-gray font-weight-700 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text">START SPREADING YOUR KNOWLEDGE WITH AUDIO</h2>
                    <div className="title-small width-60 margin-lr-auto md-width-70 sm-width-100 tz-text margin-seven-bottom xs-margin-eleven-bottom">Build an engaged audience and make money from your knowledge using the fastest growing media format on the planet.</div>
                </div>
            </div>
            <div className='row ' style={{marginBottom: 25, display: 'flex', justifyContent: 'center'}}>
                <div style={{display: 'flex', alignItems: 'center'}}>
                    <span id='share-label' className='title-medium xs-title-medium ' style={{ fontWeight: 800, marginRight: '0.5em'}}>Monthly</span>
                    <Toggle
                      id='frequency'
                      icons={false}
                      aria-labelledby='share-label'
                      // label="Charge subscribers for this soundcast?"
                      checked={props.frequency == 'annual'}
                      onChange={props.changeFrequency}
                      // thumbSwitchedStyle={styles.thumbSwitched}
                      // trackSwitchedStyle={styles.trackSwitched}
                      // style={{fontSize: 20, width: '50%'}}
                    />
                    <span id='share-label' className='title-medium xs-title-medium ' style={{ fontWeight: 800, marginLeft: '0.5em'}}>Annual</span><span className='title-medium xs-title-medium ' style={{ marginLeft: '0.2em'}}>(save 40%)</span>
                </div>
            </div>
            <div className="row">
                <div className="col-xs-12 col-sm-4 col-md-4 xs-margin-bottom-20px sm-margin-bottom-20px" >
                    <ul className="pricing-box-style5 text-center bg-white builder-bg list-style-none">
                        <li className="tz-background-color" style={{backgroundColor: Colors.mainGrey}}>
                            <h5 className="text-white title-large font-weight-600 tz-text alt-font" style={{marginTop: 0, marginBottom: 0}}>Basic</h5>
                            <div className="text-medium text-white alt-font tz-text no-margin-bottom font-weight-600" style={{fontSize: 15}}> <span className="no-margin-bottom">Try it for fun</span>  </div>
                        </li>
                        <li className="tz-border">
                            <div className="title-extra-large-2 sm-title-extra-large-2 alt-font tz-text" style={{color: Colors.mainGrey, marginTop: 0, marginBottom: 0, fontWeight: 800}}>$0<span style={{fontWeight: 800, fontSize: 18}}> </span></div>
                            <span className="tz-text alt-font">FOREVER</span>
                            <div style={{marginTop: '1em'}}>
                              {
                                !props.isLoggedIn &&
                                <Link className="col-md-6 center-col  btn-extra-large btn bg-white text-dark-gray no-letter-spacing" to="/signup/admin" style={{width: '80%', backgroundColor: Colors.mainGrey}}><span className="tz-text">GET BASIC</span></Link>
                                ||
                                props.isLoggedIn && props.userInfo.publisher && (!props.userInfo.publisher.plan || props.userInfo.publisher.current_period_end < moment().format('X')) &&
                                <div className="col-md-6 center-col  btn-extra-large btn bg-white text-dark-gray no-letter-spacing" style={{width: '80%', backgroundColor: 'transparent'}}><span className="tz-text">Current Plan</span></div>
                                ||
                                props.isLoggedIn && props.userInfo.publisher && (props.userInfo.publisher.plan && props.userInfo.publisher.current_period_end > moment().format('X')) &&
                                <div className="col-md-6 center-col  btn-extra-large btn bg-white text-dark-gray no-letter-spacing" style={{width: '80%', backgroundColor: 'transparent'}}><span className="tz-text">Downgrade Plan</span></div>
                              }
                            </div>
                        </li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="far fa-star" style={{color: 'orange', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray"><strong>9% transaction fee</strong> on soundcast sales</span></li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="far  fa-check-circle" style={{color: 'green', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray">Unlimited audio storage and hosting</span></li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="far  fa-check-circle" style={{color: 'green', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray">Unlimited audience signup and number of soundcasts published</span></li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="far  fa-check-circle" style={{color: 'green', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray">Unlimited uploading of companion materials (PDFs, texts, images) </span></li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="far  fa-check-circle" style={{color: 'green', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray">Audio recording from dashboard</span></li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="far  fa-check-circle" style={{color: 'green', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray">One-click RSS feed generation</span></li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="far  fa-check-circle" style={{color: 'green', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray">One-click deployment of free soundcasts to iTunes and Google Play</span></li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="far  fa-check-circle" style={{color: 'green', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray">Automatic audio file metadata tagging (e.g. ID3 tags for mp3s)</span></li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="far  fa-check-circle" style={{color: 'green', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray">Optimized soundcast landing page and publisher “store front” page</span></li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="far  fa-check-circle" style={{color: 'green', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray">Private soundcasts</span></li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="far  fa-check-circle" style={{color: 'green', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray">Listener access to mobile and web apps</span></li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="far  fa-check-circle" style={{color: 'green', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray">Audience interaction on mobile app (e.g. likes and comments)</span></li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="far  fa-check-circle" style={{color: 'green', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray">Selling soundcasts as one-time purchase, limited-time rental, or subscription</span></li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="far  fa-check-circle" style={{color: 'green', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray">Payment processing</span></li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="far  fa-star" style={{color: 'orange', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray"><strong>Monthly payouts</strong> to bank account or debit card</span></li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="far fa-star" style={{color: 'orange', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray">Creating marketing video from audio clip and branding image <strong>(up to 1 min)</strong></span></li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="far fa-star" style={{color: 'orange', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray">Service support</span></li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="fas fa-ban" style={{color: 'red', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray">Audience names and email addresses (for audience who subscribed through Soundwise)</span></li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="fas fa-ban" style={{color: 'red', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray">Complete listener analytics for each individual (for audience who signed up through Soundwise)</span></li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="fas fa-ban" style={{color: 'red', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray">Comprehensive listener analytics for all audience, e.g. download numbers, traffic sources, geo distribution</span></li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="fas fa-ban" style={{color: 'red', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray">Sending group text messages and emails to subscribed audience </span></li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="fas fa-ban" style={{color: 'red', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray">Embedable audio player with audience signup form</span></li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="fas fa-ban" style={{color: 'red', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray">Automatic audio editing (leveling volume, trimming silence, adding intro/outro)</span></li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="fas fa-ban" style={{color: 'red', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray">Audio transcription powered by machine learning</span></li>
                        <li>
                          {
                            !props.isLoggedIn &&
                            <Link className="col-md-6 center-col  btn-extra-large btn bg-white text-dark-gray no-letter-spacing" to="/signup/admin" style={{width: '80%', backgroundColor: Colors.mainGrey}}><span className="tz-text">GET BASIC</span></Link>
                            ||
                            props.isLoggedIn && props.userInfo.publisher && (!props.userInfo.publisher.plan || props.userInfo.publisher.current_period_end < moment().format('X')) &&
                            <div className="col-md-6 center-col  btn-extra-large btn bg-white text-dark-gray no-letter-spacing" style={{width: '80%', backgroundColor: 'transparent'}}><span className="tz-text">Current Plan</span></div>
                            ||
                            props.isLoggedIn && props.userInfo.publisher && (props.userInfo.publisher.plan && props.userInfo.publisher.current_period_end > moment().format('X')) &&
                            <div className="col-md-6 center-col  btn-extra-large btn bg-white text-dark-gray no-letter-spacing" style={{width: '80%', backgroundColor: 'transparent'}}><span className="tz-text">Downgrade Plan</span></div>
                          }
                        </li>
                    </ul>
                </div>
                <div className="col-xs-12 col-sm-4 col-md-4 xs-margin-bottom-20px sm-margin-bottom-20px" >
                    <ul className="pricing-box-style5 text-center bg-white builder-bg list-style-none">
                        <li className="tz-background-color" style={{backgroundColor: Colors.link}}>
                            <h5 className="text-white title-large font-weight-600 tz-text alt-font" style={{marginTop: 0, marginBottom: 0}}>PLUS</h5>
                            <div className="text-medium text-white alt-font tz-text no-margin-bottom font-weight-600"> <div className="no-margin-bottom" style={{fontSize: 15}}>Build an audience</div>  </div>
                        </li>
                        <li className="tz-border">
                            <div className="title-extra-large-2 sm-title-extra-large-2 alt-font tz-text" style={{color: Colors.link, marginTop: 0, marginBottom: 0, fontWeight: 800}}>{`$${props.prices[props.frequency]['plus']}`}<span style={{color: Colors.link, fontWeight: 800, fontSize: 18}}>/month</span></div>
                            {
                                props.frequency == 'annual' &&
                                <div className="tz-text alt-font">{`SAVE $${(props.prices['monthly']['plus'] - props.prices['annual']['plus']) * 12} A YEAR`}</div>
                                ||
                                <div className="tz-text alt-font">&nbsp;</div>
                            }
                            <div style={{marginTop: '1em'}}>
                              {
                                props.isLoggedIn && props.userInfo.publisher && (props.userInfo.publisher.plan == 'plus' && props.userInfo.publisher.current_period_end > moment().format('X')) &&
                                <div className="col-md-6 center-col btn-extra-large btn  bg-white text-dark-gray no-letter-spacing"
                                   style={{backgroundColor: 'transparent', width: '80%'}}><span className="tz-text">Current Plan</span></div>
                                ||
                                props.isLoggedIn && props.userInfo.publisher && ((props.userInfo.publisher.plan == 'plus' && props.userInfo.publisher.current_period_end < moment().format('X')) || (props.userInfo.publisher.plan == 'pro') || !props.userInfo.publisher.plan) &&
                                <div className="col-md-6 center-col btn-extra-large btn  bg-white text-dark-gray no-letter-spacing"
                                  onClick={() => props.goToCheckout('plus', props.frequency, props.prices[props.frequency]['plus'])} style={{backgroundColor: Colors.link, width: '80%'}}><span className="tz-text">GET PLUS</span></div>
                                 ||
                                 !props.isLoggedIn &&
                                  <Link className="col-md-6 center-col  btn-extra-large btn bg-white text-dark-gray no-letter-spacing" to={`/signup/admin?frequency=${props.frequency}&plan=plus&price=${props.prices[props.frequency]['plus']}`} style={{width: '80%', backgroundColor: Colors.link}}><span className="tz-text">GET PLUS</span></Link>
                              }
                            </div>
                        </li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="far fa-star" style={{color: 'orange', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray"><strong>5% transaction fee</strong> on soundcast sales</span></li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="far  fa-check-circle" style={{color: 'green', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray">Unlimited audio storage and hosting</span></li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="far  fa-check-circle" style={{color: 'green', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray">Unlimited audience signup and number of soundcasts published</span></li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="far  fa-check-circle" style={{color: 'green', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray">Unlimited uploading of companion materials (PDFs, texts, images) </span></li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="far  fa-check-circle" style={{color: 'green', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray">Audio recording from dashboard</span></li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="far  fa-check-circle" style={{color: 'green', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray">One-click RSS feed generation</span></li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="far  fa-check-circle" style={{color: 'green', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray">One-click deployment of free soundcasts to iTunes and Google Play</span></li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="far  fa-check-circle" style={{color: 'green', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray">Automatic audio file metadata tagging (e.g. ID3 tags for mp3s)</span></li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="far  fa-check-circle" style={{color: 'green', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray">Optimized soundcast landing page and publisher “store front” page</span></li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="far  fa-check-circle" style={{color: 'green', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray">Private soundcasts</span></li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="far  fa-check-circle" style={{color: 'green', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray">Listener access to mobile and web apps</span></li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="far  fa-check-circle" style={{color: 'green', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray">Audience interaction on mobile app (e.g. likes and comments)</span></li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="far  fa-check-circle" style={{color: 'green', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray">Selling soundcasts as one-time purchase, limited-time rental, or subscription</span></li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="far  fa-check-circle" style={{color: 'green', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray">Payment processing</span></li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="far  fa-star" style={{color: 'orange', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray"><strong>Monthly payouts</strong> to bank account or debit card</span></li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="far fa-star" style={{color: 'orange', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray">Creating marketing video from audio clip and branding image <strong>(up to 15 mins)</strong></span></li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="far fa-star" style={{color: 'orange', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray"><strong>Priority</strong> service support</span></li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="far fa-check-circle" style={{color: 'green', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray">Audience names and email addresses (for audience who subscribed through Soundwise)</span></li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="far fa-check-circle" style={{color: 'green', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray">Complete listener analytics for each individual (for audience who signed up through Soundwise)</span></li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="far fa-check-circle" style={{color: 'green', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray">Comprehensive listener analytics for all audience, e.g. download numbers, traffic sources, geo distribution</span></li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="far fa-check-circle" style={{color: 'green', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray">Sending group text messages and emails to subscribed audience </span></li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="far fa-check-circle" style={{color: 'green', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray">Embedable audio player with audience signup form, coming soon</span></li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="far fa-check-circle" style={{color: 'green', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray">Automatic audio editing (leveling volume, trimming silence, adding intro/outro), coming soon</span></li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="far fa-check-circle" style={{color: 'green', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray">Audio transcription powered by machine learning, coming soon</span></li>
                        <li>
                          {
                            props.isLoggedIn && props.userInfo.publisher && (props.userInfo.publisher.plan == 'plus' && props.userInfo.publisher.current_period_end > moment().format('X')) &&
                            <div className="col-md-6 center-col btn-extra-large btn  bg-white text-dark-gray no-letter-spacing"
                               style={{backgroundColor: 'transparent', width: '80%'}}><span className="tz-text">Current Plan</span></div>
                            ||
                            props.isLoggedIn && props.userInfo.publisher && ((props.userInfo.publisher.plan == 'plus' && props.userInfo.publisher.current_period_end < moment().format('X')) || (props.userInfo.publisher.plan == 'pro') || !props.userInfo.publisher.plan) &&
                            <div className="col-md-6 center-col btn-extra-large btn  bg-white text-dark-gray no-letter-spacing"
                              onClick={() => props.goToCheckout('plus', props.frequency, props.prices[props.frequency]['plus'])} style={{backgroundColor: Colors.link, width: '80%'}}><span className="tz-text">GET PLUS</span></div>
                             ||
                             !props.isLoggedIn &&
                              <Link className="col-md-6 center-col  btn-extra-large btn bg-white text-dark-gray no-letter-spacing" to={`/signup/admin?frequency=${props.frequency}&plan=plus&price=${props.prices[props.frequency]['plus']}`} style={{width: '80%', backgroundColor: Colors.link}}><span className="tz-text">GET PLUS</span></Link>
                          }
                        </li>
                    </ul>
                </div>
                <div className="col-xs-12 col-sm-4 col-md-4 xs-margin-bottom-20px sm-margin-bottom-20px" >
                    <ul className="pricing-box-style5 text-center bg-white builder-bg list-style-none">
                        <li className="tz-background-color" style={{backgroundColor: Colors.mainOrange}}>
                            <h5 className="text-white font-weight-600 title-large tz-text alt-font" style={{marginTop: 0, marginBottom: 0}}>PRO</h5>
                            <div className="text-medium text-white alt-font tz-text no-margin-bottom font-weight-600" style={{fontSize: 15}}> <span className="no-margin-bottom"> Make it a career</span> </div>
                            <div style={{display: 'flex', justifyContent: 'center'}}>
                            </div>
                        </li>
                        <li className="tz-border">
                            <div className="title-extra-large-2 sm-title-extra-large-2 alt-font tz-text" style={{color: Colors.mainOrange, marginTop: 0, marginBottom: 0, fontWeight: 800}}>{`$${props.prices[props.frequency]['pro']}`}<span style={{color: Colors.mainOrange, fontWeight: 800, fontSize: 18}}>/month</span></div>
                            {
                                props.frequency == 'annual' &&
                                <div className="tz-text alt-font">{`SAVE $${(props.prices['monthly']['pro'] - props.prices['annual']['pro']) * 12} A YEAR`}</div>
                                ||
                                <div className="tz-text alt-font">&nbsp;</div>
                            }
                            <div style={{marginTop: '1em'}}>
                              {
                                props.isLoggedIn && props.userInfo.publisher && (props.userInfo.publisher.plan == 'pro' && props.userInfo.publisher.current_period_end > moment().format('X')) &&
                                <div className="col-md-6 center-col btn-extra-large btn  bg-white text-dark-gray no-letter-spacing"
                                   style={{backgroundColor: 'transparent', width: '80%'}}><span className="tz-text">Current Plan</span></div>
                                ||
                                props.isLoggedIn && props.userInfo.publisher && ((props.userInfo.publisher.plan == 'pro' && props.userInfo.publisher.current_period_end < moment().format('X')) || (props.userInfo.publisher.plan == 'plus') || !props.userInfo.publisher.plan) &&
                                <div className="col-md-6 center-col btn-extra-large btn  bg-white text-dark-gray no-letter-spacing"
                                  onClick={() => props.goToCheckout('plus', props.frequency, props.prices[props.frequency]['plus'])} style={{backgroundColor: Colors.mainOrange, width: '80%'}}><span className="tz-text">GET PRO</span></div>
                                 ||
                                 !props.isLoggedIn &&
                                  <Link className="col-md-6 center-col  btn-extra-large btn bg-white text-dark-gray no-letter-spacing" to={`/signup/admin?frequency=${props.frequency}&plan=pro&price=${props.prices[props.frequency]['pro']}`} style={{width: '80%', backgroundColor: Colors.mainOrange}}><span className="tz-text">GET PRO</span></Link>
                              }
                            </div>
                        </li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="far fa-star" style={{color: 'orange', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray"><strong>No transaction fee</strong> on soundcast sales</span></li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="far  fa-check-circle" style={{color: 'green', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray">Unlimited audio storage and hosting</span></li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="far  fa-check-circle" style={{color: 'green', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray">Unlimited audience signup and number of soundcasts published</span></li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="far  fa-check-circle" style={{color: 'green', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray">Unlimited uploading of companion materials (PDFs, texts, images) </span></li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="far  fa-check-circle" style={{color: 'green', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray">Audio recording from dashboard</span></li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="far  fa-check-circle" style={{color: 'green', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray">One-click RSS feed generation</span></li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="far  fa-check-circle" style={{color: 'green', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray">One-click deployment of free soundcasts to iTunes and Google Play</span></li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="far  fa-check-circle" style={{color: 'green', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray">Automatic audio file metadata tagging (e.g. ID3 tags for mp3s)</span></li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="far  fa-check-circle" style={{color: 'green', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray">Optimized soundcast landing page and publisher “store front” page</span></li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="far  fa-check-circle" style={{color: 'green', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray">Private soundcasts</span></li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="far  fa-check-circle" style={{color: 'green', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray">Listener access to mobile and web apps</span></li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="far  fa-check-circle" style={{color: 'green', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray">Audience interaction on mobile app (e.g. likes and comments)</span></li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="far  fa-check-circle" style={{color: 'green', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray">Selling soundcasts as one-time purchase, limited-time rental, or subscription</span></li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="far  fa-check-circle" style={{color: 'green', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray">Payment processing</span></li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="far  fa-star" style={{color: 'orange', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray"><strong>Instant payouts</strong> to bank account or debit card</span></li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="far fa-star" style={{color: 'orange', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray">Creating marketing video from audio clip and branding image <strong>(up to 15 mins)</strong></span></li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="far fa-star" style={{color: 'orange', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray"><strong>Priority</strong> service support and <strong>onboarding</strong></span></li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="far fa-check-circle" style={{color: 'green', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray">Audience names and email addresses (for audience who subscribed through Soundwise)</span></li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="far fa-check-circle" style={{color: 'green', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray">Complete listener analytics for each individual (for audience who signed up through Soundwise)</span></li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="far fa-check-circle" style={{color: 'green', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray">Comprehensive listener analytics for all audience, e.g. download numbers, traffic sources, geo distribution</span></li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="far fa-check-circle" style={{color: 'green', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray">Sending group text messages and emails to subscribed audience </span></li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="far fa-check-circle" style={{color: 'green', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray">Embedable audio player with audience signup form, coming soon</span></li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="far fa-check-circle" style={{color: 'green', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray">Automatic audio editing (leveling volume, trimming silence, adding intro/outro), coming soon</span></li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15, paddingRight: 5}}><i className="far fa-check-circle" style={{color: 'green', fontSize: 16}}></i><span style={{paddingLeft: 5}} className="text-medium text-dark-gray">Audio transcription powered by machine learning, coming soon</span></li>
                        <li>
                          {
                            props.isLoggedIn && props.userInfo.publisher && (props.userInfo.publisher.plan == 'pro' && props.userInfo.publisher.current_period_end > moment().format('X')) &&
                            <div className="col-md-6 center-col btn-extra-large btn  bg-white text-dark-gray no-letter-spacing"
                               style={{backgroundColor: 'transparent', width: '80%'}}><span className="tz-text">Current Plan</span></div>
                            ||
                            props.isLoggedIn && props.userInfo.publisher && ((props.userInfo.publisher.plan == 'pro' && props.userInfo.publisher.current_period_end < moment().format('X')) || (props.userInfo.publisher.plan == 'plus') || !props.userInfo.publisher.plan) &&
                            <div className="col-md-6 center-col btn-extra-large btn  bg-white text-dark-gray no-letter-spacing"
                              onClick={() => props.goToCheckout('plus', props.frequency, props.prices[props.frequency]['plus'])} style={{backgroundColor: Colors.mainOrange, width: '80%'}}><span className="tz-text">GET PRO</span></div>
                             ||
                             !props.isLoggedIn &&
                              <Link className="col-md-6 center-col  btn-extra-large btn bg-white text-dark-gray no-letter-spacing" to={`/signup/admin?frequency=${props.frequency}&plan=pro&price=${props.prices[props.frequency]['pro']}`} style={{width: '80%', backgroundColor: Colors.mainOrange}}><span className="tz-text">GET PRO</span></Link>
                          }
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </section>
  </div>
)

export default Pricing