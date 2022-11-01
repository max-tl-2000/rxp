/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import moment, { Moment } from 'moment-timezone';
import * as baseMoment from 'moment';
import { extendMoment } from 'moment-range';
import { isNull } from './nullish';
import { logger } from './logger';

export type MomentType = Moment | string | Date;

interface IIsSameDayOptions {
  timezone?: string;
}

interface IToMomentArgs {
  parseFormat?: string;
  timezone?: string;
  strict?: boolean;
}

interface IFormatMomentArgs {
  format?: string;
  timezone?: string;
  includeZone?: boolean;
}

interface INowArgs {
  timezone?: string;
}

interface IParseASInTimezoneArgs {
  format?: string;
  timezone?: string;
}

const momentFn = moment;
const { duration, max: momentMax, now: momentNow } = momentFn;

export const DATE_ISO_FORMAT = 'YYYY-MM-DD';
export const DATE_TIME_ISO_FORMAT = 'YYYY-MM-DDTHH:mm:ss+z';

export const findLocalTimezone = (): string => momentFn.tz.guess();
export const isValidTimezone = (tz: string): boolean => !!momentFn.tz.zone(tz);

const checkIfDateIsISO = (date: MomentType, strict = true): void => {
  if (typeof date !== 'string') {
    return;
  }

  const dateToCheck = date as string;
  const ISO_8601_REGEX_FULL = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?(([+-]\d\d:\d\d)|Z)?$/i;
  const ISO_8601_REGEX_PERMISSIVE = /^\d{4}(-\d\d(-\d\d(T\d\d:\d\d(:\d\d)?(\.\d+)?(([+-]\d\d:\d\d)|Z)?)?)?)?$/i;

  if (dateToCheck.match(ISO_8601_REGEX_FULL)) {
    return;
  }

  if (strict) {
    throw new Error('date parameter is not in full ISO format');
  }

  if (!date.match(ISO_8601_REGEX_PERMISSIVE)) {
    throw new Error('date parameter is not in permissive ISO format');
  }
};

export const toMoment = (
  date: MomentType,
  { parseFormat, timezone, strict = true }: IToMomentArgs = { strict: true },
): Moment => {
  if (isNull(date) || date === '') {
    const m = momentFn(null!); // eslint-disable-line @typescript-eslint/no-non-null-assertion
    m.format = () => '';
    return m; // just return an invalid moment object
  }

  if (parseFormat !== undefined && typeof parseFormat !== 'string') {
    throw new TypeError('`parseFormat` must be a string');
  }

  checkIfDateIsISO(date, false);

  let dateAsMoment = parseFormat ? momentFn(date, parseFormat, strict) : momentFn(date);

  if (timezone) {
    dateAsMoment = dateAsMoment.tz(timezone);
  }

  return dateAsMoment;
};

export const formatMoment = (
  momentObj: Moment,
  { format, timezone, includeZone = true }: IFormatMomentArgs = { includeZone: true },
): string => {
  if (!timezone) {
    logger.warn('[formatMoment] called without timezone', momentObj);
  }

  const m = momentObj ? toMoment(momentObj, { timezone }) : undefined;

  if (!m || !m.isValid()) {
    return '';
  }

  const useAbbr = timezone && includeZone && timezone !== findLocalTimezone();
  const zone = useAbbr ? ` ${m.zoneAbbr()}` : '';

  return `${m.format(format)}${zone}`;
};

export const now = ({ timezone = findLocalTimezone() }: INowArgs = { timezone: findLocalTimezone() }) => {
  if (timezone !== undefined && typeof timezone !== 'string') {
    throw new TypeError('timezone must be a string');
  }

  let m = momentFn();
  if (timezone) {
    m = m.tz(timezone);
  }
  return m;
};

export const today = ({ timezone = findLocalTimezone() }: INowArgs = { timezone: findLocalTimezone() }) => {
  return now({ timezone }).set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
};

export const isToday = (
  date: MomentType,
  { parseFormat, timezone, strict = true }: IToMomentArgs = { strict: true },
): boolean => {
  const momentDate = toMoment(date, { parseFormat, timezone, strict });
  return momentDate.diff(today({ timezone }), 'days') === 0;
};

export const parseAsInTimezone = (str: string, { format, timezone }: IParseASInTimezoneArgs = {}): Moment => {
  const args = [str];

  if (format) {
    args.push(format);
  }

  if (timezone) {
    args.push(timezone);
  } else {
    throw new Error('parseAsInTimezone error: missing `timezone`.');
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore: spread will work just fine in this case
  return momentFn.tz(...args);
};

export const isMoment = (m: any): boolean => momentFn.isMoment(m);

export const isSameDay = (date1: MomentType, date2: MomentType, { timezone }: IIsSameDayOptions = {}): boolean => {
  if (!timezone) {
    logger.warn('[isSameDay] called without timezone');
  }

  const convertedDate1 = toMoment(date1, { timezone });
  const convertedDate2 = toMoment(date2, { timezone });

  return !convertedDate1.isValid() || !convertedDate2.isValid() ? false : convertedDate1.isSame(convertedDate2, 'day');
};

export const isValidMoment = (m: any): boolean => m && isMoment(m) && m.isValid();

export const setDefaultTZ = (tz: string) => momentFn.tz.setDefault(tz);

export const getDurationBetweenMoments = (startDate: MomentType, endDate: MomentType): string => {
  const millisecondDifference = toMoment(endDate).diff(startDate);
  return moment.utc(millisecondDifference).format('mm:ss');
};

export const rangeMoment = extendMoment(baseMoment);

export const getTimezoneNames = (): Array<string> => momentFn.tz.names();

export const stringRepresentsADateWithoutTime = (date: string) => {
  const POSSIBLE_DATE = /^\d{4}-\d{1,2}-\d{1,2}$/g;
  return !!date.match(POSSIBLE_DATE);
};

export { duration, momentMax, momentNow };
