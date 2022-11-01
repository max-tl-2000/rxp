/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import { computed } from 'mobx';
import { UserSettings, UnitInfo } from './userSettings';
import { ResidentState } from './unitsTypes';

export class Units {
  userSettings: UserSettings;

  constructor(userSettings: UserSettings) {
    this.userSettings = userSettings;
  }

  @computed
  get unitsInfo(): UnitInfo[] {
    return this.userSettings.propertySelected?.units || [];
  }

  @computed
  get activeUnits() {
    return this.unitsInfo.filter(u => u.residentState === ResidentState.CURRENT && u.aptexxData?.integrationId);
  }

  @computed
  get hasMultipleUnits() {
    return this.unitsInfo.length > 1;
  }
}
