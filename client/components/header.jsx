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

  renderLogin() {
    console.log('logged in? ', this.props.isLoggedIn)
      if(this.props.isLoggedIn) {
          return (
          <ul className="nav navbar-nav">
            <li className="propClone" style={styles.navItem}>
              <a className='dropdown-toggle' data-toggle="dropdown">
              {`Hello, ${this.capFirstLetter(this.props.userInfo.firstName)} `}
              <span className="caret"></span>
              </a>
                <ul className="dropdown-menu">
                  <li>
                    <Link to='/myprograms'>
                      <font style={{color: 'black'}}>MY PROGRAMS</font>
                    </Link>
                  </li>
                  <li >
                    <a onClick={() => this.signoutUser()}
                      style={{backgroundColor: 'transparent'}}>
                      <font style={{color: 'black'}}>LOG OUT</font>
                    </a>
                  </li>
                </ul>
            </li>
          </ul>
          )
      } else {
          return (
            <ul className="nav navbar-nav">
                <li className="propClone" style={styles.navItem}><Link className="inner-link" to='/signin'>LOG IN</Link></li>
            </ul>
          )
      }
  }

  render() {
    return (
      <div>
        <header className="header-style7" id="header-section18">
            <nav className="navbar tz-header-bg no-margin alt-font shrink-transparent-header-dark dark-header">
                <div className="container navigation-menu">
                    <div className="row">
                        <div className="col-md-3 col-sm-0 col-xs-0">
                            <Link to="/" className="inner-link"><img alt="" src="/images/soundwiselogo_white.svg"/></Link>
                        </div>
                        <div className="col-md-9 col-sm-12 col-xs-12 position-inherit">
                            <button data-target="#bs-example-navbar-collapse-1" data-toggle="collapse" className="navbar-toggle collapsed" type="button">
                                <span className="sr-only">Toggle navigation</span>
                                <span className="icon-bar"></span>
                                <span className="icon-bar"></span>
                                <span className="icon-bar"></span>
                            </button>

                        </div>
                    </div>
                </div>
            </nav>
        </header>
        <section className="no-padding position-relative cover-background tz-builder-bg-image border-none xs-padding-50px-tb hero-style9" id="hero-section18" data-img-size="(W)1920px X (H)800px"
          style={ {  backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.401961), rgba(0, 0, 0, 0.501961)), url("images/header_img4_sm.jpg")',  paddingTop: 0,  paddingBottom: 0} } data-selector=".tz-builder-bg-image">
          <div className="container one-fourth-screen position-relative">
            <div className="row">
              <div className="slider-typography xs-position-static text-center">
                <div className="slider-text-middle-main">
                  <div className="slider-text-middle text-left xs-padding-fifteen xs-no-padding-lr">
                    <Slider></Slider>
                  </div>
                </div>
              </div>
              { /* back to down */ }
              <Headerscroll></Headerscroll>
              { /* end back to down */ }
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