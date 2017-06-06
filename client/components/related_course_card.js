/**
 * Created by developer on 05.06.17.
 */
import React from 'react'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import { Link } from 'react-router-dom';
import ReactStars from 'react-stars';
import * as _ from 'lodash';

let style = {
    bottomShadowed: {
        height: 0,
    },
    cardContent: {
        paddingBottom: 30,
    }
};

const RelatedCourseCard = (props) => {
    // recalculate card height
    setTimeout(() => {
        const _blockIndex = props.blockIndex || 0; // related-courses
        const block = document.getElementsByClassName('related-courses')[_blockIndex];
        const elements = block.getElementsByClassName('bottom-shadowed'); // it's not an array
        const elementHeightArr = [];
        for (let i = 0; i < elements.length; i++) {
            let _cardHeight = elements[i].getElementsByClassName("feature-box-image")[0].offsetHeight
                + elements[i].getElementsByClassName("card-content")[0].offsetHeight;
            if (props.course.reviews) {
                _cardHeight += 50;
            }
            elementHeightArr.push(_cardHeight);
        }

        if (!props.cardHeight || props.cardHeight < style.bottomShadowed.height) {
            props.cb(Math.max.apply(null, elementHeightArr), props.blockIndex);
        }
    }, 10);

    const _style = JSON.parse(JSON.stringify(style));
    _style.bottomShadowed.height = props.cardHeight;

    return (
        <div className="col-md-12 col-sm-12 col-xs-12">
            <MuiThemeProvider>
                <Card>
                    <div className="float-left width-100 bottom-shadowed" style={_style.bottomShadowed}>
                        <div className="feature-box-image">
                            <Link to={`/courses/${props.course.id}`}>
                                <CardMedia>
                                    <img alt="" src={props.course.img_url_mobile} data-img-size="(W)800px X (H)533px" style={{objectFit: 'cover'}}/>
                                </CardMedia>
                            </Link>
                        </div>
                        <div className="card-content" style={props.course.reviews && _style.cardContent}>
                            <CardTitle
                                title={props.course.name}
                            />
                            <div className="stars-wrapper">
                                {
                                    props.course.reviews &&
                                    <ReactStars
                                        count={5}
                                        value={_.meanBy(_.values(props.course.reviews), review => review.rating)}
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
};

export default RelatedCourseCard;