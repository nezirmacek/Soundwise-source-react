import Axios from 'axios';

export function inviteListeners (invitees, subject, content, publisherName, publisherImage) {
	Axios.post('/api/send_email_invites', {
		invitees,
		subject,
		content,
		publisherName,
		publisherImage,
	})
		.then(res => {
			// console.log(res);
			// return res;
		})
		.catch(err => {
			console.log('ERROR send emails to subscribers: ', err);
		});
}