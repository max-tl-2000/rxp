import React, { useEffect } from 'react';
import { useObserver } from 'mobx-react-lite';
import { View, StyleSheet } from 'react-native';

import { formatHTMLBreakLines } from '../helpers/html';
import { t } from '../i18n/trans';
import { toMoment } from '../helpers/moment-utils';
import { IMPORT_COMM_DATE_AND_TIME_12H_FORMAT } from '../constants/date_formats';
import { PostFull, Screen, Text, Title, Loading, Pictograph } from '../components';

import { useStores } from '../mobx/useStores';
import { PostCategory } from '../mobx/stores/postTypes';

import { HomeScreenNavigationProp } from '../types';

const createStyles = () => {
  const styles = StyleSheet.create({
    errorContent: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 28,
      marginBottom: 120,
    },
    errorText: {
      marginBottom: 20,
      textAlign: 'center',
    },
  });

  return styles;
};

interface Props {
  navigation: HomeScreenNavigationProp;
}

export const PostDetails = ({ navigation }: Props) =>
  useObserver(() => {
    const { post: postStore, userSettings } = useStores();
    const { propertySelected } = userSettings;
    const { currentPost, viewingPostCategory } = postStore;
    useEffect(() => {
      if (!currentPost.hasValidData) navigation.navigate('Home', { screen: 'Feed' });
    }, []);

    const { sentAt = '', title, message = '', category, createdBy, messageDetails = '', heroImageURL, id = '' } =
      currentPost || {};

    const isEmergency = viewingPostCategory === PostCategory.Emergency;
    const date = toMoment(sentAt, { timezone: propertySelected.propertyTimezone }).format(
      IMPORT_COMM_DATE_AND_TIME_12H_FORMAT,
    );
    const createdByText =
      category === PostCategory.AnnouncementAutomated ? t('AUTOMATED_POST') : t('POSTED_BY', { createdBy });

    const styles = createStyles();

    const renderError = () => (
      <View style={styles.errorContent}>
        <Pictograph type="exhausted" />
        <Title>{t('SOMETHING_WENT_WRONG')}</Title>
        <Text style={styles.errorText}>
          {t('UNABLE_TO_SHOW_POST_DATA', {
            categoryDetails: isEmergency ? t('EMERGENCY_DETAILS') : t('ANNOUNCEMENT_DETAILS'),
          })}
        </Text>
        <Text style={styles.errorText}>{t('RETRY_OR_CONTACT_PROPERTY')}</Text>
      </View>
    );

    const messageFormatted = isEmergency ? formatHTMLBreakLines(message) : message;
    const messageDetailsFormatted = isEmergency ? formatHTMLBreakLines(messageDetails) : messageDetails;

    const renderContent = () =>
      currentPost.failed ? (
        renderError()
      ) : (
        <PostFull
          id={id}
          title={title}
          heroImageURL={heroImageURL}
          message={messageFormatted}
          messageDetails={messageDetailsFormatted}
          createdBy={createdByText}
          sentAt={date}
        />
      );

    return (
      <Screen
        title={isEmergency ? t('EMERGENCY_DETAILS') : t('ANNOUNCEMENT_DETAILS')}
        navigation={navigation}
        mode="detail"
        backScreen="Feed"
      >
        {currentPost.loading ? <Loading /> : renderContent()}
      </Screen>
    );
  });
