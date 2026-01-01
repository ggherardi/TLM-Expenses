import React from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import { ThemeColors } from '../GlobalStyles';
import BaseIcon, { IconName } from '../base-components/BaseIcon';

export const renderRightAction = (text: string, icon: IconName, color: string, action: Function, swipableRef: any) => {
  return (
    <Animated.View style={{ flex: 1, transform: [{ translateX: 0 }] }}>
      <RectButton
        style={[styles.rightAction, { backgroundColor: color }]}
        onPress={() => action()}>
        <BaseIcon name={icon} size={24} color={ThemeColors.white} />
        <Text style={styles.label} numberOfLines={1}>{text}</Text>
      </RectButton>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  rightAction: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  label: {
    color: ThemeColors.white,
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
});
