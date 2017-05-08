import React from 'react'
import { connect } from 'react-redux'
import {Tabs, Tab} from 'material-ui/Tabs'
import SwipeableViews from 'react-swipeable-views'
import {cyanA200, lime50, orange50, deepOrange800, grey50} from 'material-ui/styles/colors'

import CourseOutline from './course_outline'
import {PlayerBar} from '../containers/player_bar'
import {Reviews} from '../containers/reviews'


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
}

class _CourseBody extends React.Component {

  constructor(props) {
    super(props)

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

    // console.log('this.props.currentCourse: ', this.props.currentCourse)
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
            <CourseOutline course={this.props.course}/>
          </div>
          <div style={styles.slide}>
            <Reviews course = {this.props.course}/>
          </div>
        </SwipeableViews>
      </div>
        <PlayerBar/>
      </div>
    )
  }
}

const mapStateToProps = state => {
  const { currentCourse } = state.setCourses
  return {
    currentCourse
  }
}

export const CourseBody = connect(mapStateToProps, null)(_CourseBody)


          // <div style={styles.slide}>
          //   <Curriculum course = {this.props.course} />
          // </div>
