import React from 'react';
import { StyleSheet, View, ViewStyle, TextStyle, TouchableOpacity } from 'react-native';
import { Divider } from 'react-native-paper';
import { useObserver } from 'mobx-react-lite';
import { Ticket, MaintenanceStatus } from '../mobx/stores/maintenanceTypes';
import { Text, Caption } from './Typography';
import { applyTitleCaseWithoutUnderscores } from '../helpers/format-strings';
import { t } from '../i18n/trans';
import { withCondition } from '../helpers/typography';
import { useAppTheme } from '../hooks/use-app-theme';
import { ThemeColors } from '../helpers/theme';

interface Styles {
  content: ViewStyle;
  textContainer: ViewStyle;
  title: TextStyle;
  dueText: TextStyle;
  warning: TextStyle;
  titleContainer: TextStyle;
}

const createStyles = (themeColors: ThemeColors) => {
  const styles = StyleSheet.create({
    content: {
      margin: 4,
    },
    titleContainer: {
      lineHeight: 20,
      marginTop: 0,
      marginBottom: 0,
    },
    divider: {
      height: 1,
      width: '100%',
      marginTop: 12,
    },
    rowStyle: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    statusStyle: {
      lineHeight: 16,
    },
    disabled: {
      color: themeColors.placeholder,
    },
    defaultColor: {
      color: themeColors.text,
    },
  });

  return styles;
};

interface MaintenanceCardProps {
  maintenanceTicket: Ticket;
  unitName: string;
  showUnitName: boolean;
  isLastItem: boolean;
  onPress(selectedTicket: Ticket): void;
}

export const MaintenanceCard = (props: MaintenanceCardProps): JSX.Element =>
  useObserver(() => {
    const { maintenanceTicket, unitName, showUnitName, isLastItem, onPress } = props;

    const { colors: themeColors } = useAppTheme();
    const styles = createStyles(themeColors);
    const isOpen = maintenanceTicket.status === MaintenanceStatus.Open;
    const defaultStyle = withCondition(isOpen, styles.defaultColor);

    let maintenanceTicketLocation = maintenanceTicket.location
      ? ` - ${applyTitleCaseWithoutUnderscores(maintenanceTicket.location)}`
      : '';
    if (showUnitName) maintenanceTicketLocation += maintenanceTicket.location ? ', ' : ' - ';

    return (
      <TouchableOpacity onPress={() => onPress(maintenanceTicket)}>
        <View style={styles.content}>
          <View style={styles.rowStyle}>
            <Text style={styles.titleContainer} fontWeight="bold">
              {applyTitleCaseWithoutUnderscores(maintenanceTicket.type)}
            </Text>
            <Text style={[styles.titleContainer, styles.disabled]} fontWeight="bold">
              {maintenanceTicketLocation}
            </Text>
            {showUnitName && (
              <Text style={[styles.titleContainer, styles.disabled]} fontWeight="bold">
                {unitName}
              </Text>
            )}
          </View>
          <Caption numberOfLines={1}>{maintenanceTicket.description}</Caption>
          <Caption style={[styles.statusStyle, defaultStyle]}>
            {`${t('STATUS')}: ${t(maintenanceTicket.status.toUpperCase())}`}
          </Caption>
          {!isLastItem && <Divider style={styles.divider} />}
        </View>
      </TouchableOpacity>
    );
  });
