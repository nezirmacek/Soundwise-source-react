/**
 * Created by developer on 11.08.17.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

import Colors from '../../styles/colors';

export default class ImageS3Uploader extends Component {
    constructor(props) {
        super(props);

        this.state = {
            imageURL: '',
            fileUploaded: false,
        };

        this.fileInputRef = null;
        this.visibleFileInputRef = null;
    }

    componentDidMount () {
        // const _input = document.getElementById('upload_hidden_cover');
        // _input.addEventListener('change', (e) => {
        //     console.log('>>>>>>>>>>PATH', e);
        // });
    }

    _uploadToAws (file) {
        const { cb, fileName } = this.props;
        const _self = this;
        let data = new FormData();
        const splittedFileName = file.name.split('.');
        const ext = (splittedFileName)[splittedFileName.length - 1];
        data.append('file', file, `${fileName}.${ext}`);
        axios.post('/api/upload', data)
            .then(function (res) {
                // POST succeeded...
                console.log('success upload to aws s3: ', res);
                //replace 'http' with 'https'
                let url = res.data[0].url;
                if(url.slice(0, 5) !== 'https') {
                    url = url.replace(/http/i, 'https');
                }
                _self.setState({imageURL: url});
                cb(url);
            })
            .catch(function (err) {
                // POST failed...
                console.log('ERROR upload to aws s3: ', err);
            });
    }

    setFileName (e) {
        // if (e.target.value) {
        //     this.setState({fileUploaded: true});
        // }
        // this.visibleFileInputRef.value = e.target.files[0].name;
        this._uploadToAws(this.fileInputRef.files[0])
        if (this.fileInputRef.files[0]) {
            this.setState({fileUploaded: true});
        }
    }

    render () {
        const { imageURL, fileUploaded } = this.state;
        const that = this;

        return (
            <div style={_styles.fileUploader}>
                <div style={_styles.image}>
                    {
                        this.fileInputRef && this.fileInputRef.files && this.fileInputRef.files[0]
                        &&
                        <img src={imageURL} />
                        ||
                        null
                    }
                </div>
                <div style={_styles.loaderWrapper}>
                    <span style={{..._styles.titleText, marginLeft: 10}}>
                        {this.props.title}
                    </span>
                    <div style={{..._styles.inputFileWrapper, marginTop: 0}}>
                        <input
                            type="file"
                            name="upload"
                            id="upload_hidden_cover"
                            onChange={this.setFileName.bind(this)}
                            style={_styles.inputFileHidden}
                            ref={input => this.fileInputRef = input}
                        />
                        {
                          fileUploaded &&
                          <div>
                            <span>{this.fileInputRef.files[0].name}</span>
                            <span style={_styles.cancelImg}
                              onClick={() => that.setState({fileUploaded: false, imageURL: ''})}>Cancel</span>
                          </div>
                          ||
                          !fileUploaded &&
                          <div>
                            <button
                                onClick={() => {document.getElementById('upload_hidden_cover').click();}}
                                style={{..._styles.uploadButton, backgroundColor:  Colors.mainOrange}}
                            >
                                Upload
                            </button>
                            <span style={_styles.fileTypesLabel}>.jpg or .png files accepted</span>
                          </div>
                        }
                    </div>
                </div>
            </div>
        );
    }
};

ImageS3Uploader.propTypes = {
    cb: PropTypes.func,
    fileName: PropTypes.string,
};

const _styles = {
    fileUploader: {
        height: 133,
    },
    image: {
        width: 133,
        height: 133,
        float: 'left',
        backgroundColor: Colors.mainWhite,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: Colors.lightGrey,
    },
    loaderWrapper: {
        height: 143,
        paddingTop: 20,
        paddingRight: 0,
        paddingBottom: 0,
        paddingLeft: 20,
        width: 'calc(100% - 133px)',
        float: 'left',
    },
    titleText: {
        fontSize: 14,
    },
    inputFileWrapper: {
        margin: 10,
        width: 'calc(100% - 20px)',
        height: 53,
        backgroundColor: Colors.mainWhite,
        overflow: 'hidden',
        marginBottom: 0,
        float: 'left',
    },
    inputFileHidden: {
        position: 'absolute',
        display: 'block',
        overflow: 'hidden',
        width: 0,
        height: 0,
        border: 0,
        padding: 0,
    },
    inputFileVisible: {
        backgroundColor: 'transparent',
        width: 'calc(100% - 70px)',
        height: 32,
        float: 'left',
    },
    uploadButton: {
        backgroundColor: Colors.mainOrange,
        width: 70,
        height: 32,
        color: Colors.mainWhite,
        fontSize: 12,
        border: 0,
    },
    cancelImg: {
      color: Colors.link,
      marginLeft: 20,
      fontSize: 14,
      cursor: 'pointer'
    },
    fileTypesLabel: {
        fontSize: 11,
        marginLeft: 0,
        display: 'block',
    },
};
