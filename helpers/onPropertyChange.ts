/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import { reaction } from 'mobx';
import { UserSettings } from '../mobx/stores/userSettings';
import { CustomDrawerNavigationProp } from '../types';

export const onPropertyChange = (
  userSettings: UserSettings,
  navigation: CustomDrawerNavigationProp,
  callback: Function,
) => {
  const reactToPropertyChanges = () =>
    reaction(
      () => {
        const { propertySelected } = userSettings;
        return { propertySelected };
      },
      ({ propertySelected }) => callback(propertySelected),
    );

  let stopReaction = reactToPropertyChanges();

  const blurHandler = () => {
    stopReaction();
  };

  const focusHandler = () => {
    stopReaction();
    stopReaction = reactToPropertyChanges();
  };

  // this is needed because the View is not unmount in reality
  // it is kept in memory to easily return to it
  navigation.addListener('blur', blurHandler);
  navigation.addListener('focus', focusHandler);

  // this is the equivalent to `componentWillUnmount`
  return () => {
    navigation.removeListener('blur', blurHandler);
    navigation.removeListener('focus', focusHandler);
    // do not forget to stop the reaction
    stopReaction();
  };
};
