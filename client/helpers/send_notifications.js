import Axios from 'axios';

export function sendNotifications (registrationTokens, payload) {
  Axios.post('/api/send_notification', {
    registrationTokens,
    payload
  })
    .then(res => {
      console.log(res);
    })
    .catch(err => {
      console.log(err);
    });
}