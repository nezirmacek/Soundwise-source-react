import React, {Component} from 'react';
import {Card, CardHeader} from 'material-ui/Card';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import PropTypes from 'prop-types';
import draftToHtml from 'draftjs-to-html';
import renderHTML from 'react-render-html';
import { EditorState, convertToRaw } from 'draft-js';

import HowItWorks from './how_it_works';
import Instructor from './instructor';
// import RelatedCourses from './related_courses';
// import AddCourseToUser from '../helpers/add_course_to_user'; // this need to contain { props: { course, userInfo, history } }


export default class SoundcastBody extends Component {
    constructor(props) {
        super(props);

        this.state = {
          soundcastID: '',
          soundcast: {
            title: '',
            short_description: '',
            imageURL: '',
            long_description: JSON.stringify(convertToRaw(EditorState.createEmpty().getCurrentContent())),
            prices: [],
            features: [''],
          },
        };
        this.renderDescription = this.renderDescription.bind(this);
        this.renderFeatures = this.renderFeatures.bind(this);
        // this.renderSections = this.renderSections.bind(this);
        // this.setPlayingLesson = this.setPlayingLesson.bind(this);
        // this.addCourseToUser = AddCourseToUser.bind(this);
    }

    componentDidMount() {
        if(this.props.soundcast) {
            this.setState({
                soundcast: this.props.soundcast
            });

            window.prerenderReady = true;
        }
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.soundcast) {
            this.setState({
                soundcast: nextProps.soundcast
            });

            window.prerenderReady = true;
        }
    }


    /*RENDER*/

    renderDescription() {
        const {long_description} = this.state.soundcast;
        if(long_description) {
            const editorState = JSON.parse(long_description);
            const longDescriptionHTML = draftToHtml(editorState);

            return (
                <div className="row " >
                    <div className="col-md-12 col-sm-12 col-xs-12 bg-cream tz-background-color" style={{padding: '4%'}}>
                        <div>
                            {renderHTML(longDescriptionHTML)}
                        </div>
                    </div>
                </div>
            )
        } else {
            return null;
        }
    }

    renderFeatures() {
        const {features} = this.state.soundcast;

        if(features) {
            return (
                <ul className=" row" style={{paddingBottom: '1em', display: 'flex', flexWrap: 'wrap'}}>
                    {features.map((feature, i) => {
                        return (
                            <li key={i} className=" text-dark-gray text-extra-large  margin-lr-auto col-md-5 col-sm-6 col-xs-12 tz-text" style={{paddingLeft: '0em', paddingRight: '1em', paddingTop: '1em', paddingBottom: '1em', listStyleType: 'none', display: 'flex', alignItems: 'center', }}>
                                <strong><i className="fa fa-sun-o fa-lg" aria-hidden="true" style={{paddingRight: '1em', color: '#F76B1C'}}></i></strong>{feature}
                            </li>
                        )
                    })}
                </ul>
            )
        }
    }

    render() {
        const {soundcast} = this.state;
        return (
            <div>
                <section className="padding-20px-tb xs-padding-40px-tb bg-white builder-bg border-none" id="title-section1">
                    <div className="container">
                        {
                            soundcast.features && soundcast.features[0].length > 0 &&
                            <div className=" padding-40px-tb center-col " >
                                <div className="col-md-11 col-sm-12 col-xs-12 text-center">
                                    <h2 className="section-title-large sm-section-title-medium text-dark-gray font-weight-600 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text">WHAT YOU WILL GET
                                    </h2>
                                </div>
                                <div className="col-md-12 col-sm-12 col-xs-12 " style={{paddingBottom: 30}}>
                                    {this.renderFeatures()}
                                </div>
                            </div>
                        }
                        {soundcast.long_description && this.renderDescription()}
                        {soundcast.hostName && <Instructor soundcast={soundcast}/>}
                        <HowItWorks />
                    </div>
                </section>
                <section className="padding-80px-tb xs-padding-60px-tb bg-white  border-none" id="title-section1" style={{backgroundColor: '#FFF3E0'}}>
                    <div className="container">
                        <div className=" padding-40px-tb" >
                            <div className=" row col-md-12 col-sm-12 col-xs-12 text-center">
                                <h2 className="section-title-large sm-section-title-medium text-dark-gray font-weight-600 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text">
                                    FREQUENTLY ASKED QUESTIONS
                                </h2>
                            </div>
                            <div className="col-md-12 col-sm-12 col-xs-12 container" style={{}}>
                                <h2 className="margin-lr-auto font-weight-300 width-70 sm-width-100 section-title-medium sm-title-medium xs-title-extra-large text-dark-gray padding-30px-tb tz-text">How long do I have access to the soundcast?</h2>
                                <h5 className=" text-dark-gray text-extra-large  margin-lr-auto width-70 sm-width-100 tz-text" style={{ lineHeight: '30px'}}>It depends on the subscription plan you signed up for. You'll have access to a soundcast as long as your subscription is current. If the soundcast charges a one-time fee, you will have access as long as your instructor is still a member of Soundwise.</h5>
                                <h2 className="margin-lr-auto font-weight-300 width-70 sm-width-100 section-title-medium sm-title-medium xs-title-extra-large text-dark-gray padding-30px-tb tz-text">How do I access the audio files offline?</h2>
                                <h5 className=" text-dark-gray text-extra-large  margin-lr-auto width-70 sm-width-100 xs-width-100 tz-text text-left" style={{ lineHeight: '30px'}}>
                                    Once you install the Soundwise mobile app on your phone and sign in, the soundcasts you subscribe to will be automatically loaded. Tap on the download icon next to each episode/section will download the audio to your phone. Simply download the files when you have wifi and you can access them anywhere you go.
                                </h5>
                                <h2 className="margin-lr-auto font-weight-300 width-70 sm-width-100 section-title-medium sm-title-medium xs-title-extra-large text-dark-gray padding-30px-tb tz-text">What should I do if I have technical issues?</h2>
                                <h5 className=" text-dark-gray text-extra-large  margin-lr-auto width-70 sm-width-100 tz-text" style={{lineHeight: '30px'}}>
                                    Shoot us an email at <a href="mailto:support@mysoundwise.com">support@mysoundwise.com</a>.
                                </h5>
                                <h2 className="margin-lr-auto font-weight-300 width-70 sm-width-100 section-title-medium sm-title-medium xs-title-extra-large text-dark-gray padding-30px-tb tz-text">What if I'm not happy with the soundcast?</h2>
                                <h5 className=" text-dark-gray text-extra-large  margin-lr-auto width-70 sm-width-100 tz-text" style={{ lineHeight: '30px'}}>
                                    We want you to be happy! If you've subscribed to a free soundcast, you can simply unsubscribe by going to Me --> Settings on the mobile app. If your soundcast is a paid one, let us know at <a href="mailto:support@mysoundwise.com">support@mysoundwise.com</a> within 14 days of your subscription and we will give you a full refund.
                                </h5>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        )
    }
}

SoundcastBody.propTypes = {
    course: PropTypes.object,
    relatedCourses: PropTypes.array,
    cb: PropTypes.func,
    isLoggedIn: PropTypes.bool,
    openSignupbox: PropTypes.func,
    userInfo: PropTypes.object,
    history: PropTypes.object,
    addCourseToCart: PropTypes.func,
};

const styles = {
    moduleTitle: {
        fontSize: '32px',
        backgroundColor: '#F76B1C'
    },
    curriculumContainer: {
        marginTop: '0em'
    }
};
