import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Divider } from 'react-native-paper';
import { ThemeColors } from '../helpers/theme';

import { t } from '../i18n/trans';
import { Text, Title } from './Typography';
import { Html } from './Html';
import { Picture } from './Picture';

import { useAppTheme } from '../hooks/use-app-theme';
import { Post as PostType } from '../types';
import { useStores } from '../mobx/useStores';

const createStyles = (themeColors: ThemeColors) => {
  const styles = StyleSheet.create({
    contentContainer: {
      flexGrow: 1,
      justifyContent: 'space-between',
      flexDirection: 'column',
      backgroundColor: themeColors.background,
    },
    content: {
      marginTop: 16,
      paddingLeft: 16,
      paddingRight: 16,
    },
    title: {
      fontSize: 20,
      lineHeight: 28,
      color: themeColors.onBackground,
    },
    detailsContainer: {
      paddingTop: 16,
      width: '100%',
    },
    detailsContent: {
      marginTop: 16,
    },
    divider: {
      width: '100%',
      height: 1,
    },
    footerContainer: {
      marginTop: 48,
    },
    footerContent: {
      alignItems: 'flex-start',
      justifyContent: 'center',
      paddingHorizontal: 16,
      height: 50,
    },
    footer: {
      fontSize: 9,
      lineHeight: 11,
      letterSpacing: 0.32,
      color: themeColors.onBackground,
      fontWeight: 'normal',
    },
  });

  return styles;
};

export const PostFull = (props: PostType) => {
  const { colors: themeColors } = useAppTheme();
  const { post: postStore } = useStores();

  const { id, title, heroImageURL, message, messageDetails, createdBy, sentAt } = props;
  const styles = createStyles(themeColors);

  const onPostLinkVisited = (link: string) => id && postStore.markLinkAsVisited({ postId: id, link });

  return (
    <ScrollView contentContainerStyle={styles.contentContainer}>
      <View style={styles.content}>
        <View>
          {heroImageURL && <Picture src={heroImageURL} aspectRatio={1.85} />}
          <Title numberOfLines={5} style={styles.title} fontWeight="medium">
            {title}
          </Title>
          <View>
            <Html content={message} onLinkVisited={onPostLinkVisited} />
          </View>
          {!!messageDetails && (
            <View style={styles.detailsContainer}>
              <Divider style={styles.divider} />
              <View style={styles.detailsContent}>
                <Html content={messageDetails} onLinkVisited={onPostLinkVisited} />
              </View>
            </View>
          )}
        </View>
      </View>

      <View style={styles.footerContainer}>
        <Divider style={styles.divider} />
        <View style={styles.footerContent}>
          <Text style={styles.footer}>{createdBy}</Text>
          <Text style={styles.footer}>{t('DATE_TIME', { date: sentAt })}</Text>
        </View>
      </View>
    </ScrollView>
  );
};
