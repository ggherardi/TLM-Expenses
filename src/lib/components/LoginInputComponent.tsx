import React from 'react';
import { KeyboardTypeOptions } from 'react-native';
import BaseTextInput from '../base-components/BaseTextInput';

interface ILoginInputProps {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  keyboardType?: KeyboardTypeOptions;
  hasError?: boolean;
}

const LoginInputComponent = (props: ILoginInputProps) => {
  return (
    <BaseTextInput
      value={props.value}
      placeholder={props.placeholder}
      onChangeText={(text: string) => props.onChange(text)}
      keyboardType={props.keyboardType ? props.keyboardType : 'ascii-capable'}
      hasError={props.hasError}
    />
  );
}

export default LoginInputComponent;
