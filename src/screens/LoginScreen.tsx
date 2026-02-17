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
  const [email] = useState(userProfile.email);
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    (async () => {
      const compareVersions = (current: string, minimum: string): number => {
        const currentParts = current.split('.').map(p => Number.parseInt(p, 10) || 0);
        const minimumParts = minimum.split('.').map(p => Number.parseInt(p, 10) || 0);
        const maxLen = Math.max(currentParts.length, minimumParts.length);
        for (let i = 0; i < maxLen; i++) {
          const c = currentParts[i] ?? 0;
          const m = minimumParts[i] ?? 0;
          if (c > m) return 1;
          if (c < m) return -1;
        }
        return 0;
      };

      const needsUpdate = (versionFile?: VersionFile): boolean => {
        if (!versionFile) {
          return false;
        }
        const minVersionToCheck = Utility.IsIOS()
          ? versionFile.ios.min_supported_version
          : versionFile.android.min_supported_version;
        const comparison = compareVersions(appVersion, minVersionToCheck);
        const mustUpdate = comparison < 0;
        console.log(`Version check -> appVersion=${appVersion}, minSupported=${minVersionToCheck}, comparison=${comparison}, mustUpdate=${mustUpdate}`);
        return mustUpdate;
      };

      let versionFileToCheck: VersionFile | undefined = Utility.GetVersionData()?.versionFile;

      try {
        const versionFileUrl = !__DEV__ ? Constants.VersionCheck.VersionFileUrl : Constants.VersionCheck.VersionFileUrlDebug;
        console.log("VersionFileUrl: ", versionFileUrl);
        const response = await fetch(versionFileUrl, {
          method: 'GET',
          headers: { Accept: 'application/json' }, 
        });
        if (!response.ok) {
          throw new Error(`Version file fetch failed with status ${response.status}`);
        }
        const versionFileJson = await response.json();
        versionFileToCheck = versionFileJson;

        const versionData = new VersionData();
        versionData.id = 1;
        versionData.versionFile = versionFileJson;
        dataContext.Version.saveData([versionData]);
      } catch (err) {
        console.log("Errore while fetching version file, using cached data if present", err);
      }

      if (needsUpdate(versionFileToCheck)) {
        navigation.replace(Constants.Navigation.UpdateApp, { versionFile: versionFileToCheck });
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
  }, [navigation, userProfile]);

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
