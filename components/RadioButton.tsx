import React from 'react';
import { StyleSheet, TextStyle, View, ViewStyle, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from 'react-native-paper';
import { useAppTheme } from '../hooks/use-app-theme';

const styles = StyleSheet.create({
  touchable: {
    minHeight: 40,
    minWidth: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textLabel: {
    marginLeft: 5,
  },
  componentLabel: {
    flex: 1,
    marginLeft: 20,
  },
});

export interface RadioButtonProps {
  disabled?: boolean;
  checked: boolean;
  label: string | JSX.Element;
  onPress: (value: boolean) => void;
  contentContainerStyle?: ViewStyle;
  labelStyle?: TextStyle;
}

export const RadioButton = ({
  disabled,
  checked,
  label,
  onPress,
  contentContainerStyle = {},
  labelStyle = {},
}: RadioButtonProps): JSX.Element => {
  const { colors: themeColors } = useAppTheme();
  const iconName = checked ? 'md-radio-button-on' : 'md-radio-button-off';
  const iconColor = checked ? themeColors.secondary : themeColors.backdrop;
  const labelToRender =
    label && typeof label === 'string' ? (
      <Text style={[styles.textLabel, labelStyle]}>{label}</Text>
    ) : (
      <View style={styles.componentLabel}>{label}</View>
    );

  return (
    <TouchableOpacity disabled={disabled} style={styles.touchable} activeOpacity={1} onPress={() => onPress(!checked)}>
      <View style={[styles.wrapper, contentContainerStyle]}>
        <Ionicons name={iconName} size={20} color={iconColor} />
        {labelToRender}
      </View>
    </TouchableOpacity>
  );
};
