'use strict';
const { mailingManager, soundcastManager } = require('../managers');

const addToMailingList = (soundcastId, recipients, listName, mailingListId) => {
  mailingManager
    .addRecipients(recipients)
    .then(persistedRecipients => {
      if (mailingListId) {
        mailingManager.addReipientsToMailingList(
          mailingListId,
          persistedRecipients
        );
      } else {
        mailingManager
          .createMailingList(soundcastId, listName)
          .then(listId =>
            mailingManager
              .addReipientsToMailingList(listId, persistedRecipients)
              .then(() =>
                soundcastManager.setMailingListName(
                  soundcastId,
                  listName,
                  mailingListId
                )
              )
              .catch(err => {
                // TODO: do something with err.message
              })
          )
          .catch(err => {
            let message;
            try {
              message = err.response.body.errors[0].message;
            } catch (err) {}
            if (
              message ===
              'This list name is already in use. Please choose a new, unique name.'
            ) {
              mailingManager
                .getMailingLists()
                .then(([, body]) => {
                  const list = body.lists.find(
                    i => i.name === `${soundcastId}-${listName}`
                  );
                  if (list) {
                    mailingManager
                      .addReipientsToMailingList(list.id, persistedRecipients)
                      .then(() =>
                        soundcastManager.setMailingListName(
                          soundcastId,
                          listName,
                          mailingListId
                        )
                      )
                      .catch(err => {
                        // TODO: do something with err.message
                      });
                  } else {
                    // TODO: list not found
                  }
                })
                .catch(err => {
                  // TODO: do something with err.message;
                });
            } else {
              // TODO: do something with err.message;
            }
          });
      }
    })
    .catch(err => {
      // TODO: do something with err.message;
    });
};

const deleteFromMailingList = (emails, mailingListId) =>
  Promise.all(
    emails.map(email =>
      mailingManager
        .getRecipient(email)
        .then(({ id }) => mailingManager.deleteRecipient(id, mailingListId))
    )
  );

module.exports = {
  addToMailingList,
  deleteFromMailingList,
};
