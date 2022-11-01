/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import { useTheme } from 'react-native-paper';
import { ThemeColors } from '../helpers/theme';

export const useAppTheme = () => {
  const { dark, colors } = useTheme();
  return { theme: dark ? 'dark' : 'light', colors: colors as ThemeColors, dark };
};
