import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginSuccess } from '../../store/authSlice';
import { RootState } from '../../store/store';

export default function LoginScreen() {
  const isDark = useSelector((state: RootState) => state.theme.mode) === 'dark';
  const dispatch = useDispatch();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleMockLogin = async () => {
    // Mock user data - later replace with Supabase
    const mockUser = { email, name: "Askiboy" };
    
    // Save to local storage
    await AsyncStorage.setItem('@user_auth', JSON.stringify(mockUser));
    
    dispatch(loginSuccess(mockUser));
    router.replace('/(auth)/setup-pin'); // Send to PIN setup after login
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
        <Text style={[styles.title, isDark && styles.textLight]}>Welcome Back!</Text>
        <Text style={[styles.subtitle, isDark && styles.textLightSubtitle]}>Sign in to continue to KargiDataSub</Text>

        <View style={styles.form}>
          <TextInput 
            style={[styles.input, isDark && styles.inputDark]} 
            placeholder="Email Address" 
            placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
            value={email}
            onChangeText={setEmail}
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

          <Link href="/(auth)/forgot-password" asChild>
            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          </Link>

          <TouchableOpacity style={styles.loginBtn} onPress={handleMockLogin}>
            <Text style={styles.loginBtnText}>Login</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={[styles.dividerText, isDark && styles.textLightSubtitle]}>OR LOGIN WITH</Text>
          <View style={styles.divider} />
        </View>

        <View style={styles.socialContainer}>
          <TouchableOpacity style={[styles.socialBtn, isDark && styles.socialBtnDark]}>
            <Ionicons name="logo-google" size={24} color="#DB4437" />
            <Text style={[styles.socialBtnText, isDark && styles.textLight]}> Google</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.socialBtn, isDark && styles.socialBtnDark]}>
            <Ionicons name="logo-facebook" size={24} color="#4267B2" />
            <Text style={[styles.socialBtnText, isDark && styles.textLight]}> Facebook</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, isDark && styles.textLightSubtitle]}>Don't have an account? </Text>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity><Text style={styles.registerText}>Register</Text></TouchableOpacity>
          </Link>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FB' },
  containerDark: { backgroundColor: '#0F172A' },
  content: { flex: 1, padding: 25, justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#0B2F66', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#6B7280', marginBottom: 40 },
  textLight: { color: '#FFF' },
  textLightSubtitle: { color: '#9CA3AF' },
  form: { gap: 15 },
  input: { backgroundColor: '#FFF', padding: 18, borderRadius: 12, fontSize: 16, color: '#111' },
  inputDark: { backgroundColor: '#1E293B', color: '#FFF' },
  passwordContainer: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 12, alignItems: 'center', paddingRight: 15 },
  passwordInput: { flex: 1, padding: 18, fontSize: 16, color: '#111' },
  forgotBtn: { alignSelf: 'flex-end' },
  forgotText: { color: '#4A9C9C', fontWeight: '600' },
  loginBtn: { backgroundColor: '#0B2F66', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  loginBtnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 30 },
  divider: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  dividerText: { paddingHorizontal: 15, color: '#6B7280', fontWeight: 'bold' },
  socialContainer: { flexDirection: 'row', gap: 15 },
  socialBtn: { flex: 1, flexDirection: 'row', backgroundColor: '#FFF', padding: 15, borderRadius: 12, alignItems: 'center', justifyContent: 'center', elevation: 2 },
  socialBtnDark: { backgroundColor: '#1E293B' },
  socialBtnText: { fontSize: 16, fontWeight: '600', marginLeft: 8 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 40 },
  footerText: { fontSize: 16, color: '#6B7280' },
  registerText: { fontSize: 16, color: '#4A9C9C', fontWeight: 'bold' },
});