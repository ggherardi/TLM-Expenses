import React from 'react';
import { Animated, StyleSheet } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import { InputSideButton } from './InputSideButtonComponent';
import { ThemeColors } from '../GlobalStyles';

export const renderRightAction = (text: string, icon: IconProp, color: string, action: Function, swipableRef: any) => {
  return (
      <Animated.View style={{ flex: 1, transform: [{ translateX: 0 }] }}>
          <RectButton
              style={[styles.rightAction, { backgroundColor: color }]}
              onPress={() => action()}>
              <InputSideButton text={text} fontSize={9} textPosition={'bottom'} icon={icon} pressFunction={(() => {})} iconColor={ThemeColors.white} stretchHeight={true} />
          </RectButton>
      </Animated.View>
  );
};

const styles = StyleSheet.create({
  rightAction: {
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
  },
});