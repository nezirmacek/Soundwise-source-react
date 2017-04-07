import React, {Component} from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import {Card, CardActions, CardHeader, CardText} from 'material-ui/Card'
import {orange50, deepOrange800, grey50} from 'material-ui/styles/colors'
import firebase from "firebase"

import {CourseSection} from './course_section'
import {getCurrentProgress, changePlayStatus, setCurrentPlaySection, loadUserCourses, setCurrentCourse} from '../actions/index'

let interval, player, source

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

class _Curriculum extends Component {
  constructor(props) {
    super(props)
    this.renderModules = this.renderModules.bind(this)
    this.handleEnd = this.handleEnd.bind(this)
    this.updateSectionProgress = this.updateSectionProgress.bind(this)
  }

  componentDidMount() {
    player = document.getElementById('audio')
    source = document.getElementById('audioSource')

    player.addEventListener('ended', this.handleEnd)
  }

  updateSectionProgress(sectionId) {

    const userId = firebase.auth().currentUser.uid

    let update = this.props.course.sectionProgress[sectionId]
    update.completed = true
    update.playProgress = 0
    update.timesRepeated = update.timesRepeated + 1

    let updates = {}
    updates['/users/' + userId + '/courses/' + this.props.course.id + '/sectionProgress/' + sectionId] = update
    firebase.database().ref().update(updates)

    const sectionProgress = Object.assign({}, this.props.course.sectionProgress, {sectionId: update})
    const course = Object.assign({}, this.props.course, {sectionProgress})
    this.props.setCurrentCourse(course)

    // record section completion in course data:
    firebase.database().ref('/courses/' + this.props.course.id + '/metrics/' + sectionId)
    .once('value')
    .then(snapshot => {
      const completed = snapshot.val().timesCompleted + 1
      let update = {}
      update['/courses/' + this.props.course.id + '/metrics/' + sectionId + '/timesCompleted'] = completed
      firebase.database().ref().update(update)
    })
  }

  handleEnd() {
    this.updateSectionProgress(this.props.currentSection.section_id)

    // const next = this.props.currentPlaylist.indexOf(this.props.currentSection) + 1
    const next = this.props.currentSection.section_number
    if(next < this.props.currentPlaylist.length ) {
      this.props.setCurrentPlaySection(this.props.currentPlaylist[next])
      source.src = this.props.currentPlaylist[next].section_url
      player.load()
      player.play()
      this.props.changePlayStatus(true)
    } else {
      player.pause()
      this.props.changePlayStatus(false)
    }
  }

  componentWillReceiveProps(nextProps) {
    player = document.getElementById('audio')
    if(nextProps.playing) {
      interval = setInterval(() => {
        this.props.getCurrentProgress({
          currentTime: player.currentTime,
          duration: player.duration})
      }, 1000)
    } else {
      if(interval) {
        clearInterval(interval)
      }
    }
  }

  updateTime() {
      interval = setInterval(() => {
        currentTime = player.currentTime,
        duration = player.duration
    }, 1000)
  }

  renderModules() {
    return (
      this.props.course.modules.map(module => (
        <Card key={module.module_id}>
          <CardHeader
            title={module.module_title}
            style = {styles.moduleTitle}
          />
          <div className=''>
          {module.sections.map(section => (
            <CourseSection key={section.section_id} section={section} course={this.props.course} />
          ))}
          </div>
        </Card>
      ))
    )
  }

  render() {
    return (
      <section className="padding-110px-tb xs-padding-60px-tb bg-white builder-bg border-none" id="title-section1">
        <div className="container">
          <div className="">
              <div className="row">
                  <div className="col-md-12 col-sm-12 col-xs-12 text-center">
                    <div className="text-dark-gray text-large width-60 margin-lr-auto md-width-70 sm-width-100 tz-text">{this.props.course.description}</div>
                  </div>
              </div>
          </div>
          <div style={styles.curriculumContainer}>
            {this.renderModules()}
          </div>
        </div>
      </section>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ getCurrentProgress, changePlayStatus, setCurrentPlaySection, setCurrentCourse }, dispatch)
}


const mapStateToProps = state => {
  const { isLoggedIn } = state.user
  const { currentSection, playing, currentPlaylist, userCourses } = state.setCourses
  return {
    isLoggedIn, currentSection, playing, currentPlaylist, userCourses
  }
}

export const Curriculum = connect(mapStateToProps, mapDispatchToProps)(_Curriculum)