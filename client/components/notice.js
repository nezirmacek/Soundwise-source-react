import React from 'react'
import { withRouter } from 'react-router'
import {SoundwiseHeader} from './soundwise_header'
import Footer from './footer'

const _Notice = (props) => (
  <div>
  <SoundwiseHeader />
  <section className="padding-110px-tb bg-white builder-bg xs-padding-60px-tb" id="subscribe-section6" >
    <div className='container  text-dark-gray border-none' style={{fontSize: '18px'}}>
      <div className='row'>
        <div className="col-md-9 center-col col-sm-12 text-center">
          <h3 className="section-title-medium text-dark-gray font-weight-500 alt-font margin-three-bottom display-block sm-margin-nine-bottom xs-margin-five-bottom tz-text" style={{textAlign: 'center', lineHeight: '150%'}}>
            {props.location.state.text}
          </h3>
        </div>
      </div>
    </div>
  </section>
  <Footer />
  </div>
);

export const Notice = withRouter(_Notice);