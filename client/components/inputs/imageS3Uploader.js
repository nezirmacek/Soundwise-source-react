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
    
    _uploadToAws (file) {
        const { cb, fileName } = this.props;
        const _self = this;
        let data = new FormData();
        const splittedFileName = file.name.split('.');
        const ext = (splittedFileName)[splittedFileName.length - 1];
        data.append('file', file, `${fileName}.${ext}`);
        // axios.post('http://localhost:3000/upload/images', data) // - alternative address (need to uncomment on backend)
        axios.post('http://localhost:3000/api/fileUploads/upload', data)
            .then(function (res) {
                // POST succeeded...
                console.log('success upload to aws s3: ', res);
                _self.setState({imageURL: (JSON.parse(res.data))[0].url});
                cb((JSON.parse(res.data))[0].url);
            })
            .catch(function (err) {
                // POST failed...
                console.log('ERROR upload to aws s3: ', err);
            });
    }
    
    setFileName (e) {
        if (e.target.value) {
            this.setState({fileUploaded: true});
        }
        this.visibleFileInputRef.value = e.target.value;
    }
    
    render () {
        const { imageURL, fileUploaded } = this.state;
        return (
            <div style={_styles.fileUploader}>
                <div style={_styles.image}>
                    {
                        this.fileInputRef && this.fileInputRef.files && this.fileInputRef.files[0]
                        &&
                        <img src={URL.createObjectURL(this.fileInputRef.files[0])} />
                        ||
                        null
                    }
                </div>
                <div style={_styles.loaderWrapper}>
                    <span style={{..._styles.titleText, marginLeft: 10}}>
                        Soundcast cover art (square image)
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
                        <input
                            type="text"
                            readOnly="1"
                            id="file"
                            style={_styles.inputFileVisible}
                            placeholder={'No File Selected'}
                            onClick={() => {this.fileInputRef.click();}}
                            ref={input => this.visibleFileInputRef = input}
                        />
                        {
                            !imageURL
                            &&
                            <button
                                onClick={() => {fileUploaded && this._uploadToAws(this.fileInputRef.files[0]);}}
                                style={{..._styles.uploadButton, backgroundColor: fileUploaded && Colors.mainOrange || Colors.lightGrey}}
                            >
                                Upload
                            </button>
                            ||
                            null
                        }
                    </div>
                    <span style={_styles.fileTypesLabel}>.pdf, .jpg or .png files accepted</span>
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
        height: 133,
        paddingTop: 20,
        paddingRight: 0,
        paddingBottom: 0,
        paddingLeft: 20,
        width: 'calc(100% - 133px)',
        float: 'left',
    },
    titleText: {
        fontSize: 12,
    },
    inputFileWrapper: {
        margin: 10,
        width: 'calc(100% - 20px)',
        height: 25,
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
        width: 'calc(100% - 50px)',
        height: 25,
        float: 'left',
    },
    uploadButton: {
        backgroundColor: Colors.mainOrange,
        width: 50,
        height: 25,
        float: 'left',
        color: Colors.mainWhite,
        fontSize: 9,
        border: 0,
    },
    fileTypesLabel: {
        fontSize: 9,
        marginLeft: 10,
        display: 'block',
    },
};
