import 'react-native-gesture-handler'; // MUST BE AT THE VERY TOP
import React, { useEffect, useState } from 'react';
import { StatusBar, Platform, AppState, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets, initialWindowMetrics } from 'react-native-safe-area-context'; 
import { Provider, useSelector, useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur'; 
import * as NavigationBar from 'expo-navigation-bar'; 

import { store, RootState } from '../store/store';
import { setTheme } from '../store/themeSlice';
import { loginSuccess, setPin, lockApp, unlockApp } from '../store/authSlice';

if (Platform.OS === 'android') {
  NavigationBar.setPositionAsync('absolute');
  NavigationBar.setBackgroundColorAsync('#ffffff00'); 
}

// --- NEW AUTH GUARD COMPONENT ---
function AuthGuard({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const authState = useSelector((state: RootState) => state.auth);
  const isDark = useSelector((state: RootState) => state.theme.mode) === 'dark';
  
  const [enteredPin, setEnteredPin] = useState('');
  const [errorText, setErrorText] = useState('');

  useEffect(() => {
    // 1. Load session on startup
    const loadSession = async () => {
      try {
        const user = await AsyncStorage.getItem('@user_auth');
        const savedPin = await AsyncStorage.getItem('@user_pin');
        
        if (user) dispatch(loginSuccess(JSON.parse(user)));
        if (savedPin) dispatch(setPin(savedPin));

        // If no user is found, redirect to the login screen
        if (!user) {
          setTimeout(() => router.replace('/(auth)/login'), 100);
        }
      } catch (e) {
        console.error("Failed to load auth session");
      }
    };
    loadSession();

    // 2. Lock app when moved to background
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        dispatch(lockApp());
      }
    });

    return () => subscription.remove();
  }, [dispatch]);

  // 3. Handle Unlock Logic
  const handleKeypress = (num: string) => {
    setErrorText('');
    if (enteredPin.length < 6) {
      const newPin = enteredPin + num;
      setEnteredPin(newPin);

      if (newPin.length === 6) {
        if (newPin === authState.pin) {
          setEnteredPin('');
          dispatch(unlockApp());
        } else {
          setErrorText('Incorrect PIN');
          setEnteredPin('');
        }
      }
    }
  };

  // 4. Render Lock Screen Overlay
  if (authState.isAppLocked) {
    return (
      <SafeAreaView style={[styles.lockContainer, isDark && styles.lockContainerDark]}>
        <Text style={[styles.lockTitle, isDark && styles.textLight]}>App Locked</Text>
        <Text style={styles.lockSubtitle}>Enter your 6-digit PIN to unlock</Text>
        
        <View style={styles.dotsContainer}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <View key={i} style={[styles.dot, isDark && styles.dotDark, enteredPin.length > i && styles.dotActive]} />
          ))}
        </View>

        {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}

        <View style={styles.keypad}>
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'DEL'].map((key, index) => (
            <TouchableOpacity 
              key={index} 
              style={[styles.key, key === '' && { backgroundColor: 'transparent' }]} 
              onPress={() => {
                if (key === 'DEL') setEnteredPin(enteredPin.slice(0, -1));
                else if (key !== '') handleKeypress(key);
              }}
              disabled={key === ''}
            >
              <Text style={[styles.keyText, isDark && styles.textLight]}>{key}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    );
  }

  return <>{children}</>;
}


function AppContent() {
  const isDark = useSelector((state: RootState) => state.theme.mode) === 'dark';
  const insets = useSafeAreaInsets(); 

  return (
    <SafeAreaView 
        style={{ flex: 1, backgroundColor: isDark ? '#0F172A' : '#0B2F66' }} 
        edges={['top']}
    >
      <StatusBar barStyle="light-content" backgroundColor={isDark ? '#0F172A' : '#0B2F66'} />
      
      <Stack screenOptions={{ headerShown: false }}>
        {/* --- REGISTER ED AUTH FOLDER --- */}
        <Stack.Screen name="(auth)" options={{ headerShown: false, animation: 'slide_from_bottom' }} />
        
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        <Stack.Screen 
          name="VTU" 
          options={{ headerShown: false, animation: 'slide_from_bottom' }} 
        />
        <Stack.Screen name="settings" options={{ headerShown: false, animation: 'slide_from_bottom' }} />
        <Stack.Screen name="transaction" options={{ headerShown: false, animation: 'slide_from_bottom' }} />
      </Stack>

      {insets.bottom > 0 && (
        <BlurView
          intensity={isDark ? 40 : 80}
          tint={isDark ? "dark" : "light"}
          style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: insets.bottom, 
            borderTopWidth: 0, borderTopColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.4)', 
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
        {/* --- WRAPPED APP IN AUTH GUARD --- */}
        <AuthGuard>
          <AppContent />
        </AuthGuard>
      </SafeAreaProvider>
    </Provider>
  );
}

// --- NEW STYLES FOR LOCK SCREEN ---
const styles = StyleSheet.create({
  lockContainer: { flex: 1, backgroundColor: '#F4F7FB', alignItems: 'center', justifyContent: 'center', zIndex: 999 },
  lockContainerDark: { backgroundColor: '#0F172A' },
  lockTitle: { fontSize: 28, fontWeight: 'bold', color: '#0B2F66', marginBottom: 10 },
  lockSubtitle: { fontSize: 16, color: '#6B7280', marginBottom: 30 },
  textLight: { color: '#FFF' },
  errorText: { color: '#ef4444', marginBottom: 20, fontWeight: 'bold' },
  dotsContainer: { flexDirection: 'row', gap: 15, marginBottom: 40 },
  dot: { width: 15, height: 15, borderRadius: 8, backgroundColor: '#E5E7EB' },
  dotDark: { backgroundColor: '#374151' },
  dotActive: { backgroundColor: '#4A9C9C' },
  keypad: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', width: 300, gap: 15 },
  key: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.05)' },
  keyText: { fontSize: 24, fontWeight: 'bold', color: '#111' },
});