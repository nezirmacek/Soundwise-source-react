import Axios from 'axios';

export function inviteListeners (invitees, subject, content) {
	Axios.post('/api/send_email_invites', {
		invitees,
		subject,
		content,
	})
		.then(res => {
			// console.log(res);
			// return res;
		})
		.catch(err => {
			console.log('ERROR send emails to subscribers: ', err);
		});
}