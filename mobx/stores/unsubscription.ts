/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import { observable, action, runInAction, computed } from 'mobx';
import { residentServer } from '../../config';
import { makeRequest, RequestParams } from '../../network/helpers';

export interface ITokenInfo {
  commsTemplateSettingsId: string;
  propertyId: string;
  commsSubcategory: string;
  tenantName: string;
  notificationId: string;
  directMessageNotificationId: string;
  personId: string;
  propertyDisplayName: string;
  tenantId: string;
}

export class Unsubscription {
  @observable
  unsubcriptionSuccess = false;

  @observable
  tokenData?: ITokenInfo;

  @observable
  invalidToken = false;

  @computed
  get isTokenInvalid() {
    return this.invalidToken;
  }

  @action
  setUnsubscriptionSucces = () => {
    this.unsubcriptionSuccess = true;
  };

  @computed
  get isUnsubscribed() {
    return this.unsubcriptionSuccess;
  }

  @computed
  get tokenInfo() {
    return this.tokenData;
  }

  @action
  setTokenData = (data: ITokenInfo): void => {
    this.tokenData = data;
  };

  @action
  getDataFromToken = async (unsubscribeToken: string): Promise<void> => {
    const { data, error } = await makeRequest({
      serverUrl: residentServer,
      path: `/resident/api/unsubscribeToken`,
      method: 'POST',
      body: { unsubscribeToken },
    } as RequestParams);

    runInAction(() => {
      if (error) {
        this.invalidToken = true;
        return;
      }

      this.setTokenData(data);
    });
  };

  @action
  unsubscribePerson = async (): Promise<void> => {
    const { commsTemplateSettingsId, personId, notificationId, tenantId, directMessageNotificationId } =
      this.tokenInfo || {};
    const { error } = await makeRequest({
      serverUrl: residentServer,
      path: '/resident/api/unsubscribe/person',
      method: 'POST',
      body: {
        commsTemplateSettingsId,
        personId,
        notificationId,
        directMessageNotificationId,
        tenantId,
      },
    });

    runInAction(() => {
      if (error) {
        // TODO: handle error
        return;
      }

      this.unsubcriptionSuccess = true;
    });
  };
}
