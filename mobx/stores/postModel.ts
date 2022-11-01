/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import { observable, action, computed } from 'mobx';
import { getPostByIdAndPropertyId } from '../../services/post-service';
import { ObservablePromiseState, observePromise } from '../helpers/ObservablePromiseState';
import { getDefaultPostAsPromise, isDefaultPost } from '../../helpers/post';
import { UserSettings } from './userSettings';

type PostModelParam = {
  id: string;
};

export class PostModel {
  private userSettings: UserSettings;

  @observable
  private post: PostModelParam;

  private postDetailsPromise?: ObservablePromiseState;

  constructor(post: PostModelParam, userSettings: UserSettings) {
    this.post = post;
    this.userSettings = userSettings;
  }

  @computed
  get hasValidData(): boolean {
    return !!this.post?.id;
  }

  @computed
  get loaded() {
    return this.postDetailsPromise?.success;
  }

  @computed
  get loading() {
    return this.postDetailsPromise?.loading;
  }

  @computed
  get failed() {
    return this.postDetailsPromise?.failed;
  }

  @computed
  get loadPostError() {
    return this.postDetailsPromise?.error;
  }

  // Fields

  @computed
  get id() {
    return this.postDetailsPromise?.responseData?.id || '';
  }

  @computed
  get message() {
    return this.postDetailsPromise?.responseData?.message || '';
  }

  @computed
  get sentAt() {
    return this.postDetailsPromise?.responseData?.sentAt || '';
  }

  @computed
  get title() {
    return this.postDetailsPromise?.responseData?.title || '';
  }

  @computed
  get category() {
    return this.postDetailsPromise?.responseData?.category || '';
  }

  @computed
  get createdBy() {
    return this.postDetailsPromise?.responseData?.createdBy || '';
  }

  @computed
  get messageDetails() {
    return this.postDetailsPromise?.responseData?.messageDetails || '';
  }

  @computed
  get heroImageURL() {
    return this.postDetailsPromise?.responseData?.heroImageURL;
  }

  @action
  loadPost = async () => {
    if (this.loaded || !this.hasValidData) return;

    const { id: postId } = this.post;

    if (isDefaultPost(postId)) {
      // In the case that is default post we don't need to retrieve data
      this.postDetailsPromise = observePromise(() => getDefaultPostAsPromise(postId));
      return;
    }

    const serverUrl = this.userSettings.tenantServer;
    const { propertyId } = this.userSettings.propertySelected;

    this.postDetailsPromise = observePromise(() =>
      getPostByIdAndPropertyId({
        serverUrl,
        postId,
        propertyId,
      }),
    );
  };
}
