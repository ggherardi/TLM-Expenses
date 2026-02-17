import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ThemeColors } from '../lib/GlobalStyles';
import { Utility } from '../lib/Utility';
import { UserProfile } from '../lib/models/UserProfile';
import React, { useState, useEffect } from 'react';
import dataContext from '../lib/models/DataContext';
import LoginInputComponent from '../lib/components/LoginInputComponent';
import { Images } from '../assets/Images';
import { Constants } from '../lib/Constants';
import { VersionFile } from '../lib/models/VersionFile';
import { VersionData } from '../lib/models/VersionData';
import BaseButton from '../lib/base-components/BaseButton';
import BaseIcon from '../lib/base-components/BaseIcon';

const appVersion: string = require('../../package.json').version;

const LoginScreen = ({ navigation }: any) => {
  const [userProfile] = useState<UserProfile>(Utility.GetUserProfile());
  const [name, setName] = useState(userProfile.name);
  const [surname, setSurname] = useState(userProfile.surname);
  const [email, setEmail] = useState(userProfile.email);
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    (async () => {
      let doesAppNeedUpdate = false;
      let versionFileJson: VersionFile = {
        version_schema: 1,
        global_message: null,
        maintenance: { enabled: false, message: '' },
        ios: {
          latest_version: appVersion,
          min_supported_version: appVersion,
          force_update: false,
          store_url: '',
          message: '',
          changelog: [],
        },
        android: {
          latest_version: appVersion,
          min_supported_version: appVersion,
          force_update: false,
          store_url: '',
          message: '',
          changelog: [],
        },
      };

      const needsUpdateOffline = (versionFile: VersionFile): boolean => {
        console.log("Checking if version file exists: ", versionFile);
        if (!versionFile) {
          return false;
        }
        const minVersionToCheck = Utility.IsIOS() ? versionFile.ios.min_supported_version : versionFile.android.min_supported_version;
        console.log(`appVersion: ${appVersion}, minVersionToCheck: ${minVersionToCheck}, appVersion < minVersionToCheck: ${appVersion < minVersionToCheck}`);
        return Number(appVersion) < Number(minVersionToCheck);
      };

      const versionData: VersionData = Utility.GetVersionData();
      if (needsUpdateOffline(versionData.versionFile)) {
        navigation.replace(Constants.Navigation.UpdateApp, { versionFile: versionData.versionFile });
        return;
      }

      try {
        const versionFileUrl = !__DEV__ ? Constants.VersionCheck.VersionFileUrl : Constants.VersionCheck.VersionFileUrlDebug;
        console.log("VersionFileUrl: ", versionFileUrl);
        const jsonPromise = await fetch(versionFileUrl, {
          method: 'GET',
          headers: { Accept: 'application/json' }, 
        });
        versionFileJson = await jsonPromise.json();
        const versionData = new VersionData();
        versionData.id = 1;
        versionData.versionFile = versionFileJson;
        dataContext.Version.saveData([versionData]);
        console.log(versionFileJson);
        const minVersionToCheck = Utility.IsIOS() ? versionFileJson.ios.min_supported_version : versionFileJson.android.min_supported_version;
        console.log(`${appVersion} < ${minVersionToCheck}? ${appVersion < minVersionToCheck}`);
        console.log(`Version to check: ${minVersionToCheck}`);
        doesAppNeedUpdate = Number(appVersion) < Number(minVersionToCheck);
        console.log("Does app need updated? ", doesAppNeedUpdate);
      } catch (err) {
        console.log("Errore while fetching", err);
      }
      if (doesAppNeedUpdate) {
        console.log("navigating with ", versionFileJson.version_schema);
        navigation.replace(Constants.Navigation.UpdateApp, { versionFile: versionFileJson });
        return;
      }
      if (userProfile && userProfile.name && userProfile.surname) {
        console.log("Logging in..");
        setIsLoading(true);
        // Utility.ShowSuccessMessage(`Bentornato, ${userProfile.name}`);
        navigation.replace(Constants.Navigation.Home);
        setIsLoading(false);
      }
    })();
  }, []);

  const login = () => {
    setIsDisabled(true);
    setIsLoading(true);
    if (!validate()) {
      setIsDisabled(false);
      setIsLoading(false);
      return;
    }
    console.log("Loading: ", isLoading);
    const profile = new UserProfile();
    profile.name = name ? name.trim() : '';
    profile.surname = surname ? surname.trim() : '';
    profile.email = email ? email.trim() : 'nota-spese@tourleadermanagement.ch';
    dataContext.UserProfile.saveData([profile]);
    // Utility.ShowSuccessMessage(`Bentornato, ${profile.name}`);
    navigation.replace(Constants.Navigation.Home);
    setIsLoading(false);
    setIsDisabled(false);
  };

  const validate = (): boolean => {
    let isValid = true;
    let validationErrorsTemp: Record<string, string> = {};
    if (!name) {
      validationErrorsTemp = { ...validationErrorsTemp, name: 'Campo obbligatorio' };
      isValid = false;
    }
    if (!surname) {
      validationErrorsTemp = { ...validationErrorsTemp, surname: 'Campo obbligatorio' };
      isValid = false;
    }
    // if (!email) {
    //   validationErrorsTemp = { ...validationErrorsTemp, email: 'Campo obbligatorio' };
    //   isValid = false;
    // }
    setValidationErrors(validationErrorsTemp);
    return isValid;
  }

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={Images.tlm_logo_transparent.rnSource} style={[styles.image]} />
      </View>
      {showInfo ? (
        <Text style={styles.infoText}>
          Inserire nome e cognome che verranno visualizzati da TLM quando verrà inviata la nota spese. Sarà sempre possibile cambiarli dalle impostazioni.
        </Text>
      ) : null}
      <View style={styles.inputsContainer}>
        <View style={styles.inputGroup}>
          <LoginInputComponent value={name} placeholder='nome*' onChange={setName} hasError={'name' in validationErrors} />
          {'name' in validationErrors ? (
            <Text style={styles.errorText}>Campo obbligatorio</Text>
          ) : null}
        </View>
        <View style={styles.inputGroup}>
          <LoginInputComponent value={surname} placeholder='cognome*' onChange={setSurname} hasError={'surname' in validationErrors} />
          {'surname' in validationErrors ? (
            <Text style={styles.errorText}>Campo obbligatorio</Text>
          ) : null}
        </View>
        {/* <View style={styles.inputGroup}>
          <LoginInputComponent value={email} placeholder='email*' onChange={setEmail} keyboardType='email-address' hasError={'email' in validationErrors} />
        </View> */}
      </View>
      <View style={styles.buttonsRow}>
        <TouchableOpacity
          style={[styles.iconButton, showInfo ? styles.iconButtonActive : null]}
          onPress={() => setShowInfo(!showInfo)}
        >
          <BaseIcon color={ThemeColors.primary} name='info' />
        </TouchableOpacity>
        <BaseButton
          title="SALVA"
          onPress={() => login()}
          disabled={isDisabled}
          loading={isLoading}
          style={styles.saveButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: ThemeColors.white,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  image: {
    width: 250,
    alignSelf: 'center',
    resizeMode: 'contain',
  },
  infoText: {
    textAlign: 'center',
    color: ThemeColors.primary,
    marginBottom: 12,
    fontSize: 14,
  },
  inputsContainer: {
    width: '100%',
  },
  inputGroup: {
    width: '100%',
    marginBottom: 16,
  },
  errorText: {
    color: ThemeColors.danger,
    marginTop: 6,
    fontSize: 13,
  },
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
  },
  iconButton: {
    width: 54,
    height: 54,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: ThemeColors.primary,
    backgroundColor: ThemeColors.white,
    marginRight: 12,
  },
  iconButtonActive: {
    backgroundColor: '#f2e6e6',
  },
  saveButton: {
    flex: 1,
  },
});

export default LoginScreen;
