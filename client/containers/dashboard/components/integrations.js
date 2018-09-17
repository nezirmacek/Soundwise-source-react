import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import Axios from 'axios';
import firebase from 'firebase';
import { Link } from 'react-router-dom';
import Colors from '../../../styles/colors';
import commonStyles from '../../../styles/commonStyles';
import {
  OrangeSubmitButton,
} from '../../../components/buttons/buttons';

export default class Integrations extends Component {
  constructor(props) {
    super(props);
    this.state = {
      integrationSelected : '',
    };
  }

  componentDidMount() {
  }

  componentWillReceiveProps(nextProps) {
  }

  render() {
    const {
      integrationSelected
    } = this.state;
    const { userInfo } = this.props;

    return (
      <div className="padding-30px-tb">
        <div
          className="padding-bottom-20px"
        >
          <span className="title-medium ">Publisher</span>
          <Link to={`/publishers/${userInfo.publisherID}`}>
            <span
              className="text-medium"
              style={{ marginLeft: 15, color: Colors.mainOrange }}
            >
              <strong>View Publisher Page</strong>
            </span>
          </Link>
        </div>
        <ul className="nav nav-pills">
          <li role="presentation">
            <Link to="/dashboard/publisher">
              <span style={{ fontSize: 15, fontWeight: 600 }}>Profile</span>
            </Link>
          </li>
          <li role="presentation">
            <Link to="/dashboard/publisher/transactions">
              <span style={{ fontSize: 15, fontWeight: 600 }}>
                Transactions
              </span>
            </Link>
          </li>
          <li role="presentation">
            <Link to="/dashboard/publisher/payouts">
              <span style={{ fontSize: 15, fontWeight: 600 }}>Payouts</span>
            </Link>
          </li>
          <li role="presentation">
            <Link to="/dashboard/publisher/promotions">
              <span style={{ fontSize: 15, fontWeight: 600 }}>Promotions</span>
            </Link>
          </li>
          <li role="presentation">
            <Link to="/dashboard/publisher/settings">
              <span style={{ fontSize: 15, fontWeight: 600 }}>Settings</span>
            </Link>
          </li>
          <li role="presentation">
            <Link               
              style={{ backgroundColor: 'transparent' }}
              to="/dashboard/publisher/integrations">
            <span
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: Colors.mainOrange,
                }}
              >Integration</span>
            </Link>
          </li>
        </ul>
        <div className="container">
          <div className="row">
            <div
              className="col-lg-6 col-md-6 col-sm-12 col-xs-12"
              style={{ minHeight: 700 }}
            >
              <div style={{display: 'flex', marginTop: '20px', marginBottom: '20px'}}>
                <span style={{ 
                          ...styles.titleText, 
                          padding: '10px 10px 10px 0px', 
                          width: '120px',
                          marginRight: '16'}}
                >
                  Connect with
                </span>
                <div style={{ width: 'auto' }} className="dropdown">
                  <div
                    style={{ width: '100%', padding: 0 }}
                    className="btn dropdown-toggle"
                    data-toggle="dropdown"
                  >
                    <div style={styles.dropdownTitle}>
                      <span style={{ ...styles.titleText, padding: '20px'}}>
                        {integrationSelected != '' ? integrationSelected : `Choose Integration`}
                      </span>
                      <span
                        style={{ position: 'absolute', right: 10, top: 20 }}
                        className="caret"
                      />
                    </div>
                  </div>
                  <ul style={{ padding: 0 }} className="dropdown-menu" style={{ width: '100%', padding: 0 }}>
                    <li style={{ fontSize: '16px', width: '100%' }}>
                      <button
                        style={{ ...styles.categoryButton, width: '100%' }}
                        onClick={() => {
                            this.setState({integrationSelected: 'Mailchimp'})
                          }
                        }
                      >
                        Mailchimp
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
              <div style={{ ...styles.inputTitleWrapper, display: 'flex'}}>
                <span style={{ 
                        ...styles.titleText, 
                        padding: '10px 10px 10px 0px', 
                        width: '120px',
                        marginRight: '16'}}
                >
                  Status
                </span>
                <span style={{ 
                        ...styles.titleText, 
                        padding: '10px 10px 10px 0px', 
                        marginRight: '16'}}
                >
                  Not Connected
                </span>
              </div>
              <div style={{ ...styles.inputTitleWrapper, display: 'flex'}}>
                <span style={{ 
                        ...styles.titleText, 
                        padding: '10px 10px 10px 0px', 
                        width: '150px',
                        marginRight: '16'}}
                >
                  API Key
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%'}}>
                  <input
                    type="text"
                    style={{ ...styles.inputTitle, flexGrow: '1' }}
                    onChange={e => {
                      this.setState({ publisherName: e.target.value });
                    }}
                  />
                  <span>
                    The API key for connecting with your MailChimp account.
                    <a 
                      href="https://admin.mailchimp.com/account/api/" 
                      target="_blank" 
                      style={{
                        fontWeight: 600,
                        color: Colors.mainOrange,
                      }}
                    > 
                      {' '}Get your API key here. 
                    </a>
                  </span>
                </div>
              </div>
              <div>
                <OrangeSubmitButton
                  label="Save"
                  onClick={() =>
                    console.log("save integration")
                  }
                  styles={{
                    margin: '7px 0 50px',
                    backgroundColor: Colors.link,
                    borderWidth: '0px',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const styles = {
  titleText: { ...commonStyles.titleText },
  inputTitleWrapper: { ...commonStyles.inputTitleWrapper },
  inputTitle: { ...commonStyles.inputTitle, fontSize: 16 },
  dropdownTitle: { ...commonStyles.dropdownTitle },
  categoryButton: { ...commonStyles.categoryButton },
};
