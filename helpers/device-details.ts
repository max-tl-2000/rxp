/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import * as Device from 'expo-device';
import { Platform } from 'react-native';

export const getDeviceInfo = () => ({
  os: Platform.OS,
  ...Platform.select({
    web: {
      browser: navigator.userAgent,
    },
    default: {
      brand: Device.brand,
      manufacturer: Device.manufacturer,
      modelName: Device.modelName,
      deviceYearClass: Device.deviceYearClass,
      osVersion: Device.osVersion,
    },
  }),
});
