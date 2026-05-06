import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { router } from 'expo-router';
import { setPin } from '../../store/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootState } from '../../store/store';

export default function SetupPinScreen() {
  const isDark = useSelector((state: RootState) => state.theme.mode) === 'dark';
  const dispatch = useDispatch();
  const [pin, setLocalPin] = useState('');

  const handleKeyPress = async (num: string) => {
    if (pin.length < 6) {
      const newPin = pin + num;
      setLocalPin(newPin);
      
      if (newPin.length === 6) {
        // Save PIN securely to local storage & Redux
        await AsyncStorage.setItem('@user_pin', newPin);
        dispatch(setPin(newPin));
        // Route to main app!
        router.replace('/(tabs)');
      }
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <Text style={[styles.title, isDark && styles.textLight]}>Set Security PIN</Text>
      <Text style={styles.subtitle}>Enter a 6-digit PIN to secure your app</Text>

      <View style={styles.dotsContainer}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <View key={i} style={[styles.dot, isDark && styles.dotDark, pin.length > i && styles.dotActive]} />
        ))}
      </View>

      <View style={styles.keypad}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'DEL'].map((key, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.key} 
            onPress={() => {
              if (key === 'DEL') setLocalPin(pin.slice(0, -1));
              else if (key !== '') handleKeyPress(key);
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FB', alignItems: 'center', justifyContent: 'center' },
  containerDark: { backgroundColor: '#0F172A' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#0B2F66', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#6B7280', marginBottom: 40 },
  textLight: { color: '#FFF' },
  dotsContainer: { flexDirection: 'row', gap: 15, marginBottom: 60 },
  dot: { width: 15, height: 15, borderRadius: 8, backgroundColor: '#E5E7EB' },
  dotDark: { backgroundColor: '#374151' },
  dotActive: { backgroundColor: '#4A9C9C' },
  keypad: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', width: 300, gap: 15 },
  key: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.05)' },
  keyText: { fontSize: 24, fontWeight: 'bold', color: '#111' },
});