
module.exports.audioProcessing = async (req, res) => {
	// 1. Client make post request to /api/audio_processing, with episode ID and processing options
	const { epsiodeId, soundcastId, publisherEmail, publisherFirstName,
					tagging, intro, outro, overlayDuration, setVolume, trim,
					removeSilence, autoPublish, emailListeners } = req.body;
	if (epsiodeId && soundcastId && publisherEmail && publisherFirstName &&
			tagging && intro && outro && overlayDuration && setVolume && trim &&
			removeSilence && autoPublish && emailListeners) {
	  // 2. return 200 ok to client if request body includes all necessary information
		res.end('ok');

		// 3. Get the episode url from firebase 'episodes/[episode id]/url', fetch the audio file

	} else {
		res.error('Error: undefined parameters');
	}
}
