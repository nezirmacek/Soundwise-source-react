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

export default class Subscribers extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div className='padding-30px-tb'>
        <div className='padding-bottom-20px'>
            <span className='title-medium '>
                Subscribers
            </span>
            <div>
            <table>
              <tr style={styles.tr}>
                <th style={{...styles.th, width: 37}}></th>
                <th style={{...styles.th, width: 250}}>NAME</th>
                <th style={{...styles.th, width: 250}}>EMAIL</th>
                <th style={{...styles.th, width: 170}}>DATE SUBSCRIBED </th>
                <th style={{...styles.th, width: 170}}>TOTAL LISTEN</th>
                <th style={{...styles.th, width: 170}}>STATS</th>
                <th style={{...styles.th, width: 100}}></th>
              </tr>

            </table>
            </div>
        </div>
      </div>
    )
  }
}

const styles = {
  tr: {
      borderBottomWidth: 1,
    borderBottomColor: Colors.lightBorder,
    borderBottomStyle: 'solid',
  },
  th: {
    fontSize: 14,
    color: Colors.fontGrey,
    height: 35,
    fontWeight: 'regular',
    vAlign: 'middle',
  },
  td: {
      color: Colors.fontDarkGrey,
    fontSize: 14,
    height: 40,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  itemCheckbox: {
      marginTop: 7,
  },
  itemChartIcon: {
      fontSize: 12,
    color: Colors.fontBlack,
    cursor: 'pointer',
  },
}