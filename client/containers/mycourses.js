import React, {Component} from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Route, Link, Switch } from 'react-router-dom'
import firebase from "firebase"

import Footer from '../components/footer'
import {SoundwiseHeader} from '../components/soundwise_header'
import CourseCard from '../components/course_card'
import {loadUserCourses} from '../actions/index'
import {Course} from './course_page'


class _MyCourses extends Component {
    constructor (props) {
        super(props);

        this.state = {
            cardHeight: 0,
            courseArr: []
        };
    }

    componentWillMount () {
        // console.log('all courses: ', this.props.courses)
        let userCourses = []
        const that = this
        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                const userId = user.uid;

                firebase.database().ref('users/' + userId + '/courses')
                .once('value')
                .then(snapshot => {
                    const courseIDs = Object.keys(snapshot.val())

                    courseIDs.forEach(id => {
                        firebase.database().ref('courses/'+id)
                        .on('value', snapshot => {
                            userCourses.push(snapshot.val())
                        })
                    })

                })
                .then(() => {
                    // console.log('userCourses: ', userCourses)
                    that.setState({
                        courseArr: userCourses
                    })
                })
            }
        })
    }

    alignCardsHeights (height) {
        if (this.state.cardHeight < height) {
            this.setState({ cardHeight: height });
        }
    }

    render () {
        const courseArr = this.state.courseArr
        const isLoggedIn = this.props.isLoggedIn

        if (isLoggedIn === false) {
            return (
                <div>
                    <SoundwiseHeader />
                    <section className="padding-110px-tb bg-white builder-bg xs-padding-60px-tb" id="feature-section14">
                        <div className="container">
                            <div className="row">
                                <div className="col-md-12 col-sm-12 col-xs-12 text-center">
                                    <h2 className="section-title-large sm-section-title-medium xs-section-title-large text-dark-gray font-weight-600 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text">PLEASE LOG IN FIRST</h2>
                                </div>
                            </div>
                        </div>
                    </section>
                    <Footer />
                </div>
            )
        }

        if (courseArr.length === 0) {
            return (
                <div>
                    <SoundwiseHeader />
                    <section className="padding-110px-tb bg-white builder-bg xs-padding-60px-tb" id="feature-section14">
                        <div className="container">
                            <div className="row">
                                <div className="col-md-12 col-sm-12 col-xs-12 text-center">
                                    <h2 className="section-title-large sm-section-title-medium xs-section-title-large text-dark-gray font-weight-600 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text">YOU HAVEN'T SIGNED UP FOR ANY COURSES YET</h2>
                                </div>
                            </div>
                        </div>
                    </section>
                    <Footer />
                </div>
            )
        }

        return (
            <div>
                <SoundwiseHeader />
                <section className="padding-110px-tb bg-white builder-bg xs-padding-60px-tb" id="feature-section14">
                    <div className="container">
                        <div className="row">
                            <div className="col-md-12 col-sm-12 col-xs-12 text-center">
                                <h2 className="section-title-large sm-section-title-medium xs-section-title-large text-dark-gray font-weight-600 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text">MY COURSES</h2>
                            </div>
                            {courseArr.map((course, i) => (
                                <CourseCard
                                    course={course}
                                    key={course.id}
                                    match={this.props.match}
                                    index={i}
                                    alignHeightCb={this.alignCardsHeights.bind(this)}
                                    height={this.state.cardHeight}
                                />
                            ))}
                        </div>
                    </div>
                </section>
                <Footer />
            </div>
        )
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({ loadUserCourses }, dispatch);
}


const mapStateToProps = state => {
    const { userInfo, isLoggedIn } = state.user;
    const { userCourses, courses } = state.setCourses;
    return { userInfo, isLoggedIn, userCourses, courses };
};

export const MyCourses = connect(mapStateToProps, mapDispatchToProps)(_MyCourses);
