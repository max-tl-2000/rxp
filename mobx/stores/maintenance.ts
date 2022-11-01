/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import { observable, action, computed, runInAction } from 'mobx';
import orderBy from 'lodash/orderBy';

import { makeRequest, RequestParams } from '../../network/helpers';
import { UserSettings } from './userSettings';
import { Notification } from './notification';
import { MaintenanceInfo, MaintenanceStatus, Ticket, MaintenanceType, MaintenanceLocation } from './maintenanceTypes';
import {
  IMaintenanceRequestForm,
  createMaintenanceRequestForm,
  IMaintenanceRequestFormData,
} from '../forms/maintenanceRequest-form';
import { logger } from '../../helpers/logger';
import { t } from '../../i18n/trans';

export class Maintenance {
  userSettings: UserSettings;

  notification: Notification;

  errorToken?: string;

  @observable
  maintenanceInfo?: MaintenanceInfo;

  @observable
  maintenanceLocation?: MaintenanceLocation[];

  @observable
  maintenanceType?: MaintenanceType[];

  @observable
  isMaintenanceLoading = true;

  @observable
  isMaintenanceAvailable = true;

  @observable
  isMaintenanceTypeRequestFinished = false;

  @observable
  isMaintenanceCreationLoading = false;

  @observable
  isImageUploadInProgress = false;

  @observable
  selectedMaintenanceTicket?: Ticket;

  @computed
  get enhancedAndSortedMaintenanceInfos() {
    const result = this.maintenanceInfo?.unitsMaintenanceInfo.flatMap(u =>
      u.tickets.flatMap(ti => ({ ...ti, inventoryId: u.inventoryId })),
    );
    const sortedResult = orderBy(result, 'dateCreated', 'desc');
    const openTickets = sortedResult.filter(r => r.status === MaintenanceStatus.Open);
    const resolvedTickets = sortedResult.filter(r => r.status === MaintenanceStatus.Resolved);
    const cancelledTickets = sortedResult.filter(r => r.status === MaintenanceStatus.Cancelled);
    return openTickets.concat(cancelledTickets).concat(resolvedTickets);
  }

  constructor(userSettings: UserSettings, notification: Notification) {
    this.notification = notification;
    this.userSettings = userSettings;
    this.errorToken = undefined;
  }

  @action
  setErrorToken = (token?: string) => {
    this.errorToken = token;
  };

  @action
  setMaintenanceInfo = (maintenanceInfo: MaintenanceInfo): void => {
    this.maintenanceInfo = maintenanceInfo;
  };

  @action
  setIsMaintenanceLoading = ({ inProgress }: { inProgress: boolean }): void => {
    this.isMaintenanceLoading = inProgress;
  };

  @action
  setIsMaintenanceAvailable = (isAvailable: boolean): void => {
    this.isMaintenanceAvailable = isAvailable;
  };

  @action
  setIsMaintenanceTypeRequestFinished = (isFinished: boolean): void => {
    this.isMaintenanceTypeRequestFinished = isFinished;
  };

  @action
  setIsMaintenanceCreationLoading = ({ inProgress }: { inProgress: boolean }): void => {
    this.isMaintenanceCreationLoading = inProgress;
  };

  @action
  setMaintenanceLocation = (maintenanceLocation: MaintenanceLocation[]): void => {
    this.maintenanceLocation = maintenanceLocation;
  };

  @action
  setMaintenanceType = (maintenanceType: MaintenanceType[]): void => {
    this.maintenanceType = maintenanceType;
  };

  @action
  setIsImageUploadInProgress = (inProgress: boolean): void => {
    this.isImageUploadInProgress = inProgress;
  };

