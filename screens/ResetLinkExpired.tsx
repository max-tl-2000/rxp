import React, { useEffect } from 'react';
import { StyleSheet, TextStyle } from 'react-native';
import { Title } from 'react-native-paper';
import { ThemeColors } from '../helpers/theme';
import { t } from '../i18n/trans';
import { ContentWrapper } from '../components';
import { AppBranding } from '../components/AppBranding';
import { ResetLinkExpiredScreenNavigationProp } from '../types';
import { useAppTheme } from '../hooks/use-app-theme';

interface Styles {
  title: TextStyle;
}

const createStyles = (themeColors: ThemeColors) => {
  const baseStyles: Styles = {
    title: {
      textAlign: 'center',
      color: themeColors.error,
    },
  };
  return StyleSheet.create({ ...baseStyles });
};

interface Props {
  navigation: ResetLinkExpiredScreenNavigationProp;
}

export const ResetLinkExpired = ({ navigation }: Props): JSX.Element => {
  useEffect(() => {
    return () =>
      navigation.reset({
        index: 0,
        routes: [{ name: 'SignIn' }],
      });
  }, []);

  const { colors: themeColors } = useAppTheme();
  const styles = createStyles(themeColors);

  return (
    <ContentWrapper isAuthScreenContainer>
      <AppBranding />
      <Title style={styles.title}>{t('RESET_LINK_EXPIRED')}</Title>
    </ContentWrapper>
  );
};
