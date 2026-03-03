import React, { useCallback, useState } from 'react';
import { Keyboard, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import GlobalStyles, { ThemeColors } from '../lib/GlobalStyles';
import { Utility } from '../lib/Utility';
import { useCustomHeaderWithButtonAsync } from '../lib/components/CustomHeaderComponent';
import { UserProfile } from '../lib/models/UserProfile';
import dataContext from '../lib/models/DataContext';
import { FormErrorMessageComponent } from '../lib/components/FormErrorMessageComponent';
import BaseTextInput from '../lib/base-components/BaseTextInput';

const appVersion: string = require('../../package.json').version;

const ProfileScreen = ({ navigation, route }: any) => {
    const [userProfile, setUserProfile] = useState<UserProfile>(Utility.GetUserProfile());
    const [name, setName] = useState(userProfile.name);
    const [surname, setSurname] = useState(userProfile.surname);
    const [email, setEmail] = useState(userProfile.email ? userProfile.email : "nota-spese@tourleadermanagement.ch");
    const [validationErrors, setValidationErrors] = useState({});

    useFocusEffect(
        useCallback(() => {
            useCustomHeaderWithButtonAsync(navigation.getParent(), `Profilo Tour Leader`, () => save(), undefined, undefined, false, 'salva');
            return () => {
                navigation.getParent()?.setOptions({ headerTitle: undefined });
            };
        }, [navigation, name, surname, email])
    );

    const save = () => {
        if (!validate()) {
            return;
        }
        let profile = new UserProfile();
        profile.name = name ? name.trim() : '';
        profile.surname = surname ? surname.trim() : '';
        profile.email = email ? email.trim() : '';
        dataContext.UserProfile.saveData([profile]);
        setUserProfile(profile);
        console.log("AH, ", profile);
        Utility.ShowSuccessMessage("Profilo aggiornato correttamente");
        Keyboard.dismiss();
    };

    const validate = (): boolean => {
        let isValid = true;
        let validationErrorsTemp = {};
        if (!name) {
            validationErrorsTemp = { ...validationErrorsTemp, name: 'Campo obbligatorio' };
            isValid = false;
        }
        if (!surname) {
            validationErrorsTemp = { ...validationErrorsTemp, surname: 'Campo obbligatorio' };
            isValid = false;
        }
        if (!email) {
            validationErrorsTemp = { ...validationErrorsTemp, email: 'Campo obbligatorio' };
            isValid = false;
        }
        setValidationErrors(validationErrorsTemp);
        return isValid;
    }

    const refreshData = () => {
        setUserProfile(Utility.GetUserProfile());
    }

    Utility.OnFocus({ navigation: navigation, onFocusAction: () => refreshData() });

    const versionFile = Utility.GetVersionData()?.versionFile;
    const isIOS = Utility.IsIOS();
    const platformLabel = isIOS ? 'iOS' : 'Android';
    const platformVersionInfo = isIOS ? versionFile?.ios : versionFile?.android;
    const platformOsVersion = typeof Platform.Version === 'string'
        ? Platform.Version
        : `${Platform.Version}`;
    const appMode = __DEV__ ? 'Debug' : 'Produzione';
    const normalizeVersion = (value?: string) => value && value !== '0' ? value : 'n/d';

    return (
        <ScrollView contentContainerStyle={[GlobalStyles.container, styles.form]}>
            <View style={styles.field}>
                <Text style={styles.label}>Nome</Text>
                <BaseTextInput
                    value={name}
                    placeholder="es. Mario"
                    onChangeText={setName}
                    hasError={"name" in validationErrors}
                />
                <FormErrorMessageComponent text='Campo obbligatorio' field='name' validationArray={validationErrors} />
            </View>
            <View style={styles.field}>
                <Text style={styles.label}>Cognome</Text>
                <BaseTextInput
                    value={surname}
                    placeholder="es. Rossi"
                    onChangeText={setSurname}
                    hasError={"surname" in validationErrors}
                />
                <FormErrorMessageComponent text='Campo obbligatorio' field='surname' validationArray={validationErrors} />
            </View>
            <View style={styles.field}>
                <Text style={styles.label}>Email azienda (per invio nota spesa)</Text>
                <BaseTextInput
                    value={email}
                    placeholder="es. tl@gmail.com"
                    keyboardType='email-address'
                    autoCapitalize='none'
                    onChangeText={setEmail}
                    hasError={"email" in validationErrors}
                />
                <FormErrorMessageComponent text='Campo obbligatorio' field='email' validationArray={validationErrors} />
            </View>

            <View style={styles.infoSection}>
                <Text style={styles.infoSectionTitle}>Info applicazione</Text>
                <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Versione {platformLabel}</Text>
                        <Text style={styles.infoValue}>{appVersion}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Versione OS</Text>
                        <Text style={styles.infoValue}>{platformOsVersion}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Modalità app</Text>
                        <Text style={styles.infoValue}>{appMode}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Ultima versione disponibile</Text>
                        <Text style={styles.infoValue}>{normalizeVersion(platformVersionInfo?.latest_version)}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Versione minima supportata</Text>
                        <Text style={styles.infoValue}>{normalizeVersion(platformVersionInfo?.min_supported_version)}</Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    )
};

const styles = StyleSheet.create({
    form: {
        paddingVertical: 10,
    },
    field: {
        marginTop: 15,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 6,
        color: ThemeColors.black,
    },
    infoSection: {
        marginTop: 24,
        marginBottom: 16,
    },
    infoSectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: ThemeColors.black,
        marginBottom: 10,
    },
    infoCard: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 16,
        backgroundColor: '#f8f9fb',
        overflow: 'hidden',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    infoLabel: {
        fontSize: 13,
        color: '#4b5563',
        flex: 1,
        marginRight: 12,
    },
    infoValue: {
        fontSize: 13,
        color: ThemeColors.black,
        fontWeight: '600',
        textAlign: 'right',
    },
});

export default ProfileScreen;
