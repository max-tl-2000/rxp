/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
// TODO: clever, but for sure is not the most efficient way to remove undefined
// it is better to just filter the keys as in the code they are again filtered
const removeUndefined = (params: any) => JSON.parse(JSON.stringify(params));

export const addParamsToUrl = (url: string, params: any) => {
  if (!params) throw new Error('missing params');
  if (typeof params !== 'object') throw new Error('invalid params');

  const alreadyHasParams = url.includes('?');
  const firstSeparator = alreadyHasParams ? '&' : '?';

  const paramsString = Object.keys(removeUndefined(params))
    .filter(key => params[key])
    .map(key => `${key}=${params[key]}`)
    .join('&');

  return paramsString ? `${url}${firstSeparator}${paramsString}` : url;
};
