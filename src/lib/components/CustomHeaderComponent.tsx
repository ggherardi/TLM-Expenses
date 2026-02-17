import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import GlobalStyles, { ThemeColors } from '../GlobalStyles';
import BaseIcon, { IconName } from '../base-components/BaseIcon';

interface ICustomHeaderComponent {
    title: string;
    subtitle?: string;
}

interface ICustomHeaderWithButtonComponent {
    // @ts-ignore
    navigation;
    title: string;
    icon?: IconName;
    iconStyle?: StyleProp<ViewStyle>;
    onClick: Function;
    subtitle?: string;
    isDisabled?: boolean;
    buttonText?: string;
    showIcon?: boolean;
}

interface ICustomHeaderSaveButtonComponent {
    title: string;
    subtitle?: string;
    onSave: Function;
    isDisabled: boolean;
}

const HeaderButton = ({
    icon,
    text,
    onPress,
    isDisabled,
    showIcon,
    iconStyle,
}: {
    icon?: IconName;
    text?: string;
    onPress: Function;
    isDisabled?: boolean;
    showIcon?: boolean;
    iconStyle?: StyleProp<ViewStyle>;
}) => {
    const buttonColor = isDisabled ? ThemeColors.inactive : ThemeColors.white;
    const normalizedText = text ? text.toLowerCase() : '';
    const shouldRenderIcon = !!icon && !!showIcon;
    const isIconOnly = shouldRenderIcon && !normalizedText;
    return (
        <Pressable
            disabled={isDisabled}
            onPress={() => onPress()}
            style={({ pressed }) => [
                styles.actionButton,
                isIconOnly && styles.iconOnlyButton,
                pressed && !isDisabled && styles.actionButtonPressed,
                isDisabled && styles.actionButtonDisabled
            ]}>
            {shouldRenderIcon && (
                <BaseIcon
                    name={icon as IconName}
                    size={22}
                    color={buttonColor}
                    style={[
                        normalizedText ? styles.iconWithText : styles.iconOnlyIcon,
                        iconStyle,
                    ]}
                />
            )}
            <Text style={[styles.actionText, { color: buttonColor }]} numberOfLines={1}>{normalizedText}</Text>
        </Pressable>
    );
}

const BaseCustomHeaderComponent = ({ title, subtitle }: ICustomHeaderComponent) => {
    return (
        <View>
            {subtitle != undefined && subtitle != "" ? (
                <View style={styles.titleStack}>
                    <Text style={[styles.eventName, GlobalStyles.colorWhite]} numberOfLines={1}>{title}</Text>
                    <Text style={[GlobalStyles.colorWhite, styles.subtitle]} numberOfLines={1}>{subtitle}</Text>
                </View>
            ) : (
                <Text style={[styles.eventName, GlobalStyles.colorWhite]} numberOfLines={1}>{title}</Text>
            )}
        </View>
    );
}

const CustomHeaderWithButtonComponent = ({ navigation, title, subtitle, onClick, icon, isDisabled, buttonText, iconStyle, showIcon }: ICustomHeaderWithButtonComponent) => {
    const fallbackTextByIcon: Partial<Record<IconName, string>> = {
        save: 'salva',
        'paper-plane': 'invia',
        'file-pdf': 'inviare',
        pencil: 'modifica',
    };
    const fallbackText = (icon ? fallbackTextByIcon[icon] : '') || 'azione';
    const resolvedText = buttonText !== undefined
        ? buttonText.toLowerCase()
        : showIcon ? '' : fallbackText.toLowerCase();

    return (
        <View style={styles.headerRow}>
            <View style={styles.titleContainer}>
                {subtitle != undefined && subtitle != "" ? (
                    <View style={styles.titleStack}>
                        <Text style={[styles.eventName, GlobalStyles.colorWhite]} numberOfLines={1}>{title}</Text>
                        <Text style={[GlobalStyles.colorWhite, styles.subtitle]} numberOfLines={1}>{subtitle}</Text>
                    </View>
                ) : (
                    <Text style={[styles.eventName, GlobalStyles.colorWhite]} numberOfLines={1}>{title}</Text>
                )}
            </View>
            <View style={[styles.actionWrapper, !navigation.canGoBack() && styles.actionWrapperNoBack]}>
                <HeaderButton icon={icon} showIcon={showIcon} iconStyle={iconStyle} text={resolvedText} onPress={onClick} isDisabled={isDisabled} />
            </View>
        </View>
    )
}

