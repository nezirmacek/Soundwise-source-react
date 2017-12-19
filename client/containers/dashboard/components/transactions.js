import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import Axios from 'axios';
import firebase from 'firebase';
import { Link } from 'react-router-dom';

import {minLengthValidator, maxLengthValidator} from '../../../helpers/validators';
import {inviteListeners} from '../../../helpers/invite_listeners';

import ValidatedInput from '../../../components/inputs/validatedInput';
import Colors from '../../../styles/colors';
import { OrangeSubmitButton, TransparentShortSubmitButton } from '../../../components/buttons/buttons';

export default class Transactions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      transactions: [{
        date: '',
        type: 'charge',
        amount: 0,
        description: '',
      }],
    };

  }

  componentDidMount() {
    if(this.props.userInfo.publisher) {
      this.retrieveTransactions(this.props.userInfo.publisher.id);
    }
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.userInfo.publisher && nextProps.userInfo.publisher !== this.props.userInfo.publisher) {
      this.retrieveTransactions(nextProps.userInfo.publisher.id);
    }
  }

  retrieveTransactions(publisherId) {
    const that = this;
    const filter = {
        params: {
            filter: {
                where: {
                  publisherId
                    // date: {
                    //     lte: moment().format('YYYY-MM-DD[T]HH:mm:ss.SSS[Z]'),
                    // },
                }
            }
        }
    };

    Axios.get('https://mysoundwise.com/api/transactions', filter)
    .then(res => {
      // console.log('transactions: ', res);
      const transactions = res.data;
      transactions.sort((a, b) => {
        return b.createdAt - a.createdAt;
      });
      that.setState({
        transactions,
      })
    })
    .catch(err => {
      console.log('error retrieving transactions: ', err);
    });
  }

  render() {

    return (
            <div className='padding-30px-tb'>
                <div className='padding-bottom-20px'>
                    <span className='title-medium '>
                        Publisher
                    </span>
                </div>
                <ul className="nav nav-pills">
                  <li role="presentation" ><Link to='/dashboard/publisher'><span style={{fontSize: 15, fontWeight: 600}}>Settings</span></Link></li>
                  <li role="presentation" className="active"><Link style={{backgroundColor: Colors.mainOrange}} to="/dashboard/publisher/transactions"><span style={{fontSize: 15, fontWeight: 600}}>Transactions</span></Link></li>
                  <li role="presentation"><Link to="/dashboard/publisher/payouts"><span style={{fontSize: 15, fontWeight: 600}}>Payouts</span></Link></li>
                </ul>
                {
                  this.state.transactions.length > 0 &&
                  <row >
                      <div className='col-md-12 col-sm-12 col-xs-12 table-responsive' style={styles.tableWrapper}>
                        <table className='table table-hover'>
                          <thead>
                            <tr style={styles.tr}>
                              <th style={{...styles.th,}}>DATE</th>
                              <th style={{...styles.th,}}>TYPE</th>
                              <th style={{...styles.th, }}>DESCRIPTION</th>
                              <th style={{...styles.th, }}>AMOUNT</th>
                            </tr>
                          </thead>
                          <tbody>
                            {
                              this.state.transactions.map((transaction, i) => {
                                const type = transaction.type == 'charge' ? 'Sale' : 'Refund';
                                const price = Number(transaction.amount).toFixed(2);
                                const creditCardCharge = (price * 0.029 + 0.3).toFixed(2); // Stripe charge
                                const soundwiseFee = 0.00;
                                const amount = (price - creditCardCharge - soundwiseFee).toFixed(2);
                                return (
                                  <tr key={i} style={styles.tr}>
                                    <td style={{...styles.td, }}>{transaction.type == 'charge' ? transaction.date.slice(0, 10) : transaction.refund_date.slice(0, 10)}</td>
                                    <td style={{...styles.td, }}>{type}</td>
                                    <td style={{...styles.td, }}>{transaction.description}</td>
                                    <td style={{...styles.td, }}>
                                      <div style={{fontWeight: 600}}>
                                        {
                                          `${transaction.type == 'charge' ? '' : '-'}$${amount}`
                                        }
                                      </div>
                                      <div style={{fontSize: 12, color: Colors.fontGrey}}>
                                        {`(Price: ${transaction.type == 'charge' ? '' : '-'}$${price}`}
                                      </div>
                                      <div style={{fontSize: 12, color: Colors.fontGrey}}>
                                        {`Credit card processing fee: ${transaction.type == 'charge' ? '-' : ''}$${creditCardCharge}`}
                                      </div>
                                      <div style={{fontSize: 12, color: Colors.fontGrey}}>
                                        {`Soundwise fee: ${transaction.type == 'charge' ? '-' : ''}$${soundwiseFee})`}
                                      </div>
                                    </td>
                                  </tr>
                                )
                              })
                            }
                          </tbody>
                        </table>
                      </div>
                  </row>
                  ||
                  <row>
                    <div className= 'col-md-12 ' style={{marginTop: 40}}>
                      <div className='title-small padding-40px-tb' style={{display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.mainWhite}}>

                        <span>There're no transactions to show.</span>
                      </div>
                    </div>
                  </row>
                }
            </div>
    )
  }
}

const styles = {
    titleText: {
        fontSize: 16,
        fontWeight: 600,
    },
    inputTitleWrapper: {
        width: '100%',
        marginTop: 10,
        marginBottom: 20,
    },
    inputTitle: {
        height: 40,
        backgroundColor: Colors.mainWhite,
        width: '100%',
        fontSize: 16,
        borderRadius: 4,
        marginBottom: 0,
    },
    inputDescription: {
        height: 80,
        backgroundColor: Colors.mainWhite,
        width: '100%',
        fontSize: 16,
        borderRadius: 4,
        marginTop: 10,
        marginBottom: 20
    },
  tableWrapper: {
    marginTop: 25,
    backgroundColor: Colors.mainWhite,
    padding: 25,
    overflow: 'auto',
    maxHeight: 650,
  },
  tr: {
      borderBottomWidth: 1,
    borderBottomColor: Colors.lightBorder,
    borderBottomStyle: 'solid',
  },
  th: {
    fontSize: 16,
    color: Colors.fontGrey,
    // height: 35,
    fontWeight: 'regular',
    verticalAlign: 'middle',
    wordWrap: 'break-word',
  },
  td: {
      color: Colors.softBlack,
    fontSize: 16,
    // height: 40,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    verticalAlign: 'middle',
    wordWrap: 'break-word',
  },


}