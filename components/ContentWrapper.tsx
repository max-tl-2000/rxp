import React from 'react';
import {
  StyleSheet,
  View,
  ViewStyle,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from 'react-native';
import { merge } from 'lodash';
import { useObserver } from 'mobx-react-lite';

import { useHeaderHeight } from '@react-navigation/stack';
import { useStores } from '../mobx/useStores';
import { ThemeColors } from '../helpers/theme';
import { isMobileApp, isWeb } from '../config';
import { useAppTheme } from '../hooks/use-app-theme';
import { Snackbar } from './Snackbar';
import { withCondition } from '../helpers/typography';

interface Styles {
  KeyboardAvoidingView: ViewStyle;
  container: ViewStyle;
  inner: ViewStyle;
  KeyboardAvoidingViewPaddingHelper: ViewStyle;
}

const createStyles = (
  themeColors: ThemeColors,
  useLargeStyle: boolean,
  headerHeight: number,
  shouldJustifyContentTopWithLargeStyle: boolean,
  isAuthScreenContainer: boolean,
) => {
  const baseStyles: Styles = {
    KeyboardAvoidingView: {
      flex: 1,
      backgroundColor: themeColors.background,
    },
    container: {
      justifyContent: 'flex-end',
      backgroundColor: themeColors.background,
    },
    inner: {
      alignItems: 'center',
      backgroundColor: themeColors.background,
      width: '100%',
      paddingHorizontal: 36,
      ...withCondition(isMobileApp && isAuthScreenContainer, { marginTop: headerHeight }),
    },
    KeyboardAvoidingViewPaddingHelper: {
      flex: 1,
      backgroundColor: themeColors.background,
    },
  };

  const largeStyles: Partial<Styles> = {
    KeyboardAvoidingView: {
      backgroundColor: themeColors.surface,
    },
    container: {
      justifyContent: 'center',
      alignItems: 'center',
      flex: 1,
      backgroundColor: themeColors.surface,
      ...withCondition(shouldJustifyContentTopWithLargeStyle, { justifyContent: 'flex-start', marginTop: 80 }),
    },
    inner: {
      maxWidth: 408,
      maxHeight: 'fit-content',
      padding: 48,
      elevation: 2,
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 4,
      shadowColor: themeColors.onSurface,
      backgroundColor: themeColors.background,
      borderRadius: 4,
      ...withCondition(shouldJustifyContentTopWithLargeStyle, { paddingHorizontal: 48, maxWidth: 376 }),
      ...withCondition(isMobileApp && isAuthScreenContainer, { marginTop: headerHeight }),
    },
  };

  return StyleSheet.create(merge(baseStyles, useLargeStyle && largeStyles));
};

interface WrapperProps {
  children: React.ReactNode;
  shouldJustifyContentTopWithLargeStyle?: boolean;
  isAuthScreenContainer?: boolean;
}

export const ContentWrapper = ({
  children,
  shouldJustifyContentTopWithLargeStyle = false,
  isAuthScreenContainer = false,
}: WrapperProps) =>
  useObserver(() => {
    const { colors: themeColors } = useAppTheme();
    const { screenSize } = useStores();

    const useLargeStyle = screenSize.matchSmall2;
    const headerHeight = useHeaderHeight();

    const styles = createStyles(
      themeColors,
      useLargeStyle,
      headerHeight,
      shouldJustifyContentTopWithLargeStyle,
      isAuthScreenContainer,
    );

    return (
      <KeyboardAvoidingView
        style={styles.KeyboardAvoidingView}
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        keyboardVerticalOffset={Platform.select({ ios: 0, android: 500 })}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <TouchableWithoutFeedback onPress={() => !isWeb && Keyboard.dismiss()} accessible={false}>
            <View style={styles.inner}>
              {children}
              <View style={styles.KeyboardAvoidingViewPaddingHelper} />
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
        <Snackbar />
      </KeyboardAvoidingView>
    );
  });
