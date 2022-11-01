/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { StyleSheet, View, ViewStyle, ImageStyle, TextStyle } from 'react-native';
import { Text, Avatar, Card as PaperCard } from 'react-native-paper';
import { useObserver } from 'mobx-react-lite';
import Svg, { Rect } from 'react-native-svg';
import { formatHTMLBreakLines } from '../helpers/html';
import { t } from '../i18n/trans';
import { Title, Caption } from './Typography';
import { Html } from './Html';
import { MessageAlert } from '../helpers/icons';
import { withOpacity, withCondition } from '../helpers/typography';
import { colors } from '../constants/colors';
import { ThemeColors } from '../helpers/theme';
import { useAppTheme } from '../hooks/use-app-theme';
import { Picture } from './Picture';

interface CardProps {
  headerText?: string;
  date?: string;
  title: string;
  message?: string;
  imageUrl?: string;
  onPress?: any;
  isEmergency: boolean;
  footer: boolean;
  pressed: boolean;
  isRetracted: boolean;
  unread: boolean;
  retractedReason?: string;
}

interface Styles {
  card: ViewStyle;
  cardPressed: ViewStyle;
  emergencyIcon: ViewStyle;
  banner: ViewStyle;
  emergencyBanner: ViewStyle;
  emergencyHeader: ViewStyle;
  announcementBanner: ViewStyle;
  header: ViewStyle;
  emergencyText: TextStyle;
  leftBannerText: TextStyle;
  date: TextStyle;
  messageContainer: ViewStyle;
  image: ImageStyle;
  title: TextStyle;
  message: TextStyle;
  retractedText: TextStyle;
  retractedEmergencyContainer: ViewStyle;
  retractedReasonContainer: ViewStyle;
  retractedReasonText: TextStyle;
  footer: ViewStyle;
  footerLeftContainer: ViewStyle;
  cardContent: ViewStyle;
  titleContainer: ViewStyle;
  cardBanner: ViewStyle;
  titleSection: ViewStyle;
  retractedSkeletonSvg: ViewStyle;
}

const createStyles = (themeColors: ThemeColors, isEmergency: boolean, isDarkTheme: boolean, isRetracted: boolean) => {
  const baseStyles: Styles = {
    card: {
      flexDirection: 'row',
      minHeight: 130,
      borderRadius: 3,
      backgroundColor: themeColors.surfaceSecondary,
    },
    cardPressed: {
      backgroundColor: themeColors.cardPressed,
    },
    banner: {
      width: 13,
      height: 'auto',
    },
    emergencyBanner: {
      borderLeftWidth: 2,
      borderLeftColor: isRetracted ? themeColors.emergencyCardRetracted : themeColors.emergencyCard,
    },
    emergencyHeader: {
      backgroundColor: isRetracted ? themeColors.emergencyCardRetracted : themeColors.emergencyCard,
    },
    announcementBanner: {
      borderTopColor: themeColors.primary,
      borderTopWidth: 2,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 24,
      backgroundColor: isDarkTheme ? withOpacity(colors.grey900, 0.5) : colors.grey50,
      borderBottomWidth: 1,
      borderBottomColor: isDarkTheme ? withOpacity(colors.white, 0.2) : withOpacity(colors.black, 0.1),
      borderTopLeftRadius: 3,
      borderTopRightRadius: 3,
    },
    emergencyText: {
      color: themeColors.emergencyCardText,
    },
    leftBannerText: {
      lineHeight: 16,
      paddingTop: 4,
      paddingRight: 4,
      paddingBottom: 4,
      paddingLeft: 8,
      color: themeColors.text,
      letterSpacing: 0.32,
      width: '70%',
    },
    date: {
      textAlign: 'right',
      lineHeight: 16,
      paddingTop: 3,
      paddingRight: 8,
      paddingBottom: 3,
      paddingLeft: 4,
      color: themeColors.text,
      letterSpacing: 0.32,
      width: '30%',
    },
    messageContainer: {
      flexDirection: 'row',
    },
    image: {
      width: 100,
      height: 100,
      marginRight: 10,
    },
    emergencyIcon: {
      backgroundColor: colors.transparent,
      marginLeft: 4,
    },
    titleSection: {
      display: 'flex',
      flex: 1,
      flexDirection: 'row',
      borderBottomColor: isDarkTheme ? withOpacity(colors.white, 0.2) : withOpacity(colors.black, 0.1),
      borderBottomWidth: 1,
      paddingBottom: 10,
    },
    titleContainer: {
      flex: 1,
      marginBottom: !isRetracted ? 4 : 0,
      marginTop: 4,
      maxHeight: 53,
      minHeight: 12,
      paddingHorizontal: 16,
    },
    title: {
      fontWeight: '400',
      fontSize: isEmergency ? 15 : 16,
      lineHeight: 24,
      color: themeColors.onBackground,
    },
    message: {
      fontSize: 14,
      lineHeight: 20,
      color: themeColors.placeholder,
    },
    retractedText: {
      color: themeColors.disabled,
    },
    retractedEmergencyContainer: {
      marginTop: 8,
    },
    retractedReasonContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 24,
      paddingHorizontal: 16,
      borderTopWidth: 1,
      borderTopColor: isDarkTheme ? withOpacity(colors.white, 0.2) : withOpacity(colors.black, 0.1),
    },
    retractedReasonText: {
      color: themeColors.accentSecondary,
      lineHeight: 16,
    },
    footer: {
      marginTop: 3,
      borderTopColor: isDarkTheme ? withOpacity(colors.white, 0.1) : withOpacity(colors.black, 0.1),
      borderTopWidth: 1,
      width: '100%',
      minHeight: 24,
      bottom: 0,
    },
    footerLeftContainer: {
      width: '70%',
    },
    cardContent: {
      marginTop: 7,
      marginBottom: 12,
      paddingLeft: 16,
    },
    cardBanner: {
      height: 2,
      backgroundColor: themeColors.cardBanner,
      borderTopLeftRadius: 3,
      borderTopRightRadius: 3,
    },
    retractedSkeletonSvg: {
      height: 60,
    },
  };
  return StyleSheet.create(baseStyles);
};

