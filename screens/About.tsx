import React from 'react';
import { StyleSheet, View } from 'react-native';
import { List, Caption } from 'react-native-paper';
import { t } from '../i18n/trans';
import { now } from '../helpers/moment-utils';
import { isProd, nativeVersionWithBuildNumber, updateId, versionWithBuildNumber } from '../config';
import { AboutScreenNavigationProp } from '../types';
import { Screen, Text } from '../components';
import { openLinkHandler } from '../helpers/openLinkHandler';
import { RevaWordmarkLightBw } from '../helpers/icons';
import { useStores } from '../mobx/useStores';
import { useAppTheme } from '../hooks/use-app-theme';

const styles = StyleSheet.create({
  versionText: {
    margin: 8,
    marginRight: 21,
  },
  rightIcon: {
    maxHeight: 24,
  },
  contentWrapper: {
    flex: 1,
  },
  footer: {
    alignItems: 'center',
  },
  footerLine: {
    maxHeight: 25,
    display: 'flex',
    flexDirection: 'row',
  },
  footerLineCaption: {
    paddingRight: 3,
  },
});

interface Props {
  navigation: AboutScreenNavigationProp;
}
export const About = ({ navigation }: Props) => {
  const { colors: themeColors } = useAppTheme();
  const year = now().year();

  const { settings } = useStores();

  const { legal } = settings;

  return (
    <Screen title={t('ABOUT')} navigation={navigation}>
      <List.Section style={styles.contentWrapper}>
        <List.Item
          title={t('VERSION')}
          right={() => <Text style={styles.versionText}>{versionWithBuildNumber}</Text>}
        />
        {!!nativeVersionWithBuildNumber && (
          <List.Item
            title={t('BUILD_VERSION')}
            right={() => <Text style={styles.versionText}>{nativeVersionWithBuildNumber}</Text>}
          />
        )}
        {!isProd && updateId && (
          <List.Item
            title={t('UPDATED_ID')}
            right={() => <Text style={styles.versionText}>{updateId?.split('-').slice(-1)}</Text>}
          />
        )}
        <List.Item
          title={t('TERMS_OF_SERVICE')}
          onPress={async () => openLinkHandler(legal?.termsOfServiceUrl)}
          right={() => <List.Icon style={styles.rightIcon} icon="chevron-right" />}
        />
        <List.Item
          title={t('PRIVACY_POLICY')}
          onPress={async () => openLinkHandler(legal?.privacyPolicyUrl)}
          right={() => <List.Icon style={styles.rightIcon} icon="chevron-right" />}
        />
        <List.Item
          title={t('ACKNOWLEDGMENTS')}
          onPress={async () => {
            navigation.navigate('Acknowledgements', {});
          }}
          right={() => <List.Icon style={styles.rightIcon} icon="chevron-right" />}
        />
      </List.Section>
      <View style={styles.footer}>
        <View style={styles.footerLine}>
          <Caption style={styles.footerLineCaption}>Powered by</Caption>
          <RevaWordmarkLightBw fill={themeColors.onBackground} width={56} height="100%" />
        </View>
        <Caption>{t('COPYRIGHT', { year })}</Caption>
      </View>
    </Screen>
  );
};
