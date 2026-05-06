import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

export default function ForgotPasswordScreen() {
  const isDark = useSelector((state: RootState) => state.theme.mode) === 'dark';
  const [email, setEmail] = useState('');

  const handleResetPassword = () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }
    
    // Mock sending the reset link
    Alert.alert(
      "Link Sent", 
      "If an account exists for this email, a password reset link has been sent.",
      [{ text: "OK", onPress: () => router.back() }]
    );
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
        
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={isDark ? '#FFF' : '#0B2F66'} />
        </TouchableOpacity>

        <Text style={[styles.title, isDark && styles.textLight]}>Reset Password</Text>
        <Text style={[styles.subtitle, isDark && styles.textLightSubtitle]}>
          Enter the email associated with your account and we'll send you a link to reset your password.
        </Text>

        <View style={styles.form}>
          <TextInput 
            style={[styles.input, isDark && styles.inputDark]} 
            placeholder="Email Address" 
            placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <TouchableOpacity style={styles.resetBtn} onPress={handleResetPassword}>
            <Text style={styles.resetBtnText}>Send Reset Link</Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FB' },
  containerDark: { backgroundColor: '#0F172A' },
  content: { flex: 1, padding: 25, justifyContent: 'center' },
  backBtn: { position: 'absolute', top: 50, left: 25, zIndex: 10 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#0B2F66', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#6B7280', marginBottom: 40, lineHeight: 24 },
  textLight: { color: '#FFF' },
  textLightSubtitle: { color: '#9CA3AF' },
  form: { gap: 15 },
  input: { backgroundColor: '#FFF', padding: 18, borderRadius: 12, fontSize: 16, color: '#111' },
  inputDark: { backgroundColor: '#1E293B', color: '#FFF' },
  resetBtn: { backgroundColor: '#4A9C9C', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  resetBtnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});