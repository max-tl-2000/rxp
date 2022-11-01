/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import orderBy from 'lodash/orderBy';
import { toMoment, now } from './moment-utils';
import { Post, PostCategory } from '../mobx/stores/postTypes';

const scoreList = {
  newAlert: 10,
  unread: 1,
  retracted: -15,
};

const getPostSortScore = (post: Post) => {
  let postScore = 0;
  const isARecentAlert = toMoment(post.sentAt) > now().add(-1, 'day') && post.category === PostCategory.Emergency;
  const isRetracted = toMoment(post.retractedAt).isSameOrBefore(now(), 'day');

  postScore += isARecentAlert ? scoreList.newAlert : 0;
  postScore += isRetracted ? scoreList.retracted : 0;
  postScore += post.unread ? scoreList.unread : 0;

  return postScore;
};

export const sortPosts = (posts: Post[]) =>
  orderBy(
    posts.map(p => ({ ...p, sortScore: getPostSortScore(p) })),
    ['sortScore', 'sentAt'],
    ['desc', 'desc'],
  );
