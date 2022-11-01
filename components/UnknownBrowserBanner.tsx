import React from 'react';
import { StyleSheet, ViewStyle, TextStyle, View, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';

import { isMobileBrowser } from '../helpers/is-mobile';
import { Alert } from '../helpers/icons';
import { colors } from '../constants/colors';
import { t } from '../i18n/trans';
import { useStores } from '../mobx/useStores';
import { openLinkHandler } from '../helpers/openLinkHandler';
import { recommendedBrowsersPageUrl } from '../config';

interface Styles {
  link: TextStyle;
  text: TextStyle;
  bannerContainer: ViewStyle;
  leftBannerContainer: ViewStyle;
  rightBannerContainer: ViewStyle;
  iconContainer: ViewStyle;
}

const createStyles = () => {
  const baseStyles: Styles = {
    link: {
      textDecorationLine: 'underline',
    },
    text: {
      color: colors.blue800,
      lineHeight: 24,
      fontSize: 15,
    },
    bannerContainer: {
      backgroundColor: colors.blue50,
      height: 74,
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 24,
      justifyContent: 'space-between',
    },
    leftBannerContainer: {
      flex: 5,
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
    },
    rightBannerContainer: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    iconContainer: {
      marginRight: 13,
    },
  };
  return StyleSheet.create({ ...baseStyles });
};

export const UnknownBrowserBanner = () => {
  const { settings } = useStores();

  const styles = createStyles();

  const { applicationName: appName } = settings;

  const renderRecommendationBrowserListLink = (translation: string) => (
    <TouchableOpacity onPress={() => openLinkHandler(recommendedBrowsersPageUrl)}>
      <Text style={[styles.text, styles.link]}>{t(translation)}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.bannerContainer}>
      <View style={styles.leftBannerContainer}>
        <View style={styles.iconContainer}>
          <Alert fill={colors.blue600} width={24} height={21} />
        </View>

        {isMobileBrowser() ? (
          <Text style={styles.text}>
            {t('UNKNOWN_BROWSER_MOBILE_WEB_NOT_SUPPORTED')}
            {renderRecommendationBrowserListLink('CLICK_HERE')}
            {t('UNKNOWN_BROWSER_MOBILE_WEB_RECOMMENDED')}
          </Text>
        ) : (
          <Text style={styles.text}>
            {t('UNKNOWN_BROWSER_WEB_MESSAGE', { appName })}
            {renderRecommendationBrowserListLink('UNKNOWN_BROWSER_CLICKING_HERE')}
          </Text>
        )}
      </View>

      <View style={styles.rightBannerContainer}>
        <TouchableOpacity onPress={settings.unknownBrowserBannerDismiss}>
          <Text style={[styles.text]}>{t('DISMISS')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
