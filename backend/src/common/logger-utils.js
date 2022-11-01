/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
/* eslint-disable no-plusplus */
/* eslint-disable no-param-reassign */
import produce, { setAutoFreeze } from 'immer';
import { isObject } from './type-of';

const IS_URL = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/;

const getUrlParamsValueMatcher = (urlParams = []) => {
  const params = urlParams.map(param => `${param}=`).join('|');
  const pattern = `(${params}).*?(&|$)`;
  return new RegExp(pattern, 'gi');
};

const isUrl = url => IS_URL.test(url);

const excludedFieldsEntries = ['sendSsnEnabled'];

export const privateLogEntries = ['password', 'socSecNumber', 'api-token', 'authorization_token'];

export const logCtx = ctx => {
  const { tenantId, reqId, msgId, routingKey, retryCount, documentVersion, originalRequestIds, authUser, trx } =
    ctx || {};

  const { userId, fullName } = authUser || {};
  const { trxId } = trx || {};

  const outValues = {
    tenantId,
    reqId,
    msgId,
    routingKey,
    retryCount,
    documentVersion,
    originalRequestIds,
  };

  const retVal = Object.keys(outValues).reduce((acc, key) => {
    if (outValues[key] !== undefined) {
      acc[key] = outValues[key];
    }
    return acc;
  }, {});

  if (userId || fullName) {
    const aUser = {};
    if (userId) {
      aUser.userId = userId;
    }
    if (fullName) {
      aUser.fullName = fullName;
    }
    retVal.authUser = aUser;
  }

  if (trxId) {
    retVal.trx = { trxId };
  }

  return retVal;
};

export const OBSCURE_VALUE = 'REDACTED';

export const obscureUrl = (url, obscureQueryParams = privateLogEntries, replaceValue = `$1${OBSCURE_VALUE}$2`) =>
  url.replace(getUrlParamsValueMatcher(obscureQueryParams), replaceValue);

const isExcludedField = key => excludedFieldsEntries.some(it => it === key);
const replaceValue = (key, value, properties) => {
  if (
    !isExcludedField(key) &&
    properties.some(property => property && (property === key || key.toLowerCase().includes(property)))
  ) {
    return OBSCURE_VALUE;
  }

  if (key.toLowerCase().includes('url') && isUrl(value)) {
    return obscureUrl(value);
  }

  return value;
};

const redactValuesInObjectIfNeeded = (obj, properties) => {
  if (!isObject(obj)) return obj;
  const keys = Object.keys(obj || {});

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = obj[key];
    if (!Array.isArray(value) && !isObject(value)) {
      obj[key] = replaceValue(key, value, properties);
    }

    if (isObject(value)) {
      obj[key] = redactValuesInObjectIfNeeded(value, properties);
    }

    if (Array.isArray(value)) {
      obj[key] = value.map(val => redactValuesInObjectIfNeeded(val, properties));
    }
  }

  return obj;
};

export const obscureObject = (obj, properties = privateLogEntries) => {
  if (!(obj && properties.length)) return obj;
  // we should consider to remove this as this makes the returned draft
  // not to be frozen, but our code currently modifies the returned object
  // from obscureObject in some places
  setAutoFreeze(false);
  const redactedObject = produce(obj, draft => redactValuesInObjectIfNeeded(draft, properties));

  return redactedObject;
};

export const getSensitiveObject = obj => ({ sensitiveData: { ...obj } });

export const removeTokenFromObject = data => {
  const { token, ...rest } = data || {}; // eslint-disable-line @typescript-eslint/no-unused-vars
  return rest;
};

export const handleErrorObject = log => {
  const { err, error, ...rest } = log || {};
  return { ...rest, error: err || error };
};
