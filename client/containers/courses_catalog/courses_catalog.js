/**
 * Created by developer on 06.06.17.
 */
import React, {Component} from 'react';
import {Helmet} from 'react-helmet';
import {bindActionCreators} from 'redux';
import {withRouter} from 'react-router';
import {connect} from 'react-redux';
import * as _ from 'lodash';
import Footer from '../../components/footer';
import {SoundwiseHeader} from '../../components/soundwise_header';
import {loadCourses} from '../../actions/index';
import RelatedCourses from '../../components/related_courses';
import CATS from './categories.config';

class _CoursesCatalog extends Component {
  constructor(props) {
    super(props);

    this.state = {
      cardHeights: [],
    };
  }

  render() {
    const {categories} = this.props;

    // reparse courses to _categories = [{name:'xxx', courses:[...]},{...},...]; to use map inline
    const _categories = [];
    for (let key in categories) {
      if (categories.hasOwnProperty(key)) {
        let _category = categories[key];
        let _parsedCategory = {name: CATS[key], courses: []};
        for (let courseId in _category) {
          if (_category.hasOwnProperty(courseId)) {
            if (this.props.courses[courseId]) {
              _parsedCategory.courses.push(this.props.courses[courseId]);
            }
          }
        }
        _categories.push(_parsedCategory);
      }
    }
    _categories.sort((a, b) => {
      // sort categories by courses number in array
      if (a.courses.length > b.courses.length) {
        return -1;
      }
      if (a.courses.length < b.courses.length) {
        return 1;
      }
      return 0;
    });

    return (
      <div>
        <Helmet>
          <title>{`Courses catalog | Soundwise`}</title>
          <meta property="og:url" content={`https://mysoundwise.com/courses`} />
          <meta property="fb:app_id" content="1726664310980105" />
          <meta property="og:title" content={'Courses catalog'} />
          <meta property="og:description" content={''} />
          <meta property="og:image" content={''} />
          <meta name="description" content={''} />
          <meta name="keywords" content={''} />
        </Helmet>
        <SoundwiseHeader showIcon={true} />
        {_categories.map((categoryObj, i) => (
          <RelatedCourses
            courses={categoryObj.courses}
            title={categoryObj.name}
            index={i}
            key={i}
          />
        ))}
        <Footer />
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({loadCourses}, dispatch);
}

const mapStateToProps = store => {
  const {categories} = store.categories;
  const {userInfo, isLoggedIn} = store.user;
  const {courses} = store.setCourses;
  return {userInfo, isLoggedIn, courses, categories};
};

const CoursesCatalog_worouter = connect(
  mapStateToProps,
  mapDispatchToProps
)(_CoursesCatalog);
export const CoursesCatalog = withRouter(CoursesCatalog_worouter);
