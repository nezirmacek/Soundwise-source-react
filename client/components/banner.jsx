import React from 'react';


const Banner = (props) => {
    const {title, tagline, subtitle1, subtitle2, subtitle3, subtitle4, description1, description2, description3, description4, image} = props.content;
    return (
            <section className="bg-gray builder-bg border-none" id="content-section20">
                <div className="container-fluid">
                    <div className="row equalize">
                        <div className="col-md-6 col-sm-12 col-xs-12 display-table no-padding xs-padding-ten" style={{height: "755px"}}>
                            <div className="display-table-cell-vertical-middle padding-twenty-one-left padding-twenty-one-right md-padding-seven xs-no-padding-lr">

                                <div className="col-md-12 col-sm-12 col-xs-12 xs-no-padding-lr">
                                    <div className="title-extra-large-2 sm-title-extra-large xs-title-extra-large font-weight-300 text-dark-gray margin-three-bottom xs-margin-fifteen-bottom tz-text">{title}</div>
                                    <div className="text-extra-large sm-text-extra-large font-weight-300 width-85 md-width-100 margin-twenty-bottom sm-margin-fifteen-bottom tz-text"><p>{tagline}</p></div>
                                </div>
                                <div className="two-column">
                                    <div className="col-lg-6 col-md-12 col-sm-6 col-xs-12 margin-eight-bottom xs-margin-fifteen-bottom xs-no-padding-lr">
                                        <div className="float-left width-100 margin-four-bottom">
                                            <div className="col-md-2 col-sm-2 col-xs-12 no-padding"><i className="fa fa-headphones ti-desktop title-extra-large tz-icon-color" style={{color: '#61e1fb'}}></i></div>
                                            <h3 className="title-small md-title-small sm-title-small text-dark-gray col-md-10 col-sm-10 col-xs-12 no-padding-left no-padding margin-three-top md-margin-two-top sm-margin-four-top tz-text">{subtitle1}</h3>
                                        </div>
                                        <div className="text-medium width-90 md-width-100 clear-both tz-text"><p>{description1}</p></div>
                                    </div>
                                    <div className="col-lg-6 col-md-12 col-sm-6 col-xs-12 margin-eight-bottom xs-margin-fifteen-bottom xs-no-padding-lr">
                                        <div className="float-left width-100 margin-four-bottom">
                                            <div className="col-md-2 col-sm-2 col-xs-12 no-padding"><i className="fa fa-bullhorn ti-ruler-pencil  title-extra-large tz-icon-color" style={{color: '#61e1fb'}}></i></div>
                                            <h3 className="title-small md-title-small sm-title-small text-dark-gray col-md-10 col-sm-10 col-xs-12 no-padding-left no-padding margin-three-top md-margin-two-top sm-margin-four-top tz-text">{subtitle2}</h3>
                                        </div>
                                        <div className="text-medium width-90 md-width-100 clear-both tz-text"><p>{description2}</p></div>
                                    </div>
                                    <div className="col-lg-6 col-md-12 col-sm-6 col-xs-12 margin-eight-bottom xs-margin-fifteen-bottom xs-no-padding-lr">
                                        <div className="float-left width-100 margin-four-bottom">
                                            <div className="col-md-2 col-sm-2 col-xs-12 no-padding"><i className="fa fa-folder-open-o ti-world  title-extra-large tz-icon-color" style={{color: '#61e1fb'}}></i></div>
                                            <h3 className="title-small md-title-small sm-title-small text-dark-gray col-md-10 col-sm-10 col-xs-12 no-padding-left no-padding margin-three-top md-margin-two-top sm-margin-four-top tz-text">{subtitle3}</h3>
                                        </div>
                                        <div className="text-medium width-90 md-width-100 clear-both tz-text"><p>{description3}</p></div>
                                    </div>
                                    <div className="col-lg-6 col-md-12 col-sm-6 col-xs-12 margin-eight-bottom xs-no-padding-lr">
                                        <div className="float-left width-100 margin-four-bottom">
                                            <div className="col-md-2 col-sm-2 col-xs-12 no-padding"><i className="fa fa-bar-chart ti-map-alt title-extra-large tz-icon-color" style={{color: '#61e1fb'}}></i></div>
                                            <h3 className="title-small md-title-small sm-title-small text-dark-gray col-md-10 col-sm-10 col-xs-12 no-padding-left no-padding margin-three-top md-margin-two-top sm-margin-four-top tz-text">{subtitle4}</h3>
                                        </div>
                                        <div className="text-medium width-90 md-width-100 clear-both tz-text"><p>{description4}</p></div>
                                    </div>
                                </div>

                            </div>
                        </div>
                        <div className="col-md-6 col-sm-12 col-xs-12 tz-builder-bg-image sm-height-600-px xs-height-400-px cover-background" data-img-size="(W)1000px X (H)800px" style={{background: `linear-gradient(rgba(0, 0, 0, 0.01), rgba(0, 0, 0, 0.01)), url('${image}')`, height: "755px"}}></div>
                    </div>
                </div>
            </section>
    );
};

export default Banner;