import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import * as firebase from "firebase"
import { bindActionCreators } from 'redux'
import IconMenu from 'material-ui/IconMenu'
import MenuItem from 'material-ui/MenuItem'
import IconButton from 'material-ui/IconButton'

import {signoutUser} from '../actions/index'
import Slider from './slider'
import Headerscroll from './headerscroll'

const styles = {
  li: {
    float: 'right'
  },
  header: {
    paddingBottom: '50px'
  },
  navItem: {
    display: 'inline'
  }
}

class _Header extends Component {
  constructor(props) {
    super(props)
    this.state = {
      buttonValue: 0
    }

  }

  capFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  signoutUser() {
    let that = this
    firebase.auth().signOut().then(function() {
        console.log('Signed Out')
        that.props.signoutUser()
      }, function(error) {
        console.error('Sign Out Error', error);
      })

  }

  handleButtonChange(e, value) {
    this.setState({
      buttonValue: value
    })
    if(this.state.buttonValue===1) {
      this.signoutUser()
    }
  }


  render() {
    return (
      <div className="header-style6">
          <header className="header-style10" id="header-section17">

              <nav className="navbar tz-header-bg alt-font no-margin shrink-transparent-header-dark dark-header">
                  <div className="container navigation-menu">
                      <div className="row">

                          <div className="col-md-3 col-sm-4 col-xs-9">
                              <a href="#home" className="inner-link"><img alt="" src="images/soundwiselogo_white.svg" data-img-size="(W)163px X (H)40px"/></a>
                          </div>

                          <div className="col-md-9 col-sm-8 col-xs-3 position-inherit">
                              <button data-target="#bs-example-navbar-collapse-1" data-toggle="collapse" className="navbar-toggle collapsed" type="button">
                                  <span className="sr-only">Toggle navigation</span>
                                  <span className="icon-bar"></span>
                                  <span className="icon-bar"></span>
                                  <span className="icon-bar"></span>
                              </button>
                              <div id="bs-example-navbar-collapse-1" className="collapse navbar-collapse pull-right">
                                  <ul className="nav navbar-nav">
                                      <li className="propClone"><a className="inner-link" href="#"></a></li>
                                      <li className="propClone"><a className="inner-link" href="#"></a></li>
                                  </ul>
                              </div>
                          </div>
                      </div>
                  </div>
              </nav>

          </header>
          <section className="no-padding cover-background tz-builder-bg-image border-none" data-img-size="(W)1920px X (H)994px" style={{background:"linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.1)), url('images/header_img_bg_2.png')"}}>
              <div className="container one-fourth-screen xs-padding-nineteen-bottom position-relative">
                  <div className="slider-typography xs-position-static text-center">
                      <div className="slider-text-middle-main">

                          <div className="slider-text-middle text-left padding-left-right-px">
                              <div className="col-md-6 no-padding margin-twenty-top sm-margin-twenty-three-top header-banner">
                                  <h1 className="title-extra-large-4 md-title-extra-large-3 font-weight-400 line-height-65 sm-title-extra-large text-white  text-transform-none margin-ten-bottom sm-margin-nine-bottom alt-font tz-text">Train, engage and retain your agents with audios</h1>
                                  <div className="text-white text-extra-large margin-fifteen-bottom sm-margin-nine-bottom width-80 sm-width-90 tz-text"><p>Soundwise allows real estate brokers and trainers to easily disseminate training materials and updates in audio to help their agents stay productive and engaged.</p></div>
                                  <div className="float-left width-100">
                                      <a className="btn btn-large propClone text-black xs-margin-ten-bottom xs-width-100 float-left" href="http://eepurl.com/cX2uof" style={{backgroundColor: '#F76B1C'}}><span className="tz-text">REQUEST A DEMO</span></a>

                                  </div>
                              </div>
                          </div>

                      </div>
                  </div>
              </div>
          </section>
      </div>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ signoutUser }, dispatch)
}

const mapStateToProps = state => {
  const { userInfo, isLoggedIn } = state.user
  return {
    userInfo, isLoggedIn
  }
}

export const Header = connect(mapStateToProps, mapDispatchToProps)(_Header)

                            // <div id="bs-example-navbar-collapse-1" className="collapse navbar-collapse pull-right">
                            //    {this.renderLogin()}
                            // </div>