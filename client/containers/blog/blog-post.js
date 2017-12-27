import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import Butter from 'buttercms'
import { Helmet } from "react-helmet";
import moment from 'moment';

import {SoundwiseHeader} from '../../components/soundwise_header';
import Footer from '../../components/footer'

const butter = Butter('f8b408f99e5169af2c3ccf1f95b4ff7e679b2cbd');

export default class BlogPost extends Component {

  constructor(props) {
    super(props);

    this.state = {
      loaded: false
    };
  }

  componentWillMount() {
    let slug = this.props.match.params.slug;

    butter.post.retrieve(slug).then((resp) => {
      this.setState({
        loaded: true,
        post: resp.data.data
      })
    });
  }

  render() {
    if (this.state.loaded) {
      const post = this.state.post;

      return (
        <div>
          <Helmet>
            <title>{post.seo_title}</title>
            <meta name="description" content={post.meta_description} />
            <meta name="og:image" content={post.featured_image} />
          </Helmet>
          <SoundwiseHeader />
          <section className="padding-70px-tb xs-padding-60px-tb blog-style1 bg-white builder-bg" id="blog-section1" >
              <div className='row' style={{paddingLeft: '10%', paddingRight: '10%',}}>
                <div className="col-md-12 col-sm-12 col-xs-12 text-center ">
                    <img className="img100" alt="" src={post.featured_image} data-img-size="(W)800px X (H)507px"/>
                </div>
              </div>
              <div className="container post-container" style={{paddingLeft: '15%', paddingRight: '15%',}}>
                <div className="row">
                    <div className="col-md-12 col-sm-12 col-xs-12 text-center ">
                        <h2 className="section-title-large sm-section-title-medium xs-section-title-large text-dark-gray font-weight-700 alt-font  tz-text">{post.title}</h2>
                    </div>
                    <div className="col-md-12 col-sm-12 col-xs-12 text-center ">
                      <div className= 'text-large text-dark-gray margin-thirteen-bottom  xs-margin-nineteen-bottom'>{moment(post.published).format('MMMM Do YYYY')}</div>
                    </div>
                </div>
                <div dangerouslySetInnerHTML={{__html: post.body}} />
              </div>
          </section>
          <div style={{bottom: 0, width: '100%', position: 'static'}}>
            <Footer />
          </div>
        </div>
      );
    } else {
      return (
        <div>
          <SoundwiseHeader
            blog={true}
          />
          <div></div>
          <div style={{bottom: 0, width: '100%', position: 'absolute'}}>
            <Footer />
          </div>
        </div>
      );
    }
  }
}