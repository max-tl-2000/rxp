/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import { createContext } from 'react';
import { configure, reaction } from 'mobx';
import { Auth } from './stores/auth';
import { UserSettings } from './stores/userSettings';
import { mediator, makeRequest } from '../network/helpers';
import { syncStorage } from '../helpers/sync-storage/sync-storage';
import { User } from './stores/authTypes';
import { isWeb } from '../config';
import { Stores } from './stores/Stores';
import { initLogger, disableLogger } from '../helpers/logger';

configure({ enforceActions: 'observed' });

type OnUserChangeCallback = {
  (user?: User): void;
};

type OnPropertyChangeCallback = {
  (propertyId?: string): void;
};

const onUserChange = (auth: Auth, cb: OnUserChangeCallback) =>
  reaction(
    () => {
      const { user } = auth;
      return { user };
    },
    ({ user }) => cb(user),
  );

const onPropertyIdChange = (userSettings: UserSettings, cb: OnPropertyChangeCallback) =>
  reaction(
    () => {
      const { selectedPropertyId } = userSettings;
      return { selectedPropertyId };
    },
    ({ selectedPropertyId }) => cb(selectedPropertyId),
  );

export const createMobxStores = (): Stores => {
  const stores = new Stores();

  const { auth, settings, userSettings } = stores;

  auth.onBeforeLogout = () => {
    disableLogger();
    mediator().next('user:before-logout');
  };

  onUserChange(auth, async (user?: User) => {
    if (user) {
      syncStorage.fields.userData = user;

      // had to move this here to avoid the error about the logger not being initialized
      initLogger(auth, settings, userSettings, makeRequest);

      mediator().next('user:login', user);

      mediator().next('user:loggedIn', user);
    } else {
      syncStorage.entries.userData.clear();

      // by this time there is no userData anymore
      mediator().next('user:logout');

      // we reset the stores after emitting the event in case they need to access the store for some reason
      stores.resetStores();
    }
  });

  onPropertyIdChange(userSettings, async (propertyId?: string) => {
    if (propertyId) {
      mediator().next('property:change', propertyId);
      stores.resetStores();
    }
  });

  if (isWeb) {
    const onStorageChange = async (e: StorageEvent) => {
      if (e.key === 'userData') {
        await syncStorage.entries.userData.load();
        if (!syncStorage.fields.userData) {
          auth.signOut();
        }
      }
    };

    window.addEventListener('storage', onStorageChange, false);
  }

  return stores;
};

export const MobxStoresContext = createContext<Stores>({} as Stores);
