import React, { useCallback, useEffect, useState } from 'react';
import { Keyboard, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import GlobalStyles, { ThemeColors } from '../lib/GlobalStyles';
import { Utility } from '../lib/Utility';
import { useCustomHeaderWithButtonAsync } from '../lib/components/CustomHeaderComponent';
import { UserProfile } from '../lib/models/UserProfile';
import dataContext from '../lib/models/DataContext';
import { FormErrorMessageComponent } from '../lib/components/FormErrorMessageComponent';
import BaseTextInput from '../lib/base-components/BaseTextInput';

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
        }, [navigation])
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
});

export default ProfileScreen;
