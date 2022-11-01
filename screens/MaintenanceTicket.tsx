import * as React from 'react';
import { StyleSheet, View, ScrollView, ImageStyle, ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { useObserver } from 'mobx-react-lite';
import { capitalize } from 'lodash';
import { applyTitleCaseWithoutUnderscores } from '../helpers/format-strings';
import { MaintenanceScreenNavigationProp } from '../types';
import { Screen, Picture } from '../components';
import { useStores } from '../mobx/useStores';
import { t } from '../i18n/trans';
import { toMoment } from '../helpers/moment-utils';
import { MONTH_DATE_YEAR_LONG_FORMAT } from '../constants/date_formats';
import { Caption } from '../components/Typography';
import { ThemeColors } from '../helpers/theme';
import { getUnitName } from '../helpers/units';
import { useAppTheme } from '../hooks/use-app-theme';

interface Styles {
  image: ImageStyle;
  imageContainer: ViewStyle;
}

const createStyles = (themeColors: ThemeColors) => {
  const styles = StyleSheet.create({
    content: {
      color: themeColors.text,
      marginHorizontal: 16,
    },
    scrollViewContentStyle: {
      padding: 16,
    },
    row: {
      alignItems: 'baseline',
      flexDirection: 'row',
      marginBottom: 10,
      lineHeight: 20,
    },
    spacedRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
    },
    marginBottom: {
      marginBottom: 10,
    },
    description: {
      marginBottom: 5,
    },
    boldText: {
      fontSize: 14,
      color: themeColors.text,
      lineHeight: 20,
    },
    defaultText: {
      fontSize: 14,
      lineHeight: 20,
    },
  });

  return styles;
};

const imageStyle: Styles = {
  // don't use Stylesheet.create here, it breaks the image style for web
  image: {
    width: '100%',
  },
  imageContainer: {
    marginBottom: 16,
  },
};

interface Props {
  navigation: MaintenanceScreenNavigationProp;
}

export const MaintenanceTicket = ({ navigation }: Props) =>
  useObserver(() => {
    const { colors: themeColors } = useAppTheme();
    const styles = createStyles(themeColors);

    const { maintenance: maintenanceStore, units: unitsStore } = useStores();
    const { unitsInfo } = unitsStore;
    const { selectedMaintenanceTicket } = maintenanceStore;

    const {
      ticketNumber = 0,
      type = '',
      location = '',
      priority,
      description = '',
      dateCreated = '',
      status = '',
      hasPermissionToEnter,
      hasPets,
      attachmentUrls = [],
      phone = '',
    } = selectedMaintenanceTicket || {};

    const unit = unitsInfo.find(u => u.id === selectedMaintenanceTicket?.inventoryId);
    const unitName = getUnitName(unit);
    const title = `${capitalize(type)} - ${t('REQUEST')} #${ticketNumber}`;
    const dateSubmitted = toMoment(dateCreated).format(MONTH_DATE_YEAR_LONG_FORMAT);
    const hasPermissionToEnterString = hasPermissionToEnter ? t('YES') : t('NO');
    const hasPetsString = hasPets ? t('YES') : t('NO');

    return (
      <Screen title={title} navigation={navigation} mode="detail">
        <ScrollView style={styles.content} contentContainerStyle={styles.scrollViewContentStyle}>
          <View style={styles.spacedRow}>
            <View style={styles.row}>
              <Caption fontWeight="bold" style={styles.boldText}>{`${t('UNIT')}:  `}</Caption>
              <Text style={styles.defaultText}>{unitName}</Text>
            </View>
            <View style={styles.row}>
              <Caption fontWeight="bold" style={styles.boldText}>{`${t('STATUS')}:  `}</Caption>
              <Text style={styles.defaultText}>{t(status.toUpperCase())}</Text>
            </View>
          </View>

          {priority && (
            <View style={styles.row}>
              <Caption fontWeight="bold" style={styles.boldText}>{`${t('PRIORITY')}:  `}</Caption>
              <Text style={styles.defaultText}>{priority}</Text>
            </View>
          )}

          {location && (
            <View style={styles.row}>
              <Caption fontWeight="bold" style={styles.boldText}>{`${t('LOCATION')}:  `}</Caption>
              <Text style={styles.defaultText}>{applyTitleCaseWithoutUnderscores(location)}</Text>
            </View>
          )}

          {type && (
            <View style={styles.row}>
              <Caption fontWeight="bold" style={styles.boldText}>{`${t('MAINTENANCE_TYPE')}:  `}</Caption>
              <Text style={styles.defaultText}>{type}</Text>
            </View>
          )}

          <View style={styles.row}>
            <Caption fontWeight="bold" style={styles.boldText}>{`${t('PERMISSION_TO_ENTER')}:  `}</Caption>
            <Text style={styles.defaultText}>{hasPermissionToEnterString}</Text>
          </View>

          <View style={styles.row}>
            <Caption fontWeight="bold" style={styles.boldText}>{`${t('PETS_ON_PREMISES')}:  `}</Caption>
            <Text style={styles.defaultText}>{hasPetsString}</Text>
          </View>

          {phone && (
            <View style={styles.row}>
              <Caption fontWeight="bold" style={styles.boldText}>{`${t('CALLBACK_PHONE')}:  `}</Caption>
              <Text style={styles.defaultText}>{phone}</Text>
            </View>
          )}

          <Caption fontWeight="bold" style={[styles.boldText, styles.description]}>{`${t('DESCRIPTION')}:  `}</Caption>
          <Text style={styles.marginBottom}>{description}</Text>

          <View style={styles.row}>
            <Caption fontWeight="bold" style={styles.boldText}>{`${t('DATE_SUBMITTED')}:  `}</Caption>
            <Text style={styles.defaultText}>{dateSubmitted}</Text>
          </View>

          {attachmentUrls.map(attachmentUrl => {
            return (
              <View style={imageStyle.imageContainer} key={attachmentUrl.url}>
                <Picture style={imageStyle.image} src={attachmentUrl.url} />
              </View>
            );
          })}
        </ScrollView>
      </Screen>
    );
  });
