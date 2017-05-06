import React, {Component} from 'react'
import { Link, Redirect } from 'react-router-dom'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import ReactStars from 'react-stars'
import StarRating from 'react-star-rating'

import { CourseSignup } from '../containers/course_signup'
import { ReviewModal } from '../containers/review_modal'
import SocialShare from './socialshare'
import { openReviewbox } from '../actions/index'

class _CourseHeaderPurchased extends Component {
  constructor(props) {
    super(props)
  }

  componentWillReceiveProps(nextprops) {
    if('caches' in window && nextprops.course.img_url_mobile) {
        let headers = new Headers()
        headers.append('access-control-allow-origin', '*')
        headers.append('access-control-allow-methods', 'GET')
        headers.append('access-control-allow-headers', 'content-type, accept')
        headers.append('Content-Type', "image/jpeg;image/png;text/xml")

        var myInit = { method: 'GET',
               headers: headers,
               mode: 'no-cors',
               cache: 'default' }

        let request = new Request(nextprops.course.img_url_mobile, myInit)

        fetch(request)
        .then(response => {
          // if(!response.ok) {
          //   throw new TypeError('bad response status')
          // }

          return caches.open('audio-cache')
            .then(cache => {
              cache.put(nextprops.course.img_url_mobile, response)
              console.log('image cached')
            })
        })
    }
  }

  render() {
    let run_time = ''
    if(this.props.course.run_time) {
      const rt_hour = Math.floor(this.props.course.run_time/3600)
      const rt_min = Math.floor(this.props.course.run_time/60 - rt_hour*60)
      const rt_sec = this.props.course.run_time % 60
      run_time = rt_hour > 0 ? `${rt_hour}h ${rt_min}m` : `${rt_min}m ${rt_sec}s`
    }

    let average_rating = 0, ratings = []

    const reviews = []
    for(var key in this.props.course.reviews) {
      reviews.push(this.props.course.reviews[key])
    }

    ratings = reviews.map(review => review.rating)
    const total = ratings.reduce((sum, cur) => (sum + cur), 0)
    average_rating = Math.floor(total / ratings.length * 10) / 10

    return (
      <div>
        <section className=" bg-white" id="content-section23" style={{paddingBottom: '15px'}}>
            <div className="container">
                <div className="row equalize sm-equalize-auto equalize-display-inherit">
                    <div className="col-md-6 col-sm-12 col-xs-12 display-table margin-six-left sm-no-margin" style={{height: '378px'}}>
                        <div className="display-table-cell-vertical-middle">
                            <div className="row">
                                <div className="col-md-12 col-sm-12 col-xs-12">
                                    <h2 className="title-extra-large alt-font sm-section-title-medium xs-title-extra-large text-dark-gray margin-five-bottom xs-margin-ten-bottom tz-text">{this.props.course.name}</h2>
                                    <div className='row' style={{margin: '0.5em', marginBottom: '2em', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start'}}>
                                      <ReactStars
                                        count={5}
                                        value = {average_rating}
                                        size={28}
                                        edit={false}
                                        color2={'#ffd700'}
                                      />
                                      <span style={{marginLeft: '5px', fontSize: '18px'}}>{`(${ratings.length})`}</span>
                                    </div>
                                    <span className="text-extra-large sm-text-extra-large font-weight-300 margin-ten-bottom xs-margin-fifteen-bottom display-block tz-text">{`${this.props.course.description} `}</span>
                                    <span className="text-extra-large sm-text-extra-large font-weight-300 margin-ten-bottom xs-margin-fifteen-bottom display-block tz-text">{`Run Time: ${run_time}`}</span>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-6 col-sm-12 col-xs-12 "
                                  style={{paddingBottom: '30px'}}>
                                  <a className="btn-medium btn btn-circle bg-bitter-sweet text-white no-letter-spacing" onClick={() => this.props.openReviewbox(true)}

                                  >
                                    <span className="text-extra-large sm-text-extra-large tz-text">Rate this course</span>
                                  </a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-5 col-sm-12 col-xs-12 display-table sm-margin-fifteen-bottom" style={{height: '378px'}}>
                        <div className="">
                            <img src={this.props.course.img_url_mobile} data-img-size="(W)450px X (H)450px" alt=""
                              style={{width: '350px', height: '350px'}}/>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <ReviewModal course={this.props.course}/>
      </div>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ openReviewbox }, dispatch)
}


export const CourseHeaderPurchased = connect(null, mapDispatchToProps)(_CourseHeaderPurchased)