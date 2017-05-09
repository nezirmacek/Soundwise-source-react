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
  <section className="bg-white builder-bg padding-110px-tb" id="portfolios-section4">
    <div className="container">
      <div className="row">
        { /* section title */ }
        <div className="col-md-12 col-sm-12 col-xs-12 ">
          <h2 className="section-title-large sm-section-title-medium xs-section-title-large text-dark-gray font-weight-700 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text text-center"
            id="tz-slider-text104">SO MUCH TO LEARN. SO LITTLE TIME.</h2>
          <div className="text-medium width-60 margin-lr-auto md-width-70 sm-width-100 tz-text margin-thirteen-bottom xs-margin-nineteen-bottom" id="tz-slider-text105">
            <ul>
              <li>Curated audio content from thought leaders and expert practitioners</li>
              <li>Flexible playlists of short audios</li>
              <li>Rich information always, boring never</li>
              <li>Option to take audio courses for more in-depth study</li>
              <li>Learning challenges that keep you motivated to implement what you learned</li>
            </ul>
          </div>
        </div>
        { /* end section title */ }
      </div>
    </div>
    <div className='container'>
      <div className='row'>
        <Slider {...settings}>
          <div className="item col-md-12 col-sm-12 col-xs-12 text-center ">
            <img src="images/discover.png" data-img-size="(W)800px X (H)1417px" id="tz-bg-36" alt />
          </div>
          { /* end portfolio */ }
          { /* portfolio */ }
          <div className="item col-md-12 col-sm-12 col-xs-12 text-center ">
            <img src="images/discover_playlist.png" data-img-size="(W)800px X (H)1417px" id="tz-bg-37" alt />
          </div>
          { /* end portfolio */ }
          { /* portfolio */ }
          <div className="item col-md-12 col-sm-12 col-xs-12 text-center ">
            <img src="images/challenges.png" data-img-size="(W)800px X (H)1417px" id="tz-bg-38" alt />
          </div>
          { /* end portfolio */ }
          { /* portfolio */ }
          <div className="item col-md-12 col-sm-12 col-xs-12 text-center ">
            <img src="images/my_classes.png" data-img-size="(W)800px X (H)1417px" id="tz-bg-39" alt />
          </div>
          { /* end portfolio */ }
          { /* portfolio */ }
          <div className="item col-md-12 col-sm-12 col-xs-12 text-center ">
            <img src="images/class_details.png" data-img-size="(W)800px X (H)1417px" id="tz-bg-40" alt />
          </div>
          { /* end portfolio */ }
          <div className="item col-md-12 col-sm-12 col-xs-12 text-center ">
            <img src="images/about_me.png" data-img-size="(W)800px X (H)1417px" id="tz-bg-40" alt />
          </div>
          { /* end portfolio */ }
        </Slider>
      </div>
    </div>
  </section>
);

export default Feature_section;