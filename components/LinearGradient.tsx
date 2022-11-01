import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';

import { withOpacity } from '../helpers/typography';
import { useAppTheme } from '../hooks/use-app-theme';

const createStyles = (bottomPosition: number) => {
  const styles = StyleSheet.create({
    linearGradient: {
      position: 'absolute',
      bottom: bottomPosition,
      height: 32,
      left: 0,
      right: 0,
    },
  });

  return styles;
};

interface LinearGradientProps {
  bottomPosition?: number;
}

export const LinearGradient = ({ bottomPosition = 52 }: LinearGradientProps) => {
  const { colors: themeColors } = useAppTheme();
  const styles = createStyles(bottomPosition);

  return (
    <ExpoLinearGradient
      colors={[withOpacity(themeColors.background, 0), themeColors.background]}
      style={styles.linearGradient}
      pointerEvents="none"
    />
  );
};
