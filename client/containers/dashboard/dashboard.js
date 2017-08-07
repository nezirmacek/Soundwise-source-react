/**
 * Created by developer on 01.08.17.
 */
import React, {Component} from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import {SoundwiseHeader} from '../../components/soundwise_header';
import CreateEpisode from './components/create_episode';

const verticalMenuItems = [
    {
        label: 'Soundcasts',
        iconClass: 'headphones',
    },
    {
        label: 'Add Episode',
        iconClass: 'bullseye',
    },
    {
        label: 'Analytics',
        iconClass: 'lightbulb-o',
    },
    {
        label: 'Subscribers',
        iconClass: 'users',
    },
    {
        label: 'Announcements',
        iconClass: 'bullhorn',
    },
];

class _Dashboard extends Component {
    constructor (props) {
        super(props);

        if (!props.isLoggedIn) {
            this.props.history.push('/signin');
        }
        this.state = {
            activeMenuItem: 1,
        };
    }

    render() {
        return (
            <div>
                <SoundwiseHeader />
                <div className="row">
                    <div className="col-lg-2 col-md-3 col-sm-4 col-xs-6" style={styles.verticalMenu}>
                        {
                            verticalMenuItems.map((item, i) => {
                                return (
                                    <div
                                        style={this.state.activeMenuItem === i && styles.activeVerticalMenuItem || styles.verticalMenuItem}
                                        key={i}
                                        onClick={() => this.setState({activeMenuItem: i})}
                                    >
                                        <i
                                            className={`fa fa-${item.iconClass}`}
                                            style={{...styles.verticalMenuItemIcon, ...(this.state.activeMenuItem === i && {color: '#F76B1C'} || {})}}
                                        ></i>
                                        {item.label}
                                    </div>
                                );
                            })
                        }
                    </div>
                    <div className="col-lg-10 col-md-9 col-sm-8 col-xs-6" style={styles.contentWrapper}>
                        {
                            this.state.activeMenuItem === 0 &&
                            null
                            ||
                            this.state.activeMenuItem === 1 &&
                            <CreateEpisode />
                            ||
                            this.state.activeMenuItem === 2 &&
                            null
                            ||
                            this.state.activeMenuItem === 3 &&
                            null
                            ||
                            this.state.activeMenuItem === 4 &&
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
        fontSize: 16,
        paddingTop: 25,
        paddingLeft: 19,
    },
    activeVerticalMenuItem: {
        width: '100%',
        height: 75,
        fontSize: 16,
        paddingTop: 25,
        paddingLeft: 19,
        backgroundColor: '#f5f5f5',
        color: '#F76B1C',
        borderLeft: '3px solid #F76B1C',
    },
    verticalMenuItemIcon: {
        fontSize: '20px',
        color: '#687178',
        marginRight: 10,
        width: 25,
    },
    contentWrapper: {
        backgroundColor: '#f5f5f5',
        minHeight: 375,
        paddingTop: 10,
        paddingRight: 20,
        paddingBottom: 10,
        paddingLeft: 20,
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
