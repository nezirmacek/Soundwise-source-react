import React from 'react'
import {Tabs, Tab} from 'material-ui/Tabs'
import SwipeableViews from 'react-swipeable-views'
import {cyanA200, lime50, orange50, deepOrange800, grey50} from 'material-ui/styles/colors'

import Instructor from './instructor'
import {Curriculum} from './curriculum'
import {PlayerBar} from '../containers/player_bar'
import {Reviews} from '../containers/reviews'
import Resources from './resources'

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
    // fontSize: 20,
    fontFamily: 'lato'
  },
  active_tab: {
    color: deepOrange800,
    backgroundColor: orange50,
    // fontSize: 24,
    fontFamily: 'lato'
  }
}

export default class CourseBodyPurchased extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      slideIndex: 1,
      course: {
        runtime: '',
        price: '',
        name: '',
        description: '',
        modules: [],
        resources: []
      }
    }
    this.handleChange = this.handleChange.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      course: nextProps.course
    })
  }

  handleChange(value) {
    this.setState({
      slideIndex: value,
    })
  }

  render() {
    styles.tab = []
    styles.tab[0] = styles.tabs
    styles.tab[1] = styles.tabs
    // styles.tab[2] = styles.tabs
    styles.tab[this.state.slideIndex] = Object.assign({},   styles.tab[this.state.slideIndex], styles.active_tab)

    return (
     <div className='vbox'>
      <div className=''>
        <Tabs
          onChange={this.handleChange}
          value={this.state.slideIndex}
        >
          <Tab style={styles.tab[0]} label="RESOURCES" value={0} />
          <Tab style={styles.tab[1]} label="CONTENT" value={1} />

        </Tabs>
        <SwipeableViews
          index={this.state.slideIndex}
          onChangeIndex={this.handleChange}
        >
          <div>
            <Resources course = {this.state.course} />
          </div>
          <div style={styles.slide}>
            <Curriculum course = {this.state.course} />
          </div>

        </SwipeableViews>
      </div>
        <PlayerBar/>
      </div>
    )
  }
}

