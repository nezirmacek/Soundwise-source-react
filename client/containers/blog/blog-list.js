import React, {Component} from 'react';
import Butter from 'buttercms';
const butter = Butter('f8b408f99e5169af2c3ccf1f95b4ff7e679b2cbd');

export default class BlogList extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    butter.post.list({page: 1, page_size: 10})
    .then(function(response) {
      console.log(response);
    });
  }

  render() {
    return (
      <div>
      </div>
    )
  }
}