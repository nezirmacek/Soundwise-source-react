import React from 'react';
import { Link } from 'react-router-dom';
import Toggle from 'react-toggle';

import Colors from '../styles/colors';

const Pricing = (props) => (
  <div>
    <section className="xs-padding-30px-tb bg-white builder-bg" id="pricing-table5" style={{ paddingBottom: 80, paddingTop: 30,}}>
        <div className="container">
            <div className="row">
                <div className="col-md-12 col-sm-12 col-xs-12 text-center">
                    <h2 className="section-title-large sm-section-title-medium xs-section-title-large text-dark-gray font-weight-700 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text">START SPREADING YOUR KNOWLEDGE IN AUDIO</h2>
                    <div className="title-medium width-60 margin-lr-auto md-width-70 sm-width-100 tz-text margin-thirteen-bottom xs-margin-nineteen-bottom">Description text.</div>
                </div>
            </div>
            <div className='row ' style={{marginBottom: 25, display: 'flex', justifyContent: 'center'}}>
                <div style={{display: 'flex', alignItems: 'center'}}>
                    <span id='share-label' style={{fontSize: 24, fontWeight: 800, marginRight: '0.5em'}}>Monthly</span>
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
                    <span id='share-label' style={{fontSize: 24, fontWeight: 800, marginLeft: '0.5em'}}>Annual</span><span style={{fontSize: 24, marginLeft: '0.2em'}}>(save 40%)</span>
                </div>
            </div>
            <div className="row">
                <div className="col-xs-12 col-sm-4 col-md-4 xs-margin-bottom-20px sm-margin-bottom-20px" >
                    <ul className="pricing-box-style5 text-center bg-white builder-bg list-style-none">
                        <li className="tz-background-color" style={{backgroundColor: Colors.mainGrey}}>
                            <h5 className="text-white title-large font-weight-600 tz-text alt-font" style={{marginTop: 0, marginBottom: 0}}>Basic</h5>
                            <div className="text-medium text-white alt-font tz-text no-margin-bottom font-weight-400"> <p className="no-margin-bottom">Try it for fun</p>  </div>
                        </li>
                        <li className="tz-border">
                            <div className="title-extra-large-2 sm-title-extra-large-2 alt-font tz-text" style={{color: Colors.mainGrey, marginTop: 0, marginBottom: 0, fontWeight: 800}}>$0<span style={{fontWeight: 800, fontSize: 18}}> </span></div>
                            <span className="tz-text alt-font">FOREVER</span>
                        </li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15}}><i className="far  fa-check-circle" style={{color: 'green'}}></i><span style={{paddingLeft: 15}} className="tz-text">Mobile and web interfaces</span></li>
                        <li className="tz-border"><span className="tz-text">Unlimited uploading and storage</span></li>
                        <li className="tz-border" style={{textAlign: 'left', paddingLeft: 15}}><i className="far  fa-times-circle" style={{color: 'red'}}></i><span style={{paddingLeft: 15}} className="tz-text">Optional landing pages</span></li>
                        <li className="tz-border"><span className="tz-text">Advanced listener analytics & tracking</span></li>
                        <li className="tz-border"><span className="tz-text">Mobile push notifications</span></li>
                        <li>
                            <Link className="col-md-6 center-col  btn-extra-large btn bg-white text-dark-gray no-letter-spacing" to="/signup/admin" style={{width: '80%', backgroundColor: Colors.mainGrey}}><span className="tz-text">GET BASIC</span></Link>
                        </li>
                    </ul>
                </div>
                <div className="col-xs-12 col-sm-4 col-md-4 xs-margin-bottom-20px sm-margin-bottom-20px" >
                    <ul className="pricing-box-style5 text-center bg-white builder-bg list-style-none">
                        <li className="tz-background-color" style={{backgroundColor: Colors.link}}>
                            <h5 className="text-white title-large font-weight-600 tz-text alt-font" style={{marginTop: 0, marginBottom: 0}}>PLUS</h5>
                            <div className="text-medium text-white alt-font tz-text no-margin-bottom font-weight-400"> <div className="no-margin-bottom">Build an audience</div>  </div>
                        </li>
                        <li className="tz-border">
                            <div className="title-extra-large-2 sm-title-extra-large-2 alt-font tz-text" style={{color: Colors.link, marginTop: 0, marginBottom: 0, fontWeight: 800}}>{`$${props.prices[props.frequency]['plus']}`}<span style={{color: Colors.link, fontWeight: 800, fontSize: 18}}>/month</span></div>
                            {
                                props.frequency == 'annual' &&
                                <div className="tz-text alt-font">{`SAVE $${(props.prices['monthly']['plus'] - props.prices['annual']['plus']) * 12} A YEAR`}</div>
                                ||
                                <div className="tz-text alt-font">&nbsp;</div>
                            }
                        </li>
                        <li className="tz-border"><span className="tz-text">Mobile and web interfaces</span></li>
                        <li className="tz-border"><span className="tz-text">Unlimited uploading and storage</span></li>
                        <li className="tz-border"><span className="tz-text">Optional landing pages</span></li>
                        <li className="tz-border"><span className="tz-text">Advanced listener analytics & tracking</span></li>
                        <li className="tz-border"><span className="tz-text">Mobile push notifications</span></li>
                        <li>
                            <div className="col-md-6 center-col btn-extra-large btn  bg-white text-dark-gray no-letter-spacing"
                              onClick={() => props.goToCheckout('plus', props.frequency, props.prices[props.frequency]['plus'])} style={{backgroundColor: Colors.link, width: '80%'}}><span className="tz-text">GET PLUS</span></div>
                        </li>
                    </ul>
                </div>
                <div className="col-xs-12 col-sm-4 col-md-4 xs-margin-bottom-20px sm-margin-bottom-20px" >
                    <ul className="pricing-box-style5 text-center bg-white builder-bg list-style-none">
                        <li className="tz-background-color" style={{backgroundColor: Colors.mainOrange}}>
                            <h5 className="text-white font-weight-600 title-large tz-text alt-font" style={{marginTop: 0, marginBottom: 0}}>PRO</h5>
                            <div className="text-medium text-white alt-font tz-text no-margin-bottom"> <p className="no-margin-bottom"> Make it a career</p> </div>
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
                        </li>
                        <li className="tz-border"><span className="tz-text">Mobile and web interfaces</span></li>
                        <li className="tz-border"><span className="tz-text">Unlimited uploading and storage</span></li>
                        <li className="tz-border"><span className="tz-text">Optional landing pages</span></li>
                        <li className="tz-border"><span className="tz-text">Advanced listener analytics & tracking</span></li>
                        <li className="tz-border"><span className="tz-text">Mobile push notifications</span></li>
                        <li>
                            <div className="col-md-6 center-col btn-extra-large btn text-dark-gray no-letter-spacing"
                               onClick={() => props.goToCheckout('pro', props.frequency, props.prices[props.frequency]['pro'])}
                               style={{backgroundColor: Colors.mainOrange, width: '80%'}}><span className="tz-text">GET PRO</span></div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </section>
  </div>
)

export default Pricing