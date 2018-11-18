import { takeEvery, put, all, call, select } from 'redux-saga/effects';
import { CoreAPI } from 'react-kinetic-core';
import moment from 'moment';
import { List } from 'immutable';
import { commonActions, toastActions } from 'common';
import { actions, types } from '../modules/spaceApp';
import { actions as errorActions } from '../modules/errors';
import { DiscussionAPI, createDiscussionList } from 'discussions-lib';
import { calculateDateRange } from 'common/src/utils';

export function* fetchAppSettingsSaga() {
  const [{ users, usersServerError }, { space, spaceServerError }] = yield all([
    call(CoreAPI.fetchUsers),
    call(CoreAPI.fetchSpace, {
      include: 'userAttributeDefinitions,userProfileAttributeDefinitions',
    }),
  ]);

  if (usersServerError || spaceServerError) {
    yield put(
      errorActions.setSystemError(usersServerError || spaceServerError),
    );
  } else {
    yield put(
      actions.setAppSettings({
        spaceAdmins: List(users).filter(u => u.spaceAdmin),
        userAttributeDefinitions: space.userAttributeDefinitions.reduce(
          (memo, item) => {
            memo[item.name] = item;
            return memo;
          },
          {},
        ),
        userProfileAttributeDefinitions: space.userProfileAttributeDefinitions.reduce(
          (memo, item) => {
            memo[item.name] = item;
            return memo;
          },
          {},
        ),
      }),
    );
  }
}

export function* deleteAlertSaga(action) {
  const { errors, serverError } = yield call(CoreAPI.deleteSubmission, {
    id: action.payload,
  });

  if (serverError || errors) {
    yield put(errorActions.setSystemError(serverError));
  } else {
    yield put(toastActions.addSuccess('Deleted alert.'));
    yield put(commonActions.fetchAlerts());
  }
}

export function* fetchRecentDiscussionsSaga() {
  const { pageToken, search, isArchived, dateRange } = yield select(state => ({
    pageToken: state.space.spaceApp.discussionsPageToken,
    search: state.space.spaceApp.discussionsSearchTerm,
    isArchived: state.space.spaceApp.showingArchived,
    dateRange: state.space.spaceApp.searchDateRange,
  }));

  const user = yield select(state => state.app.profile.username);

  const dateParams = isArchived
    ? calculateDateRange(yield call(() => moment()), dateRange)
    : {};

  const { error, discussions, nextPageToken } = yield call(
    DiscussionAPI.fetchDiscussions,
    {
      pageToken,
      user,
      title: search,
      isArchived,
      ...dateParams,
    },
  );

  if (error) {
    yield put(actions.setDiscussionsError(error));
  } else {
    yield put(actions.setDiscussions(createDiscussionList(discussions)));
    yield put(actions.pushDiscussionPageToken(nextPageToken || null));
  }
}

export function* watchSpaceApp() {
  yield takeEvery(types.FETCH_APP_SETTINGS, fetchAppSettingsSaga);
  yield takeEvery(
    [
      types.FETCH_DISCUSSIONS,
      types.SET_DISCUSSIONS_SEARCH_TERM,
      types.TOGGLE_SHOWING_ARCHIVED,
      types.SUBMIT_DATE_RANGE_DROPDOWN,
    ],
    fetchRecentDiscussionsSaga,
  );
  yield takeEvery(types.DELETE_ALERT, deleteAlertSaga);
}
