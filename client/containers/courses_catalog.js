/**
 * Created by developer on 06.06.17.
 */
import React, { Component } from 'react';
import {Helmet} from "react-helmet";
import Footer from '../components/footer';
import { SoundwiseHeader } from '../components/soundwise_header';

class _CoursesCatalog extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const _categories = {};
        for (let key in this.props.courses) {
            if (this.props.courses.hasOwnProperty(key)) {
                const __course = this.props.courses[key];
                // if (__course.id !== _course.id && __course.category === _course.category) {
                //     _relatedCourses.push(__course);
                // }
                let _currentCategory = _categories[__course.category];
                if (!_currentCategory) {
                    _categories[__course.category] = [];
                }

            }
        }

        return (
            <div>
                {/*<Helmet>*/}
                    {/*<title>{`Courses catalog | Soundwise`}</title>*/}
                    {/*<meta property="og:url" content={`https://mysoundwise.com/courses`} />*/}
                    {/*<meta property="fb:app_id" content='1726664310980105' />*/}
                    {/*<meta property="og:title" content={'Courses catalog'}/>*/}
                    {/*<meta property="og:description" content={''}/>*/}
                    {/*<meta property="og:image" content={''} />*/}
                    {/*<meta name="description" content={''} />*/}
                    {/*<meta name="keywords" content={''} />*/}
                {/*</Helmet>*/}
                {/*<SoundwiseHeader />*/}

                {/*<Footer />*/}
            </div>
        )
    }
}

// function mapDispatchToProps(dispatch) {
//     return bindActionCreators({ setCurrentPlaylist, setCurrentCourse, loadCourses }, dispatch)
// }
//
// const mapStateToProps = state => {
//     const { userInfo, isLoggedIn } = state.user
//     const { courses, currentPlaylist, currentCourse } = state.setCourses
//     return {
//         userInfo, isLoggedIn, courses, currentPlaylist, currentCourse
//     }
// }
//
// // export const Course = connect(mapStateToProps, mapDispatchToProps)(_Course)
//
// const Course_worouter = connect(mapStateToProps, mapDispatchToProps)(_Course)
//
// export const Course = withRouter(Course_worouter)

