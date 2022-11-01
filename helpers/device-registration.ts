/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import { residentServer } from '../config';
import { makeRequest, RequestParams } from '../network/helpers/request';
import { mediator } from '../network/helpers';
import { getPushNotificationsToken } from './push-notifications';
import { syncStorage } from './sync-storage/sync-storage';
import { User } from '../mobx/stores/authTypes';
import { logger } from './logger';
import { getDeviceInfo } from './device-details';

const dissociateUserFromDevice = async () => {
  const { deviceData } = syncStorage.fields;
  const { deviceId } = deviceData || {};

  if (!deviceId) return;

  const { error } = await makeRequest({
    serverUrl: residentServer,
    path: `/resident/api/device/${deviceId}`,
    method: 'PATCH',
    body: { userId: null },
  } as RequestParams);

  if (error) {
    logger.error('dissociateUserFromDevice: error while updating device', { error });
    return;
  }

  syncStorage.fields.deviceData = { ...deviceData, userId: undefined };
  logger.info('dissociated user from device', deviceId);
};

const registerDevice = async ({ id: userId }: User) => {
  const { deviceData } = syncStorage.fields;

  const { deviceId, pushToken: savedPushToken } = deviceData || {};

  const pushToken = savedPushToken || (await getPushNotificationsToken());

  const details = getDeviceInfo();

  if (deviceId) {
    const { error } = await makeRequest({
      serverUrl: residentServer,
      path: `/resident/api/device/${deviceId}`,
      method: 'PATCH',
      body: { pushToken, userId, details },
    } as RequestParams);

    if (error) {
      logger.error('registerDevice: error while updating device', { error });
      return;
    }

    syncStorage.fields.deviceData = { ...deviceData, userId, pushToken };
    logger.info('registerDevice: associated device with user', { deviceId, userId, pushToken });

    return;
  }

  const { data, error } = await makeRequest({
    serverUrl: residentServer,
    path: '/resident/api/device',
    method: 'POST',
    body: { pushToken, details, userId },
  } as RequestParams);

  if (error) {
    logger.error('registerDevice: error while creating device', { error });
    return;
  }

  syncStorage.fields.deviceData = { deviceId: data.id, pushToken, userId };
  logger.info('registerDevice:registered new device', syncStorage.fields.deviceData);
};

export const initDeviceRegistration = () => {
  mediator().subscribe('user:loggedIn', (user: User) => registerDevice(user));
  mediator().subscribe('user:before-logout', dissociateUserFromDevice);
};
