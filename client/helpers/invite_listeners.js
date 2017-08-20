import Axios from 'axios';

export function inviteListeners (invitees, soundcastTitle, adminFirstName, adminLastName) {
  Axios.post('/api/send_email_invites', {
    invitees,
    soundcastTitle,
    adminName: `${adminFirstName} ${adminLastName}`,
  })
    .then(res => {
      console.log(res);
    })
    .catch(err => {
      console.log(err);
    });
}