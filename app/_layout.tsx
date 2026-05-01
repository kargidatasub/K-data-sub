import React, { useEffect } from 'react';
import { StatusBar, Platform } from 'react-native';
import { Stack } from 'expo-router';
// 1. Import SafeAreaView again
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets, initialWindowMetrics } from 'react-native-safe-area-context'; 
import { Provider, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur'; 
import * as NavigationBar from 'expo-navigation-bar'; 

import { store, RootState } from '../store/store';
import { setTheme } from '../store/themeSlice';

if (Platform.OS === 'android') {
  NavigationBar.setPositionAsync('absolute');
  NavigationBar.setBackgroundColorAsync('#ffffff00'); 
}

function AppContent() {
  const isDark = useSelector((state: RootState) => state.theme.mode) === 'dark';
  const insets = useSafeAreaInsets(); 

  return (
    // 2. Changed View to SafeAreaView, added edges={['top']}, and set dynamic background colors
    // This color fills the notch/status bar area perfectly depending on your theme!
    <SafeAreaView 
        style={{ flex: 1, backgroundColor: isDark ? '#0F172A' : '#0B2F66' }} 
        edges={['top']}
    >
      <StatusBar barStyle="light-content" backgroundColor={isDark ? '#0F172A' : '#0B2F66'} />
      
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>

      {/* The Glass Blur specifically for the bottom safe area! */}
      {insets.bottom > 0 && (
        <BlurView
          intensity={isDark ? 40 : 80}
          tint={isDark ? "dark" : "light"}
          experimentalBlurMethod="dimezisBlurView" 
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: insets.bottom, 
            borderTopWidth: 0,
            borderTopColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.4)', 
          }}
        />
      )}
    </SafeAreaView>
  );
}

export default function RootLayout() {
  
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('appTheme');
        if (savedTheme === 'light' || savedTheme === 'dark') {
          store.dispatch(setTheme(savedTheme));
        }
      } catch (e) {
        console.error("Failed to load theme");
      }
    };
    loadTheme();
  }, []);

  return (
    <Provider store={store}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <AppContent />
      </SafeAreaProvider>
    </Provider>
  );
}