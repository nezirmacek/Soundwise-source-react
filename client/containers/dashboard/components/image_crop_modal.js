import React, { Component } from 'react';
import Cropper from 'react-cropper';
// import 'cropperjs/dist/cropper.css';
// import {Cropper} from 'react-image-cropper'
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import moment from 'moment';
import Colors from '../../../styles/colors';

function dataURItoBlob(dataURI) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(dataURI.split(',')[1]);
    else
        byteString = unescape(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], {type:mimeString});
}

export default class ImageCropModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      src: '',
      cropResult: null,
      cropped: false,
      crop: {
        x: 20,
        y: 10,
        aspect: 1/1,
        height: 10
      },
    };
    this.cropImage = this.cropImage.bind(this);
    this.cancelCrop = this.cancelCrop.bind(this);
    this.upload = this.upload.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    let file = nextProps.file;
    if(file) {
      const reader = new FileReader();
      reader.onload = () => {
        var image = new Image();
        image.src = reader.result;

        image.onload = () => {
          this.setState({
            src: reader.result,
            height: image.height,
            width: image.width,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  }

  cancelCrop() {
    this.setState({
      cropped: false,
      cropResult: null,
    })
  }

  cropImage() {
    this.setState({
      cropResult: this.refs.cropper.getCroppedCanvas().toDataURL(),
      cropped: true,
    });
  }

  upload() {
    const {hostImg} = this.props;
    const {cropResult} = this.state;
    if(cropResult) {
      const fileBlob = dataURItoBlob(this.state.cropResult);
      this.props.upload(fileBlob, hostImg);
      this.setState({
        cropped: false,
      })
    } else {
      alert('Please confirm image crop before saving.');
      return;
    }
    // console.log('fileBlob: ', fileBlob);
  }

  render() {
    const that = this;
    const {cropResult, width, height,} = this.state;
    const actions = [
      <FlatButton
        label="Save"
        primary={true}
        onClick={() => that.upload()}
      />,
      <FlatButton
        label="Cancel"
        primary={true}
        onClick={this.props.handleClose}
      />,
    ];
    return (
      <MuiThemeProvider>
        <Dialog
          title="Crop Image"
          actions={actions}
          modal={false}
          open={this.props.open}
          onRequestClose={this.props.handleClose}
          contentStyle={{width: '80%'}}
          bodyStyle={{minHeight: 350, overflowY: 'auto'}}
        >
        {
          !this.state.cropped &&
          <div className='center-col' style={{}}>
            <Cropper
              // onImageLoaded={this.onImageLoaded}
              // onChange={this.onChange.bind(this)}
              // onComplete={this.setPixels}
              style={{ height: 300, width: width / height * 300, margin: '0 auto' }}
              // crop={this.cropImage}
              // ratio={1 / 1}
              src={this.state.src}
              // ref={ref => this.image = ref }
              ref='cropper'
              aspectRatio={1 / 1}
              guides={false}
            />
            <div style={{width: '100%', marginTop: 10,}}>
              <RaisedButton
                onClick={this.cropImage}
                backgroundColor={Colors.mainOrange}
                label="Confirm Crop"
                fullWidth={true} />
            </div>
          </div>
          ||
          <div style={{width: '100%'}}>
            <div style={{display: 'flex', justifyContent: 'center'}}>
              <img style={{ height: 300, width: 300, padding: 10, }} src={this.state.cropResult} alt="cropped image" />
            </div>
            <RaisedButton
              onClick={this.cancelCrop}
              label="Cancel"
              fullWidth={true} />
          </div>
        }
        </Dialog>
      </MuiThemeProvider>
    )
  }
}