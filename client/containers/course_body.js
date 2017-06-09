import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {Tabs, Tab} from 'material-ui/Tabs';
import SwipeableViews from 'react-swipeable-views';
import {cyanA200, lime50, orange50, deepOrange800, grey50} from 'material-ui/styles/colors';
import PropTypes from 'prop-types';

import CourseOutline from '../components/course_outline';
import {PlayerBar} from './player_bar';
import {Reviews} from './reviews';
import { openSignupbox } from '../actions/index';

class _CourseBody extends React.Component {

  constructor(props) {
    super(props);
    console.log('>>>>>>>>>>P1', props);

    this.state = {
      slideIndex: 0,
    }
  }

  handleChange = (value) => {
    this.setState({
      slideIndex: value,
    })
  }

  render() {
    const { course, relatedCourses, cb, isLoggedIn, openSignupbox } = this.props;
    styles.tab = []
    styles.tab[0] = styles.tabs
    styles.tab[1] = styles.tabs
    styles.tab[this.state.slideIndex] = Object.assign({},   styles.tab[this.state.slideIndex], styles.active_tab)

    return (
        <div className='vbox'>
            <div className=''>
                <Tabs
                    onChange={this.handleChange}
                    value={this.state.slideIndex}
                >
                    <Tab style={styles.tab[0]} label="OVERVIEW" value={0} />
                    <Tab style={styles.tab[1]} label="REVIEWS" value={1} />
                </Tabs>
                <SwipeableViews
                    index={this.state.slideIndex}
                    onChangeIndex={this.handleChange}
                >
                    <div>
                        <CourseOutline
                            course={course}
                            relatedCourses={relatedCourses}
                            cb={cb}
                            isLoggedIn={isLoggedIn}
                            openSignupbox={openSignupbox}
                        />
                    </div>
                    <div style={styles.slide}>
                        <Reviews course = {this.props.course}/>
                    </div>
                </SwipeableViews>
            </div>
            <PlayerBar/>
        </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({ openSignupbox }, dispatch)
}

const mapStateToProps = store => {
    const { currentCourse } = store.setCourses;
    const { isLoggedIn } = store.user;
    return {
        currentCourse,
        isLoggedIn
    }
};

export const CourseBody = connect(mapStateToProps, mapDispatchToProps)(_CourseBody);

CourseBody.propTypes = {
    course: PropTypes.object,
    currentCourse: PropTypes.object,
    relatedCourses: PropTypes.array,
    cb: PropTypes.func,
    isLoggedIn: PropTypes.bool,
    dispatch: PropTypes.func,
    openSignupbox: PropTypes.func,
};

const styles = {
    headline: {
        fontSize: 24,
        paddingTop: 16,
        marginBottom: 12,
        fontWeight: 400,
    },
    slide: {
        padding: 10,
    },
    tabs: {
        color: deepOrange800,
        backgroundColor: 'white',
        fontSize: 20,
        // fontFamily: 'lato'
    },
    active_tab: {
        color: deepOrange800,
        backgroundColor: orange50,
        fontSize: 20,
        // fontFamily: 'lato'
    }
};
