import React, { createContext, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { ThemeColors } from '../GlobalStyles';

type ToastType = 'success' | 'error' | 'info';

export type ToastOptions = {
  message: string;
  type?: ToastType;
  duration?: number;
};

type ToastContextValue = {
  show: (options: ToastOptions) => void;
};

export const ToastContext = createContext<ToastContextValue | null>(null);

// Lightweight service to trigger toasts from non-React modules (e.g., Utility)
let externalShow: ((options: ToastOptions) => void) | null = null;
export const ToastService = {
  show: (options: ToastOptions) => externalShow && externalShow(options),
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toast, setToast] = useState<ToastOptions | null>(null);
  const [visible, setVisible] = useState(false);
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const anim = useRef(new Animated.Value(0)).current;

  const show = (options: ToastOptions) => {
    if (hideTimeout.current) {
      clearTimeout(hideTimeout.current);
    }
    setToast(options);
    setVisible(true);
    Animated.timing(anim, {
      toValue: 1,
      duration: 200,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();

    hideTimeout.current = setTimeout(() => {
      Animated.timing(anim, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start(() => setVisible(false));
    }, options.duration ?? 2000);
  };

  useEffect(() => {
    externalShow = show;
    return () => {
      externalShow = null;
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
    };
  }, []);

  const contextValue = useMemo(() => ({ show }), []);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-40, 0],
  });

  const bgColor =
    toast?.type === 'success'
      ? ThemeColors.success
      : toast?.type === 'error'
        ? ThemeColors.danger
        : ThemeColors.info;

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {visible && toast ? (
        <Animated.View style={[styles.container, { transform: [{ translateY }] }]}>
          <View style={[styles.toast, { backgroundColor: bgColor }]}>
            <Text style={styles.text}>{toast.message}</Text>
          </View>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 999,
    elevation: 6,
    paddingHorizontal: 10,
  },
  toast: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  text: {
    color: ThemeColors.white,
    fontWeight: '600',
  },
});
