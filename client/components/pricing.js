import React from 'react'
import { Link } from 'react-router-dom'
import Colors from '../styles/colors';

const Pricing = (props) => (
  <div>
    <section className="xs-padding-30px-tb bg-white builder-bg" id="pricing-table5" style={{ paddingBottom: 80, paddingTop: 30,}}>
        <div className="container">
            <div className="row">
                <div className="col-md-12 col-sm-12 col-xs-12 text-center">
                    <h2 className="section-title-large sm-section-title-medium xs-section-title-large text-dark-gray font-weight-700 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text">START SPREADING YOUR KNOWLEDGE IN AUDIO</h2>
                    <div className="text-extra-large width-60 margin-lr-auto md-width-70 sm-width-100 tz-text margin-three-bottom">How many subscribers will you have? *</div>
                    <div className="text-large width-60 margin-lr-auto md-width-70 sm-width-100 tz-text margin-thirteen-bottom xs-margin-nineteen-bottom">(* Don't worry. Just pick one to start. We'll automatically move you across pricing tiers as your subscriber size changes.)</div>
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
                            <h3 className="title-extra-large-2 sm-title-extra-large-2 alt-font tz-text" style={{color: Colors.mainGrey, marginTop: 0, marginBottom: 0}}>$0</h3>
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
                            <div className="text-medium text-white alt-font tz-text no-margin-bottom font-weight-400"> <p className="no-margin-bottom">Build an audience</p>  </div>
                        </li>
                        <li className="tz-border">
                            <h3 className="title-extra-large-2 sm-title-extra-large-2 alt-font tz-text" style={{color: Colors.link, marginTop: 0, marginBottom: 0}}>$29</h3>
                            <span className="tz-text alt-font">PER MONTH</span>
                        </li>
                        <li className="tz-border"><span className="tz-text">Mobile and web interfaces</span></li>
                        <li className="tz-border"><span className="tz-text">Unlimited uploading and storage</span></li>
                        <li className="tz-border"><span className="tz-text">Optional landing pages</span></li>
                        <li className="tz-border"><span className="tz-text">Advanced listener analytics & tracking</span></li>
                        <li className="tz-border"><span className="tz-text">Mobile push notifications</span></li>
                        <li>
                            <Link className="col-md-6 center-col btn-extra-large btn  bg-white text-dark-gray no-letter-spacing" to="/signup/admin" style={{backgroundColor: Colors.link, width: '80%'}}><span className="tz-text">GET PLUS</span></Link>
                        </li>
                    </ul>
                </div>
                <div className="col-xs-12 col-sm-4 col-md-4 xs-margin-bottom-20px sm-margin-bottom-20px" >
                    <ul className="pricing-box-style5 text-center bg-white builder-bg list-style-none">
                        <li className="tz-background-color" style={{backgroundColor: Colors.mainOrange}}>
                            <h5 className="text-white font-weight-600 title-large tz-text alt-font" style={{marginTop: 0, marginBottom: 0}}>PRO</h5>
                            <div className="text-medium text-white alt-font tz-text no-margin-bottom"> <p className="no-margin-bottom"> Make it a career</p> </div>
                            <div style={{display: 'flex', justifyContent: 'center'}}>
                              <div className="popular position-absolute bg-yellow border-radius-2 alt-font text-small2 builder-bg tz-text">MOST POPULAR</div>
                            </div>
                        </li>
                        <li className="tz-border">
                            <h3 className="sm-title-extra-large-2 title-extra-large-2 alt-font tz-text" style={{color: Colors.mainOrange, marginTop: 0, marginBottom: 0}}>$79</h3>
                            <span className="tz-text alt-font">PER MONTH</span>
                        </li>
                        <li className="tz-border"><span className="tz-text">Mobile and web interfaces</span></li>
                        <li className="tz-border"><span className="tz-text">Unlimited uploading and storage</span></li>
                        <li className="tz-border"><span className="tz-text">Optional landing pages</span></li>
                        <li className="tz-border"><span className="tz-text">Advanced listener analytics & tracking</span></li>
                        <li className="tz-border"><span className="tz-text">Mobile push notifications</span></li>
                        <li>
                            <Link className="col-md-6 center-col btn-extra-large btn text-dark-gray no-letter-spacing" to="/signup/admin" style={{backgroundColor: Colors.mainOrange, width: '80%'}}><span className="tz-text">GET PRO</span></Link>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </section>
  </div>
)

export default Pricing