import React, { useState } from 'react';
import { StyleSheet, ViewStyle, TextStyle, View } from 'react-native';
import { HelperText } from 'react-native-paper';

import { Dropdown } from 'react-native-material-dropdown';
import { isWeb } from '../config';
import { WebDropdown } from './WebDropdown';
import { useAppTheme } from '../hooks/use-app-theme';
import { ThemeColors } from '../helpers/theme';
import { Alert } from '../helpers/icons';
import { withCondition } from '../helpers/typography';
import { sizes } from '../constants/sizes';

interface Styles {
  pickerOverlay: ViewStyle;
  labelStyle: TextStyle;
  helperContainer: ViewStyle;
  helperText: TextStyle;
  iconWrapper: ViewStyle;
  errorBorderBottom: ViewStyle;
  inputContainer: ViewStyle;
  openDropDownStyles: ViewStyle;
  rippleStyle: ViewStyle;
}

const createStyles = (themeColors: ThemeColors, isItemSelected: boolean, placeHolderOnly: boolean): Styles => {
  const baseStyles = {
    rippleStyle: {
      top: !placeHolderOnly && isItemSelected ? 10 : 0,
      bottom: !placeHolderOnly && isItemSelected ? 0 : 10,
    },
    pickerOverlay: {
      backgroundColor: themeColors.surface,
    },
    labelStyle: {
      color: themeColors.placeholder,
    },
    helperContainer: {
      marginTop: 0,
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
    errorBorderBottom: {
      borderBottomColor: themeColors.error,
      borderBottomWidth: 1,
    },
    inputContainer: {
      borderBottomColor: themeColors.dropdownBorder,
      // height: 35,
      borderBottomWidth: 1,
    },
    openDropDownStyles: {
      zIndex: sizes.dropdown.zIndex,
    },
  };

  if (!isWeb) {
    baseStyles.helperContainer = {
      ...baseStyles.helperContainer,
      marginTop: -7,
    };
  }

  return StyleSheet.create(baseStyles as Styles);
};

export const Select = (props: any) => {
  const { colors } = useAppTheme();
  const { errorMessage, errorVisible, label, disabled, onLayout, data, viewRef, placeHolderOnly, onChangeText } = props;
  const [isItemSelected, setIsItemSelected] = useState(false);
  const styles = createStyles(colors, isItemSelected, placeHolderOnly);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const shouldAddLabelHeight = (!placeHolderOnly && isItemSelected) || data?.length === 1;
  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const openDropDownStyles = withCondition(isWeb && isOpen, styles.openDropDownStyles);
  return (
    <View onLayout={onLayout} ref={viewRef} style={openDropDownStyles}>
      {isWeb ? (
        <WebDropdown {...props} onClose={handleClose} onOpen={handleOpen} />
      ) : (
        <Dropdown
          {...props}
          textColor={colors.text}
          itemColor={colors.text}
          baseColor={disabled ? colors.disabled : colors.placeholder}
          placeholder={placeHolderOnly ? label : ''}
          placeholderTextColor={disabled ? colors.disabled : colors.placeholder}
          pickerStyle={styles.pickerOverlay}
          activeLineWidth={1}
          labelTextStyle={styles.labelStyle}
          labelHeight={shouldAddLabelHeight ? 20 : 0}
          rippleInsets={styles.rippleStyle}
          labelFontSize={placeHolderOnly ? 0 : 12}
          titleTextStyle={styles.labelStyle}
          onChangeText={(v: string) => {
            setIsItemSelected(true);
            onChangeText && onChangeText(v);
          }}
          inputContainerStyle={[styles.inputContainer, errorVisible && styles.errorBorderBottom]}
        />
      )}
      <View style={styles.helperContainer}>
        {errorVisible && (
          <>
            <View style={styles.iconWrapper}>
              <Alert fill={colors.error} width={15} height={15} />
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
