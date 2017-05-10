import React from 'react';
import Bannerright from './bannerright';
import Smallimg from './smallimg';

const Banner = () => (
  <section id='intro' className="position-relative hero-section23 cover-background tz-builder-bg-image border-none xs-padding-top-30px hero-style23" data-img-size="(W)1920px X (H)1000px"
    style={ {  background: 'linear-gradient(rgba(0, 0, 0, 0.00784314), rgba(0, 0, 0, 0.00784314)), url("images/section2_background.png")'} } data-selector=".tz-builder-bg-image">
    <div className="container position-relative">
      <div className="row equalize xs-equalize-auto equalize-display-inherit two-column">
        { /* slider text */ }
        <div className="col-md-6 col-sm-6 col-xs-12 display-table pull-right xs-text-center" style={ {  height: 728} }>
          <div className="display-table-cell-vertical-middle" style={{color: 'black'}}>
            <h2 className="title-extra-large-4 md-title-extra-large-3 line-height-65 sm-title-extra-large alt-font xs-title-extra-large text-dark-gray margin-thirteen-bottom xs-margin-five-bottom tz-text"
              data-selector=".tz-text" id="ui-id-20" style={ {  backgroundColor: 'rgba(0, 0, 0, 0)',  fontSize: 60,  fontWeight: 500,  fontFamily: 'Montserrat, sans-serif',  textTransform: 'none',  borderRadius: 0} }>Build the skills for a life well lived...10 minutes at a time.</h2>
            <Bannerright></Bannerright>
            <div className="btn-dual">
              <a className="btn btn-large propClone bg-golden-yellow text-black xs-margin-ten-bottom xs-width-100" href="https://eepurl.com/cyNzD5" data-selector="a.btn, button.btn"
                style={ {} }><span className="tz-text" data-selector=".tz-text" style={ {} }>GET ADVANCE ACCESS</span></a>
            </div>
          </div>
        </div>
        { /* end slider text */ }
        { /* image */ }
        <Smallimg></Smallimg>
        { /* end image */ }
      </div>
    </div>
  </section>
);

export default Banner;