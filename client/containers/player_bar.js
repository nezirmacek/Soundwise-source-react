import React, {Component} from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import {grey50, orange500} from 'material-ui/styles/colors'

import {setCurrentPlaySection, changePlayStatus} from '../actions/index'

let player, source

class _PlayerBar extends Component {
  constructor(props) {
    super(props)
    this.handlePlayerClick = this.handlePlayerClick.bind(this)
    this.handleForward = this.handleForward.bind(this)
    this.handleRewind = this.handleRewind.bind(this)
  }

  componentDidMount() {
    player = document.getElementById('audio')
    source = document.getElementById('audioSource')
  }

  togglePlayOrPause() {
    if(!this.props.playing) {
      return (
        <div>
          <a className="jp-play" onClick={() => this.handlePlayerClick()}><i className="icon-control-play i-2x"></i></a>
        </div>
      )
    } else {
        return (
          <div>
            <a className="jp-pause" onClick={() => this.handlePlayerClick()}><i className="icon-control-pause i-2x"></i></a>
          </div>
      )
      }
  }

  handlePlayerClick() {
    player = document.getElementById('audio')

    if(this.props.playing) {
      player.pause()
      this.props.changePlayStatus(false)
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
      <footer className="footer bg-info dker" style={{display: displayed}}>
        <div id="jp_container_N" >
              <div className="jp-type-playlist">
                <div id="jplayer_N" className="jp-jplayer hide"></div>
                <div className="jp-gui">
                  <div className="jp-interface">
                    <div className="jp-controls">
                      <div><a className="jp-previous" onClick={() => this.handleRewind()}><i className="icon-control-rewind i-lg"></i></a></div>
                      {this.togglePlayOrPause()}
                      <div><a className="jp-next" onClick={() => this.handleForward()}><i className="icon-control-forward i-lg"></i></a></div>
                      <div className="hide"><a className="jp-stop"><i className="fa fa-stop"></i></a></div>
                      <div className="jp-progress " >
                        <div className="jp-seek-bar dk" style={{width: '100%', backgroundColor: grey50}}>
                          <div className="jp-play-bar bg-info" style={{width: `${currentPercent}%`, backgroundColor: '#F76B1C'}}>
                          </div>
                          <div className="jp-title text-lt">
                            <ul>
                              <li>{this.props.currentSection.title}</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div className=" jp-current-time text-xs text-muted">{`${currentMin}:${currentSec}`}</div>
                      <div className=" jp-duration text-xs text-muted">{`${totalMin}:${totalSec}`}</div>
                    </div>
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
  const { currentSection, playing, playerLaunched, currentTime, currentDuration, currentPlaylist } = state.setCourses
  return {
    isLoggedIn, currentSection, playing, playerLaunched, currentTime, currentDuration, currentPlaylist
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