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

class Page extends Component {
    constructor() {
        super()
        this.state={
            open: false
        }

    }

    componentDidMount() {

    }


    render() {
        return (
          <div id="page" className="page ao-font-lato">
            <Header></Header>
            <Banner></Banner>
            <Feature_section></Feature_section>
            <Video></Video>
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