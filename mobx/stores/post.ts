/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import { observable, action, computed, runInAction, ObservableMap } from 'mobx';
import { makeRequest, RequestParams, mediator } from '../../network/helpers';
import { sortPosts } from '../../helpers/home-sort';
import { UserSettings } from './userSettings';
import { Notification } from './notification';
import { Post } from './postTypes';
import { logger } from '../../helpers/logger';
import { PostModel } from './postModel';
import { t } from '../../i18n/trans';
import { dismissNotifications } from '../../helpers/push-notifications';
import { EventTypes } from '../../constants/eventTypes';

export class Posts {
  userSettings: UserSettings;

  notification: Notification;

  @observable
  private postListMap: any;

  @observable
  loadingPostsInProgress = false;

  @observable
  markedPosts: Set<string> = new Set();

  @observable
  private viewingPostId = '';

  constructor(userSettings: UserSettings, notification: Notification) {
    this.postListMap = new ObservableMap();
    this.notification = notification;
    this.viewingPostId = '';
    this.userSettings = userSettings;

    mediator().subscribe('posts:new', this.onPostsReceived);
  }

  @computed
  get posts(): Post[] {
    return Array.from(this.postListMap.values());
  }

  @computed
  get viewingPostCategory() {
    return this.postListMap.get(this.viewingPostId)?.category;
  }

  @action
  clearPosts = (): void => {
    this.postListMap.clear();
  };

  @action
  clearMarkedPosts = (): void => {
    this.markedPosts.clear();
  };

  @action
  resetStore = () => {
    this.clearPosts();
    this.clearMarkedPosts();
  };

  @action
  setPosts = (posts: Post[]): void => {
    this.clearPosts();
    posts.forEach((post: Post) => {
      this.postListMap.set(post.id, post);
    });
  };

  @action
  setIsLoadingPosts = ({ inProgress }: { inProgress: boolean }): void => {
    this.loadingPostsInProgress = inProgress;
  };

  @action
  updateMarkedPostsAsRead = () => {
    const { propertyId } = this.userSettings.propertySelected;

    this.posts.forEach(post => {
      if (post.unread && this.markedPosts.has(`${propertyId}_${post.id}`)) {
        this.postListMap.set(post.id, { ...post, unread: false });
      }
    });
  };

  @computed
  get postsForSelectedProperty() {
    const { propertyId } = this.userSettings.propertySelected;
    return this.posts.filter(post => post.propertyId === propertyId);
  }

  @computed
  get sortedPosts() {
    return sortPosts(this.posts);
  }

  @computed
  get hasUnreadPosts() {
    const { propertyId } = this.userSettings.propertySelected;

    return this.postsForSelectedProperty.some(post => {
      return post.unread && !this.markedPosts.has(`${propertyId}_${post.id}`);
    });
  }

  @computed
  get currentPost() {
    const post = new PostModel({ id: this.viewingPostId }, this.userSettings);
    post.loadPost();
    return post;
  }

  @action
  setViewingPost = (postId: string) => {
    this.viewingPostId = postId;
  };

  onPostsReceived = (posts: { propertyId: string; id: string }[]) => {
    const postsForSelectedProperty = posts.filter(p => p.propertyId === this.userSettings.propertySelected.propertyId);
    if (postsForSelectedProperty.length === 0) return;

    if (this.loadingPostsInProgress) return;

    this.getPosts();
  };

  @action
  getPosts = async (): Promise<void> => {
    const serverUrl = this.userSettings.tenantServer;

    if (!serverUrl) {
      logger.error("nothing to do as we can't get the tenant server");
      return;
    }

    const { propertyId } = this.userSettings.propertySelected;

    if (!propertyId) {
      throw new Error('No selected propertyId!');
    }

    const { data, error } = await makeRequest({
      serverUrl,
      path: `/resident/api/properties/${propertyId}/posts`,
      method: 'GET',
      onStatusChanged: this.setIsLoadingPosts,
    } as RequestParams);

    runInAction(() => {
      if (error) {
        this.notification.enqueue({ userMessage: t('SYSTEM_ERROR'), debugMessage: 'Error at getPosts' });
        logger.error('error at getting home feed', error);
        return;
      }

      this.setPosts(data);
    });
  };

