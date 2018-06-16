import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import * as firebase from "firebase"
import { bindActionCreators } from 'redux'
import IconMenu from 'material-ui/IconMenu'
import MenuItem from 'material-ui/MenuItem'
import IconButton from 'material-ui/IconButton'
import Colors from '../styles/colors';

import Footer from './footer'
import {signoutUser} from '../actions/index'


class _LandingPagePodcast extends Component {
  constructor(props) {
    super(props)
    this.state = {
      buttonValue: 0
    }
  }

  signoutUser() {
    let that = this;
    firebase.auth().signOut().then(
        function() {
            that.props.signoutUser();
            that.props.history.push('/signin')
        },
        function(error) {
            console.error('Sign Out Error', error);
        }
    );
  }
  capFirstLetter(name) {
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  handleButtonChange(e, value) {
      this.setState({
        buttonValue: Number(value)
      });
      if(Number(value)==1) {
        this.signoutUser();
      }
  }

  renderLogin() {
        if(this.props.isLoggedIn) {
            if (this.props.userInfo.admin) {
                return (
                    <ul className="nav navbar-nav" style={{
                        verticalAlign: 'center',
                    }}>
                        <li className="propClone sm-no-border" style={{marginTop: 5}}>
                            <div className='dropdown'>
                                <div className='btn dropdown-toggle' data-toggle="dropdown" style={{height: 37, justifyContent: 'center'}}>
                                    <div style={{color: 'rgb(255, 255, 255)', backgroundColor: 'rgba(0, 0, 0, 0)', borderColor: 'rgb(255, 255, 255) rgb(255, 255, 255) rgba(0, 0, 0, 0)', fontFamily: 'Montserrat, sans-serif', textTransform: 'none', fontSize: '16px', fontWeight: 700}}>{`Hello, ${this.capFirstLetter(this.props.userInfo.firstName)} `}
                                       <span className="caret"></span>
                                    </div>
                                </div>
                                <ul className="dropdown-menu">
                                    {this.props.userInfo.soundcasts &&
                                    <li>
                                        <Link style={{color: 'black'}} to='/mysoundcasts'>My Soundcasts</Link>
                                    </li>
                                    }
                                    {this.props.userInfo.admin &&
                                    <li>
                                        <Link to='/dashboard/soundcasts' style={{color: 'black'}}>Admin Dashboard</Link>
                                    </li>
                                    }
                                    {this.props.userInfo.courses &&
                                    <li>
                                        <Link to='/myprograms' style={{color: 'black'}}>My Courses</Link>
                                    </li>
                                    }
                                    <li>
                                        <Link to='/myprofile' style={{color: 'black'}}>My Profile</Link>
                                    </li>
                                    <li>
                                        <a onClick={() => this.signoutUser()}>
                                            <font style={{color: 'black'}}>Log Out</font>
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </li>
                    </ul>
                );
            } else {
                return (
                    <ul className="nav navbar-nav">
                        {
                            this.props.userInfo.courses &&
                            <li className="propClone sm-no-border">
                                <Link to='/courses' className="inner-link">COURSES</Link>
                            </li>
                        }
                        {
                            this.props.userInfo.courses &&
                            <li>
                                <Link to='/myprograms'>My Library</Link>
                            </li>
                        }
                        {
                            this.props.userInfo.soundcasts &&
                            <li>
                                <Link to='/mysoundcasts'>My Soundcasts</Link>
                            </li>
                        }
                        <li className="propClone sm-no-border" >
                            <a className='dropdown-toggle' data-toggle="dropdown">
                                {`Hello, ${this.capFirstLetter(this.props.userInfo.firstName)} `}
                                <span className="caret"></span>
                            </a>
                            <ul className="dropdown-menu">
                                {this.props.userInfo.soundcasts &&
                                <li>
                                    <Link to='/mysoundcasts'>My Soundcasts</Link>
                                </li>
                                }
                                {this.props.userInfo.courses &&
                                <li>
                                    <Link to='/myprograms'>My Courses</Link>
                                </li>
                                }
                                <li>
                                    <Link to='/myprofile'>My Profile</Link>
                                </li>
                                <li>
                                    <a onClick={() => this.signoutUser()}>
                                        <font style={{color: 'black'}}>LOG OUT</font>
                                    </a>
                                </li>
                            </ul>
                        </li>
                    </ul>
                );
            }
        } else {
            return (
                <ul className="nav navbar-nav">
                                    <li className="propClone"><Link to="/signin" className="inner-link" data-selector="nav a" style={{color: 'rgb(255, 255, 255)', backgroundColor: 'rgba(0, 0, 0, 0)', borderColor: 'rgb(255, 255, 255) rgb(255, 255, 255) rgba(0, 0, 0, 0)', fontFamily: 'Montserrat, sans-serif', textTransform: 'none', fontSize: '16px', fontWeight: 700}} id="ui-id-21">LOG IN</Link></li>
                                    <li className="nav-button propClone float-left btn-medium sm-no-margin-tb"><Link className="inner-link" to="/signup_options"  className="sm-text-medium display-block sm-bg-white text-black sm-padding-nav-btn width-100 sm-display-inline-block sm-width-auto" data-selector="nav a" style={{color: 'rgb(0, 0, 0)', backgroundColor: 'rgb(255, 255, 255)', borderColor: 'rgba(0, 0, 0, 0)', fontFamily: 'Montserrat, sans-serif', textTransform: 'none', fontSize: '16px', fontWeight: 700}} id="ui-id-17">SIGN UP</Link></li>
                </ul>
            );
        }
  }

  render() {
    return (
    <div>
        <div className="header-style8">
            <header className="header-style8" id="header-section16">
                <nav className="navbar tz-header-bg no-margin alt-font navigation-menu dark-header" data-selector=".tz-header-bg" >
                    <div className="pull-left">
                        <Link to='/' className="inner-link" data-selector="nav a" ><img alt="" src="images/soundwiselogo_white.svg" data-img-size="(W)163px X (H)40px" data-selector="img" style={{borderRadius: 0, bordeColor: 'rgb(78, 78, 78)', borderStyle: 'none', borderWidth: '1px', maxHeight: 40}} id="ui-id-16"/></Link>
                    </div>
                    <div className="pull-right">
                        <button data-target="#bs-example-navbar-collapse-1" data-toggle="collapse" className="navbar-toggle collapsed" type="button">
                            <span className="sr-only">Toggle navigation</span>
                            <span className="icon-bar"></span>
                            <span className="icon-bar"></span>
                            <span className="icon-bar"></span>
                        </button>
                        <div id="bs-example-navbar-collapse-1" className="collapse navbar-collapse pull-right">
                            <ul className="nav navbar-nav">
                                <li className="propClone"><Link to='/podcast' className="inner-link"  data-selector="nav a" style={{color: 'rgb(255, 255, 255)', backgroundColor: 'rgba(0, 0, 0, 0)', borderColor: 'rgb(255, 255, 255) rgb(255, 255, 255) rgba(0, 0, 0, 0)', fontFamily: 'Montserrat, sans-serif', textTransform: 'none', fontSize: '16px', fontWeight: 700}} id="ui-id-18">PODCAST HOSTS</Link></li>
                                <li className="propClone"><Link className="inner-link" to='/selling' data-selector="nav a" style={{color: 'rgb(255, 255, 255)', backgroundColor: 'rgba(0, 0, 0, 0)', borderColor: 'rgb(255, 255, 255) rgb(255, 255, 255) rgba(0, 0, 0, 0)', fontFamily: 'Montserrat, sans-serif', textTransform: 'none', fontSize: '16px', fontWeight: 700}} id="ui-id-19">SELLING AUDIOS</Link></li>
                                <li className="propClone"><Link className="inner-link" to='/pricing' data-selector="nav a" style={{color: 'rgb(255, 255, 255)', backgroundColor: 'rgba(0, 0, 0, 0)', borderColor: 'rgb(255, 255, 255) rgb(255, 255, 255) rgba(0, 0, 0, 0)', fontFamily: 'Montserrat, sans-serif', textTransform: 'none', fontSize: '16px', fontWeight: 700}} id="ui-id-20">PRICING</Link></li>
                                {this.renderLogin()}
                            </ul>
                        </div>
                    </div>
                </nav>
            </header>
            <section className="no-padding cover-background tz-builder-bg-image" data-img-size="(W)1920px X (H)750px" style={{paddingTop: 0, paddingBottom: 0, backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url("images/uploads/Screenshot 2018-06-14 17.10.56.png")'}} data-selector=".tz-builder-bg-image" id="ui-id-10">
                <div className="container">
                    <div className="row equalize xs-equalize-auto equalize-display-inherit">
                        <div className="col-md-6 col-sm-7 col-xs-12 text-left xs-margin-nineteen-bottom xs-text-center display-table pull-right" style={{height: 713}}>
                            <div className="display-table-cell-vertical-middle xs-padding-nineteen-top">
                                <h1 className="sm-title-extra-large alt-font xs-title-extra-large line-height-55 text-white tz-text margin-eight-bottom" data-selector=".tz-text" style={{color: 'rgb(255, 255, 255)', backgroundColor: 'rgba(0, 0, 0, 0)', fontFamily: 'Montserrat, sans-serif', borderRadius: 0, fontSize: 60, fontWeight: 700}} id="ui-id-33"><p>Turn Casual Listeners Into Loyal Customers</p></h1>
                                <div className="text-white text-extra-large xs-text-extra-large margin-twelve-bottom sm-margin-nine-bottom width-80 sm-width-100 tz-text" data-selector=".tz-text" ><p>For coaches, consultants, and entrepreneurial experts. Build an engaged, loyal listener community for your podcast with Soundwise. So that you can turn more listeners into customers.</p></div>
                                <Link to='/signup_options' className="btn btn-large btn-circle propClone bg-white text-dark-gray xs-margin-thirteen-bottom" href="#" data-selector="a.btn, button.btn" ><span className="tz-text" data-selector=".tz-text" style={{color: 'rgb(40, 40, 40)', backgroundColor: 'rgba(0, 0, 0, 0)', fontWeight: 600, fontFamily: 'Montserrat, sans-serif', textTransform: 'none', borderRadius: 0, fontSize: 18}} id="ui-id-32">SUBMIT YOUR PODCAST FEED OR START ANEW</span></Link>
                            </div>
                        </div>
                        <div className="col-md-6 col-sm-5 col-xs-12 display-table" style={{height: 713}}>
                            <div className="text-left xs-text-center display-table-cell-vertical-bottom padding-twenty-nine-top xs-no-padding-top">
                                <img src="images/application-slider-mobile.png" data-img-size="(W)436px X (H)629px" alt="" data-selector="img" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
        <section className="padding-110px-tb xs-padding-60px-tb bg-white builder-bg" id="content-section32" data-selector=".builder-bg" data-img-size="(W)1920px X (H)750px" style={{paddingTop: 0, paddingBottom: 0, backgroundImage: ' url("images/uploads/Screenshot 2018-06-14 17.10.56.png")'}} data-selector=".tz-builder-bg-image" id="ui-id-10">
            <div className="container">
                <div className="row equalize xs-equalize-auto equalize-display-inherit">
                    <div className="col-lg-5 col-md-6 col-sm-6 xs-12 xs-text-center xs-margin-nineteen-bottom display-table" style={{height: 651}}>
                        <div className="display-table-cell-vertical-middle">
                            <h2 className="alt-font  sm-title-large xs-title-large text-fast-blue margin-eight-bottom tz-text sm-margin-ten-bottom" data-selector=".tz-text" style={{backgroundColor: 'rgba(0, 0, 0, 0)', fontFamily: 'Montserrat, sans-serif', borderRadius: 0, color: 'rgb(247, 107, 28)', fontSize: 42, fontWeight: 700 }} id="ui-id-41">Double your email list growth. With no extra work.</h2>
                            <div className=" tz-text width-90 sm-width-100 margin-seven-bottom sm-margin-ten-bottom" data-selector=".tz-text" style={{backgroundColor: 'rgba(0, 0, 0, 0)', fontWeight: 300, fontFamily: 'Open Sans, sans-serif', borderRadius: 0, color: 'rgb(0, 0, 0)', fontSize: 18}} id="ui-id-42"><p>Leverage your podcast to grow one of your biggest assets in business—your email list— 100% faster. And make your communication intimate and special with group text messages. Directly to your listeners’ phones.</p></div>
                            <div className=" tz-text width-90 sm-width-100 margin-fifteen-bottom sm-margin-ten-bottom" data-selector=".tz-text" style={{backgroundColor: 'rgba(0, 0, 0, 0)', fontWeight: 400, fontFamily: 'Open Sans, sans-serif', borderRadius: 0, color: 'rgb(0, 0, 0)', fontSize: 18}} id="ui-id-43"><p><i className ="far fa-check-square" style={{marginRight: 5, color: Colors.mainOrange}}></i> Get name and email of every subscriber to your Soundwise channel</p><p><i className ="far fa-check-square" style={{marginRight: 5, color: Colors.mainOrange}}></i> Automated emails to subscribers when publishing new episodes</p><p><i style={{marginRight: 5, color: Colors.mainOrange}} className ="far fa-check-square"></i> Text-message and email your subscribers about new updates</p></div>
                            <Link to='/signup_options' className="btn btn-medium propClone btn-circle bg-fast-blue text-white" href="#" data-selector="a.btn, button.btn" style={{color: 'rgb(255, 255, 255)', borderColor: 'rgba(0, 0, 0, 0)', fontSize: 12, fontWeight: 600, fontFamily: 'Montserrat, sans-serif', borderRadius: 30, backgroundColor: 'rgb(247, 107, 28)'}} id="ui-id-45"><span className="tz-text" data-selector=".tz-text" style={{color: 'rgb(255, 255, 255)', backgroundColor: 'rgba(0, 0, 0, 0)', fontWeight: 600, fontFamily: 'Montserrat, sans-serif', borderRadius: 0, fontSize: 16}} id="ui-id-44">SUBMIT YOUR PODCAST FEED OR START ANEW</span></Link>
                        </div>
                    </div>
                    <div className="col-lg-7 col-md-6 col-sm-6 xs-12 xs-text-center display-table" style={{height: 651}}>
                        <div className="display-table-cell-vertical-middle">
                            <img alt="" src="images/application-screenshot-img-06.png" data-img-size="(W)800px X (H)785px" data-selector="img" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <section className="padding-110px-tb feature-style29 bg-white builder-bg xs-padding-60px-tb" id="content-section44" data-selector=".builder-bg" >
            <div className="container">
                <div className="row equalize xs-equalize-auto equalize-display-inherit">
                    <div className="col-md-5 display-table col-md-pull-1 col-sm-pull-0 col-sm-12 col-xs-12 xs-margin-nineteen-bottom sm-height-auto" style={{height: 650}}>
                        <div className="display-table-cell-vertical-middle">
                            <img className="img-responsive sm-width-60 xs-width-100 margin-lr-auto sm-margin-twenty-bottom" src="images/infographic-2.png" data-img-size="(W)984px X (H)1376px" alt="" data-selector="img" />
                        </div>
                    </div>
                    <div className="col-md-7 col-sm-12 col-xs-12 display-table sm-height-auto" style={{height: 650}}>
                        <div className="display-table-cell-vertical-middle">
                            <div className="col-md-12 col-sm-12 col-xs-12">
                                <h2 className=" sm-section-title-medium xs-section-title-large margin-four-bottom xs-text-center tz-text" data-selector=".tz-text" style={{backgroundColor: 'rgba(0, 0, 0, 0)', fontFamily: 'Open Sans, sans-serif', borderRadius: 0, color: 'rgb(97, 225, 251)', fontSize: 42, fontWeight: 700}} id="ui-id-48">Get more podcast subscribers.</h2>
                                <p className="text-extra-large font-weight-300 margin-fifteen-bottom xs-margin-nineteen-bottom xs-text-center tz-text" data-selector=".tz-text" style={{backgroundColor: 'rgba(0, 0, 0, 0)', fontSize: 18, fontWeight: 300, fontFamily: 'Open Sans, sans-serif', borderRadius: 0, color: 'rgb(0, 0, 0)'}} id="ui-id-49">Attract more subscribers with our battle-tested landing page template. Rise above the noise by showcasing unique benefits and value of your show. Capture listener attention with episode pages and timed popups.&nbsp;</p>
                            </div>
                            <div className="row two-column no-margin">
                                <div className="col-md-6 col-sm-6 col-xs-12 margin-eight-bottom xs-margin-fifteen-bottom xs-text-center">
                                    <div className="float-left xs-margin-lr-auto xs-float-none xs-margin-seven-bottom" style={{color: Colors.link}}><i className="fas fa-columns  title-extra-large tz-icon-color" data-selector=".tz-icon-color" ></i></div>
                                    <div className="info xs-no-margin xs-width-100 xs-clear-both">
                                        <h3 className="text-medium alt-font margin-two-bottom text-dark-gray tz-text" data-selector=".tz-text" >Optimized podcast landing page on web and mobile</h3>

                                    </div>
                                </div>
                                <div className="col-md-6 col-sm-6 col-xs-12 margin-eight-bottom xs-margin-fifteen-bottom xs-text-center">
                                    <div className="float-left xs-margin-lr-auto xs-float-none xs-margin-seven-bottom"><i className="fas fa-share-alt ti-flag-alt-2  title-extra-large tz-icon-color" data-selector=".tz-icon-color" style={{color: Colors.link}}></i></div>
                                    <div className="info xs-no-margin xs-width-100 xs-clear-both">
                                        <h3 className="text-medium alt-font margin-two-bottom text-black tz-text" data-selector=".tz-text" >Social-sharing-ready pages for individual episodes</h3>

                                    </div>
                                </div>
                                <div className="col-md-6 col-sm-6 col-xs-12 xs-margin-fifteen-bottom xs-text-center">
                                    <div className="float-left xs-margin-lr-auto xs-float-none xs-margin-seven-bottom"><i className="fas fa-eye title-extra-large tz-icon-color" style={{color: Colors.link}} data-selector=".tz-icon-color" ></i></div>
                                    <div className="info xs-no-margin xs-width-100 xs-clear-both">
                                        <h3 className="text-medium alt-font margin-two-bottom text-black tz-text" data-selector=".tz-text" >Pleasant “subscribe” popup appearing on player pause, stop, and half-way progress&nbsp;</h3>

                                    </div>
                                </div>
                                <div className="col-md-6 col-sm-6 col-xs-12 xs-no-margin-bottom xs-text-center">
                                    <div className="float-left xs-margin-lr-auto xs-float-none xs-margin-seven-bottom"><i className="fab fa-wpforms ti-announcement  title-extra-large tz-icon-color" data-selector=".tz-icon-color" style={{color: Colors.link}} ></i></div>
                                    <div className="info xs-no-margin xs-width-100 xs-clear-both">
                                        <h3 className="text-medium alt-font margin-two-bottom text-black tz-text" data-selector=".tz-text" >Easily integrating signup form into your own website</h3>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <section className="bg-gray builder-bg border-none" id="content-section20" data-selector=".builder-bg" >
            <div className="container-fluid">
                <div className="row equalize">
                    <div className="col-md-6 col-sm-12 col-xs-12 display-table no-padding xs-padding-ten" style={{height: 833}}>
                        <div className="display-table-cell-vertical-middle padding-twenty-two md-padding-seven xs-no-padding-lr">
                            <div className="col-md-12 col-sm-12 col-xs-12 margin-nine-top xs-no-padding-lr">
                                <h2 className=" sm-title-extra-large xs-title-extra-large   margin-three-bottom xs-margin-fifteen-bottom tz-text" data-selector=".tz-text" style={{backgroundColor: 'rgba(0, 0, 0, 0)', fontFamily: 'Open Sans, sans-serif', borderRadius: 0, color: 'rgb(247, 107, 28)', fontSize: 42, fontWeight: 700}} id="ui-id-52">Take your listener relationship from casual to committed.
            </h2>
                        <div className="text-extra-large sm-text-extra-large font-weight-300 width-85 md-width-100 margin-twenty-bottom sm-margin-fifteen-bottom tz-text" data-selector=".tz-text" style={{backgroundColor: 'rgba(0, 0, 0, 0)', fontSize: 18, fontWeight: 300, fontFamily: 'Open Sans, sans-serif', borderRadius: 0, color: 'rgb(0, 0, 0)'}} id="ui-id-53"><p>Build an engaged tribe for your podcast from the phone. Make listeners more invested in you with conversations through messages and comments. Allow your subscribers to feel ultra special (and attract more of them) with subscriber-only content.&nbsp;</p></div>
                            </div>
                            <div className="two-column">
                                <div className="col-lg-6 col-md-12 col-sm-6 col-xs-12 margin-eight-bottom xs-margin-fifteen-bottom xs-no-padding-lr">
                                    <div className="float-left width-100 margin-four-bottom">
                                        <div className="col-md-2 col-sm-2 col-xs-12 no-padding"><i className="far fa-comments ti-desktop text-fast-blue title-large tz-icon-color" data-selector=".tz-icon-color" style={{color: Colors.mainOrange}}></i></div>
                                        <h3 className=" sm-title-small text-dark-gray col-md-10 col-sm-10 col-xs-12 no-padding-left no-padding margin-three-top md-margin-two-top sm-margin-four-top tz-text" data-selector=".tz-text" style={{color: 'rgb(40, 40, 40)', backgroundColor: 'rgba(0, 0, 0, 0)', fontWeight: 500, fontFamily: 'Open Sans, sans-serif', borderRadius: 0, fontSize: 18}} id="ui-id-54">Chatting with your fans about an episode and allowing your fans to talk among themselves</h3>
                                    </div>

                                </div>
                                <div className="col-lg-6 col-md-12 col-sm-6 col-xs-12 margin-eight-bottom xs-margin-fifteen-bottom xs-no-padding-lr">
                                    <div className="float-left width-100 margin-four-bottom">
                                        <div className="col-md-2 col-sm-2 col-xs-12 no-padding"><i className="fas fa-paperclip text-fast-blue title-large tz-icon-color" data-selector=".tz-icon-color" style={{color: Colors.mainOrange}}></i></div>
                                        <h3 className=" sm-title-small text-dark-gray col-md-10 col-sm-10 col-xs-12 no-padding-left no-padding margin-three-top md-margin-two-top sm-margin-four-top tz-text" data-selector=".tz-text" style={{color: 'rgb(40, 40, 40)', backgroundColor: 'rgba(0, 0, 0, 0)', fontWeight: 500, fontFamily: 'Open Sans, sans-serif', borderRadius: 0, fontSize: 18}} id="ui-id-55">Adding supplementary materials to an episode (text, image, or pdf) with few clicks</h3>
                                    </div>

                                </div>
                                <div className="col-lg-6 col-md-12 col-sm-6 col-xs-12 margin-eight-bottom xs-margin-fifteen-bottom xs-no-padding-lr">
                                    <div className="float-left width-100 margin-four-bottom">
                                        <div className="col-md-2 col-sm-2 col-xs-12 no-padding"><i className="fas fa-microphone text-fast-blue title-extra-large tz-icon-color" data-selector=".tz-icon-color" style={{color: Colors.mainOrange}}></i></div>
                                        <h3 className=" sm-title-small text-dark-gray col-md-10 col-sm-10 col-xs-12 no-padding-left no-padding margin-three-top md-margin-two-top sm-margin-four-top tz-text" data-selector=".tz-text" style={{color: 'rgb(40, 40, 40)', backgroundColor: 'rgba(0, 0, 0, 0)', fontWeight: 500, fontFamily: 'Open Sans, sans-serif', borderRadius: 0, fontSize: 18}} id="ui-id-56">Creating subscriber-only episodes with ease</h3>
                                    </div>

                                </div>
                                <div className="col-lg-6 col-md-12 col-sm-6 col-xs-12 margin-eight-bottom xs-no-padding-lr">
                                    <div className="float-left width-100 margin-four-bottom">
                                        <div className="col-md-2 col-sm-2 col-xs-12 no-padding"><i className="fas fa-child text-fast-blue title-extra-large tz-icon-color" data-selector=".tz-icon-color" style={{color: Colors.mainOrange}}></i></div>
                                        <h3 className="sm-title-small text-dark-gray col-md-10 col-sm-10 col-xs-12 no-padding-left no-padding margin-three-top md-margin-two-top sm-margin-four-top tz-text" data-selector=".tz-text" style={{color: 'rgb(40, 40, 40)', backgroundColor: 'rgba(0, 0, 0, 0)', fontWeight: 500, fontFamily: 'Open Sans, sans-serif', borderRadius: 0, fontSize: 18}} id="ui-id-57">Giving private access to only invited listeners&nbsp;</h3>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 col-sm-12 col-xs-12 tz-builder-bg-image sm-height-600-px xs-height-400-px cover-background" data-img-size="(W)1000px X (H)800px" style={{background: 'linear-gradient(rgba(0, 0, 0, 0.01), rgba(0, 0, 0, 0.01)), url("images/bg-image/hero-bg22.jpg")', height: 833}} data-selector=".tz-builder-bg-image"></div>
                </div>
            </div>
        </section>

        <section className="padding-110px-tb xs-padding-60px-tb bg-white builder-bg" id="content-section50" data-selector=".builder-bg" >
            <div className="container">
                <div className="row equalize xs-equalize-auto equalize-display-inherit">
                    <div className="col-md-6 col-sm-6 xs-12 xs-text-center display-table" style={{height: 481}}>
                        <div className="display-table-cell-vertical-middle">
                            <img alt="" src="images/content-50.jpg" data-img-size="(W)800px X (H)681px" data-selector="img" />
                        </div>
                    </div>
                    <div className="col-md-6 col-sm-6 xs-12 xs-text-center xs-margin-nineteen-bottom display-table" style={{height: 481}}>
                        <div className="display-table-cell-vertical-middle">
                            <h2 className="alt-font sm-title-large xs-section-title-large line-height-40 width-90 sm-width-100 margin-eight-bottom tz-text sm-margin-ten-bottom sm-margin-ten-top" style={{backgroundColor: 'rgba(0, 0, 0, 0)', fontFamily: 'Montserrat, sans-serif', borderRadius: 0, color: Colors.link, fontSize: 42, fontWeight: 600}} data-selector=".tz-text" id="ui-id-60">Understand your listeners intimately.</h2>
                            <div className="text-extra-large tz-text width-90 sm-width-100 margin-five-bottom sm-margin-ten-bottom" style={{backgroundColor: 'rgba(0, 0, 0, 0)', fontSize: 18, fontWeight: 300, fontFamily: 'Open Sans, sans-serif', borderRadius: 0, color: 'rgb(0, 0, 0)'}} data-selector=".tz-text" id="ui-id-61">Understand what your subscribers want with listening-session tracking. Make your marketing smarter by knowing who your biggest fans are.</div>
                            <div className=" tz-text width-90 sm-width-100 margin-ten-bottom sm-margin-ten-bottom xs-margin-twenty-bottom" style={{backgroundColor: 'rgba(0, 0, 0, 0)', fontSize: 18, fontWeight: 400, fontFamily: 'Open Sans, sans-serif', borderRadius: 0, color: 'rgb(0, 0, 0)'}} data-selector=".tz-text" id="ui-id-62"><p><i className="far fa-play-circle" style={{color: Colors.link, marginRight: 5}}></i> See every subscriber’s listening record</p><p><i className="far fa-play-circle" style={{color: Colors.link, marginRight: 5}}></i> Know who your most avid listeners are</p><p><i className="far fa-play-circle" style={{color: Colors.link, marginRight: 5}}></i> See which episodes perform the best</p></div>
                              <Link to='/signup_options' className="btn-medium btn-circle btn  btn-border text-fast-blue propClone"  data-selector="a.btn, button.btn" style={{backgroundColor: 'rgba(0, 0, 0, 0)', fontWeight: 600, fontFamily: 'Montserrat, sans-serif', borderRadius: 30, color: 'rgb(97, 225, 251)', borderColor: Colors.link, fontSize: 18}} id="ui-id-59"><span className="tz-text" data-selector=".tz-text" >SUBMIT YOUR PODCAST FEED OR START ANEW</span></Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section className="padding-110px-tb xs-padding-60px-tb bg-white builder-bg" id="content-section51" data-selector=".builder-bg" >
            <div className="container">
                <div className="row equalize xs-equalize-auto equalize-display-inherit">
                    <div className="col-md-6 col-sm-6 xs-12 xs-text-center xs-margin-nineteen-bottom display-table" style={{height: 481}}>
                        <div className="display-table-cell-vertical-middle">
                            <h2 className="alt-font sm-title-large xs-section-title-large line-height-40 width-90 sm-width-100 margin-eight-bottom tz-text sm-margin-ten-bottom" style={{backgroundColor: 'rgba(0, 0, 0, 0)', fontSamily: 'Montserrat, sans-serif', borderRadius: 0, color: 'rgb(247, 107, 28)', fontSize: 42, fontWeight: 700}} data-selector=".tz-text" id="ui-id-65">The easiest way to sell your audios.</h2>
                            <div className="text-extra-large tz-text width-90 sm-width-100 margin-five-bottom sm-margin-ten-bottom" style={{backgroundColor: 'rgba(0, 0, 0, 0)', fontSize: 18, fontWeight: 400, fontFamily: 'Open Sans, sans-serif', borderRadius: 0, color: 'rgb(0, 0, 0)'}} data-selector=".tz-text" id="ui-id-66">Turn your podcast listeners into paying customers of your audio courses and programs with a few clicks.</div>
                            <div className="text-medium tz-text width-90 sm-width-100 margin-ten-bottom sm-margin-ten-bottom xs-margin-twenty-bottom" style={{backgroundColor: 'rgba(0, 0, 0, 0)', fontSize: 18, fontWeight: 400, fontFamily: 'Open Sans, sans-serif', borderRadius: 0, color: 'rgb(0, 0, 0)'}}  data-selector=".tz-text" id="ui-id-67"><p>Easy and secure delivery of your audio products that pleases your customers.</p></div>
                            <Link to='/selling' className="btn-medium btn-circle btn border-2-light-orange btn-border text-light-orange propClone" href="#" data-selector="a.btn, button.btn" ><span className="tz-text" style={{backgroundColor: 'rgba(0, 0, 0, 0)', fontWeight: 600, fontFamily: 'Montserrat, sans-serif', borderRadius: 0, color: 'rgb(247, 107, 28)', fontSize: 16}} data-selector=".tz-text" id="ui-id-64">LEARN MORE</span></Link>
                        </div>
                    </div>
                    <div className="col-md-6 col-sm-6 xs-12 xs-text-center display-table" style={{height: 481}}>
                        <div className="display-table-cell-vertical-middle">
                            <img alt="" src="images/content-51.jpg" data-img-size="(W)800px X (H)681px" data-selector="img" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <section className="call-to-action4 padding-90px-tb builder-bg offer bg-gray border-none xs-padding-60px-tb" id="callto-action4" data-selector=".builder-bg" >
            <div className="container">
                <div className="row equalize xs-equalize-auto equalize-display-inherit">
                    <div className="col-md-6 col-sm-6 col-xs-12 display-table slider-text-middle text-left xs-margin-nineteen-bottom xs-text-center" style={{height: 585}}>
                        <div className="display-table-cell-vertical-middle">
                            <div className="offer-box-left">

                                <span className=" alt-font xs-title-extra-large letter-spacing-minus-1 text-dark-gray display-block font-weight-700 margin-nine-bottom tz-text" style={{color: 'rgb(40, 40, 40)', backgroundColor: 'rgba(0, 0, 0, 0)', fontWeight: 700, fontFamily: 'Montserrat, sans-serif', borderRadius: 0, fontSize: 60, lineHeight: '65px'}} data-selector=".tz-text" id="ui-id-70">Convert more listeners into customers with Soundwise</span>
                                <div className=" width-90 sm-width-100 margin-sixteen-bottom tz-text" data-selector=".tz-text" style={{backgroundColor: 'rgba(0, 0, 0, 0)', fontWeight: 400, fontFamily: 'Open Sans, sans-serif', borderRadius: 0, color: 'rgb(0, 0, 0)', fontSize: 18}} id="ui-id-71"><p>Build an engaged audience for your podcast that leads to bigger impact and more sales.</p></div>
                            </div>
                            <div className="float-left width-100 xs-text-center">
                                <a target='_blank' href="https://itunes.apple.com/us/app/soundwise-learn-on-the-go/id1290299134?ls=1&mt=8" className="sm-width-140px float-left xs-float-none xs-display-inline-block"><img src="images/app-store-badge.png" style={{width: 200}} data-img-size="(W)200px X (H)61px" alt="" data-selector="img" /></a>
                                <a target='_blank' href="https://play.google.com/store/apps/details?id=com.soundwisecms_mobile_android" className="sm-width-140px float-left xs-float-none margin-five-left xs-margin-two-left xs-display-inline-block"><img src="images/google-play-badge.png" data-img-size="(W)200px X (H)61px" alt="" data-selector="img" style={{width: 200}}/></a>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 col-sm-6 col-xs-12 display-table text-right xs-margin-lr-auto xs-fl-none xs-no-padding-bottom" style={{height: 585}}>
                        <div className="display-table-cell-vertical-middle">
                            <img src="images/design-screenshot6.png" data-img-size="(W)800px X (H)828px" alt="" data-selector="img" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <section className="padding-60px-tb bg-fast-blue builder-bg border-none" id="callto-action9" data-selector=".builder-bg" style={{padding: '60px 0px', borderColor: 'rgb(112, 112, 112)', backgroundColor: 'rgb(247, 107, 28)'}}>
            <div className="container">
                <div className="row equalize sm-equalize-auto">
                    <div className="col-md-6 col-sm-12 col-xs-12 sm-text-center display-table sm-margin-ten-bottom xs-margin-fifteen-bottom" style={{height: 80}}>
                        <div className="offer-box-left display-table-cell-vertical-middle">
                            <div className="display-table-cell-vertical-middle sm-display-inline-block">

                            <span className="title-extra-large xs-title-extra-large text-white font-weight-400 display-block tz-text"  data-selector=".tz-text">30-day money back guarantee. No risk involved.</span>
                        </div>
                            </div>
                    </div>
                    <div className="col-md-6 col-sm-12 col-xs-12 sm-text-center text-right display-table" style={{height: 80}}>
                        <div className="btn-dual display-table-cell-vertical-middle">
                            <Link to='/signup_options' className="btn btn-large propClone bg-white  btn-circle xs-margin-ten-bottom" href="#" data-selector="a.btn, button.btn" ><span className="tz-text" style={{backgroundColor: 'rgba(0, 0, 0, 0)', fontWeight: 600, fontFamily: 'Montserrat, sans-serif', borderRadius: 0, color: 'rgb(247, 107, 28)', fontSize: 16}} data-selector=".tz-text" id="ui-id-73">SUBMIT YOUR PODCAST FEED OR START A NEW ONE</span></Link>

                            </div>
                    </div>
                </div>
            </div>
        </section>
        <Footer
          showPricing={true}
        ></Footer>
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

export const LandingPagePodcast = connect(mapStateToProps, mapDispatchToProps)(_LandingPagePodcast);
