import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  PressableStateCallbackType,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import { ThemeColors } from '../../lib/GlobalStyles';

type Variant = 'primary' | 'outline';

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: Variant;
  style?: StyleProp<ViewStyle>;
}

const BaseButton = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  style,
}: Props) => {
  const isPrimary = variant === 'primary';

  const buttonStyle = ({
    pressed,
  }: PressableStateCallbackType): StyleProp<ViewStyle> => [
    styles.base,
    isPrimary ? styles.primary : styles.outline,
    pressed && !disabled ? styles.pressed : null,
    (disabled || loading) && styles.disabled,
    style,
  ];

  return (
    <Pressable onPress={onPress} disabled={disabled || loading} style={buttonStyle}>
      {loading ? (
        <ActivityIndicator
          color={isPrimary ? ThemeColors.white : ThemeColors.primary}
          style={styles.spinner}
        />
      ) : null}
      <Text style={[styles.text, isPrimary ? styles.textPrimary : styles.textOutline]}>
        {title}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  primary: {
    backgroundColor: ThemeColors.primary,
    borderColor: ThemeColors.primary,
  },
  outline: {
    backgroundColor: ThemeColors.white,
    borderColor: ThemeColors.primary,
  },
  pressed: {
    opacity: 0.9,
  },
  disabled: {
    opacity: 0.6,
  },
  spinner: {
    marginRight: 8,
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  textPrimary: {
    color: ThemeColors.white,
  },
  textOutline: {
    color: ThemeColors.primary,
  },
});

export default BaseButton;
