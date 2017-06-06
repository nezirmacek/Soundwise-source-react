/**
 * Created by developer on 05.06.17.
 */
import React from 'react';
import RelatedCourseCard from './related_course_card';
import Slider from 'react-slick';

const style = {
    sliderWrapper: {
        width: '90%',
        margin: '0 auto',
    }
};

const RelatedCourses = (props) => {
    const length = props.courses.length;
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1 ,
        arrows: props.courses.length > 3,
        autoplay: false,
        // autoplaySpeed: 3000,
        swipe: true,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                    arrows: props.courses.length > 2,
                    infinite: true,
                    dots: true,
                    autoplay: false,
                }
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    arrows: props.courses.length > 1,
                    infinite: true,
                    dots: true,
                    autoplay: false,
                }
            },
        ]
    };

    return (
        <section className="padding-40px-tb xs-padding-40px-tb bg-white builder-bg border-none">
            <div className="row padding-40px-tb">
                <div className="col-md-12 col-sm-12 col-xs-12 text-center">
                    <h2 className="section-title-large sm-section-title-medium xs-section-title-large text-dark-gray font-weight-600 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text"
                        id="tz-slider-text125"
                    >
                        PEOPLE WHO TOOK THIS COURSE ALSO TOOK
                    </h2>
                </div>
            </div>
            <div style={style.sliderWrapper} className="row">
                <Slider {...settings}>
                    {
                        props.courses.map((course, i) => {
                            return (
                                <div key={i}>
                                    <RelatedCourseCard course={course} cb={props.cb} />
                                </div>
                            );
                        })
                    }
                </Slider>
            </div>
        </section>
    );
};

export default RelatedCourses;
