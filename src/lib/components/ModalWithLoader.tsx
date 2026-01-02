import React from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, View } from 'react-native';
import { ThemeColors } from '../GlobalStyles';

interface IModalLoaderProps {
  isLoading: boolean;
  text?: string,
  size?: ModalLoaderSize;
}

enum ModalLoaderSize {
  small = "small",
  large = "large"
}

const ModalLoaderComponent = (props: IModalLoaderProps) => {
  return (<>
    {
      props.isLoading ? (
        <Modal presentationStyle='overFullScreen' statusBarTranslucent={true} transparent={true} style={[styles.modal]}>
          <View style={{ justifyContent: 'center', height: '100%' }}>
            <View style={[styles.wrapper]}>
            </View>
            <View style={[styles.box]}>
              <View style={[styles.boxSubContainer]}>
                <ActivityIndicator size={props.size ? props.size : "large"} color={ThemeColors.primary} style={[styles.loader]}></ActivityIndicator>
                {props.text ? (
                  <Text style={[styles.titleText]}>{props.text}</Text>
                ) : (<></>)}
            </View>
          </View>
        </View>
        </Modal >
      ) : (<></>)
    }
  </>
  );
}

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    justifyContent: 'center',
  },
  wrapper: {
    backgroundColor: 'gray',
    opacity: 0.5,
    height: '100%'
  },
  titleText: {
    alignSelf: 'center',
    fontSize: 15,
    paddingLeft: 10
  },
  box: {
    justifyContent: 'center',
    alignSelf: 'center',
    position: 'absolute',
    backgroundColor: ThemeColors.white,
    width: 300,
    height: 150,    
  },
  boxSubContainer: {
    justifyContent: 'center',
    flexDirection: 'row',
    padding: 10
  },
  loader: {
  }
});

export default ModalLoaderComponent;