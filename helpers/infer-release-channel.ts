/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
export const inferReleaseChannelFromHostname = (hostname: string): string | undefined => {
  const IP_REGEX = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/;

  if (hostname !== 'localhost' && !hostname.match(IP_REGEX)) {
    const parts = hostname.split(/\./g);
    parts.shift();
    // env URLs look like {tenant|service}.{releaseChannel}.env.reva.tech
    // prod URLs look like {tenant|service}.reva.tech
    return parts.length <= 2 ? 'prod' : parts[0];
  }

  // in localhost or when using the ips we can't determine the releaseChannel
  return undefined;
};
