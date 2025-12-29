import { FormControl, Input, NativeBaseProvider, ScrollView } from '@gluestack-ui/themed-native-base';
import React, { Keyboard, StyleSheet } from 'react-native';
import GlobalStyles from '../lib/GlobalStyles';
import { Utility } from '../lib/Utility';
import { useCustomHeaderWithButtonAsync } from '../lib/components/CustomHeaderComponent';
import { UserProfile } from '../lib/models/UserProfile';
import { useEffect, useState } from 'react';
import dataContext from '../lib/models/DataContext';
import { FormErrorMessageComponent } from '../lib/components/FormErrorMessageComponent';

const ProfileScreen = ({ navigation, route }: any) => {
    const [userProfile, setUserProfile] = useState<UserProfile>(Utility.GetUserProfile());
    const [name, setName] = useState(userProfile.name);
    const [surname, setSurname] = useState(userProfile.surname);
    const [email, setEmail] = useState(userProfile.email ? userProfile.email : "nota-spese@tourleadermanagement.ch");
    const [validationErrors, setValidationErrors] = useState({});

    useEffect(() => {
        useCustomHeaderWithButtonAsync(navigation.getParent(), `Profilo Tour Leader`, () => save(), undefined, undefined, false, 'salva');
    });

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
        <NativeBaseProvider>
            <ScrollView contentContainerStyle={[GlobalStyles.container]}>
                <FormControl style={GlobalStyles.mt15} isRequired isInvalid={"name" in validationErrors}>
                    <FormControl.Label>Nome</FormControl.Label>
                    <Input defaultValue={name} placeholder="es. Mario" onChange={setName}></Input>
                    <FormErrorMessageComponent text='Campo obbligatorio' field='name' validationArray={validationErrors} />
                </FormControl>
                <FormControl style={GlobalStyles.mt15} isRequired isInvalid={"surname" in validationErrors}>
                    <FormControl.Label>Cognome</FormControl.Label>
                    <Input defaultValue={surname} placeholder="es. Rossi" onChange={setSurname}></Input>
                    <FormErrorMessageComponent text='Campo obbligatorio' field='surname' validationArray={validationErrors} />
                </FormControl>
                <FormControl style={GlobalStyles.mt15} isRequired isInvalid={"email" in validationErrors}>
                    <FormControl.Label>Email azienda (per invio nota spesa)</FormControl.Label>
                    <Input keyboardType='email-address' defaultValue={email} placeholder="es. tl@gmail.com" onChange={setEmail}></Input>
                    <FormErrorMessageComponent text='Campo obbligatorio' field='email' validationArray={validationErrors} />
                </FormControl>
            </ScrollView>
        </NativeBaseProvider>
    )
};

const styles = StyleSheet.create({
    section: {
        paddingBottom: 15
    },
    caption: {
        fontSize: 15,
        fontWeight: 'bold'
    },
    text: {
        fontSize: 15
    }
});

export default ProfileScreen;