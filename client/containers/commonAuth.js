import firebase from 'firebase';
import Axios from 'axios';

/*
 * SIGN IN BLOCK (signIn, signInFacebook, compileUser, signInInvitedAdmin)
 */

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
              signInInvitedAdmin(match, history);
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

const provider = new firebase.auth.FacebookAuthProvider();
const signInFacebook = (signinUser, history, match, sucessCallback, errCallback) => {
  // firebase.auth().signInWithRedirect(provider)
  firebase.auth().signInWithPopup(provider).then(result => {
    // This gives you a Facebook Access Token. You can use it to access the Facebook API.
    // The signed-in user info.
    const userId = firebase.auth().currentUser.uid;
    firebase.database().ref('users/' + userId)
      .once('value')
      .then(snapshot => {
        const _user = snapshot.val();
        if(_user && typeof(_user.firstName) !== 'undefined') { // if user already exists
          sucessCallback && sucessCallback(_user);
          let updates = {};
          updates['/users/' + userId + '/pic_url/'] = _user.pic_url;
          firebase.database().ref().update(updates);
          _user.pic_url = _user.photoURL;
          delete _user.photoURL;
          signinUser(_user);

          if (history.location.state && history.location.state.soundcast) {
            compileUser(_user, signinUser);
            history.push('/soundcast_checkout', {
              soundcast: history.location.state.soundcast,
              soundcastID: history.location.state.soundcastID,
              checked: history.location.state.checked,
              sumTotal: history.location.state.sumTotal,
            });
          } else if (_user.admin) {
            compileUser(_user, signinUser);
            history.push('/dashboard/soundcasts');
          } else if(match.params.id) {
            signInInvitedAdmin(match, history);
          } else {
            history.push('/myprograms');
          }
        } else {  //if it's a new user
          // const { email, photoURL: pic_url, displayName } = result.user;
          // const name = displayName.split(' ');
          // const _userToRegister = {
          //   firstName: name[0],
          //   lastName: name[1],
          //   email,
          //   pic_url,
          // };
          //
          // firebase.database().ref('users/' + userId).set(_userToRegister);
          // signinUser(_userToRegister);
          // // from login page now register subscribers by default
          // history.push('/myprograms');

          alert('You don’t have a Soundwise account. Please create or sign up for a soundcast to get started.');
          if(match.params.id) {
            history.push(`/signup/admin/${match.params.id}`);
          } else {
            history.push('/signup');
          }
        }
      })
  }).catch(error => {
    facebookErrorCallback(error, () => {
      // Facebook account successfully linked to the existing Firebase user.
      firebase.auth().onAuthStateChanged(user => {
        if (user) {
          const userId = user.uid;
          firebase.database().ref('users/' + userId)
          .once('value')
          .then(snapshot => {
            const _user = snapshot.val();
            _user && signinUser(_user);

            if (history.location.state && history.location.state.soundcast) {
              compileUser(_user, signinUser);
              history.push('/soundcast_checkout', {
                soundcast: history.location.state.soundcast,
                soundcastID: history.location.state.soundcastID,
                checked: history.location.state.checked,
                sumTotal: history.location.state.sumTotal,
              });
            } else if (_user.admin && !match.params.id) {
              compileUser(_user, signinUser);
              history.push('/dashboard/soundcasts');
            } else if(match.params.id) {
              signInInvitedAdmin(match, history);
            } else {
              history.push('/myprograms');
            }
          });
        } else {
          // alert('User saving failed. Please try again later.');
          // Raven.captureMessage('user saving failed!')
        }
      });
    });
    errCallback && errCallback(error);
  });
}

const facebookErrorCallback = (error, callback) => {
  // Handle Errors here.
  if (error.code === 'auth/account-exists-with-different-credential') {
    // Step 2.
    // User's email already exists.
    console.log('Error signInFacebook', error)
    // The provider account's email address.
    const email = error.email;
    // Get registered providers for this email.
    firebase.auth().fetchProvidersForEmail(email).then(providers => {
      // Step 3.
      // If the user has several providers,
      // the first provider in the list will be the "recommended" provider to use.
      if (providers[0] === 'password') {
        // Asks the user his password.
        // In real scenario, you should handle this asynchronously.
        const password = prompt('Please enter your Soundwise password'); // TODO: implement promptUserForPassword.
        firebase.auth().signInWithEmailAndPassword(email, password).then(user => {
          // Step 4a.
          // The pending Facebook credential.
          return user.link(error.credential) // pending credential
        }).then(callback)
      }
    })
  }
}

