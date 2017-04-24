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
                  title={`Section ${section.section_number}: ${section.title} (${section.run_time})`}
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
        description_long: [''],
        features: [''],
        modules: [
          {
            sections: []
          }
        ]
      },
      userCourses: {}
    }
    this.renderDescription = this.renderDescription.bind(this)
    this.renderFeatures = this.renderFeatures.bind(this)
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

  renderDescription() {
    return (
      <div>
      {this.state.course.description_long.map(paragraph => {
        return (
          <p className="text-dark-gray text-extra-large  margin-lr-auto width-100 sm-width-100 tz-text">
            {paragraph}
          </p>
        )
      })}
      </div>
    )
  }

  renderFeatures() {
    return (
      <ul>
       {this.state.course.features.map(feature => {
          return (
            <li className="text-dark-gray text-extra-large  margin-lr-auto col-md-6 tz-text" style={{paddingLeft: '1em', paddingRight: '2em', paddingTop: '1em', listStyleType: 'none'}}>
              <i className="material-icons" style={{paddingRight: '1em'}}>check</i>{feature}
            </li>
          )
       })}
      </ul>
    )
  }

  render() {
    return (
      <div>
        <section className="padding-40px-tb xs-padding-40px-tb bg-white builder-bg border-none" id="title-section1">
          <div className="container">
            <div className="row padding-40px-tb">
                <div className="col-md-12 col-sm-12 col-xs-12">
                  {this.renderDescription()}
                </div>
            </div>
            <div className="row padding-40px-tb" style={{backgroundColor: '#FFF3E0'}}>
                <div className="col-md-12 col-sm-12 col-xs-12 text-center">
                  <h2 className="section-title-large sm-section-title-medium text-dark-gray font-weight-600 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text">WHAT YOU WILL GET</h2>
                </div>
                <div className="col-md-12 col-sm-12 col-xs-12">
                  {this.renderFeatures()}
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