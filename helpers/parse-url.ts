/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import { parse as urlParse } from 'url';

export interface IURL {
  originalUrl: string | null;
  origin: string | null;
  protocol: string | null;
  pathname: string | null;
  hostname: string | null;
  search: string | null;
  hash: string | null;
}

/**
 * parses an URL and return the identified parts
 * @param {string} url the url to parse
 *
 * @return {IURL} the parsed url
 */
export const parseUrl = (url: string): IURL => {
  const a = urlParse(url);

  return {
    originalUrl: url,
    origin: `${a.protocol}//${a.hostname}`,
    protocol: a.protocol,
    // the leading slash is needed to fix the issue in IE11 where the pathname does
    // not contain the leading slash
    pathname: a.pathname,
    hostname: a.hostname || a.host,
    search: a.search,
    hash: a.hash,
  };
};
