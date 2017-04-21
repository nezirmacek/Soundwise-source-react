import React, {Component} from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import firebase from 'firebase'
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
import Spinner from 'react-activity/lib/Spinner'

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
      loading: false,
      currentTime: 0,
      duration: 1,
      cached: false
    }
    this.playFile = this.playFile.bind(this)
    this.handleTap = this.handleTap.bind(this)
    this.renderPlayButton = this.renderPlayButton.bind(this)
    this.handleCacheAudio = this.handleCacheAudio.bind(this)
    this.renderCacheButton = this.renderCacheButton.bind(this)
  }

  componentDidMount() {
    const that = this
    player = document.getElementById('audio')
    source = document.getElementById('audioSource')
    if(this.props.currentSection.section_id == this.props.section.section_id) {
      this.setState({
        currentTime: this.props.currentTime,
        duration: this.props.currentDuration
      })
    }

    // let headers = new Headers()
    // headers.append('access-control-allow-origin', '*')
    // headers.append('access-control-allow-methods', 'GET, POST, PUT, DELETE, OPTIONS')
    // headers.append('access-control-allow-headers', 'content-type, accept')
    // headers.append('Content-Type', "audio/mpeg3;audio/x-mpeg-3;video/mpeg;video/x-mpeg;text/xml")

    // let request = new Request(this.props.section.section_url, {headers})

    // fetch(request)
    // .then(response => {
    //   console.log(response.status)
    // })

    if('caches' in window) {
      caches.open('audio-cache')
      .then(cache => {
        cache.keys()
        .then(keys => {
          keys.forEach(key => {
            // console.log('key: ', key)
            if(key.url === that.props.section.section_url) {
              that.setState({
                cached: true
              })
            }
          })
        })
      })
    }
  }

  handleTap() {
    if(!this.props.playing || (this.props.playing && this.props.section !== this.props.currentSection)) {
      this.playFile()
    }
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
        if(this.props.playing) { //if switching to another section, store the progress data for the current section first
          player.pause()

          this.setState({
            loading: true
          })

          const userId = firebase.auth().currentUser.uid
          const sectionId = this.props.currentSection.section_id
          const playProgress = this.props.currentTime / this.props.currentDuration

          let updates = {}
          updates['/users/' + userId + '/courses/' + this.props.course.id + '/sectionProgress/' + sectionId + '/playProgress'] = playProgress

          firebase.database().ref().update(updates)
          console.log('progress updated')
        }

        this.setState({
          loading: true
        })
        this.props.changePlayStatus(false)
        this.props.setCurrentPlaySection(this.props.section)
        // console.log(this.props.currentSection)
        source.src = this.props.section.section_url
        player.load()

        player.addEventListener('loadeddata', () => {
          player.currentTime = this.props.course.sectionProgress[this.props.section.section_id].playProgress * player.duration  //jump to the position previously left off

          player.play()

          this.props.changePlayStatus(true)
          this.setState({playing: true, loading: false})

          if(!this.props.playerLaunched) {
            this.props.launchPlayer(true)
          }
        })


      } else if(this.props.playing) {
        player.pause()
        this.props.changePlayStatus(false)
        this.setState({playing: false})
      } else if(!this.props.playing) {
        this.setState({
          loading: true
        })
        this.props.setCurrentPlaySection(this.props.section)

        player.addEventListener('loadeddata', () => {
          player.currentTime = this.props.course.sectionProgress[this.props.section.section_id].playProgress * player.duration  //jump to the position previously left off

          player.play()

          this.props.changePlayStatus(true)
          this.setState({playing: true, loading: false})
        })
      }
    }
  }

  renderPlayButton() {
    if(this.state.loading) {
      return (
        <Spinner size={12} speed={1} />
      )
    } else if(this.props.playing && this.props.currentSection.section_id == this.props.section.section_id) {
      return (
        <Levels color="#F76B1C" size={12} speed={1} />
      )
    } else {
      return (
        <i className="material-icons">play_circle_outline</i>
      )
    }
  }

  renderCacheButton() {
    if(this.state.cached === true) {
      return (
        <span style={{color: '#F76B1C'}}>remove download</span>
      )
    } else if(this.state.cached === false) {
      return (
          <span style={{color: '#F76B1C'}}>enable offline</span>
      )
    } else if(this.state.cached === 'processing') {
      return (
        <Spinner size={12} speed={1} />
      )
    }
  }

  handleCacheAudio() {
    const that = this

    if(this.state.cached === false) {
        this.setState({
          cached: 'processing'
        })

        let headers = new Headers()
        // headers.append('access-control-allow-origin', '*')
        headers.append('access-control-allow-methods', 'GET')
        headers.append('access-control-allow-headers', 'content-type, accept')
        headers.append('Content-Type', "audio/mpeg3;audio/x-mpeg-3;video/mpeg;video/x-mpeg;text/xml")

        var myInit = { method: 'GET',
               headers: headers,
               mode: 'no-cors',
               cache: 'default' }

        let request = new Request(this.props.section.section_url, myInit)

        fetch(request)
        .then(response => {
          // if(!response.ok) {
          //   throw new TypeError('bad response status')
          // }
          // console.log('response header (size): ', response)

          return caches.open('audio-cache')
            .then(cache => {
              cache.put(that.props.section.section_url, response)
            })
        })
        .then(() => {
          that.setState({
            cached: true
          })
        })
        .catch((err) => {
          console.log('error in caching: ', err)
          alert('Oops! Looks like your storage is full. To store this section, clear the cached images and files in your browser history to free up some space.')
        })
    } else if(this.state.cached === true) {
        caches.open('audio-cache')
        .then(cache => {
          cache.keys()
          .then(keys => {
            keys.forEach(key => {
              // console.log('key: ', key)
              if(key.url === that.props.section.section_url) {
                cache.delete(key)
              }
            })
          })
          .then(() => {
            that.setState({
              cached: false
            })
          })
        })
    }
  }

  // <FontIcon
  //         className="material-icons"
  //         color={grey500}
  //         hoverColor={orange500}
  //       >pause</FontIcon>

  render() {

    // const sectionNumber = this.props.currentPlaylist.indexOf(this.props.section) + 1
    const completed = this.props.course.sectionProgress[this.props.section.section_id].completed

    let progress = ''
    if(completed) {
      progress = 'completed'
    } else {
      progress = `${Math.floor(this.props.course.sectionProgress[this.props.section.section_id].playProgress * 100)}% completed`
    }

    const displayDownload = 'caches' in window ? '' : 'none'

    return (
      <div>
      <Card>
        <CardHeader
          title={`Section ${this.props.section.section_number}:`}
          style={styles.sectionTitle}
          actAsExpander={true}
          showExpandableButton={true}
        />
        <CardText>
          <div className='row'>
          <div className='col-md-1 col-sm-2 col-xs-2'>
            <a onClick={this.handleTap}
              style={{padding: '1em', paddingRight: '2em'}}>
              {this.renderPlayButton()}
            </a>
          </div>
          <div className='col-md-8 col-sm-8 col-xs-8'
            style={{paddingLeft: '2em'}}>
            <span style={{fontSize: '18px'}}>
              {this.props.section.title}
            </span>
            <span style={{paddingLeft: '1em'}}>
              {`(${progress})`}
            </span>
          </div>
          <div
            style={{display: displayDownload}}
            className='col-md-2 col-sm-2 col-xs-2'>
            <a  onClick={this.handleCacheAudio}>
              {this.renderCacheButton()}
            </a>
          </div>
          </div>
        </CardText>
        <CardText expandable={true}>
          <div style={{padding: '1em 2em'}}>
            <a href={this.props.section.transcript_url} download>
              <i style={{padding: '1em'}} className="fa fa-lg fa-file-text-o" aria-hidden="true"></i>
              <span style={{fontSize: '18px'}}>Transcript</span>
            </a>
          </div>
        </CardText>
      </Card>
      </div>
    )
  }
}

          // <Checkbox
          //   uncheckedIcon={this.renderPlayButton()}
          //   checkedIcon={this.renderPlayButton()}
          //   label={this.props.section.title}
          //   labelStyle={styles.label}
          //   onCheck={this.handleTap}
          // />
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