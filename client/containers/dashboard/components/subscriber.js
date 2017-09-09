import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import ReactCrop from 'react-image-crop';
import axios from 'axios';
import firebase from 'firebase';

import {minLengthValidator, maxLengthValidator} from '../../../helpers/validators';
import ValidatedInput from '../../../components/inputs/validatedInput';
import Colors from '../../../styles/colors';
import { OrangeSubmitButton, TransparentShortSubmitButton } from '../../../components/buttons/buttons';

export default class Subscriber extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className='padding-30px-tb'>
        <div >
            <div className='padding-bottom-20px'>
              <span className='title-medium '>
                  Subscribers
              </span>
            </div>
        </div>
      </div>
    )
  }
}