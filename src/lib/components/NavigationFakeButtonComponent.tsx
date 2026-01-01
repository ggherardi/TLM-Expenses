import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import BaseIcon, { IconName } from '../base-components/BaseIcon';
import GlobalStyles, { ThemeColors } from '../GlobalStyles';

interface INavigationFakeButtonProps {
  pressFunction: Function;
  icon: IconName;
  iconColor?: string;
  iconStyle?: any;
  stretchHeight?: boolean;
  size?: number;
  isDisabled?: boolean;
}

export const NavigationFakeButtonComponent = ({ pressFunction, icon, iconColor = ThemeColors.white, iconStyle, stretchHeight, size, isDisabled = false }: INavigationFakeButtonProps) => (
  <Pressable onPress={() => pressFunction()} style={({ pressed }) => [{
    opacity: pressed ? 0.2 : 1,
  }, styles.btnBox]} disabled={isDisabled}>
    <View style={[GlobalStyles.flexRow, styles.button]}>
      <BaseIcon
        style={iconStyle ? iconStyle : GlobalStyles.iconPrimary}
        name={icon}
        size={size ? size : 20}
        color={isDisabled ? 'gray' : iconColor}
      />
    </View>
  </Pressable>);

const styles = StyleSheet.create({
  btnBox: {
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  button: {
    backgroundColor: ThemeColors.primary,
    borderColor: ThemeColors.primary,
    borderWidth: 1,
    padding: 10,
    borderRadius: 30
  }
})
