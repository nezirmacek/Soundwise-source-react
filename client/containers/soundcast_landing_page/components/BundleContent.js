import React, { Component } from "react";
import firebase from "firebase";

export default class BundleContent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      soundcasts: []
    };
  }

  componentDidMount() {
    let soundcasts = [];
    const { soundcastsIds } = this.props;
    const promises = soundcastsIds.map(id =>
      firebase
        .database()
        .ref(`soundcasts/${id}`)
        .once("value")
        .then(snapshot => {
          console.log(snapshot);
          const soundcast = snapshot.val();
          console.log(snapshot.val());
          soundcasts.push(soundcast);
        })
        .catch(e => console.log(e))
    );
    Promise.all(promises).then(() => this.setState({ soundcasts }));
  }

  render() {
    console.log(this.state.soundcasts);
    return (
      <div>
        <div className="row">
          <div className="col-md-12 col-sm-12 col-xs-12 text-center padding-40px-tb">
            <h2 className="section-title-large sm-section-title-medium text-dark-gray font-weight-600 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text">
              CONTENT
            </h2>
          </div>
        </div>
      </div>
    );
  }
}
