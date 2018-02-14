import React from 'react'
import { BrowserRouter as Router, Route, Link } from 'react-router-dom'

const Footer = (props) => (
  <footer id="footer-section11" className="padding-30px-tb bg-dark-gray builder-bg">
    <div className="container">
      <div className="row equalize" style={{display: 'flex', alignItems: 'flex-start'}}>

        <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12 xs-text-center xs-margin-four-bottom display-table">
          <div className="display-table-cell-vertical-middle">
            {
              props.soundcastID &&
              <Link to={`/soundcasts/${props.soundcastID}`} className="inner-link"><img src="/images/soundwiselogo_white.svg" data-img-size="(W)163px X (H)40px" alt="Soundwise Logo" /></Link>
              ||
              <img src="/images/soundwiselogo_white.svg" data-img-size="(W)163px X (H)40px" alt="Soundwise Logo" />
            }
          </div>
        </div>
        <div className="col-lg-3 col-md-3 col-sm-3 col-xs-12 xs-text-center xs-margin-four-bottom display-table text-left">
          <ul className='link' style={{float: 'right'}}>
            <li className="text-medium margin-seven-bottom font-weight-600 text-white tz-text xs-margin-one-half-bottom">Resources</li>
            <li className="tz-text text-medium-gray">
              <Link to='/wave_video'>
                <span className='text-light-gray tz-text'>Sound Wave Video Maker</span>
              </Link>
            </li>
            <li className="tz-text text-medium-gray">
              <Link to='/blog'>
                <span className='text-light-gray tz-text'>Articles</span>
              </Link>
            </li>
          </ul>
        </div>
        <div className="col-lg-3 col-md-3 col-sm-3 col-xs-12 xs-text-center xs-margin-four-bottom display-table text-left">
          <ul className='link' style={{float: 'right'}}>
            <li className="text-medium margin-seven-bottom font-weight-600 text-white tz-text xs-margin-one-half-bottom">Useful Links</li>
            <li className="tz-text text-medium-gray">
              <Link to='/pricing'>
                <span className="text-light-gray tz-text">Plans and Pricing</span>
              </Link>
            </li>
            <li className="tz-text text-medium-gray">
              <Link to='/terms'>
                <span className="text-light-gray tz-text">Terms of Use</span>
              </Link>
            </li>
            <li className="tz-text text-medium-gray">
              <Link to='/privacy'>
                <span className="text-light-gray tz-text">Privacy Policy</span>
              </Link>
            </li>
          </ul>
        </div>
        <div className="col-lg-3 col-md-3 col-sm-3 col-xs-12 text-right xs-text-center display-table">
          <div className="display-table-cell-vertical-middle">
            <span className="text-light-gray tz-text">© 2017 Soundwise Inc.</span>
          </div>
        </div>

      </div>
    </div>
  </footer>
);

export default Footer