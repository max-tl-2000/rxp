/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import { t } from '../i18n/trans';
import { PostCategory, PostSubCategory } from '../mobx/stores/postTypes';

export const DEFAULT_POSTS = [
  {
    id: 'default-post-id',
    category: PostCategory.AnnouncementAutomated,
    subCategory: PostSubCategory.GeneralAnnouncement,
    title: t('POST_EMPTY_STATE_TITLE'),
    message: t('POST_EMPTY_STATE_MESSAGE'),
    sentAt: new Date().toISOString(),
    createdBy: 'string',
    retractedAt: '',
    unread: false,
    propertyId: 'string',
    messageDetails: undefined,
    publicDocumentId: 'string',
    heroImageURL: undefined,
    hasMessageDetails: false,
    metadata: undefined,
    isDefaultPost: true,
  },
];

export const isDefaultPost = (postId: string) => DEFAULT_POSTS.some(defaultPost => defaultPost.id === postId);

export const getDefaultPostAsPromise = (postId: string) =>
  new Promise((resolve, reject) => {
    const post = DEFAULT_POSTS.find(defaultPost => defaultPost.id === postId);
    if (!post) reject(new Error('Default post not found'));
    setTimeout(() => {
      resolve(post);
    }, 300);
  });
