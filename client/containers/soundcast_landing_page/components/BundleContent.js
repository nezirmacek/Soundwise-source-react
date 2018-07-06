import React, { Component } from "react";
import firebase from "firebase";
import Slider from "react-slick";

export default class BundleContent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      soundcasts: [
        {
          short_description: "True Divine Nature",
          title: "Matt Kahn0",
          imageURL:
            "https://s3.amazonaws.com/soundwiseinc/demo/69c4cfd0-a395-11e7-8d5d-ef57ff420759.jpg"
        },
        {
          short_description: "Inspirations from True Divine Nature",
          title: "Matt Kahn1",
          imageURL:
            "https://s3.amazonaws.com/soundwiseinc/demo/69c4cfd0-a395-11e7-8d5d-ef57ff420759.jpg"
        },
        {
          short_description: "Inspirations from True Divine Nature12345",
          title: "Matt Kahn241",
          imageURL:
            "https://s3.amazonaws.com/soundwiseinc/demo/69c4cfd0-a395-11e7-8d5d-ef57ff420759.jpg"
        },
        {
          short_description: "Inspirations from True Divine Nature12345",
          title: "Matt Kahn22",
          imageURL:
            "https://s3.amazonaws.com/soundwiseinc/demo/69c4cfd0-a395-11e7-8d5d-ef57ff420759.jpg"
        },
        {
          short_description: "Inspirations from True Divine Nature12345",
          title: "Matt Kahn21",
          imageURL:
            "https://s3.amazonaws.com/soundwiseinc/demo/69c4cfd0-a395-11e7-8d5d-ef57ff420759.jpg"
        },
        {
          short_description: "Nature12345",
          title: "Matt Kahn3",
          imageURL:
            "https://s3.amazonaws.com/soundwiseinc/demo/69c4cfd0-a395-11e7-8d5d-ef57ff420759.jpg"
        }
      ]
    };
  }

  componentDidMount() {
    // const that = this;
    // let tempSoundcasts = [];
    // console.log(this.props.soundcastsIds);
    // const promises = this.props.soundcastsIds.map(id =>
    //   firebase
    //     .database()
    //     .ref(`soundcasts/${id}`)
    //     .once("value")
    //     .then(snapshot => console.log(1) /*;soundcasts.push(snapshot.val())}*/)
    //     .catch(x => console.log(x))
    // );
    // console.log(promises);
    // Promise.all(promises).then(() =>
    //   that.setState({ soundcasts: tempSoundcasts })
    // );
  }

  render() {
    const { soundcasts } = this.state;
    return (
      <div>
        <div className="row">
          <div className="col-md-12 col-sm-12 col-xs-12 text-center padding-40px-tb">
            <h2 className="section-title-large sm-section-title-medium text-dark-gray font-weight-600 alt-font margin-three-bottom xs-margin-fifteen-bottom tz-text">
              CONTENT
            </h2>
          </div>
        </div>
        <div>
          <Slider centerPadding={0} lidesToShow={3}>
            {soundcasts.map(soundcast => {
              return (
                <div style={styles.soundcastContainer}>
                  <img
                    src={soundcast.imageURL}
                    style={{ width: 250, height: 250 }}
                  />
                  <div>
                    <h4 style={styles.title}>{soundcast.title}</h4>
                    <h5 style={styles.description}>
                      {soundcast.short_description}
                    </h5>
                  </div>
                </div>
              );
            })}
          </Slider>
        </div>
      </div>
    );
  }
}

const styles = {
  soundcastContainer: {
    // alignItems: "center",
    // justifyContent: "center",
    width: "250px",
    height: "400px",
    borderStyle: "solid",
    borderWidth: "3px",
    borderColor: "red"
  },
  title: {
    margin: 0,
    width: "250px",
    fontSize: "22px",
    fontWeight: "bold",
    fontStyle: "normal",
    textAlign: "left"
  },
  description: {
    margin: 0,
    width: "250px",
    fontSize: "16px",
    fontStyle: "normal",
    textAlign: "left"
  }
};
