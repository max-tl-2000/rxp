/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import React from 'react';
import { NavigationContainerRef } from '@react-navigation/native';

import { RootParamList } from '../types';

export const navigationRef = React.createRef<NavigationContainerRef>();

type NavigateParams = [string, object | any];
let navigateParams: NavigateParams | undefined;
let navigationReady = false;

export const setNavigationRefReady = () => {
  navigationReady = true;

  if (navigateParams) {
    navigationRef?.current?.navigate(...navigateParams);
    navigateParams = undefined;
  }
};

export function navigate<RouteName extends keyof RootParamList>(
  name: keyof RootParamList,
  params: RootParamList[RouteName] = {},
) {
  if (!navigationRef.current || !navigationReady) {
    navigateParams = [name, params];
    return;
  }
  navigationRef?.current?.navigate(name, params);
}
