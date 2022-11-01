import React, { useState } from 'react';
import { StyleSheet, View, TouchableWithoutFeedback, ViewStyle, TextStyle } from 'react-native';
import { Text, Surface, Avatar } from 'react-native-paper';
import capitalize from 'lodash/capitalize';
import { useObserver } from 'mobx-react-lite';
import { t } from '../i18n/trans';
import { Check } from '../helpers/icons';
import { ThemeColors } from '../helpers/theme';
import { formatDateAgo } from '../helpers/date';
import { toMoment, now } from '../helpers/moment-utils';
import { PostCategory, Post as PostType } from '../mobx/stores/postTypes';
import { useStores } from '../mobx/useStores';
import { colors } from '../constants/colors';
import { useAppTheme } from '../hooks/use-app-theme';

import { Card } from './Card';

interface CardProps {
  post: PostType;
  onPress: (postId: string) => void;
  imageUrl?: string;
  lastUnreadPost?: boolean;
  isFirstCard?: boolean;
}

interface Styles {
  isFirstCard: ViewStyle;
  postContainer: ViewStyle;
  surface: ViewStyle;
  iconLimiter: ViewStyle;
  contentContainer: ViewStyle;
  announcementLimiter: TextStyle;
  announcementLimiterContent: ViewStyle;
  olderPosts: TextStyle;
  olderPostsContainer: ViewStyle;
}

const createStyles = (themeColors: ThemeColors, cardPressed: boolean) => {
  const baseStyles: Styles = {
    postContainer: {
      backgroundColor: themeColors.background,
    },
    isFirstCard: {
      marginTop: 0,
    },
    surface: {
      elevation: cardPressed ? 9 : 2,
      borderTopLeftRadius: 3,
      borderTopRightRadius: 3,
      borderBottomLeftRadius: 3,
      borderBottomRightRadius: 3,
    },
    iconLimiter: {
      marginBottom: 12,
      backgroundColor: themeColors.postIconLimiter,
    },
    contentContainer: {
      flex: 1,
      flexDirection: 'column',
      paddingTop: 8,
      paddingRight: 16,
      paddingBottom: 8,
      paddingLeft: 16,
      backgroundColor: themeColors.background,
    },
    announcementLimiter: {
      fontSize: 24,
      lineHeight: 32,
      color: themeColors.announcementLimiter,
    },
    announcementLimiterContent: {
      paddingTop: 48,
      alignItems: 'center',
      backgroundColor: themeColors.background,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.announcementLimiterBorder,
      marginBottom: 25,
    },
    olderPosts: {
      color: themeColors.placeholder,
      fontSize: 12,
      letterSpacing: 0.32,
    },
    olderPostsContainer: {
      marginBottom: 24,
      marginTop: 24,
    },
  };

  return StyleSheet.create(baseStyles);
};

export const PostCard = (props: CardProps): JSX.Element =>
  useObserver(() => {
    const [cardPressed, setCardPressed] = useState(false);

    const {
      post: {
        category,
        sentAt,
        title,
        message,
        retractedAt,
        unread,
        heroImageURL,
        id,
        hasMessageDetails = false,
        metadata,
      },
      lastUnreadPost,
      isFirstCard,
      onPress,
    } = props;

    const { userSettings } = useStores();
    const { propertySelected } = userSettings;
    const { colors: themeColors } = useAppTheme();
    const styles = createStyles(themeColors as ThemeColors, cardPressed);
    const viewProps = {
      onMouseEnter: () => setCardPressed(true),
      onMouseLeave: () => setCardPressed(false),
    };
    const isRetracted = toMoment(retractedAt, { timezone: propertySelected.propertyTimezone }).isSameOrBefore(
      now(),
      'day',
    );
    return (
      <View style={styles.postContainer}>
        <View {...viewProps}>
          <TouchableWithoutFeedback
            onPress={() => onPress(id)}
            onPressIn={() => {
              setCardPressed(true);
            }}
            onPressOut={() => {
              setCardPressed(false);
            }}
            onLongPress={() => onPress(id)}
          >
            <View style={[styles.contentContainer, isFirstCard && styles.isFirstCard]}>
              <Surface style={styles.surface}>
                <Card
                  onPress={() => onPress(id)}
                  headerText={capitalize(category.charAt(0) + category.slice(1))}
                  date={formatDateAgo(sentAt, propertySelected.propertyTimezone)}
                  title={title}
                  message={message}
                  isEmergency={category === PostCategory.Emergency}
                  isRetracted={isRetracted}
                  footer={hasMessageDetails}
                  unread={unread}
                  pressed={cardPressed}
                  imageUrl={heroImageURL}
                  retractedReason={metadata?.retractDetails?.retractedReason}
                />
              </Surface>
            </View>
          </TouchableWithoutFeedback>
        </View>
        {lastUnreadPost && (
          <View style={styles.announcementLimiterContent}>
            <Avatar.Icon
              size={60}
              icon={() => Check({ fill: colors.white, height: 32, width: 30 })}
              style={[styles.iconLimiter]}
            />
            <Text style={styles.announcementLimiter}>{t('CAUGHT_UP_ANNOUNCEMENTS')}</Text>
            <View style={styles.olderPostsContainer}>
              <Text style={styles.olderPosts}>{t('OLDER_POSTS_BELOW')}</Text>
            </View>
          </View>
        )}
      </View>
    );
  });
