import firebase from 'firebase';

const signIn = async (email, password, signinUser, history, match, sucessCallback, errCallback) => {
  try {
      await firebase.auth().signInWithEmailAndPassword(email, password);
      firebase.auth().onAuthStateChanged(user => {
        if (user) {
          const userId = user.uid;
          let _user;
          firebase.database().ref(`users/${userId}`).once('value').then(snapshot => {
            if (snapshot.val()) {
              _user = JSON.parse(JSON.stringify(snapshot.val()));
              signinUser(_user);
              sucessCallback && sucessCallback(_user);
            }
          })
          .then(() => {
            if (history.location.state && history.location.state.soundcast) {
              compileUser(_user, signinUser);
              history.push('/soundcast_checkout', {
                soundcast: history.location.state.soundcast,
                soundcastID: history.location.state.soundcastID,
                checked: history.location.state.checked,
                sumTotal: history.location.state.sumTotal,
                userInfo: _user,
              });
            } else if (_user.admin && !match.params.id) {
              compileUser(_user, signinUser);
              history.push('/dashboard/soundcasts');
            } else if(match.params.id) {
              this.signInInvitedAdmin();
            } else if (_user.courses) {
              compileUser(_user, signinUser);
              history.push('/myprograms');
            } else {
              compileUser(_user, signinUser);
              history.push('/mysoundcasts');
            }
          });
        } else {
          // alert('Failed to save login info. Please try again later.');
          // Raven.captureMessage('Failed to save login info. Please try again later.');
        }
      });
  } catch (error) {
    errCallback && errCallback(error);
    console.log(error.toString());
  }
}

const compileUser = async (_user, signinUser) => {
  // const { signinUser } = this.props;
  if (_user.soundcasts_managed && _user.admin) {
    if (_user.publisherID) {
      let publisher_snapshot = await firebase.database().ref(`publishers/${_user.publisherID}`).once('value');
      if (publisher_snapshot.val()) {
        const _publisher = JSON.parse(JSON.stringify(publisher_snapshot.val()));
        _publisher.id = _user.publisherID;
        _user.publisher = _publisher;
        if (_user.publisher.administrators) {
          let admins = {};
          for (let adminId in _user.publisher.administrators) {
            admins[adminId] = await firebase.database().ref(`users/${adminId}`).once('value');
            if (admins[adminId].val()) {
              const _admin = JSON.parse(JSON.stringify(admins[adminId].val()));
              _user.publisher.administrators[adminId] = _admin;
            }
          }
        }
      }
    }

    let soundcastsManaged = {};
    for (let key in _user.soundcasts_managed) {
      soundcastsManaged[key] = await firebase.database().ref(`soundcasts/${key}`).once('value');
      if (soundcastsManaged[key].val()) {
        _user = JSON.parse(JSON.stringify(_user));
        const _soundcast = JSON.parse(JSON.stringify(soundcastsManaged[key].val()));
        _user.soundcasts_managed[key] = _soundcast;
        signinUser(_user);
        if (_soundcast.episodes) {
          let episodes = {};
          for (let epkey in _soundcast.episodes) {
            episodes[epkey] = await firebase.database().ref(`episodes/${epkey}`).once('value');
            if (episodes[epkey].val()) {
              _user = JSON.parse(JSON.stringify(_user));
              _user.soundcasts_managed[key].episodes[epkey] = JSON.parse(JSON.stringify(episodes[epkey].val()));
              signinUser(_user);
            }
          }
        }
      }
    }
  }

  if (_user.soundcasts) {
    let userSoundcasts = {};
    for (let key in _user.soundcasts) {
      userSoundcasts[key] = await firebase.database().ref(`soundcasts/${key}`).once('value');
      if (userSoundcasts[key].val()) {
        _user = JSON.parse(JSON.stringify(_user));
        const _soundcast = JSON.parse(JSON.stringify(userSoundcasts[key].val()));
        _user.soundcasts[key] = _soundcast;
        signinUser(_user);
        if (_soundcast.episodes) {
          let soundcastEpisodes = {};
          for (let epkey in _soundcast.episodes) {
            soundcastEpisodes[epkey] = await firebase.database().ref(`episodes/${epkey}`).once('value')
            if (soundcastEpisodes[epkey].val()) {
              _user = JSON.parse(JSON.stringify(_user));
              _user.soundcasts[key].episodes[epkey] = JSON.parse(JSON.stringify(soundcastEpisodes[epkey].val()));
              signinUser(_user);
            }
          }
        }
      }
    }
  }
}

export {
  signIn,
  compileUser,
}
