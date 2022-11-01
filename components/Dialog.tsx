/* eslint-disable react/display-name */
import React, { ReactNode } from 'react';
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Dialog as RNDialog } from 'react-native-paper';
import { useObserver } from 'mobx-react-lite';
import { useStores } from '../mobx/useStores';

interface DialogProps {
  children: ReactNode;
  dismissable?: boolean;
  onDismiss?: () => void;
  style?: ViewStyle;
  theme?: ReactNativePaper.Theme;
  visible: boolean;
}

interface DialogActionsProps {
  children: ReactNode;
  style?: ViewStyle;
}

interface DialogContentProps {
  children: ReactNode;
  style?: ViewStyle;
}

interface DialogScrollAreaProps {
  children: ReactNode;
  style?: ViewStyle;
}

interface DialogTitleProps {
  children: ReactNode;
  style?: TextStyle;
  theme?: ReactNativePaper.Theme;
}

const createStyles = () => {
  const wideScreenStyles: any = {
    wideScreenStyle: {
      maxWidth: 420,
      alignSelf: 'center',
    },
  };
  return StyleSheet.create(wideScreenStyles);
};

const Dialog = ({ children, ...props }: DialogProps) =>
  useObserver(() => {
    const { screenSize } = useStores();
    const isWideScreen = screenSize.matchMedium;
    const styles = createStyles();

    return (
      <RNDialog style={isWideScreen && styles.wideScreenStyle} {...props}>
        {children}
      </RNDialog>
    );
  });

Dialog.Actions = ({ children, style, ...props }: DialogActionsProps) => (
  <RNDialog.Actions style={style} {...props}>
    {children}
  </RNDialog.Actions>
);

Dialog.Content = ({ children, style, ...props }: DialogContentProps) => (
  <RNDialog.Content style={style} {...props}>
    {children}
  </RNDialog.Content>
);

Dialog.ScrollArea = ({ children, style, ...props }: DialogScrollAreaProps) => (
  <RNDialog.ScrollArea style={style} {...props}>
    {children}
  </RNDialog.ScrollArea>
);

Dialog.Title = ({ children, style, ...props }: DialogTitleProps) => (
  <RNDialog.Title style={style} {...props}>
    {children}
  </RNDialog.Title>
);

export { Dialog };