const getSkeleton = (themeColors: ThemeColors) => ({
  title: (
    <Svg>
      <Rect x="0" y="23" rx="5" ry="5" width="100%" height="15" fill={themeColors.highlight} />
    </Svg>
  ),
  message: (
    <Svg height="130">
      <Rect x="0" y="30" rx="5" ry="5" width="100%" height="10" fill={themeColors.highlight} />
      <Rect x="0" y="50" rx="5" ry="5" width="100%" height="10" fill={themeColors.highlight} />
      <Rect x="0" y="70" rx="5" ry="5" width="100%" height="10" fill={themeColors.highlight} />
      <Rect x="0" y="90" rx="5" ry="5" width="100%" height="10" fill={themeColors.highlight} />
    </Svg>
  ),
});

const getRetractedSkeleton = (themeColors: ThemeColors, styles: Record<string, any>) => ({
  message: (
    <Svg style={[styles.retractedSkeletonSvg]}>
      <Rect x="0" y="0" rx="7" ry="7" width="100%" height="14" fill={themeColors.highlight} />
      <Rect x="0" y="19" rx="7" ry="7" width="100%" height="14" fill={themeColors.highlight} />
      <Rect x="0" y="38" rx="7" ry="7" width="100%" height="14" fill={themeColors.highlight} />
    </Svg>
  ),
});

export const Card = (props: CardProps): JSX.Element =>
  useObserver(() => {
    const {
      headerText,
      date,
      title,
      message,
      imageUrl,
      isEmergency,
      footer,
      pressed,
      isRetracted,
      unread,
      retractedReason,
      onPress,
    } = props;
    const { dark, colors: themeColors } = useAppTheme();
    const styles = createStyles(themeColors as ThemeColors, isEmergency, dark, isRetracted);
    const skeleton = getSkeleton(themeColors);
    const retractedSkeleton = getRetractedSkeleton(themeColors, styles);
    const retractedStyle = withCondition(isRetracted, styles.retractedText);
    const emergencyTextStyle = withCondition(isEmergency, styles.emergencyText);
    const emergencyHeaderStyle = withCondition(isEmergency, styles.emergencyHeader);
    const messageFormatted = isEmergency ? formatHTMLBreakLines(message) : message;
    const formattedHtml = `<div class="container">${messageFormatted}</div>`;
    const messageAlertColor = isRetracted ? themeColors.emergencyCardRetracted : themeColors.emergencyCard;

    const displayMessageSection = () => {
      if (!isRetracted) {
        return (
          <PaperCard.Content pointerEvents="none" style={[styles.cardContent]}>
            {message ? <Html content={formattedHtml} /> : skeleton.message}
          </PaperCard.Content>
        );
      }

      return <PaperCard.Content>{retractedSkeleton.message}</PaperCard.Content>;
    };

    return (
      <PaperCard
        {...{ onPress: onPress && (() => onPress()) }}
        style={[styles.card, unread && isEmergency && styles.emergencyBanner, pressed && styles.cardPressed]}
      >
        <View style={[styles.header, emergencyHeaderStyle, unread && !isEmergency && styles.announcementBanner]}>
          <Caption style={[styles.leftBannerText, emergencyTextStyle]}>{headerText}</Caption>
          <Caption style={[styles.date, emergencyTextStyle]}>{date}</Caption>
        </View>
        {!!imageUrl && (
          <Picture
            style={{ opacity: isRetracted ? 0.6 : 1 }}
            src={imageUrl}
            aspectRatio={1.85}
            shouldFit
            autoCrop="g_auto"
          />
        )}
        <View style={[isEmergency && styles.titleSection]}>
          {isEmergency && (
            <Avatar.Icon
              size={60}
              icon={() => MessageAlert({ fill: messageAlertColor, height: 50, width: 50 })}
              style={[styles.emergencyIcon]}
            />
          )}
          <View style={styles.titleContainer}>
            {title ? (
              <Title numberOfLines={2} style={[styles.title, retractedStyle]}>
                {title}
              </Title>
            ) : (
              skeleton.title
            )}
          </View>
        </View>
        <View style={[isEmergency && styles.retractedEmergencyContainer]}>{displayMessageSection()}</View>
        {retractedReason && (
          <View style={styles.retractedReasonContainer}>
            <Caption style={[styles.retractedReasonText]} fontWeight="bold">
              {`${t('RETRACTED')}: `}
            </Caption>
            <Caption style={styles.retractedReasonText}>{t(`${retractedReason}`)}</Caption>
          </View>
        )}
        {footer && (
          <View style={styles.footer}>
            <View style={styles.footerLeftContainer}>
              <Text style={styles.leftBannerText}>{t('READ_MORE')}</Text>
            </View>
          </View>
        )}
      </PaperCard>
    );
  });
