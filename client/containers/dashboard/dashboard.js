/**
 * Created by developer on 01.08.17.
 */
import React, {Component} from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as _ from 'lodash';
import firebase from 'firebase';

import {SoundwiseHeader} from '../../components/soundwise_header';
import CreateEpisode from './components/create_episode';
import SoundcastsManaged from './components/soundcasts_managed';
import AddSoundcast from "./components/add_soundcast";
import Subscribers from "./components/subscribers";
import Subscriber from "./components/subscriber";
import Announcements from "./components/announcements";
import Analytics from "./components/analytics";
import EditSoundcast from './components/edit_soundcast';
import Settings from './components/settings';
import EditEpisode from './components/edit_episode';
import Soundcast from './components/soundcast';

const verticalMenuItems = [
    {
        path: 'soundcasts',
        label: 'Soundcasts',
        iconClass: 'headphones',
        isMenuItemVisible: true,
        Component: SoundcastsManaged,
    },
    {
        path: 'edit',
        label: 'edit',
        isMenuItemVisible: false,
        Component: EditSoundcast,
    },
    {
        path: 'soundcast',
        label: 'edit',
        isMenuItemVisible: false,
        Component: Soundcast,
    },
    {
        path: 'add_episode',
        label: 'Add Episode',
        iconClass: 'plus-square-o',
        isMenuItemVisible: true,
        Component: CreateEpisode,
    },
    {
        path: 'add_soundcast',
        isMenuItemVisible: false,
        Component: AddSoundcast,
    },
    {
        path: 'analytics',
        label: 'Analytics',
        iconClass: 'bar-chart',
        isMenuItemVisible: true,
        Component: Analytics,
    },
    {
        path: 'subscribers',
        label: 'Subscribers',
        iconClass: 'users',
        isMenuItemVisible: true,
        Component: Subscribers,
    },
    {
        path: 'subscriber',
        isMenuItemVisible: false,
        Component: Subscriber,
    },
    {
        path: 'announcements',
        label: 'Announcements',
        iconClass: 'bullhorn',
        isMenuItemVisible: true,
        Component: Announcements,
    },
    {
        path: 'settings',
        label: 'Publisher',
        iconClass: 'cog',
        isMenuItemVisible: true,
        Component: Settings,
    },
    {
        path: 'edit_episode',
        label: 'edit_episode',
        isMenuItemVisible: false,
        Component: EditEpisode,
    },
];

class _Dashboard extends Component {
    constructor (props) {
        super(props);
        this.state = {
            userInfo: {},
        }
    }

    componentDidMount() {
        const that = this;
        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                if(that.props.userInfo.admin) {
                    that.setState({
                        userInfo: that.props.userInfo
                    });
                }
            } else {
                that.props.history.push('/signin');
            }
        });
    }
    componentWillReceiveProps (nextProps) {
        if (!nextProps.userInfo.admin || !nextProps.isLoggedIn) {
            nextProps.history.push('/signin');
        }

        if(nextProps.userInfo.admin) {
            this.setState({
                userInfo: nextProps.userInfo
            });
        }
    }

    render() {
        const { history, match, isLoggedIn } = this.props;
        let userInfo = this.state.userInfo;
        const currentTab = _.find(verticalMenuItems, {path: match.params.tab});

        return (
            <div className='container-fluid'
              >
                <SoundwiseHeader />
                <div className="row" style={{minHeight: '100%', width: '100%'}}>
                    <div className="col-lg-2 col-md-3 col-sm-4 col-xs-6" style={styles.verticalMenu}>
                        {
                            verticalMenuItems.map((item, i) => {
                                if (item.isMenuItemVisible) {
                                    return (
                                        <div
                                            style={match.params.tab === item.path && styles.activeVerticalMenuItem || styles.verticalMenuItem}
                                            key={i}
                                            onClick={() => match.params.tab !== item.path && history.push(`/dashboard/${item.path}`)}
                                        >
                                            <i
                                                className={`fa fa-${item.iconClass}`}
                                                style={{...styles.verticalMenuItemIcon, ...(match.params.tab === item.path && {color: '#F76B1C'} || {})}}
                                            ></i>
                                            {item.label}
                                        </div>
                                    );
                                } else {
                                    return null;
                                }
                            })
                        }
                    </div>
                    <div className="col-lg-10 col-md-9 col-sm-8 col-xs-6" style={styles.contentWrapper}>
                        {
                            currentTab
                            &&
                            <currentTab.Component
                                userInfo={userInfo}
                                history={history}
                                id={match.params.id}
                            />
                            ||
                            null
                        }
                    </div>
                </div>
            </div>
        );
    }
}

const styles = {
    verticalMenu: {
        backgroundColor: '#fff',
        paddingRight: 0,
    },
    verticalMenuItem: {
        width: '100%',
        height: 75,
        color: '#687178',
        fontSize: 18,
        paddingTop: 25,
        paddingLeft: 19,
        cursor: 'pointer',
        fontWeight: 'bold',
    },
    activeVerticalMenuItem: {
        width: '100%',
        height: 75,
        fontSize: 18,
        paddingTop: 25,
        paddingLeft: 19,
        backgroundColor: '#f5f5f5',
        color: '#F76B1C',
        borderLeft: '3px solid #F76B1C',
        fontWeight: 'bold',
    },
    verticalMenuItemIcon: {
        fontSize: '20px',
        color: '#687178',
        marginRight: 5,
        width: 25,
    },
    contentWrapper: {
        backgroundColor: '#f5f5f5',
        minHeight: '950',
        paddingTop: 10,
        paddingRight: 20,
        paddingBottom: 10,
        paddingLeft: 20,
        marginBottom: 0
    },
};

function mapDispatchToProps(dispatch) {
    return bindActionCreators({  }, dispatch);
}


const mapStateToProps = state => {
    const { userInfo, isLoggedIn } = state.user;
    return {
        userInfo, isLoggedIn
    }
};

export const Dashboard = connect(mapStateToProps, mapDispatchToProps)(_Dashboard);
