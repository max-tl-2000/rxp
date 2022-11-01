/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
/* eslint-disable no-console */
import isString from 'lodash/isString';
import { getDeviceInfo } from './device-details';
import { User } from '../mobx/stores/authTypes';
import { cloudEnv, appId, versionWithBuildNumber, nativeVersionWithBuildNumber, updateId, isWeb } from '../config';
import { Auth } from '../mobx/stores/auth';
import { Settings } from '../mobx/stores/settings';
import { RequestParams } from '../network/helpers';
import { UserSettings } from '../mobx/stores/userSettings';
import { JSONStringify } from './json-stringify';

const getDeviceData = ({ user, applicationName }: { user?: User; applicationName: string }) => {
  const environment = cloudEnv;
  const customerName = user?.fullName;
  const userId = user?.id;
  const deviceInfo = getDeviceInfo();

  return {
    environment,
    customerName,
    userId,
    applicationName,
    appId,
    versionWithBuildNumber,
    nativeVersionWithBuildNumber,
    updateId,
    ...deviceInfo,
  };
};

enum Methods {
  trace = 'trace',
  debug = 'debug',
  info = 'info',
  error = 'error',
  warn = 'warn',
}

type LogMethods = {
  [key in keyof typeof Methods]: (message: string, logData?: any) => {};
};

const logMethods = Object.values(Methods);
const logMethodsToServer = [Methods.error];
let makeRequest: (arg: Partial<RequestParams>) => any;

const sendLogToServer = async (serverUrl: string, logArgs: any) => {
  if (logMethodsToServer.includes(logArgs?.severity)) {
    const { error } = await makeRequest({
      serverUrl,
      path: '/resident/api/log',
      method: 'POST',
      body: [logArgs],
    } as RequestParams);

    if (error) {
      console.error('UNABLE TO SEND LOG!', error);
    }
  }
};

const logMessageToConsole = (level: Methods, logArgs: any) => {
  const { loggingMessage, ...argsForLogging } = logArgs;
  let obj;

  try {
    obj = JSONStringify(argsForLogging, 2);
    console[level](`${loggingMessage}, ${obj}`);
  } catch (err) {
    console[level](loggingMessage, obj);
  }
};

export const logger = logMethods.reduce((acc, methodName: keyof typeof Methods): LogMethods => {
  (acc as any)[methodName] = (...args: any[]) => console.warn('logger not initialized', ...args);
  return acc;
}, {} as LogMethods);

const handleUncaughtExceptions = () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore: global here is ReactNative
  const { ErrorUtils } = global;
  const defaultErrorHandler = ErrorUtils.getGlobalHandler();

  const customGlobalHandler = async (error: any, isFatal: any) => {
    logger.error('Unhandled exception', { error });

    defaultErrorHandler(error, isFatal);
  };

  ErrorUtils.setGlobalHandler(customGlobalHandler);
};

let loggerEnabled = false;
let globalErrorHandlerSet = false;

export const disableLogger = () => {
  loggerEnabled = false;
};

export const initLogger = (
  auth: Auth,
  settings: Settings,
  userSettings: UserSettings,
  makeRequestFunction: (arg: Partial<RequestParams>) => any,
) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore: global here is ReactNative
  if (!isWeb && global.ErrorUtils && !globalErrorHandlerSet) {
    handleUncaughtExceptions();
    // TODO: In web we probably want to use to window.onerror
    globalErrorHandlerSet = true;
  }

  makeRequest = makeRequestFunction;
  loggerEnabled = true;

  const logMessage = async (level: Methods, message: string, logData: {}) => {
    const { user } = auth;
    const { applicationName } = settings;
    const { tenantServer: serverUrl } = userSettings;
    const deviceData = getDeviceData({ user, applicationName });

    const environment = cloudEnv.includes('staging') ? 'staging' : cloudEnv;

    const logArgs = {
      loggingMessage: message,
      severity: level,
      ...deviceData,
      ...logData,
    };

    switch (environment) {
      case 'prod':
        loggerEnabled && sendLogToServer(serverUrl, logArgs);
        return;
      case 'staging':
        loggerEnabled && sendLogToServer(serverUrl, logArgs);
        logMessageToConsole(level, logArgs);
        return;
      default:
        logMessageToConsole(level, logArgs);
    }
  };

  return logMethods.reduce((acc, methodName) => {
    (acc as any)[methodName] = (message = '', logData: any) => {
      let messageToLog = message;
      let logDataToLog = logData;
      if (isString(logData)) {
        messageToLog = logData;
        logDataToLog = {};
      }
      logMessage(methodName, messageToLog, logDataToLog);
    };
    return acc;
  }, logger);
};
