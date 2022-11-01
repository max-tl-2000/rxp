import React from 'react';
import { StyleSheet, View, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { Badge, Text } from 'react-native-paper';
import * as icons from '../helpers/icons';
import { Icons } from '../helpers/icons';
import { ThemeColors } from '../helpers/theme';
import { useAppTheme } from '../hooks/use-app-theme';

interface Styles {
  itemContainer: ViewStyle;
  labelContainer: ViewStyle;
  label: TextStyle;
  isActive: ViewStyle;
  badge: ViewStyle;
  accentBadge: ViewStyle;
}

interface DrawerItemProps {
  label: string;
  icon?: string;
  showUnreadContentBadge?: boolean;
  useAccentColor?: boolean;
  isActive?: boolean;
  onPress(): void;
}

const createStyles = (themeColors: ThemeColors) => {
  const styles: Styles = StyleSheet.create({
    itemContainer: {
      flexDirection: 'row',
      height: 48,
      alignItems: 'center',
      paddingLeft: 16,
      paddingRight: 16,
    },
    labelContainer: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginLeft: 30,
    },
    label: {
      fontSize: 13,
      color: themeColors.text,
    },
    isActive: {
      backgroundColor: themeColors.background,
    },
    badge: {
      backgroundColor: themeColors.secondary,
      color: themeColors.text,
    },
    accentBadge: {
      backgroundColor: themeColors.accentSecondary,
      color: themeColors.text,
    },
  });
  return styles;
};

export const DrawerItem = ({
  label,
  icon,
  showUnreadContentBadge,
  useAccentColor,
  isActive,
  onPress,
}: DrawerItemProps): JSX.Element => {
  const { colors: themeColors } = useAppTheme();
  const styles = createStyles(themeColors);

  const Icon = (icon && (icons as Icons)[icon as keyof Icons]) as Function;
  const badgeStyle = useAccentColor ? styles.accentBadge : styles.badge;

  return (
    <TouchableOpacity onPress={() => onPress()}>
      <View style={[styles.itemContainer, isActive && styles.isActive]}>
        {icon && <Icon width={24} height={24} fill={themeColors.placeholder} />}

        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label}</Text>
          {showUnreadContentBadge && <Badge visible style={badgeStyle} size={8} />}
        </View>
      </View>
    </TouchableOpacity>
  );
};
