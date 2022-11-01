import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Lost404, Lost404Native } from '../helpers/icons';
import { useAppTheme } from '../hooks/use-app-theme';
import { ThemeColors } from '../helpers/theme';
import { t } from '../i18n/trans';
import { useStores } from '../mobx/useStores';
import { openLinkHandler } from '../helpers/openLinkHandler';
import { now } from '../helpers/moment-utils';
import { isWeb } from '../config';

const createStyles = (themeColors: ThemeColors) => {
  const styles = StyleSheet.create({
    wrapper: {
      height: '100%',
      display: 'flex',
    },
    container: {
      display: 'flex',
      alignItems: 'center',
    },
    content: {
      flexGrow: 1,
    },
    textContainer: {
      maxWidth: 320,
    },
    textColor: {
      color: themeColors.text,
    },
    title: {
      fontSize: 34,
      marginTop: 10,
      marginBottom: 20,
    },
    message: {
      lineHeight: 20,
    },
    primary: {
      color: themeColors.primary,
    },
    inline: {
      display: 'flex',
      flexFlow: 'nowrap',
    },
    copyright: {
      paddingTop: 10,
      paddingBottom: 20,
      textAlign: 'center',
    },
  });

  return styles;
};
export const NotFoundPage = () => {
  const { colors: themeColors } = useAppTheme();
  const styles = createStyles(themeColors);
  const {
    settings: { legal },
  } = useStores();

  const year = now().year();

  return (
    <View style={[styles.wrapper]}>
      <View style={[styles.container, styles.content]}>
        {isWeb ? <Lost404 /> : <Lost404Native />}
        <View style={[styles.textContainer]}>
          <Text style={[styles.textColor, styles.title]}>{t('NOT_FOUND_PAGE_TITLE')}</Text>
          <Text style={[styles.textColor, styles.message]}>
            {t('NOT_FOUND_PAGE_CONTACT_US_AT')}
            <Text style={[styles.primary]}> contact@reva.tech</Text>
          </Text>
        </View>
      </View>

      <View style={[styles.container]}>
        <View style={[styles.textContainer]}>
          <View style={[styles.inline]}>
            <Text style={[styles.textColor]} onPress={async () => openLinkHandler(legal?.privacyPolicyUrl)}>
              {t('PRIVACY_POLICY')}
            </Text>
            <Text style={[styles.textColor]}> | </Text>
            <Text style={[styles.textColor]} onPress={async () => openLinkHandler(legal?.termsOfServiceUrl)}>
              {t('TERMS_OF_SERVICE')}
            </Text>
          </View>
          <View>
            <Text style={[styles.textColor, styles.copyright]}>{t('COPYRIGHT', { year })}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};
