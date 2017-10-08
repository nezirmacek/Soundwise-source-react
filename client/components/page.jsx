import React, {Component} from 'react'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import Dialog from 'material-ui/Dialog'
import {Header} from './header'
import Banner from './banner'
import Feature_section from './feature_section'
import Testimonial from './testimonial'
import Media_mention from './media_mention'
import Callto_action from './callto_action'
import Footer from './footer'
import Pricing from './pricing'
import Video from './video'

const customContentStyle = {
  width: '100%',
  maxWidth: 'none',
}

const headerProps = {
  title: 'SPREAD YOUR KNOWLEDGE FAST WITH AUDIO',
  tagline: 'On-demand audio training solution for organizations and experts to efficiently engage audience and provide training on the go.',
  logoImage: "images/soundwiselogo_white.svg",
  backgroundImage: 'images/header_img_3.png',
  gradient1: 'rgba(247,107,28,0.4)',
  gradient2: 'rgba(97,225,251,0.8)',
  // gradient1: 'rgba(0,0,0,0.1)',
  // gradient2: 'rgba(0,0,0,0.1)',
}

const bannerProps = {
    title: 'Lower Training Cost, Higher Impact',
    tagline: 'Maximize training efficiency by letting your audience consume your content wherever they go.',
    subtitle1: 'Asynchronous Delivery',
    description1: 'Audio training is flexible and can be taken anytime, anywhere.',
    subtitle2: 'Easy Dissemination',
    description2: "Record and send audios of your training classes and periodical updates directly to your audience's phones",
    subtitle3: 'Reference & Repeat',
    description3: 'Audio files are organized and searchable for easy reference and re-listening.',
    subtitle4: 'Tracking & Analytics',
    description4: "Track who's listened to what and review listening statistics.",
    image: 'images/section_img_2.png',
}

const featureProps = {
  description: 'Use Soundwise to make your audience more productive and better trained.',
  featureTitle1: 'Record / Upload',
  feature1: 'Upload your training materials to your Soundwise dashboard.',
  featureTitle2: 'Notify / Remind',
  feature2: 'Mobile notifications will be sent to the private group of audience of your choice when new updates are available.',
  featureTitle3: 'Listen / Engage',
  feature3: 'Audience listen to your materials at a time convenient to them. They can also give comments/raise questions from their phones.',
  featureTitle4: 'Track / Analyze',
  feature4: "Listening records down to each individual tells you who's listened to what, helping you analyze and improve your training content.",
}

class Page extends Component {
    constructor() {
        super()
        this.state={
            open: false
        }

    }

    componentDidMount() {
        window.prerenderReady = true;
    }


    render() {
        return (
          <div id="page" className="page ao-font-lato">
            <Header content={headerProps}></Header>
            <Banner content={bannerProps}></Banner>
            <Feature_section content={featureProps}></Feature_section>
            <Pricing></Pricing>
            <Media_mention></Media_mention>
            <Callto_action></Callto_action>
            <Footer></Footer>
          </div>
        )
    }
}

            // <Testimonial></Testimonial>

export default Page;

    // { /* Popup block start <subscribe8> */ }
    // <Popup></Popup>
    // {  Window fake: takes content full size; used for animation, elements with 'window', 'document' position is moved to it  }
    // <div className="ao-window-fake" data-ao-animaze-resize="windowSize:min 100%" />
    // <div id="fb-root" />
    // { /* Popup block end */ }