const compileUser = async (_user, signinUser) => {
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
} // compileUser

const signInInvitedAdmin = (match, history) => {
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      const userId = user.uid;
      firebase.database().ref(`publishers/${match.params.id}/administrators/${userId}`).set(true);
      firebase.database().ref(`publishers/${match.params.id}/soundcasts`)
      .once('value')
      .then(snapshot => {
        firebase.database().ref(`users/${userId}/soundcasts_managed`).set(snapshot.val());
        firebase.database().ref(`users/${userId}/admin`).set(true);
        firebase.database().ref(`users/${userId}/publisherID`).set(match.params.id);
        console.log('completed adding publisher to invited admin');
      })
      .then(() => {
        firebase.database().ref(`users/${userId}`)
        .on('value', snapshot => {
          const _user = snapshot.val();
          compileUser(_user, signinUser);
        });
      })
      .then(() => {
        history.push('/dashboard/soundcasts');
      });
    } else {
      // alert('profile saving failed. Please try again later.');
      // Raven.captureMessage('invited admin saving failed!')
    }
  });
}

/*
 * SIGN UP BLOCK (signUp, signUpFacebook)
 */

const signupCommon = (signupUser, history, match, publisherID, user) => {
  const { firstName, lastName, email, pic_url } = user;
  const picture = pic_url ? pic_url : 'https://s3.amazonaws.com/soundwiseinc/user_profile_pic_placeholder.png';
  firebase.auth().onAuthStateChanged(user => {
    if(user) {
      const userId = user.uid;
      const userToSave = { firstName, lastName, email: { 0: email }, pic_url: picture };
      // add admin fields
      if (match.params.mode === 'admin') {
        userToSave.admin = true;
        userToSave.publisherID = publisherID;
      }
      firebase.database().ref(`users/${userId}`)
      .once('value')
      .then(userSnapshot => {
        if(!userSnapshot.val()) {
          firebase.database().ref('users/' + userId).set(userToSave);
        }
      });
      const _user = { userId, firstName, lastName, picURL: pic_url || 'https://s3.amazonaws.com/soundwiseinc/user_profile_pic_placeholder.png' };
      // TODO: _user.picURL = false
      Axios.post('https://mysoundwise.com/api/user', _user)
      .then(res => {
        // console.log('userToSave: ', userToSave);
        console.log('Success signupCommon user save');
        signupUser(userToSave);
        // for user -> goTo myPrograms, for admin need to register publisher first
        if (match.params.mode !== 'admin' && match.params.mode !== 'soundcast_user') {
          history.push('/myprograms');
        } else if(match.params.mode == 'soundcast_user' && history.location.state) {
          history.push('/soundcast_checkout', {
            soundcast: history.location.state.soundcast,
            soundcastID: history.location.state.soundcastID,
            checked: history.location.state.checked,
            sumTotal: history.location.state.sumTotal,
          });
        }
      })
      .catch(err => {
        console.log('Error signupCommon user saving failed: ', err);
        signupUser(userToSave);
        // for user -> goTo myPrograms, for admin need to register publisher first
        if (match.params.mode !== 'admin' && match.params.mode !== 'soundcast_user') {
          history.push('/myprograms');
        } else if(match.params.mode == 'soundcast_user' && history.location.state) {
          history.push('/soundcast_checkout', {
            soundcast: history.location.state.soundcast,
            soundcastID: history.location.state.soundcastID,
            checked: history.location.state.checked,
            sumTotal: history.location.state.sumTotal,
          });
        }
      });
    }
  });
}

export {
  signIn,
  signInFacebook,
  signupCommon,
  facebookErrorCallback,
}
