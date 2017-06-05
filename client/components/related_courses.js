/**
 * Created by developer on 05.06.17.
 */
import React from 'react'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import { Link } from 'react-router-dom';
import ReactStars from 'react-stars';
import RelatedCourseCard from './related_course_card';
import Slider from 'react-slick';

const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 0,
    arrows: true,
    autoplay: false,
    // autoplaySpeed: 2000,
    swipe: true,
    // responsive: [{
    //     breakpoint: 1024,
    //     settings: {
    //         slidesToShow: 3,
    //         slidesToScroll: 2,
    //         infinite: true,
    //         dots: true
    //     }
    // }, {
    //     breakpoint: 600,
    //     settings: {
    //         slidesToShow: 2,
    //         slidesToScroll: 2,
    //         infinite: true,
    //         dots: true,
    //         autoplay: false
    //     }
    // }, {
    //     breakpoint: 480,
    //     settings: {
    //         slidesToShow: 1,
    //         slidesToScroll: 1,
    //         infinite: true,
    //         dots: true,
    //         autoplay: false
    //     }
    // }]
};

const RelatedCourses = (props) => (
    <div className="col-md-12 col-sm-12 col-xs-12 bg-white">
        <div className="row padding-40px-tb">
            <div className="col-md-12 col-sm-12 col-xs-12 text-center">
                <h2 className="section-title-large sm-section-title-medium xs-section-title-large text-dark-gray font-weight-600 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text"
                    id="tz-slider-text125"
                >
                    PEOPLE WHO TOOK THIS COURSE ALSO TOOK
                </h2>
            </div>
        </div>
        <Slider {...settings}>
            {
                props.courses.map((course, i) => {
                    return (<div><RelatedCourseCard key={i} course={course} /></div>);
                })
            }
        </Slider>
    </div>
);

export default RelatedCourses;
