/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import { logger } from '../helpers/logger';
import { RequestParams, makeRequest } from '../network/helpers';

type getPostByIdAndPropertyIdArgs = {
  postId: string;
  propertyId: string;
  serverUrl: string;
};

export const getPostByIdAndPropertyId = async ({ postId, propertyId, serverUrl }: getPostByIdAndPropertyIdArgs) => {
  if (!serverUrl) {
    logger.error("nothing to do as we can't get the tenant server");
    return { error: new Error('No serverUrl provided!') };
  }

  if (!propertyId) {
    return { error: new Error('No selected propertyId!') };
  }

  const { data, error } = await makeRequest({
    serverUrl,
    path: `/resident/api/properties/${propertyId}/posts/${postId}`,
    method: 'GET',
  } as RequestParams);

  return { data, error };
};
