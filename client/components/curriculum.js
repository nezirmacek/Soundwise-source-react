import React, {Component} from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import {Card, CardActions, CardHeader, CardText} from 'material-ui/Card'
import {orange50, deepOrange800, grey50} from 'material-ui/styles/colors'
import firebase from "firebase"

import {CourseSection} from './course_section'
import {getCurrentProgress, changePlayStatus, setCurrentPlaySection, loadUserCourses, setCurrentCourse} from '../actions/index'

let intervals = [], player, source;

const styles = {
    moduleTitle: {
        fontSize: 24,
        backgroundColor: '#F76B1C'
    },
    sectionTitle: {
        backgroundColor: orange50
    },
    curriculumContainer: {
        marginTop: '0em'
    }
}

class _Curriculum extends Component {
    constructor(props) {
        super(props);
        this.state = {
            course: {
                runtime: '',
                price: '',
                name: '',
                description: '',
                sections: [],
                resources: []
            }
        }
        this.renderSections = this.renderSections.bind(this)
        this.handleEnd = this.handleEnd.bind(this)
        this.updateSectionProgress = this.updateSectionProgress.bind(this)
    }

    componentDidMount() {

        player = document.getElementById('audio')
        source = document.getElementById('audioSource')

        player.addEventListener('ended', this.handleEnd)

    }

    updateSectionProgress(sectionId) {

        const userId = firebase.auth().currentUser.uid;

        let update = JSON.parse(JSON.stringify(this.props.userCourse.sectionProgress[sectionId]));
        update.completed = true;
        update.playProgress = 0;
        update.timesRepeated = update.timesRepeated + 1;

        // record user listening progress data
        let updates = {}
        updates['/users/' + userId + '/courses/' + this.props.userCourse.id + '/sectionProgress/' + sectionId] = update
        firebase.database().ref().update(updates)

        const sectionProgress = Object.assign({}, this.props.userCourse.sectionProgress, {sectionId: update})
        const course = Object.assign({}, this.props.userCourse, {sectionProgress})
        this.props.setCurrentCourse(course)

        // record section completion in course data:
        firebase.database().ref('/courses/' + this.props.course.id + '/metrics/' + sectionId)
            .once('value')
            .then(snapshot => {
                const completed = snapshot.val().timesCompleted + 1
                let update = {}
                update['/courses/' + this.props.course.id + '/metrics/' + sectionId + '/timesCompleted'] = completed
                firebase.database().ref().update(update)
            })
    }

    handleEnd() {
        this.updateSectionProgress(this.props.currentSection.section_id)

        // const next = this.props.currentPlaylist.indexOf(this.props.currentSection) + 1
        const sectionNumber = this.props.currentSection.section_number

        if(sectionNumber < this.props.currentPlaylist.length ) {
            this.props.setCurrentPlaySection(this.props.currentPlaylist[sectionNumber])

            source.src = this.props.currentPlaylist[sectionNumber].section_url
            player.load()
            player.play()
            this.props.changePlayStatus(true)

        } else {
            player.pause()
            this.props.changePlayStatus(false)
        }
    }

    componentWillReceiveProps(nextProps) {
        player = document.getElementById('audio')
        const that = this

        this.setState({
            course: nextProps.course
        })

        // if(nextProps.course.id !== this.props.course.id) {
        //   firebase.auth().onAuthStateChanged(user => {
        //     if(user) {
        //         const userId = user.uid
        //         firebase.database().ref('users/' + userId + '/courses/' + nextProps.course.id)
        //         .on('value', snapshot => {

        //           that.setState({
        //             course: snapshot.val()
        //           })
        //         })
        //     }
        //   })
        // }

        // supersafe watchers (it is possible to use intervalObj instead of intervals, but i think, array is more safe)
        if (nextProps.playing) {
            if (intervals.length) { // if we have watchers, we need to remove them, because they are old
                intervals.map(id => clearInterval(id));
                intervals.length = 0; // clear array, save the link to the same object
            }
            intervals.push( // to not loose intervalIds, add them all to array, and then clear all intervals from array
                setInterval(() => {
                    this.props.getCurrentProgress({
                        currentTime: player.currentTime,
                        duration: player.duration,
                    });
                }, 1000)
            );
        } else { // here we clear all intervals from array and then clear array
            intervals.map(id => clearInterval(id));
            intervals.length = 0; // clear array, save the link to the same object
        }
    }

    updateTime() { // TODO: if you use it, add intervalHandlers to array and then clear them all as in example above
        //   interval = setInterval(() => {
        //     currentTime = player.currentTime,
        //     duration = player.duration
        // }, 1000);
    }

    renderSections() {
        const that = this

        if(this.state.course.name.length > 0) {

            return (
                <Card >
                    <CardHeader
                        title={this.state.course.name}
                        style = {styles.moduleTitle}
                    />
                    <div className=''>
                        {
                            this.state.course.sections.map(section => (
                                <CourseSection key={section.section_id} section={section} course={that.props.userCourse} />
                            ))
                        }
                    </div>
                </Card>
            )
        }
    }

    render() {
        return (
            <section className="padding-60px-tb xs-padding-60px-tb bg-white builder-bg border-none" id="title-section1" >
                <div className="container">
                    <div style={styles.curriculumContainer}>
                        {this.renderSections()}
                    </div>
                </div>
            </section>
        )
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({ getCurrentProgress, changePlayStatus, setCurrentPlaySection, setCurrentCourse }, dispatch);
}


const mapStateToProps = state => {
    const { isLoggedIn } = state.user;
    const { currentSection, playing } = state.setCurrentSection;
    const { currentPlaylist, userCourses } = state.setCourses;
    return {
        isLoggedIn, currentSection, playing, currentPlaylist, userCourses
    }
};

export const Curriculum = connect(mapStateToProps, mapDispatchToProps)(_Curriculum);
