import React from 'react'
import { Link } from 'react-router-dom'

const Pricing = () => (
  <section className=" builder-bg xs-padding-30px-tb cover-background tz-builder-bg-image border-none" style={{background:`linear-gradient(rgba(0,0,0,0.1), rgba(247,107,28,0.3))`, paddingBottom: 80, paddingTop: 30}}>
      <div className="container">
          <div className="row">

              <div className="col-md-12 col-sm-12 col-xs-12 text-center">
                  <h2 className="section-title-large sm-section-title-medium xs-section-title-large text-dark-gray font-weight-600 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text">TRY IT FOR FREE FOR 30 DAYS</h2>
                  <div className="text-extra-large width-60 margin-lr-auto md-width-70 sm-width-100 tz-text margin-five-bottom xs-margin-five-bottom">No credit card required. Cancel anytime.</div>
              </div>

          </div>
          <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12 text-center">
                <h3 className="alt-font text-large text-dark-gray tz-text">PLANS START AT</h3>
                <div className="pricing-price  builder-bg">
                    <h4 className="title-extra-large-2 sm-title-extra-large-2 alt-font  tz-text" style={{color: '#61e1fb'}}>$39</h4>
                    <div className="text-large alt-font tz-text no-margin-bottom"> <p>PER MONTH</p> </div>
                </div>
              </div>
          </div>
          <div className="row margin-five-bottom xs-margin-five-bottom">
              <div className="col-md-4 col-sm-4 col-xs-12">
                  <ul className="list-style-none ">
                      <li className="position-relative padding-left-30px line-height-34 text-medium"><i className="fa fa-star-o text-dark-gray tz-icon-color position-left position-absolute icon-extra-small line-height-34"></i><span className="tz-text">Up to 50 subscribers</span></li>
                      <li className="position-relative padding-left-30px line-height-34 text-medium"><i className="fa fa-star-o text-dark-gray tz-icon-color position-left position-absolute icon-extra-small line-height-34"></i><span className="tz-text">Unlimited uploading and storage</span></li>

                  </ul>
              </div>
              <div className="col-md-4 col-sm-4 col-xs-12">
                  <ul className="list-style-none ">
                      <li className="position-relative padding-left-30px line-height-34 text-medium"><i className="fa fa-star-o text-dark-gray tz-icon-color position-left position-absolute icon-extra-small line-height-34"></i><span className="tz-text">Optional landing pages for your programs</span></li>
                      <li className="position-relative padding-left-30px line-height-34 text-medium"><i className="fa fa-star-o text-dark-gray tz-icon-color position-left position-absolute icon-extra-small line-height-34"></i><span className="tz-text">Mobile and web interfaces</span></li>
                  </ul>
              </div>
              <div className="col-md-4 col-sm-4 col-xs-12">
                  <ul className="list-style-none ">
                      <li className="position-relative padding-left-30px line-height-34 text-medium"><i className="fa fa-star-o text-dark-gray tz-icon-color position-left position-absolute icon-extra-small line-height-34"></i><span className="tz-text">Listener analytics & tracking</span></li>
                      <li className="position-relative padding-left-30px line-height-34 text-medium"><i className="fa fa-star-o text-dark-gray tz-icon-color position-left position-absolute icon-extra-small line-height-34"></i><span className="tz-text">Push notifications</span></li>
                  </ul>
              </div>
          </div>

          <div className="row">
            <div className="col-md-12 col-sm-12 col-xs-12 text-center">
              <Link to="/trial_request" className="btn-large btn text-dark-blue btn-3d" href="http://eepurl.com/cX2uof" style={{backgroundColor: '#F76B1C'}}><span className="tz-text">TRY IT FOR FREE</span></Link>
            </div>
          </div>

      </div>
  </section>

)

export default Pricing