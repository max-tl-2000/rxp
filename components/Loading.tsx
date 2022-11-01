import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { useAppTheme } from '../hooks/use-app-theme';

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  message: {
    marginTop: 16,
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  spinnerStyle: {
    position: 'relative',
  },
});

interface LoadingProps {
  message?: string;
}

export const Loading = ({ message }: LoadingProps) => {
  const { colors: themeColors } = useAppTheme();

  return (
    <View style={styles.content}>
      <ActivityIndicator style={styles.spinnerStyle} size={56} color={themeColors.secondary} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};
