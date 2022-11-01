import React, { PureComponent } from 'react';
import { observable, action, computed } from 'mobx';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Observer } from 'mobx-react-lite';
import { Text } from 'react-native-paper';

import { tryParse } from '../helpers/json';
import { PostFull, Card } from '../components';
import { HomeScreenNavigationProp, Post as PostType } from '../types';
import { colors } from '../constants/colors';
import { withOpacity } from '../helpers/typography';
import { t } from '../i18n/trans';
import { formatDateAgo } from '../helpers/date';
import { findLocalTimezone } from '../helpers/moment-utils';
import { useAppTheme } from '../hooks/use-app-theme';
import { ThemeColors } from '../helpers/theme';

const createStyles = (themeColors: ThemeColors) => {
  const styles = StyleSheet.create({
    container: {
      paddingTop: 16,
      backgroundColor: colors.grey100,
    },
    label: {
      color: withOpacity(colors.black, 0.54),
      fontSize: 13,
      marginVertical: 32,
      marginLeft: 24,
    },
    postCardWrapper: {
      marginHorizontal: 65,
    },
    postFullWrapper: {
      paddingHorizontal: 65,
      backgroundColor: themeColors.background,
    },
  });

  return styles;
};

const VALID_MESSAGE_KEYS = ['title', 'heroImageURL', 'message', 'messageDetails', 'createdBy', 'sentAt'];

interface Props {
  navigation: HomeScreenNavigationProp;
}

export class PostPreview extends PureComponent<Props> {
  @observable
  data?: PostType;

  componentDidMount() {
    window.addEventListener('message', this.handleMessage, false);
  }

  componentWillUnmount() {
    window.removeEventListener('message', this.handleMessage);
  }

  @computed
  get id() {
    return this?.data?.id;
  }

  @computed
  get title() {
    return this?.data?.title;
  }

  @computed
  get heroImageURL() {
    return this?.data?.heroImageURL;
  }

  @computed
  get message() {
    return this?.data?.message;
  }

  @computed
  get messageDetails() {
    return this?.data?.messageDetails;
  }

  @computed
  get createdBy() {
    return this?.data?.createdBy;
  }

  @computed
  get sentAt() {
    if (this?.data?.sentAt) {
      return new Date(this.data.sentAt);
    }
    return new Date();
  }

  @action
  setPostData = (data: PostType): void => {
    this.data = data;
  };

  handleMessage = ({ data = '', origin }: { data: string; origin: string }): void => {
    if (!origin.endsWith('reva.tech')) {
      return;
    }
    const postData = tryParse(data) || ({} as any);
    // message object should have all valid keys
    const postDataKeys = Object.keys(postData);
    const isMessageValid = VALID_MESSAGE_KEYS.some(key => postDataKeys.includes(key) && postData[key] !== undefined);

    if (isMessageValid) {
      this.setPostData(postData as PostType);
    }
  };

  render() {
    return (
      <Observer>
        {() => {
          const { colors: themeColors } = useAppTheme();
          const styles = createStyles(themeColors);
          const {
            id = '',
            title = '',
            message = '',
            messageDetails = '',
            heroImageURL = '',
            createdBy = '',
            sentAt = '',
          } = this;
          return (
            <ScrollView style={styles.container}>
              <>
                <Text style={styles.label}>{t('POST_PREVIEW_MESSAGE_CARD')}</Text>
                <View style={styles.postCardWrapper}>
                  <Card
                    headerText="Announcement"
                    date={formatDateAgo(sentAt, findLocalTimezone())}
                    title={title}
                    message={message}
                    footer={!!messageDetails}
                    imageUrl={heroImageURL}
                    isEmergency={false}
                    isRetracted={false}
                    pressed={false}
                    unread={false}
                  />
                </View>
                {!!messageDetails && (
                  <>
                    <Text style={styles.label}>{t('POST_PREVIEW_MESSAGE_FULL')}</Text>
                    <View style={styles.postFullWrapper}>
                      <PostFull
                        id={id}
                        title={title}
                        message={message}
                        messageDetails={messageDetails}
                        heroImageURL={heroImageURL}
                        createdBy={createdBy}
                        sentAt={sentAt.toLocaleString()}
                      />
                    </View>
                  </>
                )}
              </>
            </ScrollView>
          );
        }}
      </Observer>
    );
  }
}
