import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Link } from 'react-router-dom'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import {Helmet} from "react-helmet"
import firebase from 'firebase'
import { withRouter } from 'react-router'
import { Redirect } from 'react-router-dom'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import getMuiTheme from 'material-ui/styles/getMuiTheme'

import { SoundcastHeader } from './components/soundcast_header'
import Footer from '../../components/footer'

import SoundcastBody  from './components/soundcast_body'
import SoundcastFooter from './components/soundcast_footer'


import  PageHeader  from './components/page_header'
// import {CourseSignup} from './course_signup'

class _SoundcastPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      soundcastID: '',
      soundcast: {
        title: '',
        short_description: '',
        imageURL: '',
        long_description: '',
      },
      cardHeight: 0,
    }
  }

  componentDidMount() {
    const that = this;
    const soundcastID = this.props.match.params.id;
    firebase.database().ref('soundcasts/' + soundcastID)
      .on('value', snapshot => {
        that.setState({
          soundcast: snapshot.val(),
          soundcastID
        })
      })
  }

  setMaxCardHeight (height) {
    if (height > this.state.cardHeight) {
      this.setState({ cardHeight: height });
    }
  };



  render() {
    const {soundcast, soundcastID} = this.state;

    return (
      <div>
        <Helmet>
          <title>{`${soundcast.title} | Soundwise`}</title>
          <meta property="og:url" content={`https://mysoundwise.com/soundcasts/${soundcastID}`} />
          <meta property="fb:app_id" content='1726664310980105' />
          <meta property="og:title" content={soundcast.title}/>
          <meta property="og:description" content={soundcast.short_description}/>
          <meta property="og:image" content={soundcast.imageURL} />
          <meta name="description" content={soundcast.short_description} />
          <meta name="keywords" content={soundcast.keywords} />
        </Helmet>
        <PageHeader />
        <SoundcastHeader soundcast={soundcast} soundcastID={soundcastID}/>

        <MuiThemeProvider >
          <SoundcastBody
              soundcast={soundcast}
              soundcastID={soundcastID}
              // relatedsoundcasts={_relatedsoundcasts}
              cb={this.setMaxCardHeight.bind(this)}
              userInfo={this.props.userInfo}
              history={this.props.history}
          />
        </MuiThemeProvider>
        <SoundcastFooter soundcast={soundcast} soundcastID={soundcastID}/>
        <Footer />
      </div>
    )
  }
}



// function mapDispatchToProps(dispatch) {
//   return bindActionCreators({ setCurrentPlaylist, setCurrentCourse, loadCourses }, dispatch)
// }

const mapStateToProps = state => {
  const { userInfo, isLoggedIn } = state.user
  return {
    userInfo, isLoggedIn
  }
}


const SP_worouter = connect(mapStateToProps, null)(_SoundcastPage)

export const SoundcastPage = withRouter(SP_worouter)

