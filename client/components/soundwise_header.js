import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import * as firebase from "firebase"
import { bindActionCreators } from 'redux'
import IconMenu from 'material-ui/IconMenu'
import MenuItem from 'material-ui/MenuItem'
import IconButton from 'material-ui/IconButton'
import FontIcon from 'material-ui/FontIcon'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import getMuiTheme from 'material-ui/styles/getMuiTheme'

import {signoutUser} from '../actions/index'

const styles = {
  navItem: {
    display: 'inline'
  }
}

class _SoundwiseHeader extends Component {
    constructor(props) {
        super(props)
        this.state={
          buttonValue: 0
        }
        this.signoutUser = this.signoutUser.bind(this)
        this.handleButtonChange = this.handleButtonChange.bind(this)
    }

    signoutUser() {
      let that = this
      firebase.auth().signOut().then(function() {

          that.props.signoutUser()
        }, function(error) {
          console.error('Sign Out Error', error);
        })

    }

    capFirstLetter(name) {
        return name.charAt(0).toUpperCase() + name.slice(1)
    }

    handleButtonChange(e, value) {
      this.setState({
        buttonValue: Number(value)
      })
      if(Number(value)==1) {
        this.signoutUser()
      }
    }

    renderLogin() {

        if(this.props.isLoggedIn) {
            return (
            <ul className="nav navbar-nav">
              <li className="propClone sm-no-border"
                 style={{display: 'none'}}>
                <Link to='/courses' className="inner-link">COURSES</Link>
              </li>
              <li className="propClone sm-no-border" >
                <a className='dropdown-toggle' data-toggle="dropdown">
                {`Hello, ${this.capFirstLetter(this.props.userInfo.firstName)} `}
                <span className="caret"></span>
                </a>
                  <ul className="dropdown-menu">
                    <li>
                      <a onClick={() => this.signoutUser()}>
                        <font style={{color: 'black'}}>LOG OUT</font>
                      </a>
                    </li>
                  </ul>
              </li>
              <li>
                <Link to='/myprograms'>My Courses</Link>
              </li>
              </ul>
            )
        } else {
            return (
            <ul className="nav navbar-nav">
                <li className="propClone sm-no-border" style={{display: 'none'}}><Link to='/courses' className="inner-link">COURSES</Link>
                </li>
                <li className="propClone sm-no-border" style={styles.navItem}><Link className="inner-link" to="/signin">LOG IN</Link>
                </li>
                <li>
                  <Link to='/cart'><i className="material-icons" style={{fontSize: '26px'}}>shopping_cart</i></Link>
                </li>
            </ul>
            )
        }
    }

    render() {
      // console.log('this.props.userInfo: ', this.props.userInfo)
        return (
            <header className="leadgen-agency-1" id="header-section1">
                <nav className="navbar bg-white tz-header-bg no-margin alt-font shrink-header light-header">
                    <div className="container navigation-menu">
                        <div className="row">
                            <div className="col-md-3 col-sm-0 col-xs-0">
                                <Link to='/' className="inner-link"><img alt="Soundwise Logo" src="/images/soundwiselogo.svg" data-img-size="(W)163px X (H)39px" /></Link>
                            </div>
                            <div className="col-md-9 col-sm-12 col-xs-12 position-inherit">
                                <button data-target="#bs-example-navbar-collapse-1" data-toggle="collapse" className="navbar-toggle collapsed" type="button">
                                    <span className="sr-only">Toggle navigation</span>
                                    <span className="icon-bar"></span>
                                    <span className="icon-bar"></span>
                                    <span className="icon-bar"></span>
                                </button>
                                <div id="bs-example-navbar-collapse-1" className="collapse navbar-collapse pull-right font-weight-500">
                                    {this.renderLogin()}
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>
            </header>
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

export const SoundwiseHeader = connect(mapStateToProps, mapDispatchToProps)(_SoundwiseHeader)