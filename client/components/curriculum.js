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
    marginTop: '0em'
  }
}

class _Curriculum extends Component {
  constructor(props) {
    super(props)
    this.state = {
      course: {
        runtime: '',
        price: '',
        name: '',
        description: '',
        modules: [],
        resources: []
      }
    }
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

    let update = this.props.userCourse.sectionProgress[sectionId]
    update.completed = true
    update.playProgress = 0
    update.timesRepeated = update.timesRepeated + 1

    // record user listening progress data
    let updates = {}
    updates['/users/' + userId + '/courses/' + this.props.userCourse.id + '/sectionProgress/' + sectionId] = update
    firebase.database().ref().update(updates)

    const sectionProgress = Object.assign({}, this.props.userCourse.sectionProgress, {sectionId: update})
    const course = Object.assign({}, this.props.userCourse, {sectionProgress})
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
    const sectionNumber = this.props.currentSection.section_number

    if(sectionNumber < this.props.currentPlaylist.length ) {
      this.props.setCurrentPlaySection(this.props.currentPlaylist[sectionNumber])

      source.src = this.props.currentPlaylist[sectionNumber].section_url
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
    const that = this

    this.setState({
      course: nextProps.course
    })

    // if(nextProps.course.id !== this.props.course.id) {
    //   firebase.auth().onAuthStateChanged(user => {
    //     if(user) {
    //         const userId = user.uid
    //         firebase.database().ref('users/' + userId + '/courses/' + nextProps.course.id)
    //         .on('value', snapshot => {

    //           that.setState({
    //             course: snapshot.val()
    //           })
    //         })
    //     }
    //   })
    // }

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
    const that = this

    if(this.state.course.name.length > 0) {

      return (
        this.state.course.modules.map(module => (
          <Card key={module.module_id}>
            <CardHeader
              title={module.module_title}
              style = {styles.moduleTitle}
            />
            <div className=''>
            {module.sections.map(section => (
              <CourseSection key={section.section_id} section={section} course={that.props.userCourse} />
            ))}
            </div>
          </Card>
        ))
      )
    }
  }

  render() {
    return (
      <section className="padding-60px-tb xs-padding-60px-tb bg-white builder-bg border-none" id="title-section1" >
        <div className="container">
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
  const { currentSection, playing } = state.setCurrentSection
  const { currentPlaylist, userCourses } = state.setCourses
  return {
    isLoggedIn, currentSection, playing, currentPlaylist, userCourses
  }
}

export const Curriculum = connect(mapStateToProps, mapDispatchToProps)(_Curriculum)