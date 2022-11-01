/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import { isNull } from './nullish';

export const tryParse = <T extends {}>(str: string | null, defaultObject?: T): T | undefined => {
  try {
    const res = JSON.parse(str ?? '');
    return isNull(res) ? defaultObject : res;
  } catch (ex) {
    return defaultObject;
  }
};
