import React from 'react';
import Popup_form from './popup_form';

const Popup = () => (
  <div data-ao-template="subscribe8" type="text/x-tmpl" data-ao-popup-on="leave:once window">
    <div className="ao-collapse ao-size-5 ao-block ao-font-lato ao-text-white" data-ao-animaze-show="fadein:0 0.3s easeIn;blackout;resize:100% 100%;move:fixed 0 0" data-ao-animaze-hide="fadeout:0 0.3s;blackout: false"
      data-ao-blackout-animaze-show="fadein:0 0.5s 95 easeOut;bgColor:#FF8300" data-ao-blackout-animaze-hide="fadeout:0 0.5s" data-ao-blackout-hide-main="true">
      <a href="#" className="ao-close" data-ao-animaze-on-popup="delay:0.1s;fadein:- 0.5s" data-ao-hide-popup="true">
        <i className="fa fa-times" />
      </a>
      <div className="ao-text-center" data-ao-animaze-on-popup="fitscale;move:absolute center middle" data-ao-animaze-on-popupresize="fitscale;move:absolute center middle">
        <h1 className=" sm-title-extra-large-2 alt-font xs-title-extra-large-2 title-extra-large-4 font-weight-700 text-white letter-spacing-minus-2 tz-text margin-five-bottom sm-margin-six-bottom margin-lr-auto"
          data-selector=".tz-text" data-ao-animaze-on-popup="delay:0.1s;fadein:- 0.0s">Hey! Can we send you free stuff?</h1>
        <div className="ao-text-light ao-offs-md ao-text-bold" data-ao-animaze-on-popup="delay:0.1s;fadein:- 0.0s">Be the first to know when Soundwise is released and get one audio course for FREE</div>
        <div className="ao-block-center ao-size-5 col-lg-9 col-md-8 col-sm-8 center-col text-center">
          <Popup_form></Popup_form>
        </div>
      </div>
    </div>
  </div>
);

export default Popup;