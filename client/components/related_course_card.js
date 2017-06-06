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
        height: 'auto',
    },
    cardContent: {
        paddingBottom: 30,
    }
};

const RelatedCourseCard = (props) => {
    setTimeout(() => {
        const elements = document.getElementsByClassName('bottom-shadowed'); // it's not an array
        const elementHeightArr = [];
        for (let i = 0; i < elements.length; i++) {
            elementHeightArr.push(
                elements[i].getElementsByClassName("feature-box-image")[0].offsetHeight
                + elements[i].getElementsByClassName("card-content")[0].offsetHeight
            );
        }
        style.bottomShadowed.height = Math.max.apply(null, elementHeightArr);
        props.cb(style.bottomShadowed.height);
    });

    return (
        <div className="col-md-12 col-sm-12 col-xs-12">
            <MuiThemeProvider>
                <Card>
                    <div className="float-left width-100 bottom-shadowed" style={style.bottomShadowed}>
                        <div className="feature-box-image">
                            <Link to={`/courses/${props.course.id}`}>
                                <CardMedia>
                                    <img alt="" src={props.course.img_url_mobile} data-img-size="(W)800px X (H)533px" style={{objectFit: 'cover'}}/>
                                </CardMedia>
                            </Link>
                        </div>
                        <div className="card-content" style={props.course.reviews && style.cardContent}>
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