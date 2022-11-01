/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import { makeRequest, RequestParams } from '../network/helpers';
import { residentServer } from '../config';

export const getLicensesInfo = () =>
  makeRequest({
    serverUrl: residentServer,
    path: '/attribution-list.json',
    authorizationToken: '', // no auth required for this endpoint
    method: 'GET',
  } as RequestParams);
