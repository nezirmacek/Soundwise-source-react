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

const RelatedCourses = (props) => {
    const length = props.courses.length;
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: (length > 3) ? (length - 3) : 0 ,
        arrows: props.courses.length > 3,
        autoplay: true,
        autoplaySpeed: 3000,
        swipe: true,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: (length > 2) ? (length - 2) : 0,
                    arrows: props.courses.length > 2,
                    infinite: true,
                    dots: true,
                    autoplay: true,
                }
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: (length > 1) ? (length - 1) : 0,
                    arrows: props.courses.length > 1,
                    infinite: true,
                    dots: true,
                    autoplay: true,
                }
            },
        ]
    };

    return (
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
                        return (
                            <div key={i}>
                                <RelatedCourseCard course={course} />
                            </div>
                        );
                    })
                }
            </Slider>
        </div>
    );
};

export default RelatedCourses;
