import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useObserver } from 'mobx-react-lite';
import { Screen, Text, NotFoundPage } from '../components';
import { useAppTheme } from '../hooks/use-app-theme';
import { ThemeColors } from '../helpers/theme';
import { t } from '../i18n/trans';
import { useStores } from '../mobx/useStores';
import { getLogoForProperty } from '../helpers/branding-helper';
import { templateActions } from '../constants/templateActions';

const createStyles = (colors: ThemeColors) => {
  const styles = StyleSheet.create({
    header: {
      backgroundColor: colors.background,
      width: '100%',
      height: 50,
    },
    container: {
      height: '100%',
      paddingTop: 80,
      paddingRight: 20,
      paddingLeft: 20,
    },
    title: {
      fontSize: 20,
      lineHeight: 20,
      marginTop: 0,
    },
    textButton: {
      color: colors.primary,
      textTransform: 'uppercase',
      maxWidth: 'fit-content',
    },
    messageContainer: {
      marginTop: 20,
      marginBottom: 40,
    },
    description: {
      marginTop: 20,
      marginBottom: 20,
    },
    note: {
      marginBottom: 20,
    },
  });

  return styles;
};

const getTemplateSubcategory = (commsSubcategory: string) => {
  if (commsSubcategory === templateActions.RXP_ANNOUNCEMENT) return t('ANNOUNCEMENT').toLowerCase();
  if (commsSubcategory === templateActions.RXP_DIRECT_MESSAGE) return t('DIRECT_MESSAGE').toLowerCase();

  return '';
};

export const UnsubscribeComms = ({ route }: any) =>
  useObserver(() => {
    const { colors, theme } = useAppTheme();
    const { unsubscription: unsubscriptionStore } = useStores();

    const { token } = route?.params || {};

    useEffect(() => {
      unsubscriptionStore.getDataFromToken(token);
    }, []);

    const styles = createStyles(colors as ThemeColors);

    const { propertyDisplayName, commsSubcategory = '', tenantName = '', propertyId = '' } =
      unsubscriptionStore.tokenInfo || {};

    const propertyLogoUri = getLogoForProperty({ tenantName, propertyId, theme });
    const commsSubcategoryToDisplay = getTemplateSubcategory(commsSubcategory);

    const appBarTitle = unsubscriptionStore.isTokenInvalid ? t('APP_TITLE') : propertyDisplayName;

    const renderUnsubscribeConfirmation = () => (
      <>
        <Text style={[styles.title]}>{t('UNSUBSCRIBE_FROM_EMAILS')}</Text>
        <View style={[styles.messageContainer]}>
          <Text>{t('UNSUBSCRIBE_FROM', { commsSubcategory: commsSubcategoryToDisplay })}</Text>
        </View>
        <Text style={[styles.textButton]} accessibilityRole="link" onPress={unsubscriptionStore.unsubscribePerson}>
          {t('UNSUBSCRIBE_CONFIRMATION_BUTTON')}
        </Text>
      </>
    );

    const renderUnsubscriptionSuccess = () => (
      <>
        <Text style={[styles.title]}>{t('YOU_HAVE_UNSUBSCRIBED')}</Text>
        <View style={[styles.messageContainer]}>
          <Text>
            {t('YOU_WILL_NO_LONGER_RECEIVE_EMAILS', {
              commsSubcategory: commsSubcategoryToDisplay,
              propertyDisplayName,
            })}
          </Text>
          <Text style={[styles.description]}>{t('IT_CAN_TAKE_5_DAYS')}</Text>
          <Text style={[styles.note]}>{t('UNSUBSCRIPTION_NOTE')}</Text>
          <Text>{t('CLOSE_WINDOW')}</Text>
        </View>
      </>
    );

    const renderUnsubscriptionScreen = () => {
      if (unsubscriptionStore.isUnsubscribed) return renderUnsubscriptionSuccess();

      return renderUnsubscribeConfirmation();
    };

    return (
      <>
        <Screen
          title={appBarTitle || ''}
          hideAppBar={false}
          mode="no-action"
          propertyLogoUri={propertyLogoUri || ''}
          renderAppLogo={unsubscriptionStore.isTokenInvalid}
          unsubscribeScreen
        >
          <View style={[styles.container]}>
            {unsubscriptionStore.isTokenInvalid ? <NotFoundPage /> : renderUnsubscriptionScreen()}
          </View>
        </Screen>
      </>
    );
  });
