import React, { useState } from 'react';
import { StyleSheet, TextStyle, ViewStyle, View, TouchableOpacity } from 'react-native';
import { HelperText, TextInput as PaperTextInput } from 'react-native-paper';
import { colors } from '../constants/colors';
import { Alert, Eye, EyeOff } from '../helpers/icons';
import { ThemeColors } from '../helpers/theme';
import { injectStyles } from '../helpers/inject-styles';
import { isWeb } from '../config';
import { useAppTheme } from '../hooks/use-app-theme';

interface Styles {
  hiddenContainer: ViewStyle;
  container: ViewStyle;
  input: TextStyle;
  inputPaddingRight: TextStyle;
  iconWrapper: ViewStyle;
  helperContainer: ViewStyle;
  helperText: TextStyle;
  iconAffordance: ViewStyle;
}

const createStyles = (themeColors: ThemeColors) => {
  const baseStyles: Styles = {
    hiddenContainer: {
      position: 'absolute',
      top: -99999,
      left: -99999,
    },
    container: {
      width: '100%',
      maxWidth: 256,
    },
    input: {
      paddingHorizontal: 0,
      backgroundColor: themeColors.background,
      height: 30,
    },
    inputPaddingRight: {
      paddingRight: 30,
    },
    helperContainer: {
      alignItems: 'center',
      flexDirection: 'row',
      paddingBottom: 16,
    },
    helperText: {
      textAlign: 'left',
      fontSize: 12,
      width: '100%',
      lineHeight: 16,
    },
    iconWrapper: {
      paddingRight: 3,
    },
    iconAffordance: {
      position: 'absolute',
      top: 2,
      right: 0,
      paddingHorizontal: 3,
    },
  };
  return StyleSheet.create({ ...baseStyles });
};

export type TextInputPropsCustom = React.ComponentProps<typeof PaperTextInput> & {
  errorMessage: string;
  errorVisible: boolean;
  isPassword: boolean;
  isNotVisible: boolean;
  viewRef: any;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
};

if (isWeb) {
  injectStyles({
    id: 'text-input-fix',
    styles: `
      [data-c="paper-text-input"]:focus { outline: none }
    `,
  });
}

export const TextInput = (props: Partial<TextInputPropsCustom>): JSX.Element => {
  const {
    errorMessage,
    errorVisible,
    isPassword,
    value = '',
    isNotVisible,
    containerStyle,
    inputStyle,
    onLayout,
    viewRef,
    ...rest
  } = props;
  const { colors: themeColors } = useAppTheme();
  const styles = createStyles(themeColors);
  const [showingPassword, setShowingPassword] = useState(false);

  if (isWeb) {
    delete rest.autoCompleteType;
  }

  const handleEyeAffordanceClick = () => setShowingPassword(!showingPassword);

  const icon = !showingPassword ? (
    <Eye fill={colors.grey700} width={25} height={25} />
  ) : (
    <EyeOff fill={colors.grey700} width={25} height={25} />
  );

  return (
    <View
      ref={viewRef}
      style={isNotVisible ? styles.hiddenContainer : [styles.container, containerStyle]}
      onLayout={onLayout}
    >
      <PaperTextInput
        data-c="paper-text-input"
        error={!!errorVisible}
        mode="flat"
        dense
        style={[styles.input, isPassword && styles.inputPaddingRight, inputStyle]}
        secureTextEntry={isPassword && !showingPassword}
        value={value}
        {...(rest as any)}
      />
      {isPassword && (
        <TouchableOpacity onPress={handleEyeAffordanceClick} style={styles.iconAffordance}>
          {icon}
        </TouchableOpacity>
      )}
      <View style={styles.helperContainer}>
        {errorVisible && (
          <>
            <View style={styles.iconWrapper}>
              <Alert fill={themeColors.error} width={15} height={15} />
            </View>
            <HelperText padding="none" visible={errorVisible} type="error" style={styles.helperText}>
              {errorMessage}
            </HelperText>
          </>
        )}
      </View>
    </View>
  );
};
