import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import GlobalStyles, { ThemeColors } from '../GlobalStyles';
import BaseIcon, { IconName } from '../base-components/BaseIcon';

interface ICustomHeaderComponent {
    navigation: any;
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
}

interface ICustomHeaderSaveButtonComponent {
    // @ts-ignore
    navigation;
    title: string;
    subtitle?: string;
    onSave: Function;
    isDisabled: boolean;
}

const HeaderButton = ({ icon, text, onPress, isDisabled, iconStyle }: { icon?: IconName; text?: string; onPress: Function; isDisabled?: boolean; iconStyle?: StyleProp<ViewStyle> }) => {
    const buttonColor = isDisabled ? ThemeColors.inactive : ThemeColors.white;
    const isIconOnly = icon && !text;
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
            {icon && (
                <BaseIcon
                    name={icon}
                    size={22}
                    color={buttonColor}
                    style={[
                        text ? styles.iconWithText : styles.iconOnlyIcon,
                        iconStyle,
                    ]}
                />
            )}
            {text && <Text style={[styles.actionText, { color: buttonColor }]} numberOfLines={1}>{text}</Text>}
        </Pressable>
    );
}

const BaseCustomHeaderComponent = ({ navigation, title, subtitle }: ICustomHeaderComponent) => {
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

const CustomHeaderWithButtonComponent = ({ navigation, title, subtitle, onClick, icon, isDisabled, buttonText, iconStyle }: ICustomHeaderWithButtonComponent) => {
    return (
        <View style={[styles.headerRow, { width: navigation.canGoBack() ? '75%' : '90%' }]}>
            <View style={{ flex: navigation.canGoBack() ? 4 : 6 }}>
                {subtitle != undefined && subtitle != "" ? (
                    <View style={styles.titleStack}>
                        <Text style={[styles.eventName, GlobalStyles.colorWhite]} numberOfLines={1}>{title}</Text>
                        <Text style={[GlobalStyles.colorWhite, styles.subtitle]} numberOfLines={1}>{subtitle}</Text>
                    </View>
                ) : (
                    <Text style={[styles.eventName, GlobalStyles.colorWhite]} numberOfLines={1}>{title}</Text>
                )}
            </View>
            <View style={[styles.actionWrapper, { flex: 1, justifyContent: 'flex-end' }]}>
                <HeaderButton icon={icon} onPress={onClick} isDisabled={isDisabled} iconStyle={iconStyle} />
            </View>
        </View>
    )
}

const CustomHeaderSaveButtonComponent = ({ navigation, title, subtitle, onSave, isDisabled }: ICustomHeaderSaveButtonComponent) => {
    return (
        <View style={[styles.headerRow, { width: '75%' }]}>
            <View style={{ flex: 4 }}>
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
                <HeaderButton icon={'save'} onPress={onSave} isDisabled={isDisabled} />
            </View>
        </View>
    )
}

const useCustomHeader = (navigation: any, title: string, subtitle?: string) => {
    navigation.setOptions({
        headerTitle: () => <BaseCustomHeaderComponent navigation={navigation} title={title} subtitle={subtitle} />,
    })
}

export const useCustomHeaderWithButtonAsync = (navigation: any, title: string, onClick: Function, icon?: IconName, subtitle?: string, isDisabled?: boolean, buttonText?: string, iconStyle?: StyleProp<ViewStyle>) => {
    return new Promise((resolve, reject) => {
        navigation.setOptions({
            headerTitle: () => <CustomHeaderWithButtonComponent navigation={navigation} title={title} icon={icon} iconStyle={iconStyle} subtitle={subtitle} onClick={onClick as Function} isDisabled={isDisabled as boolean} buttonText={buttonText} />,
        });
        resolve(true);
    });
}

export const useCustomHeaderSaveButton = (navigation: any, title: string, onSave: Function, subtitle?: string, isDisabled?: boolean) => {
    navigation.setOptions({
        headerTitle: () => <CustomHeaderSaveButtonComponent navigation={navigation} title={title} subtitle={subtitle} onSave={onSave as Function} isDisabled={isDisabled as boolean} />,
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    actionWrapper: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
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
        textTransform: 'uppercase',
    },
})

export default useCustomHeader;
