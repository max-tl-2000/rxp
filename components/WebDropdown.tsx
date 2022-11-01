import React, { useState, CSSProperties } from 'react';

import { useSelect } from 'downshift';

import { Text } from './Typography';
import { useAppTheme } from '../hooks/use-app-theme';
import { ThemeColors } from '../helpers/theme';

interface GetStylesArgs {
  isItemSelect: boolean;
  colors: ThemeColors;
  errorVisible?: boolean;
  disabled?: boolean;
}

interface CSSStyles {
  [key: string]: CSSProperties;
}

const getAffordanceStyles = (colors: ThemeColors, disabled: boolean): Partial<CSSStyles> => {
  return {
    affordance: {
      width: '24px',
      height: '24px',
      fill: disabled ? colors.disabled : colors.text,
    },
    arrow: {
      position: 'absolute',
      right: 0,
      top: 0,
      width: '24px',
      height: '40px',
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  };
};

const getStyles = ({ colors, isItemSelect, errorVisible, disabled }: GetStylesArgs): Partial<CSSStyles> => {
  let label: Partial<CSSProperties> = {
    fontSize: '16px',
    color: disabled ? colors.disabled : colors.placeholder,
  };

  if (isItemSelect) {
    label = {
      ...label,
      color: colors.placeholder,
    };
  }

  return {
    inputLabel: {
      color: isItemSelect ? colors.text : colors.placeholder,
    },
    menuStyles: {
      maxHeight: '300px',
      overflowY: 'scroll',
      backgroundColor: colors.surface,
      listStyle: 'none',
      position: 'absolute',
      top: 0,
      left: 0,
      zIndex: 10,
      width: '100%',
      display: 'none',
      margin: 0,
      boxSizing: 'border-box',
      padding: 0,
      boxShadow: `0 0 5px ${colors.backdrop}`,
      borderRadius: '2px',
    },
    menuStylesOn: {
      display: 'block',
    },
    wrapper: {
      display: 'inline-block',
      textAlign: 'left',
      position: 'relative',
      width: '100%',
    },
    trigger: {
      display: 'block',
      width: '100%',
      minWidth: '200px',
      height: '40px',
      appearance: 'none',
      cursor: 'pointer',
      textAlign: 'left',
      background: 'none',
      border: 0,
      position: 'relative',
      margin: 0,
      padding: 0,
    },
    line: {
      position: 'absolute',
      bottom: 0,
      width: '100%',
      height: '2px',
      background: errorVisible ? colors.error : colors.disabled,
      transform: 'scaleY(.5)',
    },
    lineOver: {
      position: 'absolute',
      bottom: 0,
      width: '100%',
      height: '2px',
      backgroundColor: errorVisible ? colors.error : colors.primary,
      display: 'none',
    },
    lineOverActive: {
      transform: 'scaleY(1)',
      display: 'block',
    },
    label,
    item: {
      padding: '12px 14px',
      cursor: 'pointer',
    },
    itemLabel: {
      fontSize: '16px',
    },
  };
};

interface Item {
  value: any;
  label: string;
}

interface OnChangeTextFn {
  (value: any): void;
}

interface WebDropdownProps {
  data: Item[];
  label: string;
  onChangeText: OnChangeTextFn;
  style: CSSProperties;
  value: any;
  errorVisible?: boolean;
  onClick: (e: any) => void;
  onClose: () => void;
  onOpen: () => void;
  disabled: boolean;
  placeHolderOnly?: boolean;
}

export const WebDropdown = ({
  data = [],
  label,
  onChangeText,
  style,
  value,
  errorVisible,
  onClose,
  onOpen,
  disabled,
  placeHolderOnly,
}: WebDropdownProps) => {
  const selectedItem = data?.find(item => item.value === value) || null;
  const [isItemSelect, setIsItemSelected] = useState(false);
  const { isOpen, getToggleButtonProps, getLabelProps, getMenuProps, highlightedIndex, getItemProps } = useSelect({
    items: data,
    selectedItem,
    onSelectedItemChange: args => {
      setIsItemSelected(true);
      onChangeText(args.selectedItem?.value);
    },
    itemToString: (item: Item | null) => item?.label || '',
  });

  const menuOpenStyles = isOpen ? { display: 'block' } : {};

  const { colors } = useAppTheme();

  const styles = getStyles({ colors, isItemSelect, errorVisible, disabled });

  const getStyleForItem = (themeColors: ThemeColors, selected: boolean) => {
    if (selected) {
      return {
        ...styles.item,
        backgroundColor: themeColors.highlight,
      };
    }

    return styles.item;
  };

  const [focused, setFocused] = useState<boolean>(false);

  const getToggleProps = () => {
    const props = getToggleButtonProps();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !isOpen) {
        props.onClick(e);
      }
    };

    return { ...props, onKeyDown };
  };

  const getLineStyles = () => {
    if (focused) {
      return {
        ...styles.lineOver,
        ...styles.lineOverActive,
      };
    }
    return styles.lineOver;
  };

  const toggleProps = getToggleProps();
  const labelProps = getLabelProps();

  const onFocus = () => {
    setFocused(true);
  };

  const onBlur = () => {
    setFocused(false);
  };

  React.useEffect(() => {
    isOpen ? onOpen() : onClose();
  }, [isOpen]);

  const Affordance = () => {
    const affordanceStyles = getAffordanceStyles(colors, disabled);
    return (
      <div style={affordanceStyles.arrow}>
        <svg style={affordanceStyles.affordance} focusable="false" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </div>
    );
  };

  const InoutLabel = () => {
    if (selectedItem || (!placeHolderOnly && isItemSelect)) {
      return (
        <Text {...labelProps} style={styles.label}>
          {label}
        </Text>
      );
    }
    return <div />;
  };

  return (
    <div style={styles.wrapper} onFocus={onFocus} onBlur={onBlur}>
      <InoutLabel />

      <button type="button" {...toggleProps} style={{ ...styles.trigger, ...style }} disabled={disabled}>
        <Text {...labelProps} style={[styles.inputLabel, styles.itemLabel]}>
          {selectedItem?.label || label}
        </Text>
        <div style={styles.line} />
        <div style={getLineStyles()} />
        <Affordance />
      </button>
      <ul {...getMenuProps()} style={{ ...styles.menuStyles, ...menuOpenStyles }}>
        {isOpen &&
          data.map((item, index) => (
            <li
              style={getStyleForItem(colors, highlightedIndex === index)}
              key={`${item.value}`}
              {...getItemProps({ item, index })}
            >
              <Text style={styles.itemLabel as any}>{item.label}</Text>
            </li>
          ))}
      </ul>
    </div>
  );
};
