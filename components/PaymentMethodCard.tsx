import React from 'react';
import { StyleSheet, View, ViewStyle, TextStyle } from 'react-native';
import { Divider, Button } from 'react-native-paper';
import { useObserver } from 'mobx-react-lite';
import capitalize from 'lodash/capitalize';
import { Text, Caption } from './Typography';
import { t } from '../i18n/trans';
import { withCondition } from '../helpers/typography';
import { PaymentMethod } from '../mobx/stores/paymentTypes';
import { Icons } from '../helpers/icons';
import * as icons from '../helpers/icons';
import { getPaymentMethodIconName, getPaymentMethodText, getPaymentFeeText } from '../helpers/payments';
import { ThemeColors } from '../helpers/theme';
import { useAppTheme } from '../hooks/use-app-theme';

interface Styles {
  card: ViewStyle;
  textContainer: ViewStyle;
  title: TextStyle;
  dueText: TextStyle;
  warning: TextStyle;
  titleContainer: TextStyle;
}

const createStyles = (themeColors: ThemeColors) => {
  const styles = StyleSheet.create({
    content: {
      width: '100%',
      marginTop: 16,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    spacedRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    button: {
      backgroundColor: themeColors.backgroundSecondary,
    },
    disabledButton: {
      backgroundColor: themeColors.disabled,
    },
    marginLeft: {
      marginLeft: 20,
    },
    defaultTextColor: {
      color: themeColors.onPrimary,
    },
    marginBotton: {
      marginBottom: 8,
    },
    divider: {
      height: 1,
      width: '100%',
      marginTop: 12,
    },
    warning: {
      color: themeColors.error,
    },
    defaultPaymentMethod: {
      width: 142,
    },
  });

  return styles;
};

interface PaymentMethodCardProps {
  paymentMethod: PaymentMethod;
  onRemovePress: (paymentMethod: PaymentMethod) => void;
  onMakeDefaultPress: (paymentMethod: PaymentMethod) => void;
}

export const PaymentMethodCard = ({
  paymentMethod,
  onRemovePress,
  onMakeDefaultPress,
}: PaymentMethodCardProps): JSX.Element =>
  useObserver(() => {
    const { colors: themeColors } = useAppTheme();
    const styles = createStyles(themeColors);

    const {
      brand,
      channelType,
      expirationDate,
      isDefault = false,
      isExpired = true,
      lastFour,
      isGenericExpiration,
    } = paymentMethod;

    const feeText = getPaymentFeeText(paymentMethod);
    const iconName = getPaymentMethodIconName(paymentMethod);
    const Icon = (icons as Icons)[iconName as keyof Icons] as Function;

    const warningStyle = withCondition(isExpired, styles.warning);
    const disabledStyle = withCondition(isExpired, styles.disabledButton);

    const getCardExpirationData = () => {
      if (isGenericExpiration) return <Caption style={warningStyle}>{`${t('EXPIRED')}, `}</Caption>;
      if (expirationDate)
        return <Caption style={warningStyle}>{`${t('EXPIRATION_DATE')}: ${expirationDate}, `}</Caption>;
      return <></>;
    };

    return (
      <View style={styles.content}>
        <View style={styles.spacedRow}>
          <View style={styles.marginBotton}>
            <Text>{`${capitalize(brand)} ${getPaymentMethodText(channelType)} #${lastFour}`}</Text>
            <View style={styles.row}>
              {getCardExpirationData()}
              <Caption style={warningStyle}>{feeText}</Caption>
            </View>
          </View>
          <Icon width={32} height={32} fill={themeColors.placeholder} />
        </View>

        <View style={styles.row}>
          {isDefault ? (
            <Text fontStyle="italic" style={styles.defaultPaymentMethod}>
              {t('DEFAULT_METHOD')}
            </Text>
          ) : (
            <Button
              disabled={isExpired}
              mode="contained"
              style={[styles.button, disabledStyle]}
              labelStyle={!isExpired && styles.defaultTextColor}
              onPress={() => onMakeDefaultPress(paymentMethod)}
            >
              {t('MAKE_DEFAULT')}
            </Button>
          )}
          <Button
            labelStyle={styles.defaultTextColor}
            mode="contained"
            style={[styles.button, styles.marginLeft]}
            onPress={() => onRemovePress(paymentMethod)}
          >
            {t('REMOVE')}
          </Button>
        </View>

        <Divider style={styles.divider} />
      </View>
    );
  });
