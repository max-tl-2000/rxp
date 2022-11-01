import React from 'react';
import { StyleSheet, GestureResponderEvent, View, ViewStyle, TextStyle, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';

import { ThemeColors } from '../helpers/theme';
import { useAppTheme } from '../hooks/use-app-theme';

interface Styles {
  container: ViewStyle;
  link: TextStyle;
  text: TextStyle;
}

const createStyles = (themeColors: ThemeColors) => {
  const baseStyles: Styles = {
    container: {
      alignItems: 'center',
      marginBottom: 24,
    },
    link: {
      color: themeColors.accentSecondary,
    },
    text: {
      lineHeight: 20,
      fontSize: 12,
      textAlign: 'center',
    },
  };
  return StyleSheet.create({ ...baseStyles });
};

interface Props {
  helperText: string;
  linkText: string;
  onPress: (event: GestureResponderEvent) => void;
}

export const HelperTextWithLink = ({ helperText, linkText, onPress }: Props) => {
  const { colors: themeColors, dark } = useAppTheme();
  const styles = createStyles(themeColors);

  const activeOpacity = dark ? 0.7 : 0.87;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{helperText}</Text>
      <TouchableOpacity onPress={onPress} activeOpacity={activeOpacity}>
        <Text style={[styles.link, styles.text]}>{linkText}</Text>
      </TouchableOpacity>
    </View>
  );
};
