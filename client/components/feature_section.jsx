import React from 'react';

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
    <div className="container">
      <div className="row">
        <div className="owl-carousel owl-theme owl-pagination-bottom owl-dark-pagination gallery-style4">
          { /* portfolio */ }
          <div className="item col-md-12 col-sm-12 col-xs-12 text-center lightbox-gallery">
            <a href="images/discover.png" id="tz-bg-69" title><img src="images/discover.png" data-img-size="(W)800px X (H)1417px" id="tz-bg-36" alt /></a>
          </div>
          { /* end portfolio */ }
          { /* portfolio */ }
          <div className="item col-md-12 col-sm-12 col-xs-12 text-center lightbox-gallery">
            <a href="images/discover_playlist.png" id="tz-bg-70" title><img src="images/discover_playlist.png" data-img-size="(W)800px X (H)1417px" id="tz-bg-37" alt /></a>
          </div>
          { /* end portfolio */ }
          { /* portfolio */ }
          <div className="item col-md-12 col-sm-12 col-xs-12 text-center lightbox-gallery">
            <a href="images/challenges.png" id="tz-bg-71" title><img src="images/challenges.png" data-img-size="(W)800px X (H)1417px" id="tz-bg-38" alt /></a>
          </div>
          { /* end portfolio */ }
          { /* portfolio */ }
          <div className="item col-md-12 col-sm-12 col-xs-12 text-center lightbox-gallery">
            <a href="images/my_classes.png" id="tz-bg-72" title><img src="images/my_classes.png" data-img-size="(W)800px X (H)1417px" id="tz-bg-39" alt /></a>
          </div>
          { /* end portfolio */ }
          { /* portfolio */ }
          <div className="item col-md-12 col-sm-12 col-xs-12 text-center lightbox-gallery">
            <a href="images/class_details.png" id="tz-bg-73" title><img src="images/class_details.png" data-img-size="(W)800px X (H)1417px" id="tz-bg-40" alt /></a>
          </div>
          { /* end portfolio */ }
          <div className="item col-md-12 col-sm-12 col-xs-12 text-center lightbox-gallery">
            <a href="images/about_me.png" id="tz-bg-73" title><img src="images/about_me.png" data-img-size="(W)800px X (H)1417px" id="tz-bg-40" alt /></a>
          </div>
          { /* end portfolio */ }
        </div>
      </div>
    </div>
  </section>
);

export default Feature_section;