  @action
  markPostsAsRead = async (ids: string[]): Promise<void> => {
    await dismissNotifications(EventTypes.POST_TO_RXP, ids);

    const { propertyId } = this.userSettings.propertySelected;
    const idsToMark = ids.filter(id => !this.markedPosts.has(`${propertyId}_${id}`));
    if (idsToMark.length) {
      this.sendMarkPostsAsReadRequest(idsToMark);
    }
  };

  @action
  sendMarkPostsAsReadRequest = async (ids: string[]): Promise<void> => {
    const serverUrl = this.userSettings.tenantServer;

    if (!serverUrl) {
      logger.error("nothing to do as we can't get the tenant server");
      return;
    }

    const { propertyId } = this.userSettings.propertySelected;

    if (!propertyId) {
      throw new Error('No selected propertyId!');
    }

    const { data, error } = await makeRequest({
      serverUrl,
      path: `/resident/api/properties/${propertyId}/posts/markAsRead`,
      method: 'POST',
      body: { postIds: ids },
    } as RequestParams);

    runInAction(() => {
      if (error) {
        this.notification.enqueue({
          userMessage: t('SYSTEM_ERROR'),
          debugMessage: 'Error at sendMarkPostsAsReadRequest',
        });
        logger.error('error at marking posts', error);
        return;
      }
      if (data?.length) {
        data.forEach((id: string) => this.markedPosts.add(`${propertyId}_${id}`));
      }
    });
  };

  @action
  addNewPosts = (posts: Post[]) => {
    const { propertyId } = this.userSettings.propertySelected;
    const postsToAdd = posts.filter(post => post.propertyId === propertyId);
    postsToAdd.forEach((post: Post) => {
      this.postListMap.set(post.id, post);
    });
  };

  @action
  markPostAsClicked = async (id: string): Promise<void> => {
    const { propertyId } = this.userSettings.propertySelected;
    const serverUrl = this.userSettings.tenantServer;

    if (!serverUrl) {
      logger.error("nothing to do as we can't get the tenant server");
      return;
    }

    if (!propertyId) {
      throw new Error('No selected propertyId!');
    }

    const { error } = await makeRequest({
      serverUrl,
      path: `/resident/api/properties/${propertyId}/posts/markAsClicked`,
      method: 'POST',
      body: { postId: id },
    } as RequestParams);

    runInAction(() => {
      if (error) {
        this.notification.enqueue({
          userMessage: t('SYSTEM_ERROR'),
          debugMessage: 'Error at markPostAsClicked',
        });
        logger.error('error at marking post as clicked', error);
      }
    });
  };

  @action
  markLinkAsVisited = async (visitedLink: { postId: string; link: string }): Promise<void> => {
    const { propertyId } = this.userSettings.propertySelected;
    const serverUrl = this.userSettings.tenantServer;

    if (!serverUrl) {
      logger.error("nothing to do as we can't get the tenant server");
      return;
    }

    if (!propertyId) {
      throw new Error('No selected propertyId!');
    }

    const { error } = await makeRequest({
      serverUrl,
      path: `/resident/api/properties/${propertyId}/posts/markLinkAsVisited`,
      method: 'POST',
      body: { postId: visitedLink.postId, link: visitedLink.link },
    } as RequestParams);

    runInAction(() => {
      if (error) {
        this.notification.enqueue({
          userMessage: t('SYSTEM_ERROR'),
          debugMessage: 'Error at markLinkAsVisited',
        });
        logger.error('error at marking link as visited', error);
      }
    });
  };
}
