/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import { DefaultTheme, configureFonts } from 'react-native-paper';
import { ColorSchemeName } from 'react-native-appearance';
import mapValues from 'lodash/mapValues';

import { colors } from '../constants/colors';
import { fontConfig } from './fonts';
import { withOpacity } from './typography';
import { makeRequest, RequestParams } from '../network/helpers';
import { isThemeTestChannel } from '../config';
import themeColors from './theme-colors.json';
import { isNull } from './nullish';
import { logger } from './logger';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  accentSecondary: string;
  background: string;
  backgroundSecondary: string;
  surface: string;
  surfaceSecondary: string;
  error: string;
  text: string;
  onPrimary: string;
  onBackground: string;
  onSurface: string;
  disabled: string;
  placeholder: string;
  backdrop: string;
  notification: string;
  border: string;
  highlight: string;
  cardBanner: string;
  emergencyCardText: string;
  emergencyCard: string;
  emergencyCardRetracted: string;
  announcementLimiter: string;
  announcementLimiterBorder: string;
  postIconLimiter: string;
  cardPressed: string;
  dropdownBorder: string;
  loadingImageCircle: string;
  appBarPrimary: string;
  navDrawerHeader: string;
  navDrawerOverlay: string;
}

export interface Theme extends ReactNativePaper.Theme {
  colors: ThemeColors;
}

const prepareColors = (colorDefinitions: { [key: string]: { name: string; opacity?: number } }): ThemeColors => {
  const defined = mapValues(colorDefinitions, definition => {
    const color = (colors as any)[definition.name];
    return isNull(definition.opacity) ? color : withOpacity(color, definition.opacity as number);
  });

  return defined as ThemeColors;
};

export const lightTheme: Theme = {
  ...DefaultTheme,
  dark: false,
  roundness: 4,
  colors: prepareColors(themeColors.light),
  fonts: configureFonts(fontConfig),
  animation: {
    scale: 1.0,
  },
};

export const darkTheme: Theme = {
  ...DefaultTheme,
  dark: true,
  roundness: 4,
  colors: prepareColors(themeColors.dark),
  fonts: configureFonts(fontConfig),
  animation: {
    scale: 1.0,
  },
};

const getDynamicTheme = async (
  colorScheme: ColorSchemeName,
): Promise<{ isDynamicThemeAvailable: boolean; dynamicTheme?: Theme }> => {
  try {
    const airtableThemeUrl = 'https://api.airtable.com/v0/apppqum8XGMsl0Vcv/Theme';
    const airtableToken = '{your-airtable-token}';

    const { error, data } = await makeRequest({
      serverUrl: airtableThemeUrl,
      method: 'GET',
      authorizationToken: airtableToken,
    } as RequestParams);

    if (error) throw error;

    const themeJson = data?.records[0]?.fields.theme;
    if (!themeJson) {
      logger.error('dynamic color theme not found', error);
      return { isDynamicThemeAvailable: false };
    }

    const { dark, light } = JSON.parse(themeJson);
    logger.info('dynamic theme found and applied', { preferredScheme: colorScheme, dark, light });

    const dynamicTheme = colorScheme === 'dark' ? { ...darkTheme, colors: dark } : { ...lightTheme, colors: light };
    return { isDynamicThemeAvailable: true, dynamicTheme };
  } catch (error) {
    logger.error('failed to get dynamic color theme', error);
    return { isDynamicThemeAvailable: false };
  }
};

export const getTheme = async (colorScheme: ColorSchemeName): Promise<Theme> => {
  const staticTheme = colorScheme === 'dark' ? darkTheme : lightTheme;

  if (!isThemeTestChannel) return staticTheme;
  const { isDynamicThemeAvailable, dynamicTheme } = await getDynamicTheme(colorScheme);

  return isDynamicThemeAvailable ? (dynamicTheme as Theme) : staticTheme;
};