const CustomHeaderSaveButtonComponent = ({ title, subtitle, onSave, isDisabled }: ICustomHeaderSaveButtonComponent) => {
    return (
        <View style={styles.headerRow}>
            <View style={styles.titleContainer}>
                {subtitle != undefined && subtitle != "" ? (
                    <View style={styles.titleStack}>
                        <Text style={[styles.eventName, GlobalStyles.colorWhite]} numberOfLines={1}>{title}</Text>
                        <Text style={[GlobalStyles.colorWhite, styles.subtitle]} numberOfLines={1}>{subtitle}</Text>
                    </View>
                ) : (
                    <Text style={[styles.eventName, GlobalStyles.colorWhite]} numberOfLines={1}>{title}</Text>
                )}
            </View>
            <View style={styles.actionWrapper}>
                <HeaderButton text='salva' onPress={onSave} isDisabled={isDisabled} />
            </View>
        </View>
    )
}

const useCustomHeader = (navigation: any, title: string, subtitle?: string) => {
    navigation.setOptions({
        headerTitle: () => <BaseCustomHeaderComponent title={title} subtitle={subtitle} />,
    })
}

export const useCustomHeaderWithButtonAsync = (navigation: any, title: string, onClick: Function, icon?: IconName, subtitle?: string, isDisabled?: boolean, buttonText?: string, iconStyle?: StyleProp<ViewStyle>, showIcon?: boolean) => {
    return new Promise((resolve) => {
        navigation.setOptions({
            headerTitle: () => <CustomHeaderWithButtonComponent navigation={navigation} title={title} icon={icon} iconStyle={iconStyle} subtitle={subtitle} onClick={onClick as Function} isDisabled={isDisabled as boolean} buttonText={buttonText} showIcon={showIcon} />,
        });
        resolve(true);
    });
}

export const useCustomHeaderSaveButton = (navigation: any, title: string, onSave: Function, subtitle?: string, isDisabled?: boolean) => {
    navigation.setOptions({
        headerTitle: () => <CustomHeaderSaveButtonComponent title={title} subtitle={subtitle} onSave={onSave as Function} isDisabled={isDisabled as boolean} />,
    })
}

const styles = StyleSheet.create({
    eventName: {
        fontSize: 20,
        fontWeight: 'bold'
    },
    subtitle: {
        maxWidth: '90%',
        marginTop: 2,
    },
    titleStack: {
        flexDirection: 'column',
    },
    headerRow: {
        flex: 1,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    titleContainer: {
        flex: 1,
        minWidth: 0,
        paddingRight: 8,
    },
    actionWrapper: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        flexShrink: 0,
    },
    actionWrapperNoBack: {
        paddingRight: 8,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: ThemeColors.white,
        minHeight: 36,
        minWidth: 82,
    },
    actionButtonPressed: {
        opacity: 0.7,
    },
    actionButtonDisabled: {
        borderColor: ThemeColors.inactive,
        opacity: 0.5,
    },
    iconOnlyButton: {
        width: 40,
        height: 40,
        minWidth: 40,
        borderRadius: 20,
        paddingHorizontal: 0,
        paddingVertical: 0,
    },
    iconOnlyIcon: {
        alignSelf: 'center',
        marginLeft: 0,
    },
    iconWithText: {
        marginRight: 6,
    },
    actionText: {
        fontSize: 14,
        fontWeight: '600',
        color: ThemeColors.white,
        textAlign: 'center',
        textTransform: 'none',
    },
})

export default useCustomHeader;
