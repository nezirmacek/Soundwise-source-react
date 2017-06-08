import React, {Component} from 'react';
import {Card, CardHeader} from 'material-ui/Card';
import {orange50, deepOrange800, grey50} from 'material-ui/styles/colors';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

import HowItWorks from './how_it_works';
import Instructor from './instructor';
import RelatedCourses from './related_courses';
import LessonPlayer from './lesson_player';

const styles = {
    moduleTitle: {
        fontSize: '32px',
        backgroundColor: '#F76B1C'
    },
    curriculumContainer: {
        marginTop: '0em'
    }
};

export default class CourseOutline extends Component {
    constructor(props) {
        super(props);

        this.state = {
            course: {
                price: '',
                name: '',
                description: '',
                description_long: [''],
                features: [''],
                teacher_bio: [''],
                modules: [
                    {
                        sections: []
                    }
                ]
            },
            userCourses: {},
            isDialogShown: false,
            playingLessonId: null,
        };
        this.renderDescription = this.renderDescription.bind(this);
        this.renderFeatures = this.renderFeatures.bind(this);
        this.renderModules = this.renderModules.bind(this);
        this.setPlayingLesson = this.setPlayingLesson.bind(this);
    }

    componentDidMount() {
        this.setState({
            course: this.props.course
        })
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            course: nextProps.course
        })
    }

    showDialog (isDialodShown) {
        this.setState({ isDialogShown: isDialodShown });
    }

    setPlayingLesson (id) {
        this.setState({playingLessonId: id});
    }

    /*RENDER*/

    renderDescription() {
        return (
            <div>
                {this.state.course.description_long.map((paragraph, i) => {
                    return (
                        <p key={i} className="text-dark-gray text-extra-large  margin-lr-auto width-100 sm-width-100 tz-text">
                            {paragraph}
                        </p>
                    )
                })}
            </div>
        )
    }

    renderFeatures() {
        return (
            <ul>
                {this.state.course.features.map((feature, i) => {
                    return (
                        <li key={i} className="text-dark-gray text-extra-large  margin-lr-auto col-md-6 tz-text" style={{paddingLeft: '1em', paddingRight: '2em', paddingTop: '1em', listStyleType: 'none'}}>
                            <strong><i className="material-icons" style={{paddingRight: '1em', color: 'green'}}>check</i></strong>{feature}
                        </li>
                    )
                })}
            </ul>
        )
    }

    renderModules = (course) => {
        return (
            course.modules.map((module, mi) => (
                <Card key={mi}>
                    <CardHeader
                        title={module.module_title}
                        style={styles.moduleTitle}
                    />
                    {
                        module.sections.map((section, i) => (
                            <LessonPlayer
                                key={i}
                                index={i}
                                section={section}
                                showDialogCb={this.showDialog.bind(this, true)}
                                playingCb={this.setPlayingLesson}
                                isPlaying={section.section_id === this.state.playingLessonId}
                            />
                        ))
                    }
                </Card>
            ))
        )
    };

    render() {
        return (
            <div>
                <section className="padding-40px-tb xs-padding-40px-tb bg-white builder-bg border-none" id="title-section1">
                    <div className="container">
                        <div className="row padding-70px-tb" >
                            <div className="col-md-12 col-sm-12 col-xs-12 text-center">
                                <h2 className="section-title-large sm-section-title-medium text-dark-gray font-weight-600 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text">
                                    WHAT YOU WILL GET
                                </h2>
                            </div>
                            <div className="col-md-12 col-sm-12 col-xs-12">
                                {this.renderFeatures()}
                            </div>
                        </div>
                        <div className="row padding-40px-tb" style={{backgroundColor: '#FFF3E0'}}>
                            <div className="col-md-12 col-sm-12 col-xs-12">
                                {this.renderDescription()}
                            </div>
                        </div>
                        <HowItWorks />
                        <div style={styles.curriculumContainer}>
                            <div className="row padding-40px-tb xs-padding-40px-tb">
                                <div className="col-md-12 col-sm-12 col-xs-12 text-center">
                                    <h2 className="section-title-large sm-section-title-medium text-dark-gray font-weight-600 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text">
                                        COURSE OUTLINE
                                    </h2>
                                </div>
                            </div>
                            {this.renderModules(this.state.course)}
                        </div>
                    </div>
                </section>
                {
                    this.props.relatedCourses.length >= 5 &&
                    <RelatedCourses courses={this.props.relatedCourses} cb={this.props.cb} title={'PEOPLE WHO TOOK THIS COURSE ALSO TOOK'}/>
                }
                <Instructor course={this.state.course}/>
                <section className="padding-80px-tb xs-padding-60px-tb bg-white  border-none" id="title-section1" style={{backgroundColor: '#FFF3E0'}}>
                    <div className="container">
                        <div className=" padding-40px-tb" >
                            <div className=" row col-md-12 col-sm-12 col-xs-12 text-center">
                                <h2 className="section-title-large sm-section-title-medium text-dark-gray font-weight-600 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text">
                                    FREQUENTLY ASKED QUESTIONS
                                </h2>
                            </div>
                            <div className="col-md-12 col-sm-12 col-xs-12 container" style={{}}>
                                <h2 className="margin-lr-auto font-weight-300 width-70 sm-width-100 section-title-medium sm-title-medium xs-title-extra-large text-dark-gray padding-30px-tb tz-text">How long do I have access to the content?</h2>
                                <h5 className=" text-dark-gray text-extra-large  margin-lr-auto width-70 sm-width-100 tz-text" style={{ lineHeight: '30px'}}>As long as the Internet is still a thing.</h5>
                                <h2 className="margin-lr-auto font-weight-300 width-70 sm-width-100 section-title-medium sm-title-medium xs-title-extra-large text-dark-gray padding-30px-tb tz-text">How do I access the audio files offline?</h2>
                                <h5 className=" text-dark-gray text-extra-large  margin-lr-auto width-70 sm-width-100 xs-width-100 tz-text text-left" style={{ lineHeight: '30px'}}>
                                    Once you sign up for the program, you'll see an "enable offline" button on the right hand side of every audio section. Click on that, and voila! Now you can play the section even when you don't have internet or you don't want to use your cellphone data plan for streaming. The offline function works best on computer and android phone in a Chrome browser. Sadly, if you have an iPhone you can't use the offline function. But we're working on an iOS app. Stay tuned :)
                                </h5>
                                <h2 className="margin-lr-auto font-weight-300 width-70 sm-width-100 section-title-medium sm-title-medium xs-title-extra-large text-dark-gray padding-30px-tb tz-text">What should I do if I have technical issues?</h2>
                                <h5 className=" text-dark-gray text-extra-large  margin-lr-auto width-70 sm-width-100 tz-text" style={{lineHeight: '30px'}}>
                                    Shoot us an email at <a href="mailto:support@mysoundwise.com">support@mysoundwise.com</a>.
                                </h5>
                                <h2 className="margin-lr-auto font-weight-300 width-70 sm-width-100 section-title-medium sm-title-medium xs-title-extra-large text-dark-gray padding-30px-tb tz-text">What if I'm not happy with the content?</h2>
                                <h5 className=" text-dark-gray text-extra-large  margin-lr-auto width-70 sm-width-100 tz-text" style={{ lineHeight: '30px'}}>
                                    We want you to be happy! If you are unsatisfied with the course, let us know at <a href="mailto:support@mysoundwise.com">support@mysoundwise.com</a> within 14 days of your purchase and we will give you a full refund.
                                </h5>
                            </div>
                        </div>
                    </div>
                </section>
                <Dialog
                    title="Can't listen to this lesson"
                    actions={[
                        <FlatButton
                            label="Ok"
                            primary={true}
                            keyboardFocused={true}
                            onTouchTap={this.showDialog.bind(this, false)}
                        />,
                    ]}
                    modal={false}
                    open={this.state.isDialogShown}
                    onRequestClose={this.showDialog.bind(this, false)}
                >
                    Please enroll in the course to listen to this lesson
                </Dialog>
            </div>
        )
    }
}
