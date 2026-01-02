import React from 'react';
import { ActivityIndicator, ColorValue } from 'react-native';
import { ThemeColors } from '../GlobalStyles';

interface ILoaderProps {
  size?: LoaderSize;
  color?: ColorValue;
}

export enum LoaderSize {
  small = "small",
  large = "large"
}

const LoaderComponent = (props: ILoaderProps) => {
  return (
    <ActivityIndicator size={props.size ? props.size : "large"} color={props.color ? props.color : ThemeColors.primary}></ActivityIndicator>
  );
}

export default LoaderComponent;