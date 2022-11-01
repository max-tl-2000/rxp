/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
// error objects cannot be serialized. (they are serialized as {})

import isError from 'lodash/isError';

// we manually have to copy the values from the error
const replacer = (key: string, value: any) => {
  if (isError(value)) {
    return {
      message: value?.message,
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      token: value?.token,
      stack: value?.stack,
    };
  }
  return value;
};

export const JSONStringify = (obj: any, spaces: number | undefined = undefined) => {
  // TODO: maybe we would have to use safe-stringify???
  return JSON.stringify(obj, replacer, spaces);
};
