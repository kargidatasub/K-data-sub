import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginSuccess } from '../../store/authSlice';
import { RootState } from '../../store/store';

export default function RegisterScreen() {
  const isDark = useSelector((state: RootState) => state.theme.mode) === 'dark';
  const dispatch = useDispatch();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleMockRegister = async () => {
    if (!fullName || !email || !password) return;

    // Mock new user data
    const mockUser = { email, name: fullName, phone };
    
    // Save to local storage to persist the session
    await AsyncStorage.setItem('@user_auth', JSON.stringify(mockUser));
    
    // Log them in via Redux
    dispatch(loginSuccess(mockUser));
    
    // Send to PIN setup immediately after registering
    router.replace('/(auth)/setup-pin'); 
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={isDark ? '#FFF' : '#0B2F66'} />
          </TouchableOpacity>

          <Text style={[styles.title, isDark && styles.textLight]}>Create Account</Text>
          <Text style={[styles.subtitle, isDark && styles.textLightSubtitle]}>Join KargiDataSub to get started</Text>

          <View style={styles.form}>
            <TextInput 
              style={[styles.input, isDark && styles.inputDark]} 
              placeholder="Full Name" 
              placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
              value={fullName}
              onChangeText={setFullName}
            />

            <TextInput 
              style={[styles.input, isDark && styles.inputDark]} 
              placeholder="Email Address" 
              placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <TextInput 
              style={[styles.input, isDark && styles.inputDark]} 
              placeholder="Phone Number" 
              placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
            
            <View style={[styles.passwordContainer, isDark && styles.inputDark]}>
              <TextInput 
                style={styles.passwordInput} 
                placeholder="Password" 
                placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color={isDark ? '#9CA3AF' : '#6B7280'} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.registerBtn} onPress={handleMockRegister}>
              <Text style={styles.registerBtnText}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, isDark && styles.textLightSubtitle]}>Already have an account? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity><Text style={styles.loginText}>Login</Text></TouchableOpacity>
            </Link>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FB' },
  containerDark: { backgroundColor: '#0F172A' },
  scrollContent: { flexGrow: 1, padding: 25, justifyContent: 'center' },
  backBtn: { marginBottom: 20, alignSelf: 'flex-start' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#0B2F66', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#6B7280', marginBottom: 40 },
  textLight: { color: '#FFF' },
  textLightSubtitle: { color: '#9CA3AF' },
  form: { gap: 15 },
  input: { backgroundColor: '#FFF', padding: 18, borderRadius: 12, fontSize: 16, color: '#111' },
  inputDark: { backgroundColor: '#1E293B', color: '#FFF' },
  passwordContainer: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 12, alignItems: 'center', paddingRight: 15 },
  passwordInput: { flex: 1, padding: 18, fontSize: 16, color: '#111' },
  registerBtn: { backgroundColor: '#0B2F66', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  registerBtnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 40 },
  footerText: { fontSize: 16, color: '#6B7280' },
  loginText: { fontSize: 16, color: '#4A9C9C', fontWeight: 'bold' },
});