/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import AsyncStorage from '@react-native-community/async-storage';
import { tryParse } from '../json';

type PersistableEntity = {
  fieldValue: any;
  getValue(): any;
  setValue(value: any): void;
  load(): Promise<void>;
  clear(): Promise<void>;
};

type Storage = {
  [key: string]: PersistableEntity;
};

type SimpleStorage = {
  [key: string]: any;
};

const createSyncStorage = () => {
  // adding a new persistable value is as simple as adding a key to this array
  const keys = ['userData', 'selectedPropertyId', 'deviceData', 'wasDismissedUnknownBrowserBanner'];

  const entries: Storage = {};
  const fields: SimpleStorage = {};

  keys.forEach(key => {
    entries[key] = {
      fieldValue: undefined,
      getValue() {
        return this.fieldValue;
      },
      setValue(value) {
        this.fieldValue = value;
        const str = JSON.stringify(this.fieldValue);
        AsyncStorage.setItem(key, str);
      },
      async load() {
        const value = await AsyncStorage.getItem(key);
        this.fieldValue = tryParse(value);
      },
      async clear() {
        this.fieldValue = undefined;
        await AsyncStorage.removeItem(key);
      },
    };

    Object.defineProperty(fields, key, {
      get() {
        return entries[key].getValue();
      },
      set(value) {
        entries[key].setValue(value);
      },
    });
  });

  const storage = {
    async load() {
      // eslint-disable-next-line no-restricted-syntax
      for (const key of keys) {
        const field = entries[key];

        await field.load(); // eslint-disable-line no-await-in-loop
      }
    },
    async clear() {
      // eslint-disable-next-line no-restricted-syntax
      for (const key of keys) {
        const field = entries[key];

        await field.clear(); // eslint-disable-line no-await-in-loop
      }
    },
    fields,
    entries,
  };

  return storage;
};

// using it
// 1. get a value
// syncStorage.fields.userData
//
// 2. set a value
// syncStorage.fields.userData = value;
//
// 3. clear a value
// syncStorage.entries.userData.clear(); // removes the value from userData entry and removes it from AsyncStorage
//
// 4. clear all
// syncStorage.clear(); // remove all values
//
// 5. load all async values
// await syncStorage.load(); // don't miss the await in this case

export const syncStorage = createSyncStorage();
