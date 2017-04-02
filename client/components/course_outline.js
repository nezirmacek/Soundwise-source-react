import React, {Component} from 'react'
import {Card, CardActions, CardHeader, CardText} from 'material-ui/Card'
import {orange50, deepOrange800, grey50} from 'material-ui/styles/colors'
import { connect } from 'react-redux'

import Instructor from './instructor'
const styles = {
  moduleTitle: {
    fontSize: 24,
    backgroundColor: '#F76B1C'
  },
  sectionTitle: {
    backgroundColor: orange50
  },
  curriculumContainer: {
    marginTop: '3em'
  }
}

const renderModules = (course) => {
    return (
      course.modules.map(module => (
        <Card key={module.module_id}>
          <CardHeader
            title={module.module_title}
            style = {styles.moduleTitle}
          />
          <div className=''>
          {module.sections.map(section => {
            return (
              <div>
              <Card>
                <CardHeader
                  title={section.title}
                  style = {styles.sectionTitle}
                />
                <CardText >
                  {section.content}
                </CardText>
              </Card>
              </div>
            )
          })}
          </div>
        </Card>
      ))
    )
  }

export default class CourseOutline extends Component {
  constructor(props) {
    super(props)
    this.state = {
      course: {
        price: '',
        name: '',
        description: '',
        modules: [
          {
            sections: []
          }
        ]
      },
      userCourses: {}
    }
  }

  componentDidMount() {
    console.log('currentCourse: ', this.props.course)
    this.setState({
      course: this.props.course
    })
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      course: nextProps.course
    })
  }

  render() {
    return (
      <div>
        <section className="padding-80px-tb xs-padding-60px-tb bg-white builder-bg border-none" id="title-section1">
          <div className="container">
            <div className="">
                <div className="row padding-60px-tb">
                    <div className="col-md-12 col-sm-12 col-xs-12 text-center">
                      <h2 className="section-title-large sm-section-title-medium text-dark-gray font-weight-600 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text">WHAT YOU WILL LEARN</h2>
                      <div className="text-dark-gray text-large width-60 margin-lr-auto md-width-70 sm-width-100 tz-text">{this.state.course.description}</div>
                    </div>
                </div>
            </div>
            <div style={styles.curriculumContainer}>
                <div className="row">
                    <div className="col-md-12 col-sm-12 col-xs-12 text-center">
                      <h2 className="section-title-large sm-section-title-medium text-dark-gray font-weight-600 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text">CONTENT OUTLINE</h2>
                    </div>
                </div>
                {renderModules(this.state.course)}
            </div>
          </div>
        </section>
        <Instructor course={this.state.course}/>
      </div>
    )
  }
}


// <div style={styles.curriculumContainer}>
//             {renderModules(props.course)}
//           </div>