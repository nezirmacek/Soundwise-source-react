import React from 'react';
import Slider from 'react-slick'

const settings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 4,
  slidesToScroll: 3,
  arrows: true,
  autoplay: false,
  // autoplaySpeed: 2000,
  swipe: true,
  responsive: [{
    breakpoint: 1024,
    settings: {
      slidesToShow: 3,
      slidesToScroll: 2,
      infinite: true,
      dots: true
    }
  }, {
    breakpoint: 600,
    settings: {
      slidesToShow: 2,
      slidesToScroll: 2,
      infinite: true,
      dots: true,
      autoplay: false
    }
  }, {
    breakpoint: 480,
    settings: {
      slidesToShow: 1,
      slidesToScroll: 1,
      infinite: true,
      dots: true,
      autoplay: false
    }
  }]
}

const Feature_section = () => (
            <section className="padding-80px-tb feature-style4 bg-white builder-bg xs-padding-30px-tb" id="feature-section7">
                <div className="container">
                    <div className="row">

                        <div className="col-md-12 col-sm-12 col-xs-12 text-center">
                            <h2 className="section-title-large sm-section-title-medium xs-section-title-large text-dark-gray font-weight-600 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text">HOW IT WORKS</h2>
                            <div className="text-extra-large width-60 margin-lr-auto md-width-70 sm-width-100 tz-text margin-thirteen-bottom xs-margin-nineteen-bottom">Less time sitting in meetings/classrooms is more time for your agents to work on their busienss. Use Soundwise to make your agents more productive and better trained.</div>
                        </div>

                    </div>
                    <div className="row">
                        <div className="col-md-12 col-sm-12 col-xs-12 four-column">

                            <div className="col-md-3 col-sm-6 col-xs-12 text-center sm-margin-nine-bottom xs-margin-nineteen-bottom">
                                <div className="margin-nineteen-bottom sm-margin-thirteen-bottom xs-margin-nine-bottom"><img alt="" src="images/broadcast.png" data-img-size="(W)90px X (H)90px"/></div>
                                <h3 className="text-medium text-dark-gray alt-font font-weight-600 margin-three-bottom display-block sm-margin-nine-bottom xs-margin-five-bottom tz-text">Record / Upload</h3>
                                <div className="text-medium tz-text"> <p>Record or upload your training classes or sales meetings through Soundwise web interface.</p> </div>
                            </div>


                            <div className="col-md-3 col-sm-6 col-xs-12 text-center sm-margin-nine-bottom xs-margin-nineteen-bottom">
                                <div className="margin-nineteen-bottom sm-margin-thirteen-bottom xs-margin-nine-bottom"><img alt="" src="images/phone_buzz.png" data-img-size="(W)90px X (H)90px"/></div>
                                <h3 className="text-medium text-dark-gray alt-font font-weight-600 margin-three-bottom display-block sm-margin-nine-bottom xs-margin-five-bottom tz-text">Notify / Remind</h3>
                                <div className="text-medium tz-text"> <p>Your agents will be notified on their phone when new audios are available and be reminded to listen to them.</p> </div>
                            </div>


                            <div className="col-md-3 col-sm-6 col-xs-12 text-center xs-margin-nine-bottom xs-margin-nineteen-bottom">
                                <div className="margin-nineteen-bottom sm-margin-thirteen-bottom xs-margin-nine-bottom"><img alt="" src="images/earphones.png" data-img-size="(W)90px X (H)90px"/></div>
                                <h3 className="text-medium text-dark-gray alt-font font-weight-600 margin-three-bottom display-block sm-margin-nine-bottom xs-margin-five-bottom tz-text">Listen / Comment</h3>
                                <div className="text-medium tz-text"> <p>Agents listen to your materials at a time convenient to them. They can also give comments/raise questions from their phones.</p> </div>
                            </div>


                            <div className="col-md-3 col-sm-6 col-xs-12 text-center">
                                <div className="margin-nineteen-bottom sm-margin-thirteen-bottom xs-margin-nine-bottom"><img alt="" src="images/analytics.png" data-img-size="(W)90px X (H)90px"/></div>
                                <h3 className="text-medium text-dark-gray alt-font font-weight-600 margin-three-bottom display-block sm-margin-nine-bottom xs-margin-five-bottom tz-text">Track / Analyze</h3>
                                <div className="text-medium tz-text"> <p>Listening stats and tracking provide proof of who's listened to what, and help you analyze what kinds of materials are more popular.</p> </div>
                            </div>

                        </div>
                    </div>
                </div>
            </section>
);

export default Feature_section;