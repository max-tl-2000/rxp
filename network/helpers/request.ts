/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import { mediator } from './mediator';
import { logger } from '../../helpers/logger';
import { User } from '../../mobx/stores/authTypes';
import { JSONStringify } from '../../helpers/json-stringify';

let defaultAuthToken: string | undefined;

const getDefaultAuthToken = () => {
  return defaultAuthToken;
};

const setDefaultAuthToken = (token: string | undefined) => {
  defaultAuthToken = token;
};

const getAuthorizationHeader = (authorizationToken?: string) => {
  const token: string | undefined = authorizationToken ?? getDefaultAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const initRequestHelper = () => {
  // the request helper should receive the token instead of reading it
  // from the syncStorage. The benefit of doing it this way is that we maintain
  // the user user as the source of truth. When the user is signed out
  // we just remove the token from this module
  mediator().subscribe('user:login', (user: User) => {
    setDefaultAuthToken(user.authToken);
  });
  mediator().subscribe('user:logout', () => {
    setDefaultAuthToken(undefined);
  });
};

export type RequestParams = {
  serverUrl: string;
  path?: string;
  method: string;
  body?: object;
  headers?: any;
  authorizationToken?: string;
  onStatusChanged?: Function;
  onAbortControllerReady?: Function;
  emitUnauthorizedEvent?: boolean;
};

export const makeRequest = async ({
  path = '',
  method,
  body,
  authorizationToken,
  headers,
  serverUrl,
  onStatusChanged = () => {},
  onAbortControllerReady = () => {},
  emitUnauthorizedEvent = true,
}: Partial<RequestParams>) => {
  let isUnauthorized;
  try {
    onStatusChanged({ inProgress: true });

    const authHeader = getAuthorizationHeader(authorizationToken);

    const abortController = new AbortController();

    onAbortControllerReady(abortController);

    const response = await fetch(`${serverUrl}${path}` as string, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...authHeader,
        ...headers,
      },
      body: JSONStringify(body),
      signal: abortController.signal,
    });

    const contentType = response.headers.get('content-type');
    const data = contentType?.includes('application/json') ? await response.json() : await response.text();

    if (!response.ok) {
      const error = data || response;

      isUnauthorized = response.status === 401;
      const isForbidden = response.status === 403;

      if (isUnauthorized && emitUnauthorizedEvent) {
        mediator().next('user:unauthorized');
        throw new Error('Unauthorized');
      }

      if (isForbidden) {
        logger.error('Error forbidden request', error);
      }

      return { error, isUnauthorized, status: response.status };
    }

    return { data, headers: response.headers, status: response.status };
  } catch (error) {
    if ((error as any).name === 'AbortError') {
      return { aborted: true };
    }

    if (isUnauthorized) {
      throw error;
    }
    return { error };
  } finally {
    onStatusChanged({ inProgress: false });
    onAbortControllerReady(undefined);
  }
};
