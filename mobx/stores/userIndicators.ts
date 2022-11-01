/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import { observable, action, runInAction, computed } from 'mobx';

import { UserSettings } from './userSettings';
import { Settings } from './settings';
import { makeRequest, RequestParams, mediator } from '../../network/helpers';
import { addParamsToUrl } from '../../helpers/urlParams';
import { logger } from '../../helpers/logger';

interface Indicators {
  hasUnreadMessages?: boolean;
  hasOverduePayments?: boolean;
}

export class UserIndicators {
  userSettings: UserSettings;

  settings: Settings;

  @observable
  propertyIndicators: Map<string, Indicators> = new Map();

  @computed
  get propertyIds() {
    return this.userSettings.data?.properties?.map(prop => prop.propertyId);
  }

  constructor(userSettings: UserSettings, settings: Settings) {
    this.userSettings = userSettings;
    this.settings = settings;

    mediator().subscribe('user:loggedIn', () => this.getIndicators());
  }

  @computed
  get selectedPropertyHasUnreadMessages() {
    const { propertyId } = this.userSettings.propertySelected;
    const property = this.propertyIndicators.get(propertyId);
    return property?.hasUnreadMessages;
  }

  @computed
  get selectedPropertyHasOverduePayments() {
    const { propertyId } = this.userSettings.propertySelected || {};

    return this.propertyIndicators.get(propertyId)?.hasOverduePayments;
  }

  @action
  setPropertyIndicators = (propertyIndicators: Map<string, Indicators>): void => {
    this.propertyIndicators = new Map(Object.entries(propertyIndicators));
  };

  @action
  setIndicatorForProperties = (propertyIds: string[], key: keyof Indicators, value: boolean): void => {
    propertyIds
      .filter(p => !!p)
      .forEach(propertyId => {
        const propertyIndicators = this.propertyIndicators.get(propertyId);
        this.propertyIndicators.set(propertyId, { ...propertyIndicators, [key]: value });
      });
  };

  @action
  getIndicators = async (): Promise<void> => {
    const serverUrl = this.userSettings.tenantServer;
    const { propertyIds } = this;

    const { data, error } = await makeRequest({
      serverUrl,
      path: addParamsToUrl('/resident/api/userNotifications', { propertyIds }),
      method: 'GET',
    } as RequestParams);

    runInAction(() => {
      if (error) {
        logger.error('error at getting initial indicators for nav drawer', error);
        return;
      }

      data && this.setPropertyIndicators(data);
    });
  };
}