  @action
  getMaintenanceData = async (): Promise<void> => {
    this.setErrorToken(undefined);
    const serverUrl = this.userSettings.tenantServer;
    const { propertyId } = this.userSettings.propertySelected || {};

    if (!serverUrl || !propertyId) {
      logger.error('cannot determine tenant server or propertyId');
      this.notification.enqueue({ userMessage: t('SYSTEM_ERROR'), debugMessage: 'Error at getMaintenanceData' });
      return;
    }

    const { data, error } = await makeRequest({
      serverUrl,
      path: `/resident/api/properties/${propertyId}/maintenanceInfo`,
      method: 'GET',
      onStatusChanged: this.setIsMaintenanceLoading,
    } as RequestParams);

    if (error) {
      this.setErrorToken(error.token);
      this.setIsMaintenanceAvailable(false);

      logger.error('error at getting maintenance info', error);

      return;
    }

    runInAction(() => {
      this.setIsMaintenanceAvailable(true);
      this.setMaintenanceInfo(data);
    });
  };

  @action
  setSelectedMaintenanceTicket = (selectedMaintenanceTicket?: Ticket) => {
    this.selectedMaintenanceTicket = selectedMaintenanceTicket;
  };

  @observable
  createMaintenanceRequestInProgress = false;

  @observable
  createMaintenanceRequestFailed = false;

  @action
  setCreateMaintenanceRequestProgress = ({ inProgress }: { inProgress: boolean }): void => {
    this.createMaintenanceRequestInProgress = inProgress;
  };

  @action
  setCreateMaintenanceRequestFailed = (failed: boolean): void => {
    this.createMaintenanceRequestFailed = failed;
  };

  @observable
  maintenanceRequestForm: IMaintenanceRequestForm = createMaintenanceRequestForm();

  private previousForm?: IMaintenanceRequestForm;

  @action
  resetForm() {
    this.previousForm = this.maintenanceRequestForm;
    this.maintenanceRequestForm = createMaintenanceRequestForm();
  }

  @action
  loadPreviousForm() {
    if (this.previousForm) this.maintenanceRequestForm = this.previousForm;
    else this.maintenanceRequestForm = createMaintenanceRequestForm();
  }

  @action
  createMaintenanceRequest = async (formData: IMaintenanceRequestFormData, userId?: string): Promise<void> => {
    const serverUrl = this.userSettings.tenantServer;
    const { propertyId } = this.userSettings.propertySelected || {};

    const prepareImageAttachments = () =>
      formData.attachments.map(image => ({
        metadata: {
          'Content-type': image.contentType,
          'reva-userid': userId,
          'reva-inventoryid': formData.inventoryId,
        },
        contentData: image.base64,
      }));

    const { error } = await makeRequest({
      serverUrl,
      path: `/resident/api/properties/${propertyId}/maintenanceTickets`,
      method: 'POST',
      body: { ...formData, attachments: prepareImageAttachments() },
      onStatusChanged: this.setCreateMaintenanceRequestProgress,
    } as RequestParams);

    if (error) {
      logger.error('error at creating maintenance request', error);

      this.setCreateMaintenanceRequestFailed(true);

      return;
    }
    this.getMaintenanceData();
  };

  @action
  getMaintenanceTypes = async (): Promise<void> => {
    const serverUrl = this.userSettings.tenantServer;
    const { propertyId } = this.userSettings.propertySelected || {};

    if (!serverUrl || !propertyId) {
      logger.error('cannot determine tenant server or propertyId');
      this.notification.enqueue({ userMessage: t('SYSTEM_ERROR'), debugMessage: 'Error at getMaintenanceTypes' });
      return;
    }
    this.setIsMaintenanceTypeRequestFinished(false);

    const { data, error } = await makeRequest({
      serverUrl,
      path: `/resident/api/properties/${propertyId}/maintenanceTypes`,
      method: 'GET',
      onStatusChanged: this.setIsMaintenanceCreationLoading,
    } as RequestParams);

    if (error) {
      this.setCreateMaintenanceRequestFailed(true);
      this.setIsMaintenanceTypeRequestFinished(true);
      logger.error('error at getting maintenance types', error);
      return;
    }

    runInAction(() => {
      this.setMaintenanceLocation(data.locations);
      this.setMaintenanceType(data.types);
      this.setCreateMaintenanceRequestFailed(false);
      this.setIsMaintenanceTypeRequestFinished(true);
    });
  };
}
