import React from 'react';
import { useObserver } from 'mobx-react-lite';
import { Snackbar as RNSnackbar } from 'react-native-paper';
import { StyleSheet, TextStyle, View } from 'react-native';
import { merge } from 'lodash';

import { useStores } from '../mobx/useStores';
import { useAppTheme } from '../hooks/use-app-theme';
import { duration } from '../constants/duration';
import { isProd } from '../config';
import { Message } from '../mobx/stores/notification';
import { Paragraph } from './Typography';
import { ThemeColors } from '../helpers/theme';

interface Styles {
  textStyle: TextStyle;
  snackbarStyle: TextStyle;
}

const createStyles = (themeColors: ThemeColors, isWideScreen: boolean) => {
  const baseStyles: Styles = {
    textStyle: {
      color: themeColors.surface,
    },
    snackbarStyle: {
      maxWidth: '100%',
    },
  };

  const wideScreenStyles: Partial<Styles> = {
    snackbarStyle: {
      width: '100%',
      maxWidth: 568,
      alignSelf: 'center',
    },
  };

  return StyleSheet.create(merge(baseStyles, isWideScreen && wideScreenStyles));
};

export const Snackbar = () =>
  useObserver(() => {
    const { notification, screenSize } = useStores();
    const { colors: themeColors } = useAppTheme();
    const styles = createStyles(themeColors, screenSize.matchMedium);

    const renderMessage = (message: Message) => {
      if (isProd || !message.debugMessage) {
        return message.userMessage;
      }
      return (
        <View>
          <Paragraph style={styles.textStyle}>{message.userMessage}</Paragraph>
          <Paragraph style={styles.textStyle}>{message.debugMessage}</Paragraph>
        </View>
      );
    };

    return (
      <RNSnackbar
        style={styles.snackbarStyle}
        duration={duration.snackbar}
        visible={!!notification.message}
        onDismiss={notification.dismiss}
      >
        {notification.message && renderMessage(notification.message)}
      </RNSnackbar>
    );
  });
