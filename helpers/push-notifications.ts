/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-community/async-storage';

import { isAndroid, isWeb } from '../config';

import { getPermission } from './permissions';
import { logger } from './logger';
import { Stores } from '../mobx/stores/Stores';
import { EventTypes } from '../constants/eventTypes';
import { mediator } from '../network/helpers/mediator';
import { navigate } from '../navigation/RootNavigation';
import { tryParse } from './json';
import { delay } from './time';

const UNHANDLED_NOTIFICATION_RESPONSE = 'UNHANDLED_NOTIFICATION_RESPONSE';
let stores: Stores;

let isFetchingUpdates = false;

export const setIsFetchingUpdates = (isFetching: boolean) => {
  isFetchingUpdates = isFetching;
};

export const getPushNotificationsToken = async () => {
  if (isWeb || !Constants.isDevice) return '';

  const granted = await getPermission(Permissions.NOTIFICATIONS);
  if (!granted) return '';

  if (isAndroid) {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  try {
    const { data } = await Notifications.getExpoPushTokenAsync();
    return data;
  } catch (error) {
    logger.error('failed to get push notification token', error);
    return '';
  }
};

export const initNotificationsBehavior = () =>
  // set the behavior for when notifications are received while app is foregrounded
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });

export const dismissNotifications = async (eventType: string, ids: string[]) => {
  try {
    if (isWeb) return;
    const postNotificationIds = (await Notifications.getPresentedNotificationsAsync())
      .filter(n => {
        const { id, event } = n.request.content.data;
        return ids.some(i => i === id) && event === eventType;
      })
      .map(n => n.request.identifier);

    await Promise.all(postNotificationIds.map(id => Notifications.dismissNotificationAsync(id)));
  } catch (error) {
    logger.error('failed to dismiss notifications', { error, eventType, ids });
  }
};

const handleNotification = async (notification: Notifications.Notification) => {
  logger.info('handling push notification', notification);

  const { data } = notification.request.content;
  const userId = stores.auth.user?.id;

  switch (data.event) {
    case EventTypes.POST_TO_RXP: {
      if (!userId) return;

      const userData = (data.usersInfo as { id: string; propertyId: string }[]).find(
        (ui: { id: string }) => ui.id === userId,
      );
      if (userData) mediator().next('posts:new', [{ propertyId: userData.propertyId, id: data.id }]);

      break;
    }
    case EventTypes.DIRECT_MESSAGE_TO_RXP: {
      if (!userId) return;
      mediator().next('messages:new', [data]);

      break;
    }
    default:
      break;
  }
};

const clearStoredNotificationAfterTimeout = async () => {
  const considerHandledTimeout = 5000;
  await delay(considerHandledTimeout);

  if (isFetchingUpdates) return;
  logger.info(
    'enough time passed after notification was handled and app is not currently updating, considering it done and removing it from storage',
  );
  await AsyncStorage.removeItem(UNHANDLED_NOTIFICATION_RESPONSE);
};

const handleNotificationInteraction = async (
  notificationResponse: Notifications.NotificationResponse,
  isStoredNotification?: boolean,
) => {
  logger.info('handling notification interaction', notificationResponse);

  if (!isStoredNotification) {
    logger.info('saving currently handled notification to storage in case an update is applied in the meantime');
    await AsyncStorage.setItem(UNHANDLED_NOTIFICATION_RESPONSE, JSON.stringify(notificationResponse));
  }

  const { data } = notificationResponse.notification.request.content;
  const { auth, userSettings, post } = stores;
  const isLoggedIn = !!auth.user;

  const triggerNotificationEffect = (userId?: string) => {
    switch (data.event) {
      case EventTypes.POST_TO_RXP: {
        const userData = (data.usersInfo as { id: string; propertyId: string }[]).find(
          (ui: { id: string }) => ui.id === userId,
        );

        if (!userData || !userSettings.data.properties?.some(p => p.propertyId === userData.propertyId)) {
          logger.error('unable to associate push notification post data with user or user properties');
          break;
        }

        if (userSettings.propertySelected.propertyId !== userData.propertyId)
          userSettings.setSelectedPropertyId(userData.propertyId);

        mediator().next('posts:new', [{ propertyId: userData.propertyId, id: data.id }]);

        post.setViewingPost(data.id as string);
        navigate('Home', { screen: 'PostDetails' });

        break;
      }
      case EventTypes.DIRECT_MESSAGE_TO_RXP: {
        const propertyId = (data.message as any)?.propertyId;

        if (!propertyId || !userSettings.data.properties?.some(p => p.propertyId === propertyId)) {
          logger.error('unable to associate push notification message with user properties');
          break;
        }

        if (userSettings.propertySelected.propertyId !== propertyId) userSettings.setSelectedPropertyId(propertyId);
        mediator().next('messages:new', [data]);

        navigate('Messages', { scrollToLatest: true });

        break;
      }
      default:
        break;
    }

    clearStoredNotificationAfterTimeout();
  };

  if (isLoggedIn) triggerNotificationEffect(auth?.user?.id);
  else {
    const subscription = mediator().subscribe('user:login', user => {
      subscription.unsubscribe();
      triggerNotificationEffect(user.id);
    });
  }
};

export const handleStoredNotification = async () => {
  const unhandledNotification = tryParse(await AsyncStorage.getItem(UNHANDLED_NOTIFICATION_RESPONSE));

  if (!unhandledNotification) return;
  logger.info(
    'found an unhandled notification in storage, handling it now and cleaning the storage',
    unhandledNotification,
  );

  await AsyncStorage.removeItem(UNHANDLED_NOTIFICATION_RESPONSE);
  handleNotificationInteraction(unhandledNotification as Notifications.NotificationResponse, true);
};

const notificationSubscriptions: any[] = [];

export const removeNotificationListeners = () =>
  notificationSubscriptions.forEach(s => Notifications.removeNotificationSubscription(s));

export const addNotificationListeners = (dataStores: Stores) => {
  stores = dataStores;

  const receivedSubscription = Notifications.addNotificationReceivedListener(handleNotification);
  notificationSubscriptions.push(receivedSubscription);

  const interactionSubscription = Notifications.addNotificationResponseReceivedListener(handleNotificationInteraction);
  notificationSubscriptions.push(interactionSubscription);
};
