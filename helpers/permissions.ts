/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import * as Permissions from 'expo-permissions';
import { logger } from './logger';

export const getPermission = async (permission: Permissions.PermissionType) => {
  const { status, canAskAgain } = await Permissions.getAsync(permission);

  if (status === 'granted') return true;

  if (canAskAgain) {
    const { status: newStatus } = await Permissions.askAsync(permission);
    return newStatus === 'granted';
  }

  logger.warn(`Permission for ${permission} is not granted`);
  return false;
};
