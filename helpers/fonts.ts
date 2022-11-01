/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import { Fonts } from 'react-native-paper/lib/typescript/types';
import { isWeb } from '../config';

export const fontDefinition = isWeb
  ? {
      regular: {
        fontFamily: 'Roboto-Regular, Helvetica, Arial, Sans-Serif',
        fontWeight: 'normal',
      },
      medium: {
        fontFamily: 'Roboto-Medium, Helvetica, Arial, Sans-Serif',
        fontWeight: 'normal',
      },
      bold: {
        fontFamily: 'Roboto-Bold, Helvetica, Arial, Sans-Serif',
        fontWeight: 'normal',
      },
      light: {
        fontFamily: 'Roboto-Light, Helvetica, Arial, Sans-Serif',
        fontWeight: 'normal',
      },
      thin: {
        fontFamily: 'Roboto-Thin, Helvetica, Arial, Sans-Serif',
        fontWeight: 'normal',
      },
      italic: {
        fontFamily: 'Roboto-Italic, Helvetica, Arial, Sans-Serif',
        fontStyle: 'italic',
        fontWeight: 'normal',
      },
    }
  : {
      regular: {
        fontFamily: 'Roboto-Regular',
        fontWeight: 'normal',
      },
      medium: {
        fontFamily: 'Roboto-Medium',
        fontWeight: 'normal',
      },
      bold: {
        fontFamily: 'Roboto-Bold',
        fontWeight: 'normal',
      },
      light: {
        fontFamily: 'Roboto-Light',
        fontWeight: 'normal',
      },
      thin: {
        fontFamily: 'Roboto-Thin',
        fontWeight: 'normal',
      },
      italic: {
        fontFamily: 'Roboto-Italic',
        fontStyle: 'italic',
        fontWeight: 'normal',
      },
    };

export const fontConfig = {
  default: fontDefinition as Fonts,
  ios: fontDefinition as Fonts,
  android: fontDefinition as Fonts,
  web: fontDefinition as Fonts,
};
