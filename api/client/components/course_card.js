import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { Card, CardHeader, CardMedia } from 'material-ui/Card';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

export default class CourseCard extends Component {
    constructor(props) {
        super(props);

        this.references = {};
    }

    componentDidMount() {
        const { height, index, alignHeightCb } = this.props;
        // recalculate card height
        setTimeout(() => {
            let _cardHeight = this.references.image.clientWidth
                + this.references.teacher.clientHeight
                + this.references.description.clientHeight
                + 35;
            if (!height || height < _cardHeight) {
                alignHeightCb(_cardHeight);
            }
        });
    }

    render () {
        return (
            <div className="col-md-4 col-sm-4 col-xs-12 margin-three-bottom xs-margin-twenty-three-bottom xs-text-center">
                <MuiThemeProvider>
                    <Card>
                        <div className=" float-left width-100" style={{height: this.props.height}}>
                            <div
                                className="feature-box-image margin-eleven-bottom"
                                ref={(item) => this.references.image = item}
                            >
                                <Link to={`/myprograms/${this.props.course.id}`}>
                                    <CardMedia>
                                        <img
                                            alt=""
                                            src={this.props.course.img_url_mobile}
                                            data-img-size="(W)800px X (H)533px"
                                            style={{objectFit: 'cover'}}
                                        />
                                    </CardMedia>
                                </Link>
                            </div>
                            <div ref={(item) => this.references.teacher = item}>
                                <CardHeader
                                    title={`with ${this.props.course.teachers[0].teacher}`}
                                    subtitle={this.props.course.teachers[0].teacher_profession}
                                    avatar={this.props.course.teachers[0].teacher_thumbnail}
                                />
                            </div>
                            <div
                                className="feature-box-details float-left width-100"
                                ref={(item) => this.references.description = item}
                            >
                                <div className="text-medium line-height-24 float-left width-100 tz-text">
                                    <p>{this.props.course.description} </p>
                                </div>
                                <Link to={`/myprograms/${this.props.course.id}`}
                                      className="highlight-button-black border-radius-2 btn btn-small"
                                >
                                    <span className="tz-text">Go to Course</span>
                                </Link>
                            </div>
                        </div>
                    </Card>
                </MuiThemeProvider>
            </div>
        );
    }
};

CourseCard.propTypes = {
    index: PropTypes.number,
    course: PropTypes.object,
    match: PropTypes.object,
    alignHeightCb: PropTypes.func,
    height: PropTypes.number,
};
