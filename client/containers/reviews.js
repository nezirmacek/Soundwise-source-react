import React, {Component} from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as firebase from "firebase"
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card'
import ReactStars from 'react-stars'

import { ReviewModal } from '../containers/review_modal'
import { openReviewbox } from '../actions/index'

class _Reviews extends Component {
  constructor(props) {
    super(props)
    this.state = {
      reviews: [
        {}
      ]
    }
  }

  componentWillReceiveProps(nextProps) {
    const reviews = []
    for(var key in nextProps.course.reviews) {
      reviews.push(nextProps.course.reviews[key])
    }

    this.setState({
      reviews
    })
  }

  renderRow(review) {

    return (
      <Card>
        <CardHeader
          title={review.reviewer}
          subtitle={review.date}
          avatar={review.pic}
        />
        <CardText>
          <ReactStars
            count={5}
            value = {review.rating}
            size={15}
            edit={false}
            color2={'#ffd700'} />
          <div>
          {review.review}
          </div>
        </CardText>
      </Card>
    )
  }

  render() {
    const ratings = this.state.reviews.map(review => review.rating)
    const total = ratings.reduce((sum, cur) => (sum + cur), 0)
    const average_rating = Math.floor(total / ratings.length * 10) / 10

    return (
      <div>
        <section className="padding-110px-tb xs-padding-60px-tb bg-white builder-bg border-none" id="title-section1">
          <div className="container">
            <div className='row'>
                <div className="col-md-8 center-col col-sm-12 text-center">
                    <h3 className="title-extra-large-1 alt-font xs-title-large  margin-four-bottom tz-text" >How do you like this program?</h3>
                </div>
                <div className="col-md-6 col-sm-11 col-xs-11 center-col text-center" style={{padding: '1.5em', margin: '2em'}}>
                    <button onClick={() => this.props.openReviewbox(true)}  className="text-white btn btn-extra-large2 propClone btn-3d text-white width-100 builder-bg tz-text tz-background-color" style={{backgroundColor: '#61E1FB'}}><span className="tz-text">Write A Review</span></button>
                </div>
            </div>
            <div className='row' style={{marginBottom: '3em'}}>
                <div className="col-md-6 center-col col-sm-12 text-center">
                    <h3 className="title-extra-large-2 alt-font xs-title-large  margin-four-bottom tz-text" >{`Average Rating: ${average_rating}`}</h3>
                    <div style={{width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2em'}}>
                      <ReactStars
                        count={5}
                        value = {average_rating}
                        size={28}
                        color2={'#ffd700'}
                        edit={false}
                        /> <span style={{marginLeft: '10px', fontSize: '20'}}>{`(${ratings.length})`}</span>
                    </div>
                </div>
            </div>
            <div className='col-md-8 center-col col-sm-12'>
              <div className="col-md-6 center-col col-sm-12 text-center">
                <h3 className="title-extra-large-1 alt-font xs-title-large  margin-four-bottom tz-text" >Reviews</h3>
              </div>
              {this.state.reviews.map(review => this.renderRow(review))}
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

const mapStateToProps = state => {
  const { userInfo, isLoggedIn } = state.user
  return {
    userInfo, isLoggedIn
  }
}

export const Reviews = connect(mapStateToProps, mapDispatchToProps)(_Reviews)