/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import { UAParser } from 'ua-parser-js';
import { Request } from 'express';
import trim from 'jq-trim';

interface ISupportedBrowsersHash {
  [key: string]: number;
}

interface IBrowserAliases {
  [key: string]: string;
}

interface IDectedBrowser {
  isABot: boolean;
  unknownBrowser: boolean;
  name?: string;
  version?: number;
  supported: boolean;
  olderVersion: boolean;
}

const ALL_VERSIONS = -1;

export const defaultSupportedBrowsers: ISupportedBrowsersHash = {
  Safari: 13,
  Chrome: 80,
  Firefox: 74,
  Edge: 80,
  Vivaldi: 3,
  Opera: 67,
  Brave: 1,
  'Samsung Browser': 11,
};

const unsupportedBrowsers: ISupportedBrowsersHash = {
  IE: ALL_VERSIONS,
};

// Browser flavors whose required version is the same as the base
const browserAliases: IBrowserAliases = {
  Chromium: 'Chrome',
  'Mobile Safari': 'Safari',
};

// This function handles different versions of Firefox mobile for Android and iOS
const isAnOlderVersionOfFirefoxMobile = ({
  userAgent,
  pattern,
  supportedVersion,
  validateUserAgent,
}: {
  userAgent: string;
  pattern: string;
  supportedVersion: number;
  validateUserAgent: Function;
}): boolean => {
  if (userAgent.includes(pattern) && validateUserAgent(userAgent)) {
    const firefoxVersion = parseInt(userAgent.split(pattern)[1] || '', 10);
    if (firefoxVersion < supportedVersion) {
      return true;
    }
  }

  return false;
};

const androidUAValidation = (userAgent: string): boolean => userAgent.includes('Android');
const iOSUAValidation = (userAgent: string): boolean =>
  userAgent.includes('iPhone') || userAgent.includes('iPod') || userAgent.includes('iPad');

export const detectBrowserFromUserAgent = (
  userAgent: string,
  supportedBrowsers: ISupportedBrowsersHash = defaultSupportedBrowsers,
) => {
  const ua = trim(userAgent);

  const result: IUAParser.IResult = new UAParser(ua).getResult();
  const { browser }: { browser: IUAParser.IBrowser } = result;

  const bName = browser?.name || '';
  const currentBrowserVersion = parseInt(browser.major || '', 10);
  const isABot = !!ua.match(/googlebot|AhrefsBot|robot|bingbot/i);

  if (
    isAnOlderVersionOfFirefoxMobile({
      userAgent,
      pattern: 'Firefox/',
      supportedVersion: 66,
      validateUserAgent: androidUAValidation,
    }) ||
    isAnOlderVersionOfFirefoxMobile({
      userAgent,
      pattern: 'FxiOS/',
      supportedVersion: 25,
      validateUserAgent: iOSUAValidation,
    })
  ) {
    return {
      isABot,
      unknownBrowser: false,
      name: bName,
      version: currentBrowserVersion,
      supported: false,
      olderVersion: true,
    };
  }

  const effectiveBrowserName = browserAliases[bName] || bName;

  const supportedVersion = supportedBrowsers[effectiveBrowserName];
  const unsupportedVersion = unsupportedBrowsers[effectiveBrowserName];

  const unknownBrowser = typeof supportedVersion === 'undefined' && typeof unsupportedVersion === 'undefined';

  const olderVersion = !!supportedVersion && currentBrowserVersion < supportedVersion;

  const supported = unknownBrowser || olderVersion ? false : typeof unsupportedVersion === 'undefined';

  return {
    isABot,
    unknownBrowser,
    name: browser.name,
    version: currentBrowserVersion,
    supported,
    olderVersion,
  };
};

export const detectBrowserFromReq = (
  req: Request,
  supportedBrowsers: ISupportedBrowsersHash = defaultSupportedBrowsers,
): IDectedBrowser => detectBrowserFromUserAgent(req.headers['user-agent'] || '', supportedBrowsers);

export const isRequestFromABot = (req: Request): boolean => detectBrowserFromReq(req).isABot;
