import React from 'react';

const Footer = () => (
  <footer id="footer-section11" className="padding-30px-tb bg-dark-gray builder-bg">
    <div className="container">
      <div className="row equalize">
        { /* caption */ }
        <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12 xs-text-center xs-margin-four-bottom display-table">
          <div className="display-table-cell-vertical-middle">
            <a href="#home" className="inner-link"><img src="/images/soundwiselogo_white.svg" data-img-size="(W)163px X (H)40px" alt="Soundwise Logo" /></a>
          </div>
        </div>
        { /* end caption */ }
        { /* caption */ }
        <div className="col-md-6 col-sm-6 col-xs-12 text-right xs-text-center display-table">
          <div className="display-table-cell-vertical-middle">
            <span className="text-light-gray tz-text">© 2017 Soundwise Inc.</span>
          </div>
        </div>
        { /* end caption */ }
      </div>
    </div>
  </footer>
);

export default Footer