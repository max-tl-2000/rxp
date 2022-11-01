import React, { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';
import { Screen, ScreenModes } from './Screen';
import { t } from '../i18n/trans';
import { Pictograph } from './Pictograph';
import { ThemeColors } from '../helpers/theme';
import { useAppTheme } from '../hooks/use-app-theme';
import { Title, Text } from './Typography';

const createStyles = (themeColors: ThemeColors) => {
  const styles = StyleSheet.create({
    childrenWrapper: {
      padding: 16,
    },
    content: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
    },
    messageTitle: {
      marginTop: 16,
      textAlign: 'center',
    },
    message: {
      marginTop: 16,
      lineHeight: 24,
      textAlign: 'center',
      letterSpacing: 0.1,
    },
    action: {
      marginHorizontal: 16,
      marginBottom: 18,
    },
    buttonLabel: {
      color: themeColors.onPrimary,
    },
  });

  return styles;
};

interface ErrorModalProps {
  title: string;
  messageTitle?: string;
  message: string;
  navigation: any;
  action?: Function;
  onClose?: Function;
  backScreen?: string;
  children?: ReactNode | ReactNode[];
  mode?: ScreenModes;
}

export const ErrorModal = ({
  title,
  messageTitle,
  message,
  navigation,
  action,
  onClose,
  children,
  backScreen,
  mode = 'modal',
}: ErrorModalProps) => {
  const { colors: themeColors } = useAppTheme();
  const styles = createStyles(themeColors);

  return (
    <Screen title={title} mode={mode} navigation={navigation} onClose={onClose} backScreen={backScreen}>
      {!!children && <View style={styles.childrenWrapper}>{children}</View>}
      <View style={styles.content}>
        <Pictograph type="exhausted" />
        {messageTitle && <Title style={styles.messageTitle}>{messageTitle}</Title>}
        <Text style={styles.message}>{message}</Text>
      </View>
      <>
        {action && (
          <Button mode="contained" onPress={() => action()} style={styles.action} labelStyle={styles.buttonLabel}>
            {t('TRY_AGAIN')}
          </Button>
        )}
      </>
    </Screen>
  );
};
