import { createSelector } from 'reselect';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { editDraft, requestDraft, saveDraft, sendDraft } from '../../../../store/modules/draft-message';
import { REPLY_TO_MESSAGE } from '../../../../store/modules/message';
import { getLastMessage } from '../../../../services/message';
import Presenter from './presenter';

let scrollToWhen;

if (BUILD_TARGET === 'browser') {
  scrollToWhen = require('react-redux-scroll').scrollToWhen; // eslint-disable-line
}

const messageDraftSelector = state => state.draftMessage.draftsByInternalId;
const discussionIdSelector = (state, ownProps) => ownProps.discussionId;
const internalIdSelector = (state, ownProps) => ownProps.internalId;
const messagesStateSelector = state => state.message.messagesById;
const userSelector = state => state.user.user;
const messagesSelector = createSelector(
  [messagesStateSelector, discussionIdSelector],
  (messages, discussionId) => Object.keys(messages)
    .map(messageId => messages[messageId])
    .filter(item => item.discussion_id === discussionId)
);

const mapStateToProps = createSelector(
  [messageDraftSelector, discussionIdSelector, internalIdSelector, messagesSelector, userSelector],
  (drafts, discussionId, internalId, messages, user) => {
    const message = messages && messages.find(item => item.is_draft === true);
    const sentMessages = messages.filter(item => item.is_draft !== true);
    const lastMessage = getLastMessage(sentMessages);
    const parentMessage = message && sentMessages
      .find(item => item.message_id === message.parent_id && item !== lastMessage);
    const draft = drafts[internalId] || message;

    return {
      allowEditRecipients: messages.length === 1 && message && true,
      message,
      parentMessage,
      draft,
      discussionId,
      user,
    };
  }
);

const mapDispatchToProps = dispatch => bindActionCreators({
  editDraft,
  requestDraft,
  saveDraft,
  sendDraft,
}, dispatch);

export default compose(...[
  connect(mapStateToProps, mapDispatchToProps),
  ...(scrollToWhen ? [scrollToWhen(REPLY_TO_MESSAGE)] : []),
])(Presenter);
