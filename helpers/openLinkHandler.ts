/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import { Linking } from 'react-native';
import { isWeb } from '../config';

export const openLinkHandler = async (url: string, blank = true) => {
  const supported = await Linking.canOpenURL(url);

  if (supported) {
    if (isWeb && blank) {
      return window.open(url, '_blank');
    }
    return Linking.openURL(url);
  }
  throw new Error('LINK NOT SUPPORTED');
};
