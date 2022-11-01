/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import AsyncStorage from '@react-native-community/async-storage';
import { AppState } from 'react-native';
import * as Updates from 'expo-updates';

import { isLocalDevelopment, isWeb, otaUpdatesInterval } from '../config';
import { logger } from './logger';
import { now, formatMoment, toMoment, findLocalTimezone } from './moment-utils';
import { Notification } from '../mobx/stores/notification';
import { tryParse } from './json';
import { t } from '../i18n/trans';
import * as pushNotifications from './push-notifications';

const OTA_UPDATES_CHECK_TIMESTAMP = 'OTA_UPDATES_CHECK_TIMESTAMP';
const NOTIFY_ABOUT_LAST_UPDATE = 'NOTIFY_ABOUT_LAST_UPDATE';

let notificationStore: Notification;

export const setNotificationStoreForOTAUpdates = (store: Notification) => {
  notificationStore = store;
};

export const notifyAboutLatestUpdateIfNecessary = async () => {
  if (!notificationStore) {
    logger.warn('notification store not initialized, cannot notify about update');
  }

  const shouldNotify = tryParse(await AsyncStorage.getItem(NOTIFY_ABOUT_LAST_UPDATE), false);

  if (shouldNotify) {
    await AsyncStorage.removeItem(NOTIFY_ABOUT_LAST_UPDATE);
    notificationStore.enqueue({ userMessage: t('THE_LATEST_UPDATE_WAS_SUCCESSFULLY_APPLIED') });
  }
};

export const fetchUpdates = async ({
  onFetchingUpdates = () => {},
  shouldNotifyAboutUpdate = false,
}: Partial<{
  onFetchingUpdates: () => void;
  shouldNotifyAboutUpdate: boolean;
}>): Promise<boolean> => {
  try {
    logger.info('checking for OTA updates');
    await AsyncStorage.setItem(OTA_UPDATES_CHECK_TIMESTAMP, formatMoment(now(), { timezone: findLocalTimezone() }));

    const update = isLocalDevelopment || isWeb ? { isAvailable: false } : await Updates.checkForUpdateAsync();

    if (update.isAvailable) {
      pushNotifications.setIsFetchingUpdates(true);
      onFetchingUpdates();
      shouldNotifyAboutUpdate && (await AsyncStorage.setItem(NOTIFY_ABOUT_LAST_UPDATE, 'true'));

      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
      return true;
    }

    pushNotifications.setIsFetchingUpdates(false);
    pushNotifications.handleStoredNotification();
    return false;
  } catch (e) {
    logger.error('error while fetching app update', e);
    return false;
  }
};

const hasEnoughTimePassedSinceLastCheck = async () => {
  const lastUpdateCheckTime = await AsyncStorage.getItem(OTA_UPDATES_CHECK_TIMESTAMP);

  if (lastUpdateCheckTime) {
    const secondsSinceLastCheck = now().diff(toMoment(lastUpdateCheckTime), 'seconds');
    if (secondsSinceLastCheck < otaUpdatesInterval) return false;
  }
  return true;
};

const applyUpdatesIfNecessary = async () => {
  if (!(await hasEnoughTimePassedSinceLastCheck())) return;

  await fetchUpdates({ onFetchingUpdates: notificationStore?.showSplashScreen, shouldNotifyAboutUpdate: true });
};

AppState.addEventListener('change', state => {
  if (state === 'active') applyUpdatesIfNecessary();
});
