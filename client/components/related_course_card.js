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

const RelatedCourseCard = (props) => (
    <div className="col-md-12 col-sm-12 col-xs-12">
        <MuiThemeProvider>
            <Card>
                <div className=" float-left width-100 bottom-shadowed">
                    <div className="feature-box-image margin-eleven-bottom">
                        <Link to={`/myprograms/${props.course.id}`}>
                            <CardMedia>
                                <img alt="" src={props.course.img_url_mobile} data-img-size="(W)800px X (H)533px" style={{objectFit: 'cover'}}/>
                            </CardMedia>
                        </Link>
                    </div>
                    <div>
                        <CardTitle
                            title={props.course.name}
                        />
                        <div className="stars-wrapper">
                            <ReactStars
                                count={5}
                                value={_.meanBy(_.values(props.course.reviews), review => review.rating)}
                                size={40}
                                edit={false}
                                color2={'#ffd700'}
                            />
                        </div>
                    </div>
                </div>
            </Card>
        </MuiThemeProvider>
    </div>
);

export default RelatedCourseCard;