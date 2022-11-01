/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import { getServerForTenant } from '../config';
import { setQueryParams } from './set-query-params';

export type LogoInfoType = {
  tenantName: string;
  propertyId: string;
  theme: string;
};

export const getLogoForProperty = ({ tenantName, propertyId, theme = 'light' }: LogoInfoType): string | undefined => {
  // without a tenantName or propertyId we cannot infer the logo at all
  if (!tenantName || !propertyId) return undefined;

  const tenantServer = getServerForTenant(tenantName);

  let url = `${tenantServer}/api/images/app/rxp/property/${propertyId}/logo`;

  if (theme) {
    url = setQueryParams(url, { theme });
  }

  return url;
};

export const getLogoForApp = ({ tenantName, propertyId, theme }: LogoInfoType): string | undefined => {
  // without a tenant name we cannot infer the logo returning undefined will use whatever is the default in the app
  if (!tenantName) return undefined;
  if (!propertyId) {
    // when there is no propertyId, we might still have the tenantName
    // so we can use the logo for the tenant
    const tenantServer = getServerForTenant(tenantName);
    let url = `${tenantServer}/api/images/app/rxp/tenant/logo`;

    if (theme) {
      url = setQueryParams(url, { theme });
    }

    return url;
  }
  return getLogoForProperty({ tenantName, propertyId, theme });
};
