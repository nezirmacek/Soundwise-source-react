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

const style = {
    bottomShadowed: {
        height: 0,
    },
    cardContent: {
        paddingBottom: 30,
    }
};

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
        const { cardHeight, course } = this.props;
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
                                <CardTitle
                                    title={course.name}
                                />
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
