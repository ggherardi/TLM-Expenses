import React, { Pressable, StyleSheet, Text, View } from 'react-native';
import GlobalStyles, { ThemeColors } from '../GlobalStyles';
import { InputSideButton } from './InputSideButtonComponent';

interface ICustomHeaderComponent {
    navigation: any;
    title: string;
    subtitle?: string;
}

interface ICustomHeaderWithButtonComponent {
    // @ts-ignore
    navigation;
    title: string;
    icon?: IconProp;
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

const BaseCustomHeaderComponent = ({ navigation, title, subtitle }: ICustomHeaderComponent) => {
    return (
        <NativeBaseProvider>
            <View>
                {subtitle != undefined && subtitle != "" ? (
                    <VStack>
                        <Text style={[styles.eventName, GlobalStyles.colorWhite]}>{title}</Text>
                        <Text style={[GlobalStyles.colorWhite, { maxWidth: "70%" }]} numberOfLines={1}>{subtitle}</Text>
                    </VStack>
                ) : (
                    <Text style={[styles.eventName, GlobalStyles.colorWhite]}>{title}</Text>
                )}
            </View>
        </NativeBaseProvider>
    );
}

const CustomHeaderWithButtonComponent = ({ navigation, title, subtitle, onClick, icon, isDisabled, buttonText }: ICustomHeaderWithButtonComponent) => {
    return (
        <NativeBaseProvider>
            <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', width: navigation.canGoBack() ? '75%' : '90%' }]}>
                <View style={{ flex: navigation.canGoBack() ? 4 : 6 }}>
                    {subtitle != undefined && subtitle != "" ? (
                        <VStack>
                            <Text style={[styles.eventName, GlobalStyles.colorWhite]} numberOfLines={1}>{title}</Text>
                            <Text style={[GlobalStyles.colorWhite, { maxWidth: "90%" }]} numberOfLines={1}>{subtitle}</Text>
                        </VStack>
                    ) : (
                        <Text style={[styles.eventName, GlobalStyles.colorWhite]} numberOfLines={1}>{title}</Text>
                    )}
                </View>
                <View style={[{ flex: icon ? 1 : 2, flexDirection: 'row', justifyContent: 'center' }]}>
                    <InputSideButton icon={icon} text={buttonText} iconColor={ThemeColors.white} size={25} pressFunction={() => onClick()} isDisabled={isDisabled} iconStyle={{ color: ThemeColors.white }} />
                </View>
            </View>
        </NativeBaseProvider>
    )
}

const CustomHeaderSaveButtonComponent = ({ navigation, title, subtitle, onSave, isDisabled }: ICustomHeaderSaveButtonComponent) => {
    return (
        <NativeBaseProvider>
            <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', width: '75%' }]}>
                <View style={{ flex: 4 }}>
                    {subtitle != undefined && subtitle != "" ? (
                        <VStack>
                            <Text style={[styles.eventName, GlobalStyles.colorWhite]} numberOfLines={1}>{title}</Text>
                            <Text style={[GlobalStyles.colorWhite, { maxWidth: "70%" }]} numberOfLines={1}>{subtitle}</Text>
                        </VStack>
                    ) : (
                        <Text style={[styles.eventName, GlobalStyles.colorWhite]} numberOfLines={1}>{title}</Text>
                    )}
                </View>
                <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
                    <InputSideButton icon={"floppy-disk"} iconColor={ThemeColors.white} size={25} pressFunction={() => onSave()} isDisabled={isDisabled} iconStyle={{ color: ThemeColors.white }} />
                </View>
            </View>
        </NativeBaseProvider>
    )
}

const useCustomHeader = (navigation: any, title: string, subtitle?: string) => {
    navigation.setOptions({
        headerTitle: () => <BaseCustomHeaderComponent navigation={navigation} title={title} subtitle={subtitle} />,
    })
}

export const useCustomHeaderWithButtonAsync = (navigation: any, title: string, onClick: Function, icon?: IconProp, subtitle?: string, isDisabled?: boolean, buttonText?: string) => {
    return new Promise((resolve, reject) => {
        navigation.setOptions({
            headerTitle: () => <CustomHeaderWithButtonComponent navigation={navigation} title={title} icon={icon} subtitle={subtitle} onClick={onClick as Function} isDisabled={isDisabled as boolean} buttonText={buttonText} />,
        })
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
})

export default useCustomHeader;