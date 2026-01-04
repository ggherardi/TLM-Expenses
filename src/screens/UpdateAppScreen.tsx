import React, { useEffect } from 'react';
import { Image, SafeAreaView, StyleSheet, Text, View, Linking, Pressable } from 'react-native';
import { Images } from '../assets/Images';
import { ThemeColors } from '../lib/GlobalStyles';
import { VersionFile } from '../lib/models/VersionFile';
import { Utility } from '../lib/Utility';

type UpdateAppProps = {
  navigation: any;
  route: {
    params?: {
      message?: string;
      versionFile?: VersionFile;
    };
  };
};

const UpdateApp = ({ navigation, route }: UpdateAppProps) => {
  const message =
    route?.params?.message ??
    'È disponibile una nuova versione. Aggiorna l’app per continuare a utilizzare tutte le funzionalità.';
  const storeUrl = Utility.IsIOS()
    ? route.params?.versionFile?.ios?.store_url
    : route.params?.versionFile?.android?.store_url;
  useEffect(() => {
    // Hide header and disable gestures so the user cannot leave this screen.
    navigation?.setOptions?.({ headerShown: false, gestureEnabled: false });
  }, [navigation]);

  const GoToStore = (internalStoreUrl: string) => {
    Linking.openURL(internalStoreUrl);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.logoWrapper}>
          <Image source={Images.tlm_logo.rnSource} style={styles.logo} resizeMode="contain" />
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>Aggiorna l’app</Text>
          <Text style={styles.message}>{message}</Text>
          {storeUrl ? (
            <Pressable style={styles.button} onPress={() => GoToStore(storeUrl)}>
              <Text style={styles.buttonText}>Vai allo Store</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  logo: {
    height: 300,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    // color: '#111',
    color: ThemeColors.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    // color: '#333',
    color: ThemeColors.primary,
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    marginTop: 24,
    backgroundColor: ThemeColors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default UpdateApp;
