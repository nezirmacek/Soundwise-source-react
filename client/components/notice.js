import React from 'react'
import { withRouter } from 'react-router'
import {SoundwiseHeader} from './soundwise_header'
import Footer from './footer'

const _Notice = (props) => (
  <div>
  <SoundwiseHeader />
  <section className=" bg-white builder-bg xs-padding-60px-tb" id="contact-section2 border-none" style={{paddingBottom: '30px', paddingTop: '110px', boderBottom: '0px'}}>
    <div className='container  text-dark-gray border-none' style={{fontSize: '18px'}}>
      <h3 className="section-title-medium text-dark-gray font-weight-500 alt-font margin-three-bottom display-block sm-margin-nine-bottom xs-margin-five-bottom tz-text" style={{textAlign: 'center', lineHeight: '150%'}}>
        {props.location.state.text}
      </h3>
    </div>
  </section>
  <div style={{bottom: 0, position: 'absolute', width: '100%'}}>
    <Footer />
  </div>
  </div>
);

export const Notice = withRouter(_Notice);