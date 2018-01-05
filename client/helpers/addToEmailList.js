import Axios from 'axios';

export function addToEmailList (soundcastId, emailAddressArr, emailListId) {
  return Axios.post('/api/add_emails', {
    soundcastId,
    emailAddressArr,
    emailListId,
  })
    .then(res => {
      return res.data.emailListId;
    })
    .catch(err => {
      console.log('ERROR adding to email list: ', err);
    });
}