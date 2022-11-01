/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import { PixelRatio } from 'react-native';
import trim from 'jq-trim';
import { combineWithParams } from './serialize';
import { isNull } from './nullish';

const getPixelRatio = (): number => {
  const devicePixelRatio = Math.round(PixelRatio.get() || 1);
  if (devicePixelRatio <= 1) return 1;
  if (devicePixelRatio <= 2) return 2;
  return 3;
};

export const getDevicePixelRatio = (maxDPR: number) => {
  const dpr = getPixelRatio();
  return dpr > maxDPR ? maxDPR : dpr;
};

const settings = {
  cloudName: 'revat',
  url: 'https://res.cloudinary.com',
};

const getUrlParameters = (options: any[]): string =>
  options && options.length > 0 ? `${options.filter(opt => !!opt).join(',')}/` : '';

const isCloudinaryUrl = (url = '') => trim(url).startsWith(settings.url);

const buildCloudinaryUrl = (
  imageNameOrUrl: string,
  { imageFolder, buildParameters }: { imageFolder?: string; buildParameters?(): string } = {},
) => {
  if (isCloudinaryUrl(imageNameOrUrl)) return imageNameOrUrl;
  if (!imageNameOrUrl) return ''; // if not imageNameOrUrl, just return an empty string

  // TODO: we need to check this because reva.tech images are not using cloudinary
  // here we are only adding parameters to an url which redirects to S3
  if (imageNameOrUrl.includes('reva.tech/api/documents/public/images')) {
    const qParams = { cParams: buildParameters?.() };

    return combineWithParams(imageNameOrUrl, qParams);
  }

  if (settings.cloudName) {
    const name = encodeURIComponent(imageNameOrUrl);
    return `${settings.url}/${settings.cloudName}/image/${imageFolder}/${buildParameters?.()}${name}`;
  }

  // In case of error, jsut return the url. Error('cloudinary cloudName not set');
  return imageNameOrUrl;
};

export const getUrlFromCloudinary = (imageUrl: string, params: any = {}) => {
  const { cloudinaryParams = [], maxDPR } = params;

  const dprOption = `dpr_${getDevicePixelRatio(maxDPR)}.0`;
  return buildCloudinaryUrl(imageUrl, {
    imageFolder: 'fetch',
    buildParameters: () => getUrlParameters([dprOption, ...cloudinaryParams]),
  });
};

export type getImageFromCloudinaryArgs = {
  width?: number;
  height?: number;
  radius?: number;
  format?: string;
  maxDPR?: number;
  aspectRatio?: number | undefined;
  fit?: boolean;
  gravity?: string;
};

export const getImageFromCloudinary = (
  imageUrl: string,
  { width, height, radius, format = 'auto', maxDPR, aspectRatio, fit, gravity }: getImageFromCloudinaryArgs = {},
) => {
  let widthParam = '';
  let heightParam = '';
  let radiustParam = '';
  let formatParam = '';
  let aspectRatioParam = '';
  let fitParam = '';
  let gautoParam = 'g_auto:no_faces';

  if (!isNull(width)) {
    widthParam = `w_${Math.floor(width || 0)}`;
  }

  if (!isNull(height)) {
    heightParam = `h_${Math.floor(height || 0)}`;
  }

  if (!isNull(radius)) {
    radiustParam = `r_${radius}`;
  }

  if (!isNull(aspectRatio)) {
    aspectRatioParam = `ar_${aspectRatio}`;
  }

  if (fit) {
    fitParam = `c_fit`;
  }

  if (!isNull(gravity)) {
    gautoParam = `${gravity}`;
  }

  if (format) {
    formatParam = `f_${format}`;
  }

  return getUrlFromCloudinary(imageUrl, {
    cloudinaryParams: [
      widthParam,
      heightParam,
      radiustParam,
      formatParam,
      aspectRatioParam,
      fitParam,
      gautoParam,
      'c_fill',
      'q_auto:best',
      'e_improve',
      'e_auto_brightness',
      'fl_force_strip',
    ],
    maxDPR,
  });
};
