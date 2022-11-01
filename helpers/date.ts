/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import { t } from '../i18n/trans';
import { now, toMoment, MomentType } from './moment-utils';
import { SHORT_DATE_FORMAT, MONTH_DATE_YEAR_FORMAT, DAY_OF_WEEK_FORMAT } from '../constants/date_formats';

export const formatDateAgo = (date: MomentType, timezone: string) => {
  const today = now({ timezone }).startOf('day');

  const dateMoment = toMoment(date, { timezone }).startOf('day');

  if (dateMoment.isSame(today, 'day')) return t('DATE_TODAY');

  const daysDifference = today.diff(dateMoment, 'days');

  if (daysDifference < today.weekday()) {
    return dateMoment.format(DAY_OF_WEEK_FORMAT);
  }
  const dateFormat = today.isSame(dateMoment, 'year') ? SHORT_DATE_FORMAT : MONTH_DATE_YEAR_FORMAT;
  return dateMoment.format(dateFormat);
};
