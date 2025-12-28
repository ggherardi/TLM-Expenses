import React from 'react';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';
import { ThemeColors } from '../GlobalStyles';

type Props = TextInputProps & {
  hasError?: boolean;
};

const BaseTextInput = ({ hasError, style, ...rest }: Props) => {
  return (
    <TextInput
      placeholderTextColor="#6b7280"
      style={[
        styles.input,
        style,
        hasError ? { borderColor: ThemeColors.danger } : null,
      ]}
      {...rest}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#f5f5f5',
    fontSize: 16,
  },
});

export default BaseTextInput;
