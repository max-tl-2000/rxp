/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import { action, observable, computed } from 'mobx';

import { getServerForTenant } from '../../config';
import { Settings } from './settings';
import { Notification } from './notification';
import { syncStorage } from '../../helpers/sync-storage/sync-storage';
import { TenantSettingsLegal } from '../../types';
import { ResidentState } from './unitsTypes';

export interface UnitInfo {
  id: string;
  unitFullyQualifiedName: string;
  unitDisplayName: string;
  buildingDisplayName: string;
  partyMemberIds: string[];
  partyIds: string[];
  leaseIds: string[];
  residentState: ResidentState;
  aptexxData?: {
    integrationId?: string;
    accountPersonId?: string;
  };
  personExternalId?: string;
  propertyId: string;
}

export type PropertyEntry = {
  propertyId: string;
  propertyName: string;
  propertyTimezone: string;
  propertyCity: string;
  propertyState: string;
  residentState: string;
  tenantId: string;
  tenantName: string;
  tenantLegal: TenantSettingsLegal;
  features: {
    paymentModule: boolean;
    maintenanceModule: boolean;
  };
  units: UnitInfo[];
};

type UserSettingsResponse = {
  requestedProperty?: PropertyEntry;
  properties?: PropertyEntry[];
};

export class UserSettings {
  settings: Settings;

  notification: Notification;

  constructor(settings: Settings, notification: Notification) {
    this.settings = settings;
    this.notification = notification;
  }

  @observable
  isLoadingUserProperties = false;

  @observable.shallow
  data: UserSettingsResponse = {};

  @observable
  selectedPropertyId: string | undefined;

  // TODO: this function is not being used
  @action
  setIsLoadingUserProperties = ({ inProgress }: { inProgress: boolean }): void => {
    this.isLoadingUserProperties = inProgress;
  };

  @action
  clearUserSettings() {
    this.data = {};
    this.selectedPropertyId = undefined;
    syncStorage.entries.selectedPropertyId.clear();
  }

  @computed
  get tenantServer() {
    if (!this.propertySelected) {
      throw new Error('No selected property found');
    }

    const tenantName: string = this.propertySelected?.tenantName as string;

    return getServerForTenant(tenantName);
  }

  @action
  setUserSettingResponse(data: UserSettingsResponse) {
    this.data = data;
    this.setSelectedPropertyId(data.requestedProperty?.propertyId);
  }

  @action
  setSelectedPropertyId(propertyId?: string) {
    // currently there are two scenarios when the propertyId is not null
    // after call the endpoint an this responds with a requestedProperty (this happens on login, when users opens app with an active session in it, deep link handling)
    // when user change the selected property through the UI
    if (propertyId) {
      this.selectedPropertyId = propertyId;
      syncStorage.fields.selectedPropertyId = this.selectedPropertyId;
      return;
    }

    // when some how the updated list of properties does not contain the current selected propertyId
    const isSelectedPropertyIdValidOrNull =
      this.selectedPropertyId &&
      this.data.properties?.some(property => property.propertyId === this.selectedPropertyId);

    if (!isSelectedPropertyIdValidOrNull) {
      // TODO: show an error to the user
      this.selectedPropertyId = this.data.properties?.find(
        ({ residentState }) => residentState !== ResidentState.PAST,
      )?.propertyId;
      syncStorage.fields.selectedPropertyId = this.selectedPropertyId;
    }
  }

  @computed
  get propertySelected() {
    let property = this.data.properties?.find(p => p.propertyId === this.selectedPropertyId);
    if (!property) {
      property = this.data.properties?.[0];
    }
    if (!property) return {} as PropertyEntry;

    return property as PropertyEntry;
  }
}
