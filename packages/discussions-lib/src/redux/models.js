import { List, Record } from 'immutable/dist/immutable';

export const createDiscussion = discussion =>
  Discussion({
    ...discussion,
    loading: false,
    messages: List(discussion.messagesPage.messages),
    nextPageToken: discussion.messagesPage.nextPageToken,
    owningTeams: List(discussion.owningTeams),
    owningUsers: List(discussion.owningUsers),
    participants: List(discussion.participants),
    invitations: List(discussion.invitations),
    relatedItems: List(discussion.relatedItems),
  });

export const createDiscussionList = discussions =>
  List(discussions.map(createDiscussion));

export const Topic = Record({
  topicId: null,
  topicStatus: 'closed',
});

export const Discussion = Record({
  // NEW STUFF
  topic: Topic(),
  presences: List(),
  isArchived: false,
  createdAt: new Date(),
  createdBy: {},
  description: '',
  id: '',
  invitations: List(),
  isPrivate: false,
  joinPolicy: null,
  messages: List(),
  nextPageToken: null,
  milestone: 0,
  owningTeams: List(),
  owningUsers: List(),
  participants: List(),
  relatedItems: List(),
  title: '',
  updatedAt: new Date(),
  updateBy: {},
  versionId: '',

  loading: true,
  loadingMoreMessages: false,
});