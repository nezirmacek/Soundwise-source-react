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
import { EditorState, convertToRaw } from 'draft-js'

import { SoundcastHeader } from './components/soundcast_header'
import Footer from '../../components/footer'

import SoundcastBody  from './components/soundcast_body'
import SoundcastFooter from './components/soundcast_footer'
import Banner from './components/banner'
import {PricingModal} from './components/pricing_modal'

import  PageHeader  from './components/page_header'
import {SoundwiseHeader} from '../../components/soundwise_header'
import RelatedSoundcasts from './components/related_soundcasts'
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
        long_description: JSON.stringify(convertToRaw(EditorState.createEmpty().getCurrentContent())),
        prices: [{}],
        modalOpen: false
      },
      cardHeight: 0,
      showBanner: false,
    }
    this.nv = null;
    this.handleScroll = this.handleScroll.bind(this);
  }

  componentDidMount() {
    const that = this;
    const {history} = this.props;
    const soundcastID = this.props.match.params.id;

    firebase.database().ref('soundcasts/' + soundcastID)
      .once('value', snapshot => {
        if(snapshot.val()) {
          that.setState({
            soundcast: snapshot.val(),
            soundcastID
          });
        } else {
            history.push('/notfound');
        }
      });
    // this.nv.addEventListener('scroll', this.handleScroll);
    window.addEventListener('scroll', this.handleScroll);
  }

  componentWillReceiveProps(nextProps) {
    const that = this;
    const {history} = this.props;
    if(nextProps.match.params.id !== this.props.match.params.id) {
      const soundcastID = nextProps.match.params.id;
      // console.log('soundcastID: ', soundcastID);
      firebase.database().ref('soundcasts/' + soundcastID)
        .once('value', snapshot => {
          if(snapshot.val()) {
            that.setState({
              soundcast: snapshot.val(),
              soundcastID
            });
          } else {
            history.push('/notfound');
          }
        })
    }
  }

  componentWillUnmount() {
    // Make sure to remove the DOM listener when the component is unmounted.
    window.removeEventListener("scroll", this.handleScroll);
  }

  handleScroll(e) {
    const headerHeight = this.header.clientHeight;
    const bodyHeigher = this.body.clientHeight;
    if(window.pageYOffset > headerHeight && window.pageYOffset < bodyHeigher) {
      this.setState({
        showBanner: true,
      });
    } else {
      this.setState({
        showBanner: false,
      });
    }
  }

  setMaxCardHeight (height) {
    if (height > this.state.cardHeight) {
      this.setState({ cardHeight: height });
    }
  };

  handleModal() {
    const {modalOpen} = this.state;
    this.setState({
      modalOpen: !modalOpen
    })
  }

  render() {
    const soundcastID = this.props.match.params.id;
    const {soundcast, modalOpen, showBanner} = this.state;
    if(!soundcastID || !soundcast || (soundcast && soundcast.title && !soundcast.landingPage)) {
      return (
        <Redirect to="/notfound"/>
      )
    }
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
          <meta name="twitter:title" content={soundcast.title}/>
          <meta name="twitter:description" content={soundcast.short_description}/>
          <meta name="twitter:image" content={soundcast.imageURL}/>
          <meta name="twitter:card" content={soundcast.imageURL} />
        </Helmet>
        <MuiThemeProvider >
          <div>
            <div ref={(elem) => this.header = elem}>
            <SoundwiseHeader
                soundcastID={soundcastID}
              />
              <PricingModal
                soundcast={soundcast}
                soundcastID={soundcastID}
                open={modalOpen}
                handleModal={this.handleModal.bind(this)}/>
              <SoundcastHeader
                soundcast={soundcast}
                soundcastID={soundcastID}
                openModal={this.handleModal.bind(this)}/>
            </div>
            <div ref={(elem) => this.body = elem}>
              <SoundcastBody
                    showBanner={showBanner}
                    soundcast={soundcast}
                    soundcastID={soundcastID}
                    openModal={this.handleModal.bind(this)}
                    // relatedsoundcasts={_relatedsoundcasts}
                    cb={this.setMaxCardHeight.bind(this)}
                    userInfo={this.props.userInfo}
                    history={this.props.history}
              />
            </div>
            {
              showBanner &&
              <Banner
                soundcast={soundcast}
                soundcastID={soundcastID}
                openModal={this.handleModal.bind(this)}/>
              || null
            }
            <SoundcastFooter
              soundcast={soundcast}
              soundcastID={soundcastID}
              openModal={this.handleModal.bind(this)}/>
            <Footer
              soundcastID={soundcastID}
            />
          </div>
        </MuiThemeProvider>
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

