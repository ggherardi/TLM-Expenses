import React, { useEffect, useState } from 'react';
import BaseTextInput from '../base-components/BaseTextInput';

interface IInputNumber {
    onChange: (value: number | undefined) => void;
    placeholder: string;
    isRequired?: boolean;
    style?: any;
    defaultValue?: number | undefined;
}

export const InputNumber = ({ onChange, placeholder, isRequired, style, defaultValue }: IInputNumber) => {
    const [currentValue, setCurrentValue] = useState<string>(defaultValue !== undefined ? defaultValue.toString() : '');

    useEffect(() => {
        if (defaultValue !== undefined) {
            setCurrentValue(defaultValue.toString());
        }
    }, [defaultValue]);

    const validateNumber = (text: string) => {
        // allow digits, comma and dot; normalize comma to dot
        const normalized = text.replace(',', '.');
        const validRegex = /^[0-9]*\.?[0-9]*$/;
        if (normalized === '') {
            setCurrentValue('');
            onChange(undefined);
            return;
        }

        if (validRegex.test(normalized)) {
            setCurrentValue(normalized);
            const parsed = parseFloat(normalized);
            onChange(isNaN(parsed) ? undefined : parsed);
        }
    };

    return (
        <BaseTextInput
            placeholder={placeholder}
            keyboardType='decimal-pad'
            value={currentValue}
            onChangeText={validateNumber}
            style={style}
            hasError={isRequired && currentValue === ''}
        />
    )
}
