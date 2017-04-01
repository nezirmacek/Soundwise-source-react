import React from 'react';
import {Header} from './header';
import Banner from './banner';
import Feature_section from './feature_section';
import Testimonial from './testimonial';
import Media_mention from './media_mention';
import Callto_action from './callto_action';
import Footer from './footer';
import Popup from './popup';

const Page = () => (
  <div id="page" className="page ao-font-lato">
    <Header></Header>
    <Banner></Banner>
    <Feature_section></Feature_section>
    <Testimonial></Testimonial>
    <Media_mention></Media_mention>
    <Callto_action></Callto_action>
    <Footer></Footer>
    { /* Popup block start <subscribe8> */ }
    <Popup></Popup>
    { /* Window fake: takes content full size; used for animation, elements with 'window', 'document' position is moved to it */ }
    <div className="ao-window-fake" data-ao-animaze-resize="windowSize:min 100%" />
    <div id="fb-root" />
    { /* Popup block end */ }
  </div>
);

export default Page;