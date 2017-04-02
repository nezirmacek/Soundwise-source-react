import React, {Component} from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import {Card, CardActions, CardHeader, CardText} from 'material-ui/Card'
import IconButton from 'material-ui/IconButton'
import Snackbar from 'material-ui/Snackbar'
import Dialog from 'material-ui/Dialog'
import FontIcon from 'material-ui/FontIcon'
import Checkbox from 'material-ui/Checkbox'
import Slider from 'material-ui/Slider'
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar'
import {orange50, greenA200, blue500, grey500, orange500} from 'material-ui/styles/colors'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import Levels from 'react-activity/lib/Levels'

import {setCurrentPlaySection, changePlayStatus, launchPlayer} from '../actions/index'

let player = {
  currentTime: 0,
  duration: 1
}

let source, currentTime = 0, duration = 1

const muiTheme = getMuiTheme({
  slider: {
    selectionColor: orange500,
    rippleColor: orange50
  },
})

const paddingTop = window.innerHeight * 0.8
const totalWidth = window.innerWidth
const styles = {
  player: {
    width: '75%',
    maxWidth: 'none',
    bottom: '0%',
    paddingTop: '30%'
  },
  sectionTitle: {
    backgroundColor: orange50
  },
  playerContainer: {
    bottom: '0%',
    top: '20%'
  },
  playerBackground: {
    backgroundColor: 'transparent',
    color: 'transparent'
  },
  slider: {
    width: totalWidth*0.5,
    paddingTop: 25,
    selectionColor: orange500
  },
  sliderBar: {
    selectionColor: orange500
  },
  label: {
    fontSize: 18
  }
}

class _CourseSection extends Component {
  constructor(props) {
    super(props)
    this.state = {
      openPlayer: false,
      playing: false,
      currentTime: 0,
      duration: 1
    }
    this.playFile = this.playFile.bind(this)
    this.handleTap = this.handleTap.bind(this)
    this.renderPlayButton = this.renderPlayButton.bind(this)
  }

  componentDidMount() {
    player = document.getElementById('audio')
    source = document.getElementById('audioSource')
    if(this.props.currentSection.section_id == this.props.section.section_id) {
      this.setState({
        currentTime: this.props.currentTime,
        duration: this.props.currentDuration
      })
    }
  }

  handleTap(event, checked) {
      this.playFile()
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.currentSection.section_id == this.props.section.section_id) {
      // setTimeout(() => {
        this.setState({
          currentTime: nextProps.currentTime,
          duration: nextProps.currentDuration
        })
      // }, 1000)
    }
  }

  playFile() {
    if(!this.props.isLoggedIn) {
      alert('please sign up/ log in to listen to the course')
    } else {
      if(this.props.currentSection.section_id !== this.props.section.section_id) {
        if(this.props.playing) {
          player.pause()
        }
        this.props.changePlayStatus(false)
        this.props.setCurrentPlaySection(this.props.section)
        // console.log(this.props.currentSection)
        source.src = this.props.section.section_url
        player.load()
        if(this.state.currentTime > 0) {
          player.currentTime = this.state.currentTime
        }
        player.play()
        this.props.changePlayStatus(true)
        this.setState({playing: true})

        if(!this.props.playerLaunched) {
          this.props.launchPlayer(true)
        }
      } else if(this.props.playing) {
        player.pause()
        this.props.changePlayStatus(false)
        this.setState({playing: false})
      } else if(!this.props.playing) {
        this.props.setCurrentPlaySection(this.props.section)
        player.play()
        this.props.changePlayStatus(true)
        this.setState({playing: true})
      }
    }
  }

  renderPlayButton() {
    if(this.props.playing && this.props.currentSection.section_id == this.props.section.section_id) {
      return (
        <Levels color="#F76B1C" size={12} speed={1} />
      )
    } else {
      return (
        <FontIcon
          className="material-icons"
          color={grey500}
          hoverColor={orange500}
        >play_arrow</FontIcon>
      )
    }
  }

  // <FontIcon
  //         className="material-icons"
  //         color={grey500}
  //         hoverColor={orange500}
  //       >pause</FontIcon>

  render() {
    const sectionNumber = this.props.currentPlaylist.indexOf(this.props.section) + 1

    return (
      <div>
      <Card>
        <CardHeader
          title={`Section ${sectionNumber}:`}
          style={styles.sectionTitle}
          actAsExpander={true}
          showExpandableButton={true}
        />
        <CardText>
          <Checkbox
            uncheckedIcon={this.renderPlayButton()}
            checkedIcon={this.renderPlayButton()}
            label={this.props.section.title}
            labelStyle={styles.label}
            onCheck={this.handleTap}
          />
        </CardText>
        <CardText expandable={true}>
          {this.props.section.content}
        </CardText>
      </Card>
      </div>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ setCurrentPlaySection, changePlayStatus, launchPlayer }, dispatch)
}


const mapStateToProps = state => {
  const { isLoggedIn } = state.user
  const { currentSection, playing, playerLaunched, currentPlaylist , currentTime, currentDuration } = state.setCourses
  return {
    isLoggedIn, currentSection, playing, playerLaunched, currentPlaylist, currentTime, currentDuration
  }
}

export const CourseSection = connect(mapStateToProps, mapDispatchToProps)(_CourseSection)

          // <Toolbar>
            // <ToolbarGroup>
              // <IconButton style={{display: 'inline-block'}}
               // onTouchTap = { this.playFile }>
               // { this.renderPlayButton() }
              // </IconButton>
              // <MuiThemeProvider muiTheme = {muiTheme}>
                // <Slider style={{display: 'inline-block'}}
                  // style = {styles.slider}
                  // sliderStyle = {styles.sliderBar}
                  // min={0}
                  // max={1}
                  // defaultValue={0}
                  // value={this.state.currentTime / this.state.duration}
                  // onChange={this.handleSecondSlider}
                // />
              // </MuiThemeProvider>
            // </ToolbarGroup>
          // </Toolbar>

  // <Dialog
  //       open = { this.state.openPlayer }
  //       title = {this.props.section.title}
  //       modal = {false}
  //       contentStyle = {styles.player}
  //       overlayStyle = {styles.playerBackground}
  //       style = {styles.playerContainer}
  //     >
  //       {player}
  //     </Dialog>