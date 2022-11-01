import React from 'react';
import { StyleSheet } from 'react-native';
import { Button, Portal } from 'react-native-paper';

import { Dialog } from './Dialog';
import { Paragraph } from './Typography';
import { ThemeColors } from '../helpers/theme';
import { useAppTheme } from '../hooks/use-app-theme';
import { t } from '../i18n/trans';

const createStyles = (themeColors: ThemeColors) => {
  const styles = StyleSheet.create({
    buttonLabel: {
      color: themeColors.secondary,
    },
    button: {
      marginHorizontal: 16,
    },
  });
  return styles;
};

export const InfoDialog = ({
  visible,
  onDismiss,
  title,
  content,
  buttonLabel = t('OK_GOT_IT'),
}: {
  visible: boolean;
  onDismiss: () => void;
  title: string;
  content: string;
  buttonLabel?: string;
}) => {
  const { colors: themeColors } = useAppTheme();
  const styles = createStyles(themeColors);

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Content>
          <Paragraph>{content}</Paragraph>
        </Dialog.Content>
        <Dialog.Actions>
          <Button style={styles.button} labelStyle={styles.buttonLabel} onPress={onDismiss}>
            {buttonLabel}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};
