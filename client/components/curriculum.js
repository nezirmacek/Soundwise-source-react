import React, {Component} from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import {Card, CardActions, CardHeader, CardText} from 'material-ui/Card'
import {orange50, deepOrange800, grey50} from 'material-ui/styles/colors'

import {CourseSection} from './course_section'
import {getCurrentProgress, changePlayStatus, setCurrentPlaySection} from '../actions/index'

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
  }

  componentDidMount() {
    player = document.getElementById('audio')
    source = document.getElementById('audioSource')

    player.addEventListener('ended', this.handleEnd)
  }

  handleEnd() {
    const next = this.props.currentPlaylist.indexOf(this.props.currentSection) + 1
    if(next <= this.props.currentPlaylist.length - 1) {
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
  return bindActionCreators({ getCurrentProgress, changePlayStatus, setCurrentPlaySection }, dispatch)
}


const mapStateToProps = state => {
  const { isLoggedIn } = state.user
  const { currentSection, playing, currentPlaylist } = state.setCourses
  return {
    isLoggedIn, currentSection, playing, currentPlaylist
  }
}

export const Curriculum = connect(mapStateToProps, mapDispatchToProps)(_Curriculum)