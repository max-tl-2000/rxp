/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import { authServer, residentServer, rxpApiToken, appId as applicationId } from '../config';
import { RequestParams, makeRequest } from '../network/helpers';
import { addParamsToUrl } from '../helpers/urlParams';
import { t } from '../i18n/trans';

type UserInfoArgs = {
  _name_: string;
  email: string;
  password: string;
};

type UserSettingsArgs = {
  emailToken: string;
  propertyId: string | undefined;
  tenantName: string | undefined;
  appId: string;
};

export const getUserProperties = async (userSettings: UserSettingsArgs, authorizationToken?: string) => {
  const { emailToken, propertyId, tenantName, appId } = userSettings;

  const queryParams = {
    emailToken,
    propertyId,
    tenantName,
    appId,
  };

  const { data: userSettingsResponse, error: userSettingsError } = await makeRequest({
    serverUrl: residentServer,
    authorizationToken,
    path: addParamsToUrl('/resident/api/settings/user', queryParams),
    method: 'GET',
  } as RequestParams);

  if (userSettingsError) {
    return { userSettingsError };
  }

  if (!userSettingsResponse?.properties?.length) {
    // TODO: should we use a translation for this error?
    return { userSettingsError: new Error('No properties associated to user') };
  }

  const userIsNotResidentOfRequestedPropertyId =
    propertyId && userSettingsResponse.requestedProperty?.propertyId !== propertyId;

  if (userIsNotResidentOfRequestedPropertyId) {
    return { userSettingsError: new Error(t('NO_LONGER_HAVE_ACCESS')) };
  }

  return {
    userSettingsError,
    userSettingsResponse,
  };
};

export const userSignIn = async (userInfo: UserInfoArgs) => {
  const { _name_, email, password } = userInfo;
  const queryParams = { appId: applicationId };

  const { data: loginResponse, error: loginError } = await makeRequest({
    serverUrl: authServer,
    path: addParamsToUrl('/login', queryParams),
    method: 'POST',
    body: { email, password, _name_ },
    headers: { 'rxp-api-token': rxpApiToken },
    emitUnauthorizedEvent: false,
  } as RequestParams);

  if (loginError) {
    return { error: loginError };
  }

  const { token: authorizationToken, user } = loginResponse;

  if (!authorizationToken) {
    return { error: new Error('Missing token in loginResponse') };
  }

  if (!user) {
    return { error: new Error('Missing user in loginResponse') };
  }

  return {
    data: loginResponse,
    error: loginError,
  };
};
