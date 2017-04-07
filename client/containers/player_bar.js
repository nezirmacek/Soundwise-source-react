import React, {Component} from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import firebase from 'firebase'
import {grey50, orange500} from 'material-ui/styles/colors'

import {setCurrentPlaySection, changePlayStatus} from '../actions/index'

let player, source

class _PlayerBar extends Component {
  constructor(props) {
    super(props)
    this.handlePlayerClick = this.handlePlayerClick.bind(this)
    this.handleForward = this.handleForward.bind(this)
    this.handleRewind = this.handleRewind.bind(this)
    this.handleSkipForward = this.handleSkipForward.bind(this)
    this.handleSkipBackward = this.handleSkipBackward.bind(this)
  }

  componentDidMount() {
    player = document.getElementById('audio')
    source = document.getElementById('audioSource')
  }

  togglePlayOrPause() {
    if(!this.props.playing) {
      return (
        <div className=''>
          <a className=""  onClick={() => this.handlePlayerClick()}><i className="material-icons" style={{fontSize: '42px'}}>play_arrow</i></a>
        </div>
      )
    } else {
        return (
          <div className=''>
            <a className=""  onClick={() => this.handlePlayerClick()}><i className="material-icons" style={{fontSize: '42px'}}>pause</i></a>
          </div>
      )
      }
  }

  handlePlayerClick() {
    player = document.getElementById('audio')

    if(this.props.playing) {
      player.pause()
      this.props.changePlayStatus(false)

      const userId = firebase.auth().currentUser.uid

      const playProgress = this.props.currentTime / this.props.currentDuration
      const sectionId = this.props.currentSection.section_id

      let updates = {}
      updates['/users/' + userId + '/courses/' + this.props.currentCourse.id + '/sectionProgress/' + sectionId + '/playProgress'] = playProgress

      firebase.database().ref().update(updates)

    } else {
      player.play()
      this.props.changePlayStatus(true)
    }
  }

  handleRewind() {
    const previous = this.props.currentPlaylist.indexOf(this.props.currentSection) - 1
    if(previous >= 0) {
      this.props.setCurrentPlaySection(this.props.currentPlaylist[previous])
      source.src = this.props.currentPlaylist[previous].section_url
      player.load()
      player.play()
      this.props.changePlayStatus(true)
    }
  }

  handleForward() {
    const next = this.props.currentPlaylist.indexOf(this.props.currentSection) + 1
    if(next <= this.props.currentPlaylist.length - 1) {
      this.props.setCurrentPlaySection(this.props.currentPlaylist[next])
      source.src = this.props.currentPlaylist[next].section_url
      player.load()
      player.play()
      this.props.changePlayStatus(true)
    }
  }

  handleSkipForward() {
    if(this.props.currentTime < this.props.currentDuration - 10) {
      const current = player.currentTime + 10
      player.currentTime = current
    }
  }

  handleSkipBackward() {
    if(this.props.currentTime > 10) {
      const current = player.currentTime - 10
      player.currentTime = current
    }
  }

  render() {
    let currentMin = '__', currentSec = '__', totalMin = '__', totalSec = '__'
    if(this.props.currentTime > 0) {
      currentMin = Math.floor(this.props.currentTime / 60)
      currentSec = Math.floor(this.props.currentTime % 60)
    }

    if(this.props.currentDuration > 1) {
      totalMin = Math.floor(this.props.currentDuration / 60)
      totalSec = Math.floor(this.props.currentDuration % 60)
    }

    const currentPercent = this.props.currentTime / this.props.currentDuration * 100
    const displayed = this.props.playerLaunched ? '' : 'none'

    return (
      <footer className="footer bg-info dker" style={{display: displayed, height: '90px'}}>
        <div id="" >
              <div className="">
                <div id="jplayer_N" className="jp-jplayer hide"></div>
                <div className="">

                    <div className="jp-controls ">
                      <div className=''><a className="" onClick={() => this.handleSkipBackward()}><i className="material-icons" style={{fontSize: '32px'}}>replay_10</i></a></div>
                      {this.togglePlayOrPause()}
                      <div className=''><a className="" onClick={() => this.handleSkipForward()}><i className="material-icons" style={{fontSize: '32px'}}>forward_10</i></a></div>
                      <div className="jp-progress hidden-xs" style={{}}>
                        <div className="jp-seek-bar dk hidden-xs" style={{width: '100%', backgroundColor: grey50}}>
                          <div className="jp-play-bar bg-info hidden-xs" style={{width: `${currentPercent}%`, backgroundColor: '#F76B1C'}}>
                          </div>
                          <div className="jp-title text-lt">
                            <ul>
                              <li>
                                <div>
                                {this.props.currentSection.title}
                                </div>
                                <div>
                                {`${currentMin}:${currentSec} / ${totalMin}:${totalSec}`}
                                </div>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div className=" ">{`${currentMin}:${currentSec} / ${totalMin}:${totalSec}`}</div>
                    </div>

                </div>
                <div className="jp-playlist dropup" id="playlist">
                  <ul className="dropdown-menu aside-xl dker">
                    <li className="list-group-item"></li>
                  </ul>
                </div>
                <div className="jp-no-solution hide">
                  <span>Update Required</span>
                  To play the media you will need to either update your browser to a recent version or update your <a href="http://get.adobe.com/flashplayer/" target="_blank">Flash plugin</a>.
                </div>
              </div>
            </div>
      </footer>
    )
  }
}


function mapDispatchToProps(dispatch) {
  return bindActionCreators({ setCurrentPlaySection, changePlayStatus }, dispatch)
}


const mapStateToProps = state => {
  const { isLoggedIn } = state.user
  const { currentSection, playing, playerLaunched, currentTime, currentDuration, currentPlaylist, currentCourse } = state.setCourses
  return {
    isLoggedIn, currentSection, playing, playerLaunched, currentTime, currentDuration, currentPlaylist, currentCourse
  }
}

export const PlayerBar = connect(mapStateToProps, mapDispatchToProps)(_PlayerBar)

  // <div className="hidden-xs hidden-sm">
  //   <a className="jp-mute" title="mute"><i className="icon-volume-2"></i></a>
  //   <a className="jp-unmute hid" title="unmute"><i className="icon-volume-off"></i></a>
  // </div>
  // <div className="hidden-xs hidden-sm jp-volume">
  //   <div className="jp-volume-bar dk">
  //     <div className="jp-volume-bar-value lter"></div>
  //   </div>
  // </div>