import React, {Component} from 'react'
import { Layout } from 'antd'
import { Link, Redirect } from 'react-router-dom'
const { Header, Footer, Sider, Content } = Layout
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import ReactStars from 'react-stars'
import StarRating from 'react-star-rating'

import { CourseSignup } from '../containers/course_signup'
import SocialShare from './socialshare'
import { openSignupbox, openConfirmationbox, addCourseToCart } from '../actions/index'

class _CourseHeader extends Component {
  constructor(props) {
    super(props)

    this.addToCart = this.addToCart.bind(this)
  }

  handleClick() {
    this.props.openSignupbox(true)
  }

  addToCart() {
    this.props.addCourseToCart(this.props.course)
  }

  render() {
    const rt_hour = Math.floor(this.props.course.run_time/3600)
    const rt_min = Math.floor(this.props.course.run_time/60 - rt_hour*60)
    const rt_sec = this.props.course.run_time % 60
    const run_time = rt_hour > 0 ? `${rt_hour}h ${rt_min}m` : `${rt_min}m ${rt_sec}s`

    return (
      <section className=" bg-white" id="content-section23" style={{paddingBottom: '15px'}}>
          <div className="container">
              <div className="row equalize sm-equalize-auto equalize-display-inherit">
                  <div className="col-md-5 col-sm-12 col-xs-12 display-table sm-margin-fifteen-bottom" style={{height: '378px'}}>
                      <div className="display-table-cell-vertical-middle">
                          <img src={this.props.course.img_url_mobile} data-img-size="(W)450px X (H)450px" alt=""
                            style={{width: '350px', height: '350px'}}/>
                      </div>
                  </div>
                  <div className="col-md-6 col-sm-12 col-xs-12 display-table margin-six-left sm-no-margin" style={{height: '378px'}}>
                      <div className="display-table-cell-vertical-middle">
                          <div className="row">
                              <div className="col-md-12 col-sm-12 col-xs-12">
                                  <h2 className="title-extra-large alt-font sm-section-title-medium xs-title-extra-large text-dark-gray margin-five-bottom xs-margin-ten-bottom tz-text">{this.props.course.name}</h2>
                                  <div className='row' style={{margin: '0.5em', marginBottom: '2em'}}>
                                    <ReactStars
                                      count={5}
                                      value = {4.5}
                                      size={28}
                                      edit={false}
                                      color2={'#ffd700'}
                                      style={{float: 'left', display: 'inline'}}/>
                                    <span style={{float: 'right', position: 'absolute'}}>(2)</span>
                                  </div>
                                  <span className="text-extra-large sm-text-extra-large font-weight-300 margin-ten-bottom xs-margin-fifteen-bottom display-block tz-text">{`${this.props.course.description} `}</span>
                                  <span className="text-extra-large sm-text-extra-large font-weight-300 margin-ten-bottom xs-margin-fifteen-bottom display-block tz-text">{`Run Time: ${run_time}`}</span>
                              </div>
                          </div>
                          <div className="row">
                              <div className="col-md-6 col-sm-6 col-xs-6 feature-box-details-second">
                                <span className="title-extra-large alt-font sm-section-title-medium xs-title-extra-large text-dark-gray margin-five-bottom xs-margin-ten-bottom tz-text">{`$${this.props.course.price}`}</span>
                              </div>
                              <div className="col-md-6 col-sm-6 col-xs-6">
                                <Link className="btn-medium btn btn-circle bg-bitter-sweet text-white no-letter-spacing" onClick={this.addToCart}
                                  to='/cart'
                                >
                                  <span className="text-extra-large sm-text-extra-large tz-text">Add to Cart</span>
                                </Link>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </section>
    )

  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ openConfirmationbox, openSignupbox, addCourseToCart }, dispatch)
}

export const CourseHeader = connect(null, mapDispatchToProps)(_CourseHeader)