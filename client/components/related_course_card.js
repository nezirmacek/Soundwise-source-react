/**
 * Created by developer on 05.06.17.
 */
import React, { Component } from 'react'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import { Link } from 'react-router-dom';
import ReactStars from 'react-stars';
import * as _ from 'lodash';
import PropTypes from 'prop-types';

export default class RelatedCourseCard extends Component {
    constructor(props) {
        super(props);

        this.references = {
            image: {},
            content: {},
        };
    }

    componentDidMount() {
        const { cardHeight, course, cb } = this.props;
        // recalculate card height
        setTimeout(() => {
            let _cardHeight = this.references.image.clientWidth + this.references.content.clientHeight;
            if (course.reviews) {
                _cardHeight += 20;
            }
            if (!cardHeight || cardHeight < _cardHeight) {
                cb(_cardHeight);
            }
        }, 100);
    }

    render () {
        const { cardHeight, course, index } = this.props;
        const _style = JSON.parse(JSON.stringify(style));
        _style.bottomShadowed.height = cardHeight;

        return (
            <div className="col-md-12 col-sm-12 col-xs-12">
                <MuiThemeProvider>
                    <Card>
                        <div className="float-left width-100 bottom-shadowed" style={_style.bottomShadowed}>
                            <div ref={(image) => this.references.image = image} className="feature-box-image">
                                <Link to={`/courses/${course.id}`}>
                                    <CardMedia>
                                        <img alt="" src={course.img_url_mobile}
                                             data-img-size="(W)800px X (H)533px" style={{objectFit: 'cover'}}/>
                                    </CardMedia>
                                </Link>
                            </div>
                            <div ref={(content) => this.references.content = content} style={course.reviews && _style.cardContent}>
                                <div style={_style.title}>{course.name}</div>
                                <div style={_style.author}>
                                    <img alt={''} src={course.teacher_thumbnail} style={_style.authorThumbNail}/>
                                    <div>
                                        <div style={_style.teacherName}>{course.teacher}</div>
                                        <div className="one-line" style={_style.teacherRrofession}>
                                            {course.teacher_profession}
                                        </div>
                                    </div>
                                </div>
                                <div style={_style.courseDescription}>{course.description}</div>
                                <div className="stars-wrapper">
                                    {
                                        course.reviews &&
                                        <ReactStars
                                            count={5}
                                            value={_.meanBy(_.values(course.reviews), review => review.rating)}
                                            size={40}
                                            edit={false}
                                            color2={'#ffd700'}
                                        />
                                    }
                                </div>
                            </div>
                        </div>
                    </Card>
                </MuiThemeProvider>
            </div>
        );
    }
};

RelatedCourseCard.propTypes = {
    cardHeight: PropTypes.number,
    course: PropTypes.object,
    cb: PropTypes.func,
    index: PropTypes.number,
    blockIndex: PropTypes.number,
};

const style = {
    bottomShadowed: {
        height: 0,
    },
    title: {
        fontSize: '18px',
        lineHeight: '22px',
        fontWeight: 'bold',
        padding: '15px',
    },
    cardContent: {
        paddingBottom: 30,
    },
    author: {
        display: 'flex',
        alignItems: 'center',
        height: '50px',
    },
    authorThumbNail: {
        width: '40px',
        height: '40px',
        borderRadius: '20px',
        border: '1px solid #555',
        marginLeft: '20px',
        marginRight: '15px',
    },
    teacherName: {
        fontWeight: 'bold',
        fontSize: '14px',
        lineHeight: '14px',
    },
    teacherRrofession: {
        fontSize: '10px',
    },
    courseDescription: {
        paddingLeft: '20px',
        paddingRight: '20px',
        paddingBottom: '20px',
        paddingTop: '10px',
        fontSize: '10px',
        lineHeight: '14px',
    },
};
