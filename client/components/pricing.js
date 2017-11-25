import React from 'react'
import { Link } from 'react-router-dom'
import Colors from '../styles/colors';

const Pricing = () => (
  <div>
    <section className="xs-padding-30px-tb bg-white builder-bg" id="pricing-table5" style={{background:`linear-gradient(rgba(0,0,0,0.1), rgba(247,107,28,0.3))`, paddingBottom: 80, paddingTop: 30,}}>
        <div className="container">
            <div className="row">
                <div className="col-md-12 col-sm-12 col-xs-12 text-center">
                    <h2 className="section-title-large sm-section-title-medium xs-section-title-large text-dark-gray font-weight-700 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text">START SPREADING YOUR KNOWLEDGE IN AUDIO</h2>
                    <div className="text-extra-large width-60 margin-lr-auto md-width-70 sm-width-100 tz-text margin-three-bottom">How many subscribers will you have? *</div>
                    <div className="text-large width-60 margin-lr-auto md-width-70 sm-width-100 tz-text margin-thirteen-bottom xs-margin-nineteen-bottom">(* Don't worry. Just pick one to start. We'll automatically move you across pricing tiers as your subscriber size changes.)</div>
                </div>
            </div>
            <div className="row">
                <div className="col-xs-12 col-sm-6 col-md-3 xs-margin-bottom-20px sm-margin-bottom-20px" >
                    <ul className="pricing-box-style5 text-center bg-white builder-bg list-style-none">
                        <li className="tz-background-color" style={{backgroundColor: Colors.link}}>
                            <h5 className="text-white title-small font-weight-600 tz-text alt-font">0 - 50</h5>
                            <div className="text-small text-white alt-font tz-text no-margin-bottom font-weight-400"> <p className="no-margin-bottom">SUBSCRIBERS</p>  </div>
                        </li>
                        <li className="tz-border">
                            <h3 className="title-extra-large sm-title-extra-large alt-font tz-text" style={{color: Colors.link}}>FREE</h3>
                            <span className="tz-text alt-font">FOREVER</span>
                        </li>
                        <li className="tz-border"><span className="tz-text">Mobile and web interfaces</span></li>
                        <li className="tz-border"><span className="tz-text">Unlimited uploading and storage</span></li>
                        <li className="tz-border"><span className="tz-text">Optional landing pages</span></li>
                        <li className="tz-border"><span className="tz-text">Advanced listener analytics & tracking</span></li>
                        <li className="tz-border"><span className="tz-text">Mobile push notifications</span></li>
                        <li>
                            <Link className="btn-small btn border-2-dark-gray bg-white text-dark-gray no-letter-spacing" to="/signup/admin"><span className="tz-text">GET STARTED</span></Link>
                        </li>
                    </ul>
                </div>
                <div className="col-xs-12 col-sm-6 col-md-3 xs-margin-bottom-20px sm-margin-bottom-20px" >
                    <ul className="pricing-box-style5 text-center bg-white builder-bg list-style-none">
                        <li className="tz-background-color" style={{backgroundColor: Colors.link}}>
                            <h5 className="text-white title-small font-weight-600 tz-text alt-font">50 - 100</h5>
                            <div className="text-small text-white alt-font tz-text no-margin-bottom font-weight-400"> <p className="no-margin-bottom">SUBSCRIBERS</p>  </div>
                        </li>
                        <li className="tz-border">
                            <h3 className="title-extra-large sm-title-extra-large alt-font tz-text" style={{color: Colors.link}}>$29</h3>
                            <span className="tz-text alt-font">PER MONTH</span>
                        </li>
                        <li className="tz-border"><span className="tz-text">Mobile and web interfaces</span></li>
                        <li className="tz-border"><span className="tz-text">Unlimited uploading and storage</span></li>
                        <li className="tz-border"><span className="tz-text">Optional landing pages</span></li>
                        <li className="tz-border"><span className="tz-text">Advanced listener analytics & tracking</span></li>
                        <li className="tz-border"><span className="tz-text">Mobile push notifications</span></li>
                        <li>
                            <Link className="btn-small btn border-2-dark-gray bg-white text-dark-gray no-letter-spacing" to="/signup/admin"><span className="tz-text">GET STARTED</span></Link>
                        </li>
                    </ul>
                </div>
                <div className="col-xs-12 col-sm-6 col-md-3 xs-margin-bottom-20px sm-margin-bottom-20px" >
                    <ul className="pricing-box-style5 text-center bg-white builder-bg list-style-none">
                        <li className="tz-background-color" style={{backgroundColor: Colors.mainOrange}}>
                            <h5 className="text-white font-weight-600 title-small tz-text alt-font">100-1K</h5>
                            <div className="text-small text-white alt-font tz-text no-margin-bottom"> <p className="no-margin-bottom"> SUBSCRIBERS</p> </div>
                            <div style={{display: 'flex', justifyContent: 'center'}}>
                              <div className="popular position-absolute bg-yellow border-radius-2 alt-font text-small2 builder-bg tz-text">MOST POPULAR</div>
                            </div>
                        </li>
                        <li className="tz-border">
                            <h3 className="sm-title-extra-large title-extra-large alt-font tz-text" style={{color: Colors.mainOrange}}>$69</h3>
                            <span className="tz-text alt-font">PER MONTH</span>
                        </li>
                        <li className="tz-border"><span className="tz-text">Mobile and web interfaces</span></li>
                        <li className="tz-border"><span className="tz-text">Unlimited uploading and storage</span></li>
                        <li className="tz-border"><span className="tz-text">Optional landing pages</span></li>
                        <li className="tz-border"><span className="tz-text">Advanced listener analytics & tracking</span></li>
                        <li className="tz-border"><span className="tz-text">Mobile push notifications</span></li>
                        <li>
                            <Link className="btn-small btn text-white no-letter-spacing" to="/signup/admin" style={{backgroundColor: Colors.mainOrange}}><span className="tz-text">GET STARTED</span></Link>
                        </li>
                    </ul>
                </div>
                <div className="col-xs-12 col-sm-6 col-md-3 xs-margin-bottom-20px sm-margin-bottom-20px" >
                    <ul className="pricing-box-style5 text-center bg-white builder-bg list-style-none">
                        <li className="tz-background-color" style={{backgroundColor: Colors.link}}>
                            <h5 className="text-white title-small font-weight-600 tz-text alt-font">1K - 3K</h5>
                            <div className="text-small text-white alt-font tz-text no-margin-bottom font-weight-400"> <p className="no-margin-bottom">SUBSCRIBERS</p>  </div>
                        </li>
                        <li className="tz-border">
                            <h3 className="title-extra-large sm-title-extra-large alt-font tz-text" style={{color: Colors.link}}>$99</h3>
                            <span className="tz-text alt-font">PER MONTH</span>
                        </li>
                        <li className="tz-border"><span className="tz-text">Mobile and web interfaces</span></li>
                        <li className="tz-border"><span className="tz-text">Unlimited uploading and storage</span></li>
                        <li className="tz-border"><span className="tz-text">Optional landing pages</span></li>
                        <li className="tz-border"><span className="tz-text">Advanced listener analytics & tracking</span></li>
                        <li className="tz-border"><span className="tz-text">Mobile push notifications</span></li>
                        <li>
                            <Link className="btn-small btn border-2-dark-gray bg-white text-dark-gray no-letter-spacing" to="/signup/admin"><span className="tz-text">GET STARTED</span></Link>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="row">
                <div className='col-md-12 text-center margin-eight-top' style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <span style={{ paddingRight: 15}} className="section-title-medium xs-title-medium  tz-text">Have a bigger audience?</span>
                    <a className="btn-large btn text-white no-letter-spacing" href="mailto:support@mysoundwise.com" style={{borderColor: Colors.mainOrange, borderWidth: 2}}><span style={{color: Colors.mainOrange}} className="tz-text">Get a custom quote</span></a>

                </div>
            </div>
        </div>
    </section>
  </div>
)

export default Pricing