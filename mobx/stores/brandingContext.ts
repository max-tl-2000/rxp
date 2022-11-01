/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import { computed } from 'mobx';
import { Settings } from './settings';
import { UserSettings } from './userSettings';

export class BrandingContext {
  settings: Settings;

  userSettings: UserSettings;

  constructor({ settings, userSettings }: { settings: Settings; userSettings: UserSettings }) {
    this.settings = settings;
    this.userSettings = userSettings;
  }

  @computed
  get appLogoInfo() {
    const { tokenTenantName, tokenPropertyId } = this.settings;

    return {
      tenantName: tokenTenantName,
      propertyId: tokenPropertyId,
    };
  }

  @computed
  get propertyInfoForLogo() {
    const { tokenTenantName } = this.settings;
    const { tokenPropertyId } = this.settings;

    const { propertySelected } = this.userSettings;

    const { tenantName: selectedTenantName, propertyId: selectedPropertyId } = propertySelected || {};

    const calculatedTenantName: string = selectedTenantName ?? tokenTenantName;

    const calculatedPropertyId = selectedPropertyId ?? tokenPropertyId;

    return {
      tenantName: calculatedTenantName,
      propertyId: calculatedPropertyId,
    };
  }
}
