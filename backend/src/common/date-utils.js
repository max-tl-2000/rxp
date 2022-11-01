/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import { DateTime } from 'luxon';
import { isDate } from './type-of';

export const formatDate = (isoDate, { format = 'yyyy-LL-dd HH:mm:ss', tz } = {}) => {
  let d;
  if (isDate(isoDate)) {
    d = DateTime.fromJSDate(isoDate);
  } else {
    // assuming string
    d = DateTime.fromISO(isoDate);
  }

  if (tz) {
    d = d.setZone(tz);
  }
  return d.toFormat(format);
};
