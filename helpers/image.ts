/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import { Image } from 'react-native';
import { logger } from './logger';

export type ImageSizeResult = { success: boolean; width: number; height: number; error: any };

export const getSize = (uri: string): Promise<ImageSizeResult> => {
  let resolve: any;
  const promise = new Promise<ImageSizeResult>(res => {
    resolve = res;
  });

  Image.getSize(
    uri,
    (width, height) => resolve({ success: true, width, height }),
    error => {
      logger.warn('failed to get image size', { uri, error });
      resolve({ success: false, error });
    },
  );

  return promise;
};
