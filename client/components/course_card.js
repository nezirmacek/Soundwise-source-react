import React from 'react'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card'
import { Link } from 'react-router-dom'

const CourseCard = (props) => (
  <div className="col-md-4 col-sm-4 col-xs-12 xs-margin-twenty-three-bottom xs-text-center">
    <MuiThemeProvider>
    <Card>
      <div className=" float-left width-100">
          <div className="feature-box-image margin-eleven-bottom">
              <Link to={`/myprograms/${props.course.id}`}>
                <CardMedia
                  overlay={<CardTitle title={props.course.name}/>}
                >
                  <img alt="" src={props.course.img_url_mobile} data-img-size="(W)800px X (H)533px" style={{objectFit: 'cover'}}/>
                </CardMedia>
              </Link>
          </div>
          <div>
            <CardHeader
              title={`with ${props.course.teacher}`}
              subtitle={props.course.teacher_profession}
              avatar={props.course.teacher_thumbnail}
            />
          </div>
          <div className="feature-box-details float-left width-100">
              <div className="text-medium line-height-24 float-left width-100 tz-text"><p>{props.course.description} </p></div>
              <Link to={`/myprograms/${props.course.id}`} className="highlight-button-black border-radius-2 btn btn-small" ><span className="tz-text">Go to Course</span></Link>
          </div>
      </div>
    </Card>
    </MuiThemeProvider>
  </div>
)

export default CourseCard