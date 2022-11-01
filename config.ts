/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import Constants from 'expo-constants';
import * as Updates from 'expo-updates';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import { location } from './helpers/globals';
import { inferReleaseChannelFromHostname } from './helpers/infer-release-channel';
import { rxpCloudEnv } from './helpers/env';

const manifest = Constants.manifest || ({} as typeof Constants.ExpoConfig);

const themeTestChannel = 'rxp-theme-test';

let { releaseChannel } = manifest;

export const isThemeTestChannel = releaseChannel === themeTestChannel;

if (isThemeTestChannel) {
  // if is theme test channel override to use staging backend
  releaseChannel = 'staging';
}

const { android, ios, extra } = manifest;
export const { version = '' } = manifest;

// TODO: this should be moved to `app.config.ts`.
// App code should not use process.env.RXP_CLOUD_ENV
const defaultEnv = rxpCloudEnv || 'local';
export const rxpApiToken = process.env.RXP_API_TOKEN || '{default-rxp-api-token}';

export const isWeb = Platform.OS === 'web';
export const isAndroid = Platform.OS === 'android';
export const isIOS = Platform.OS === 'ios';
export const isMobileApp = isAndroid || isIOS;

export const isDeviceIOS = (Device.osName === 'iOS' && Device.modelId) || Device.osName === 'iPadOS';
export const isDeviceAndroid = Device.osName === 'Android';

if (!releaseChannel && isWeb) {
  const { hostname = '' } = location || {};

  releaseChannel = rxpCloudEnv || inferReleaseChannelFromHostname(hostname) || defaultEnv;
}

export const defaultLoginFlow = extra?.loginFlow || {};
export const defaultLegal = extra?.legal || {};
export const isProd = releaseChannel === 'prod';
export const cloudEnv = releaseChannel || defaultEnv;

export const domain = isProd ? 'reva.tech' : `${cloudEnv}.env.reva.tech`;

export const protocol = 'https://';

const tenantServer = `${protocol}[TENANT_NAME].${domain}`;

export const getServerForTenant = (tenantName: string) => {
  if (!tenantName) {
    throw new Error('missing tenantName!');
  }

  return tenantServer.replace('[TENANT_NAME]', tenantName);
};

export const authServer = `${protocol}auth.${domain}`;
export const residentServer = `${protocol}resident.${domain}`;
export const socketServer = `wss://ws.${domain}`;
const applicationServer = `${protocol}application.${domain}`;

const getEnvAppId = (appId = '') => (isProd ? appId : appId.split('.').slice(0, -1).join('.'));

const getAppId = () => {
  if (isAndroid) {
    return getEnvAppId(android?.package);
  }
  if (isIOS) {
    return getEnvAppId(ios?.bundleIdentifier);
  }
  return null;
};

export const appId = getAppId() ?? 'resident';

export const isDevelopmentEnv = ['local', 'test1'].includes(cloudEnv);

export const isLocalDevelopment = __DEV__ && isDevelopmentEnv; // eslint-disable-line no-undef

export const NetInfoConfig = {
  reachabilityUrl: 'https://clients3.google.com/generate_204',
  reachabilityTest: async (response: { status: number }) => response.status === 204,
  reachabilityLongTimeout: 60 * 1000,
  reachabilityShortTimeout: 5 * 1000,
  reachabilityRequestTimeout: 15 * 1000,
};

// TBD if we have urls per customer or generic ones
export const aptexxConfig = {
  paymentMethodSuccessUrl: '/resident/api/paymentMethodCallback/success',
  paymentMethodCancelUrl: '/resident/api/paymentMethodCallback/cancel',
  schedulePaymentSuccessUrl: '/resident/api/schedulePaymentCallback/success',
  schedulePaymentCancelUrl: '/resident/api/schedulePaymentCallback/cancel',
};

export const paymentMethodTimeOut = 30000;
export const defaultTimeOut = 2000;
export const defaultThrottleTime = 3000;
export const defaultDebounceTime = 1000;

export const updateId = Updates?.updateId;

// This are not affected by OTA updates
export const nativeAppVersion = Constants?.nativeAppVersion;
export const nativeBuildVersion = Constants?.nativeBuildVersion;

const getCIBuildNumber = ({ native = false }) => {
  if (isAndroid) {
    return native ? nativeBuildVersion : android?.versionCode;
  }
  if (isIOS) {
    return (native ? nativeBuildVersion : ios?.buildNumber)?.split('.').slice(-1);
  }
  if (isWeb) {
    return extra?.buildNumber;
  }
  return null;
};

export const nativeCIBuildNumber = getCIBuildNumber({ native: true });
export const CIBuildNumber = getCIBuildNumber({ native: false });

export const versionWithBuildNumber = [version, CIBuildNumber].filter(Boolean).join('.');

export const nativeVersionWithBuildNumber = [nativeAppVersion, nativeCIBuildNumber].filter(Boolean).join('.');

export const getTransactionsPollingInterval = () => {
  if (isDevelopmentEnv) return 60000; // 1 minute
  return 300000; // 5 minutes for staging and prod
};

export const otaUpdatesInterval = 3600; // seconds

export const recommendedBrowsersPageUrl = `${applicationServer}/recommendedBrowsers`;
