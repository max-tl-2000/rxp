/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import { parse, isValidNumber, format } from '../libphone';

const normalizePrefix = (phoneNumber = '', countryCode = '1') => {
  const trimmedPhoneNumber = phoneNumber.trim();

  let res;

  if (trimmedPhoneNumber.match(/^\+/)) {
    res = trimmedPhoneNumber;
  } else if (trimmedPhoneNumber.startsWith('00')) {
    res = `+${trimmedPhoneNumber.slice(2)}`;
  } else {
    res = `+${countryCode}${trimmedPhoneNumber}`;
  }

  return res.replace(/\*/g, '');
};

export const parsePhone = (phoneNumber: string) => {
  let number = normalizePrefix(phoneNumber, '1');

  let parsedPhone = parse(number);

  let valid = isValidNumber(parsedPhone);

  if (!valid) {
    // if failed maybe it already contained the country code
    // so we pass the prefix as empty. This seems to be a mistake, but
    // unit tests were considering this case so I will just follow suit
    number = normalizePrefix(phoneNumber, '');
    parsedPhone = parse(number);
    valid = isValidNumber(parsedPhone);
  }

  let international = '';
  let national = '';
  let normalized = '';

  if (valid) {
    international = format(parsedPhone, 'INTERNATIONAL');
    national = format(parsedPhone, 'NATIONAL');
    normalized = format(parsedPhone, 'E.164');
  }

  return {
    country: (parsedPhone || {}).country,
    valid,
    international,
    national,
    normalized,
  };
};

export const isValidPhoneNumber = (number: string) => {
  const { valid } = parsePhone(number) || {};
  return valid;
};

export const formatPhoneNumber = (number: string) => {
  const { normalized } = parsePhone(number) || {};
  return normalized;
};

export const formatPhoneToDisplay = (number: string) => {
  const { country, international, national, valid } = parsePhone(number) || {};
  if (!valid) {
    return number; // if not valid just return the number itself
  }
  return country === 'US' ? national : international;
};
