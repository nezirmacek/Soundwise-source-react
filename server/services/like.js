'use strict';

const sendNotification = require('../scripts/messaging').sendNotification;
const { userManager, likeManager } = require('../managers');
const {
  likeRepository,
  commentRepository,
  announcementRepository,
} = require('../repositories');

// ADD_LIKE
const addLike = (req, res) => {
  const like = req.body;
  const lastLiked = like.fullName;
  if (!like.fullName) {
    res.status(400).send({ error: 'fullName can not be null' });
    return;
  }
  likeRepository
    .create(like)
    .then(like => {
      const { episodeId, announcementId, commentId } = like;
      if (episodeId) {
        // LIKE EPISODE
        likeRepository.count({ episodeId }).then(count =>
          likeManager
            .updateLikeInEpisode(episodeId, count, lastLiked)
            .then(() => res.send(like))
            .catch(error => sendError(error, res))
        );
      } else if (announcementId) {
        // LIKE MESSAGE
        likeRepository
          .count({ announcementId })
          .then(likesCount =>
            announcementRepository
              .update({ lastLiked, likesCount }, announcementId)
              .then(() => res.send(like))
              .catch(error => sendError(error, res))
          )
          .catch(error => sendError(error, res));
      } else if (commentId) {
        // LIKE COMMENT
        likeRepository
          .count({ commentId })
          .then(likesCount =>
            commentRepository
              .update({ likesCount }, commentId)
              .then(() =>
                commentRepository
                  .get(commentId)
                  .then(comment => {
                    sendPush(comment);
                    res.send(like);
                  })
                  .catch(error => sendError(error, res))
              )
              .catch(error => sendError(error, res))
          )
          .catch(error => sendError(error, res));
      }
    })
    .catch(error => sendError(error, res));
};

const deleteLike = (req, res) => {
  const likeId = req.params.id;
  likeRepository
    .get(likeId)
    .then(like => {
      likeRepository
        .destroy(likeId)
        .then(() => {
          const { episodeId, announcementId, commentId } = like;
          if (announcementId) {
            // UNLIKE MESSAGE
            getNamePreviousLiker({ announcementId })
              .then(lastLiked =>
                likeRepository
                  .count({ commentId })
                  .then(likesCount =>
                    announcementRepository
                      .update({ likesCount, lastLiked }, announcementId)
                      .then(() => res.send({ lastLiked }))
                      .catch(error => sendError(error, res))
                  )
                  .catch(error => sendError(error, res))
              )
              .catch(error => sendError(error, res));
          } else if (commentId) {
            // UNLIKE COMMENT
            getNamePreviousLiker({ commentId })
              .then(lastLiked =>
                likeRepository
                  .count({ commentId })
                  .then(likesCount =>
                    commentRepository
                      .update({ likesCount }, commentId)
                      .then(() => res.send({ lastLiked }))
                      .catch(error => sendError(error, res))
                  )
                  .catch(error => sendError(error, res))
              )
              .catch(error => sendError(error, res));
          } else if (episodeId) {
            // UNLIKE EPISODE
            getNamePreviousLiker(episodeId)
              .then(lastLiked =>
                likeRepository
                  .count({ episodeId })
                  .then(likesCount =>
                    likeManager
                      .updateLikeInEpisode(episodeId, likesCount, lastLiked)
                      .then(() => res.send({ lastLiked }))
                      .catch(error => sendError(error, res))
                  )
                  .catch(error => sendError(error, res))
              )
              .catch(error => sendError(error, res));
          }
        })
        .catch(error => sendError(error, res));
    })
    .catch(error => sendError(error, res));
};

const getNamePreviousLiker = where =>
  likeRepository
    .getPrevious(where)
    .then(like => likeManager.getFullNameByUid(like.userId));

const sendPush = comment => {
  userManager.getById(comment.userId).then(user => {
    if (user && user.token) {
      sendNotification(user.token, {
        data: {
          type: 'LIKE_COMMENT',
          commentId: like.commentId,
          soundcastId: like.soundcastId,
        },
        notification: {
          title: 'New like',
          body: 'To your comment liked',
        },
      });
    }
  });
};

const sendError = (err, res) => {
  console.log(err);
  res.status(500).send(err);
};

module.exports = { addLike, deleteLike };
