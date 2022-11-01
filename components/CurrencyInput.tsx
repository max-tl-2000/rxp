import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { TextInput } from 'react-native-paper';
import { useAppTheme } from '../hooks/use-app-theme';
import { ThemeColors } from '../helpers/theme';
import { Text } from './Typography';

const createStyles = (themeColors: ThemeColors) => {
  const styles = {
    input: {
      backgroundColor: themeColors.background,
      fontSize: 14,
      height: 24,
      marginHorizontal: 2,
      paddingHorizontal: 0,
      width: 80,
    },
    textStyle: {
      paddingLeft: 10,
    },
  };
  return StyleSheet.create(styles);
};

export interface CurrencyInputProps {
  value: number;
  onValueChange: (value: number) => void;
}

export const CurrencyInput = ({ value, onValueChange }: CurrencyInputProps): JSX.Element => {
  const { colors: themeColors } = useAppTheme();
  const styles = createStyles(themeColors);

  const [formattedAmount, setFormatted] = useState('0');

  const cleanAndParse = (text: string) => {
    const justDigitsRegex = /[^0-9.]+/g;
    const cleanText = text.replace(justDigitsRegex, '');

    const float = parseFloat(cleanText) || 0;
    return { cleanText, amount: float };
  };

  const onChangeFixedAmount = (text: string) => {
    const { cleanText } = cleanAndParse(text);

    const indexOfDot = cleanText.indexOf('.');
    const trailingDot = indexOfDot === cleanText.length - 1 && indexOfDot > 0 ? '.' : '';

    const decimalsCount = indexOfDot >= 0 ? cleanText.slice(indexOfDot + 1).length : 0;
    const cleanTextTrimmed = decimalsCount > 2 ? cleanText.slice(0, 2 - decimalsCount) : cleanText;

    const formatted = Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: decimalsCount > 2 ? 2 : decimalsCount,
      maximumFractionDigits: 2,
    }).format(Number(cleanTextTrimmed));

    setFormatted(`${formatted}${trailingDot}`);
    onValueChange(Number(cleanTextTrimmed));
  };

  useEffect(() => {
    const { amount } = cleanAndParse(formattedAmount);
    if (amount !== value) onChangeFixedAmount(value.toString());
  }, [value]);

  return (
    <>
      <Text style={styles.textStyle} fontWeight="regular">
        $
      </Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        dense
        onChangeText={onChangeFixedAmount}
        value={formattedAmount}
      />
    </>
  );
};
