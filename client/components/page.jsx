import React, {Component} from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import Dialog from 'material-ui/Dialog'
import {Header} from './header';
import Banner from './banner';
import Feature_section from './feature_section';
import Testimonial from './testimonial';
import Media_mention from './media_mention';
import Callto_action from './callto_action';
import Footer from './footer';

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

        this.handleClose = this.handleClose.bind(this)
        this.popUp = this.popUp.bind(this)
    }

    componentDidMount() {
        const that = this

        setTimeout(() => {
            that.setState({
                open: true
            })
        }, 10000)
    }

    handleClose() {
        this.setState({
            open: false
        })
    }

    popUp() {
        return (
            <section id="hero-section13" className="no-padding  bg-orange border-none">
                <div className='md-pull-right'
                    style={{float: 'right'}}>
                  <a onClick={this.handleClose}><i className="material-icons text-white"
                     style={{fontSize: '42px'}}
                    >close</i></a>
                </div>
                <div className="container">
                    <div className="row equalize xs-equalize-auto equalize-display-inherit">
                        <div className="col-md-12 col-sm-12 col-xs-12 display-table text-left xs-margin-nineteen-bottom xs-text-center" style={{height: '500px'}}>
                            <div className="display-table-cell-vertical-middle xs-padding-nineteen-top text-center">
                                <h1 className="sm-title-extra-large alt-font xs-title-extra-large letter-spacing-minus-1 title-extra-large-7 line-height-85 text-white tz-text margin-eight-bottom">HEY! CAN WE SEND YOU FREE STUFF?</h1>
                                <div className="text-white title-medium xs-title-small margin-twelve-bottom sm-margin-nine-bottom tz-text text-center width-80 sm-width-100" style={{display: 'flex', alignItem: 'center', justifyContent: 'center'}}><p>Be the first to know when Soundwise is released and get one audio course for FREE.</p></div>
                                <div className="col-md-12 col-sm-12 contact-form-style2 no-padding text-center">
                                        <div className="slider-button">
                                            <a href='https://eepurl.com/cyObp9' type="submit" className="contact-submit tz-text btn btn-large border-radius-4 propClone bg-dark-gray text-white xs-width-100 xs-margin-thirteen-bottom">YES, OF COURSE!</a>
                                        </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        )
    }

    renderPopup() {
        return (
            <MuiThemeProvider >
                <Dialog
                    open={true}
                    contentStyle={customContentStyle}
                    open={this.state.open}
                    onRequestClose={this.handleClose}
                >
                    {this.popUp()}
                </Dialog>
            </MuiThemeProvider>

        )
    }

    render() {
        return (
          <div id="page" className="page ao-font-lato">
            <Header></Header>
            <Banner></Banner>
            <Feature_section></Feature_section>
            <Testimonial></Testimonial>
            <Media_mention></Media_mention>
            <Callto_action></Callto_action>
            <Footer></Footer>
            {this.renderPopup()}
          </div>
        )
    }
}



export default Page;

    // { /* Popup block start <subscribe8> */ }
    // <Popup></Popup>
    // {  Window fake: takes content full size; used for animation, elements with 'window', 'document' position is moved to it  }
    // <div className="ao-window-fake" data-ao-animaze-resize="windowSize:min 100%" />
    // <div id="fb-root" />
    // { /* Popup block end */ }