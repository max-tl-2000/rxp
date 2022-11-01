/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import { action, observable, computed, runInAction } from 'mobx';
import { addParamsToUrl } from '../../helpers/urlParams';
import { residentServer, defaultLoginFlow, defaultLegal } from '../../config';
import { makeRequest, RequestParams } from '../../network/helpers/request';
import { Notification } from './notification';
import { TenantSettingsLegal } from '../../types';
import { getLicensesInfo } from '../../services/licenses-service';
import { syncStorage } from '../../helpers/sync-storage/sync-storage';
import { detectBrowserFromUserAgent } from '../../backend/src/common/browser-detector';
import { logger } from '../../helpers/logger';
import { t } from '../../i18n/trans';

type LoginFlow = {
  line1: string;
  line2: string;
  line3: string;
  hideLogo: boolean;
};

type SettingsResponse = {
  loginFlow?: LoginFlow;
  email?: string;
  propertyId?: string;
  tenantName?: string;
  applicationName?: string;
  legal?: TenantSettingsLegal;
};

export class Settings {
  notification: Notification;

  @observable
  isLoadingSettings = false;

  @observable
  data?: SettingsResponse;

  @observable
  emailToken = '';

  @observable
  isEmailTokenExpired = false;

  @observable
  loginFlowinitiatorSource = '';

  @observable
  getAppUrl = '';

  @observable
  appName = '';

  @observable
  tenantName = '';

  @observable
  tenantId = '';

  @observable
  propertyId = '';

  @observable
  initialURL: any;

  @observable
  wasDismissedUnknownBrowserBanner: boolean | undefined;

  constructor(notification: Notification) {
    this.notification = notification;
  }

  @computed
  get loginFlow() {
    return this.data?.loginFlow || (defaultLoginFlow as LoginFlow);
  }

  @computed
  get legal() {
    return this.data?.legal || (defaultLegal as TenantSettingsLegal);
  }

  @computed
  get tokenEmail() {
    return this.data?.email;
  }

  @computed
  get tokenPropertyId() {
    return this.data?.propertyId;
  }

  @computed
  get tokenTenantName() {
    return this.data?.tenantName;
  }

  @computed
  get applicationName() {
    return this.data?.applicationName || 'Resident Experience';
  }

  @action
  restoreWasDismissedUnknownBrowserBanner = (wasDismissed: boolean) => {
    this.wasDismissedUnknownBrowserBanner = wasDismissed;
  };

  @action
  unknownBrowserBannerDismiss = () => {
    syncStorage.fields.wasDismissedUnknownBrowserBanner = true;
    this.wasDismissedUnknownBrowserBanner = true;
  };

  @computed
  get shouldShowUnknownBrowserBanner() {
    const { unknownBrowser } = detectBrowserFromUserAgent(window.navigator.userAgent);
    return unknownBrowser && !this.wasDismissedUnknownBrowserBanner;
  }

  @action
  setSettingsFromParams = ({
    emailToken = '',
    getAppUrl = '',
    appName = '',
    propertyId = '',
    tenantName = '',
    tenantId = '',
  }: {
    emailToken: string;
    getAppUrl: string;
    appName: string;
    propertyId: string;
    tenantName: string;
    tenantId: string;
  }): void => {
    this.getAppUrl = getAppUrl;
    this.appName = appName;
    this.emailToken = emailToken;
    this.propertyId = propertyId;
    this.tenantName = tenantName;
    this.tenantId = tenantId;
  };

  @action
  setInitialURL = (initialURL: any): void => {
    this.initialURL = initialURL;
  };

  @action
  clearInitialURL = (): void => {
    this.initialURL = null;
  };

  @action
  setIsLoadingSettings = ({ inProgress }: { inProgress: boolean }): void => {
    this.isLoadingSettings = inProgress;
  };

  @action
  setIsEmailTokenExpired = (isEmailTokenExpired: boolean): void => {
    this.isEmailTokenExpired = isEmailTokenExpired;
  };

  @action
  setLoginFlowinitiatorSource = (loginFlowinitiatorSource: string): void => {
    this.loginFlowinitiatorSource = loginFlowinitiatorSource;
  };

  @observable
  loadingLicensesInfo = false;

  @observable.shallow
  licensesInfo = [];

  @observable.shallow
  loadingLicensesInfoError? = {};

  @action
  async loadLicensesInfo() {
    this.loadingLicensesInfo = true;
    this.licensesInfo = [];
    this.loadingLicensesInfoError = undefined;

    const { data, error } = await getLicensesInfo();

    runInAction(() => {
      if (error) {
        this.loadingLicensesInfoError = error;
        return;
      }
      this.licensesInfo = data;
      this.loadingLicensesInfo = false;
    });
  }

  get getLicensesInfo() {
    return this.licensesInfo;
  }

  @action
  async getLoginFlow(currentPath: string) {
    let path = '/resident/api/settings/loginFlow';

    const { emailToken, propertyId, tenantName, tenantId } = this;
    const queryParams = {
      emailToken,
      propertyId,
      tenantName,
      tenantId,
    };

    path = addParamsToUrl(path, queryParams);

    const { data, error } = await makeRequest({
      serverUrl: residentServer,

      path,
      method: 'GET',
      onStatusChanged: this.setIsLoadingSettings,
    } as RequestParams);

    runInAction(() => {
      if (error) {
        if (error.token === 'EMAIL_TOKEN_EXPIRED') {
          this.setLoginFlowinitiatorSource(currentPath);
          this.setIsEmailTokenExpired(true);
        } else {
          this.notification.enqueue({ userMessage: t('SYSTEM_ERROR'), debugMessage: 'Error at getLoginFlow' });
          logger.error('error at getLoginFlow', error);
        }

        this.data = {};

        return;
      }

      this.data = data;
    });
  }
}
