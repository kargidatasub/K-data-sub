import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  Switch, Modal, TextInput, KeyboardAvoidingView, Platform, StatusBar, Alert 
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { router } from 'expo-router';
import { RootState } from '../../store/store';

export default function SecurityScreen() {
  const isDark = useSelector((state: RootState) => state.theme.mode) === 'dark';
  const insets = useSafeAreaInsets();
  
  // Settings States
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);
  const [hideBalanceEnabled, setHideBalanceEnabled] = useState(false);
  const [securityAlertsEnabled, setSecurityAlertsEnabled] = useState(true);
  const [pinModalVisible, setPinModalVisible] = useState(false);
  
  // PIN Form States
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');

  const handleUpdatePin = () => {
    if (oldPin.length < 4 || newPin.length < 4) {
        Alert.alert("Error", "Please enter a valid 4-digit PIN.");
        return;
    }
    setPinModalVisible(false);
    setOldPin('');
    setNewPin('');
    Alert.alert("Success", "PIN Updated Successfully!");
  };

  const SecurityOption = ({ icon, title, sub, color, onPress, isSwitch, switchValue, onSwitchChange }: any) => (
    <TouchableOpacity 
      style={[styles.optionRow, isDark && styles.optionRowDark]} 
      onPress={onPress}
      disabled={isSwitch || !onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconBg, { backgroundColor: (color || '#0B2F66') + '1A' }]}>
        <Ionicons name={icon} size={22} color={color || (isDark ? '#60A5FA' : '#0B2F66')} />
      </View>
      <View style={styles.optionTextContainer}>
        <Text style={[styles.optionTitle, isDark && styles.textDark]}>{title}</Text>
        {sub && <Text style={styles.optionSub}>{sub}</Text>}
      </View>
      {isSwitch ? (
        <Switch 
          value={switchValue} 
          onValueChange={onSwitchChange} 
          trackColor={{ false: '#D1D5DB', true: '#10B981' }} 
        />
      ) : (
        <Ionicons name="chevron-forward" size={20} color={isDark ? '#6B7280' : '#9CA3AF'} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#0B2F66'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDark && styles.textDark]}>Security & PIN</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <Text style={styles.sectionHeader}>Authentication</Text>
        <View style={[styles.card, isDark && styles.cardDark]}>
          <SecurityOption 
            icon="finger-print" 
            title="Biometric Login" 
            sub="Use fingerprint or Face ID to open app"
            isSwitch 
            switchValue={biometricsEnabled} 
            onSwitchChange={setBiometricsEnabled} 
          />
          <SecurityOption 
            icon="keypad" 
            title="Change Transaction PIN" 
            sub="Update your 4-digit security PIN"
            onPress={() => setPinModalVisible(true)}
            color="#F59E0B"
          />
          <SecurityOption 
            icon="lock-closed" 
            title="Change Password" 
            sub="Update your account login password"
            color="#EF4444"
            onPress={() => Alert.alert("Password", "Redirecting to password reset...")}
          />
        </View>

        {/* NEW SECTION: Login History & Alerts */}
        <Text style={styles.sectionHeader}>Login History & Alerts</Text>
        <View style={[styles.card, isDark && styles.cardDark]}>
          <SecurityOption 
            icon="location" 
            title="Last Login Location" 
            sub="Lagos, Nigeria • 12 mins ago"
            color="#3B82F6"
            onPress={() => Alert.alert("Location Info", "Last login was from Lagos, Nigeria. IP Address: 197.210.64.12")}
          />
          <SecurityOption 
            icon="phone-portrait" 
            title="Last Device Login" 
            sub="iPhone 13 Pro Max (iOS 16)"
            color="#8B5CF6"
            onPress={() => Alert.alert("Device Info", "Device: iPhone 13 Pro Max\nStatus: Active Session")}
          />
          <SecurityOption 
            icon="warning" 
            title="Security Alerts" 
            sub="Notify me of logins from new devices"
            isSwitch 
            switchValue={securityAlertsEnabled} 
            onSwitchChange={setSecurityAlertsEnabled} 
            color="#F43F5E"
          />
        </View>

        <Text style={styles.sectionHeader}>Privacy Settings</Text>
        <View style={[styles.card, isDark && styles.cardDark]}>
          <SecurityOption 
            icon="eye-off" 
            title="Hide Wallet Balance" 
            sub="Blur balance on dashboard by default"
            isSwitch 
            switchValue={hideBalanceEnabled} 
            onSwitchChange={setHideBalanceEnabled} 
            color="#10B981"
          />
        </View>

      </ScrollView>

      {/* --- CHANGE PIN MODAL --- */}
      <Modal 
        visible={pinModalVisible} 
        animationType="slide" 
        transparent 
        onRequestClose={() => setPinModalVisible(false)}
        statusBarTranslucent
        navigationBarTranslucent
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ width: '100%', justifyContent: 'flex-end', flex: 1 }}>
            <View style={[styles.modalContent, isDark && styles.cardDark, { paddingBottom: insets.bottom + 20 }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, isDark && styles.textDark]}>Change PIN</Text>
                <TouchableOpacity onPress={() => setPinModalVisible(false)}>
                  <Ionicons name="close" size={24} color={isDark ? '#fff' : '#111827'} />
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Current PIN</Text>
              <TextInput 
                style={[styles.input, isDark && styles.inputDark, isDark && styles.textDark]} 
                placeholder="****" 
                placeholderTextColor="#9CA3AF"
                secureTextEntry 
                keyboardType="numeric" 
                maxLength={4}
                value={oldPin}
                onChangeText={setOldPin}
              />

              <Text style={styles.inputLabel}>New PIN</Text>
              <TextInput 
                style={[styles.input, isDark && styles.inputDark, isDark && styles.textDark]} 
                placeholder="****" 
                placeholderTextColor="#9CA3AF"
                secureTextEntry 
                keyboardType="numeric" 
                maxLength={4}
                value={newPin}
                onChangeText={setNewPin}
              />

              <TouchableOpacity style={styles.saveBtn} onPress={handleUpdatePin}>
                <Text style={styles.saveBtnText}>Update PIN</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  containerDark: { backgroundColor: '#111827' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', elevation: 2 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  textDark: { color: '#fff' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  
  sectionHeader: { fontSize: 12, fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, marginTop: 20, marginBottom: 10, marginLeft: 5 },
  card: { backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 15, elevation: 2 },
  cardDark: { backgroundColor: '#1F2937' },
  
  optionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  optionRowDark: { borderBottomColor: '#374151' },
  iconBg: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  optionTextContainer: { flex: 1 },
  optionTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 4 },
  optionSub: { fontSize: 12, color: '#6B7280' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  inputLabel: { fontSize: 13, color: '#6B7280', fontWeight: '700', marginBottom: 8 },
  input: { backgroundColor: '#F3F4F6', borderRadius: 14, padding: 16, fontSize: 18, letterSpacing: 5, marginBottom: 20, textAlign: 'center', fontWeight: 'bold' },
  inputDark: { backgroundColor: '#374151' },
  saveBtn: { backgroundColor: '#0B2F66', padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 10 },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});