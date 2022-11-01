import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { withOpacity } from '../helpers/typography';
import { colors } from '../constants/colors';
import { IMessage, MessageDirection } from '../mobx/stores/message';
import { injectStyles } from '../helpers/inject-styles';
import { isWeb } from '../config';
import { useAppTheme } from '../hooks/use-app-theme';

if (isWeb) {
  injectStyles({
    id: 'wordbreak-fix',
    styles: `
      [word-break="break-word"] { word-break: break-word }
    `,
  });
}

interface MessageProps {
  message: IMessage;
}

const createStyles = (theme: string) => {
  const isDark = theme === 'dark';

  const styles = StyleSheet.create({
    container: {
      marginTop: 8,
    },
    containerIn: {
      marginLeft: 56,
      alignItems: 'flex-end',
    },
    containerOut: {
      marginRight: 56,
      alignItems: 'flex-start',
    },
    author: {
      fontSize: 12,
      lineHeight: 16,
      color: isDark ? colors.white : withOpacity(colors.black, 0.54),
    },
    messageContainer: {
      padding: 8,
      borderTopLeftRadius: 4,
      borderTopRightRadius: 4,
    },
    messageContainerIn: {
      backgroundColor: colors.messengerBlue,
      borderBottomLeftRadius: 4,
    },
    messageContainerOut: {
      backgroundColor: colors.grey200,
      borderBottomRightRadius: 4,
    },
    messageText: {
      fontSize: 13,
      lineHeight: 20,
    },
    messageTextIn: {
      color: colors.white,
    },
    messageTextOut: {
      color: withOpacity(colors.black, 0.87),
    },
  });

  return styles;
};

export const Message = (props: MessageProps): JSX.Element => {
  const {
    message: { author, message, direction },
  } = props;
  const isIncomingMessage = direction === MessageDirection.In;
  const viewRef = useRef<View>(null);

  const { theme } = useAppTheme();
  const styles = createStyles(theme);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    viewRef?.current?.setNativeProps({ 'word-break': 'break-word' });
  }, [viewRef]);

  return (
    <View style={[styles.container, isIncomingMessage ? styles.containerIn : styles.containerOut]}>
      <Text style={styles.author}>{author}</Text>
      <View
        ref={viewRef}
        style={[styles.messageContainer, isIncomingMessage ? styles.messageContainerIn : styles.messageContainerOut]}
      >
        <Text style={[styles.messageText, isIncomingMessage ? styles.messageTextIn : styles.messageTextOut]}>
          {message}
        </Text>
      </View>
    </View>
  );
};
