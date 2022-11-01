/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import { stringify, parse } from 'query-string';
import { parseUrl } from './parse-url';

export type ParamsHash = {
  [key: string]: any;
};

export const serializeParams = (data: ParamsHash) => stringify(data, { arrayFormat: 'bracket' });

export const setQueryParams = (url: string, params: ParamsHash) => {
  const pUrl = parseUrl(url);
  let parts = [pUrl.origin];

  if (pUrl.pathname) {
    if (pUrl.pathname === '/') {
      if (pUrl?.originalUrl?.match?.(/\/$/)) {
        parts.push(pUrl.pathname);
      }
    } else {
      parts.push(pUrl.pathname);
    }
  }

  const originAndPath = parts.join('');

  parts = [originAndPath];

  if (pUrl.search || params) {
    if (typeof params === 'string') {
      params = parse(params); // eslint-disable-line no-param-reassign
    }
    const urlParams = parse(pUrl.search || '');
    const qParams = urlParams;
    const newParams = { ...qParams, ...params };
    const serializedSearch = serializeParams(newParams);
    parts.push(serializedSearch);
  }

  const domainAndQuery = parts.join('?');

  parts = [domainAndQuery];

  if (pUrl.hash) {
    parts.push(pUrl.hash);
  }

  return parts.join('');
};
