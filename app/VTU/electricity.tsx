import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, 
  Modal, Alert, ActivityIndicator, Animated, Platform, Dimensions, Pressable 
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router'; 
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { CameraView, useCameraPermissions } from 'expo-camera'; 
import * as Notifications from 'expo-notifications'; // <-- Added Notifications
import { RootState } from '../../store/store'; 

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Configure notifications to show even when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Mock Data for Electricity DisCos
const PROVIDERS = [
  { id: 'IKEDC', name: 'Ikeja', fullName: 'Ikeja Electric', color: '#EF4444' }, 
  { id: 'EKEDC', name: 'Eko', fullName: 'Eko Electric', color: '#3B82F6' },
  { id: 'AEDC', name: 'Abuja', fullName: 'Abuja Electric', color: '#10B981' },
  { id: 'IBEDC', name: 'Ibadan', fullName: 'Ibadan Electric', color: '#F59E0B' },
  { id: 'PHED', name: 'Port Harcourt', fullName: 'Port Harcourt Electric', color: '#8B5CF6' },
  { id: 'KEDCO', name: 'Kano', fullName: 'Kano Electric', color: '#14B8A6' },
];

const QUICK_AMOUNTS = ['1000', '2000', '5000', '10000'];

export default function ElectricityScreen() {
  const isDark = useSelector((state: RootState) => state.theme.mode) === 'dark';
  const walletBalance = useSelector((state: RootState) => state.wallet?.balance ?? 0);
  const insets = useSafeAreaInsets();

  // Glass & UI State
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const modalScale = useRef(new Animated.Value(0.8)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);

  // Form State
  const [meterNumber, setMeterNumber] = useState('');
  const [provider, setProvider] = useState('IKEDC');
  const [meterType, setMeterType] = useState('Prepaid'); 
  const [amount, setAmount] = useState('');
  const [recentMeters, setRecentMeters] = useState<string[]>([]);

  // PIN Modal State
  const [isPinModalVisible, setPinModalVisible] = useState(false);
  const [pin, setPin] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Scanner State & Permissions
  const [isScannerVisible, setScannerVisible] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const savedVisibility = await AsyncStorage.getItem('@balance_visible');
        if (savedVisibility !== null) setIsBalanceVisible(JSON.parse(savedVisibility));

        const storedMeters = await AsyncStorage.getItem('@recent_meters');
        if (storedMeters) setRecentMeters(JSON.parse(storedMeters));
      } catch (e) { console.error(e); }
    };
    loadSavedData();
  }, []);

  const toggleVisibility = async () => {
    try {
      const newState = !isBalanceVisible;
      setIsBalanceVisible(newState);
      await AsyncStorage.setItem('@balance_visible', JSON.stringify(newState));
    } catch (e) { console.error(e); }
  };

  const saveRecentMeter = async (meterToSave: string) => {
    try {
      const filtered = recentMeters.filter(m => m !== meterToSave);
      const updated = [meterToSave, ...filtered].slice(0, 5); 
      setRecentMeters(updated);
      await AsyncStorage.setItem('@recent_meters', JSON.stringify(updated));
    } catch (e) { console.error(e); }
  };

  // Open Scanner Logic
  const openScanner = async () => {
    if (!cameraPermission?.granted) {
      const result = await requestCameraPermission();
      if (!result.granted) {
        Alert.alert('Permission Denied', 'You need to grant camera access to scan meter cards.');
        return;
      }
    }
    setScannerVisible(true);
  };

  // Handle successful scan
  const handleBarcodeScanned = ({ data }: { data: string }) => {
    setScannerVisible(false);
    // Clean to numeric only
    const cleanNumber = data.replace(/\D/g, '').slice(0, 13);
    setMeterNumber(cleanNumber);
  };

  useEffect(() => {
    if (isPinModalVisible) {
      Animated.parallel([
        Animated.spring(modalScale, { toValue: 1, friction: 8, useNativeDriver: true }),
        Animated.timing(modalOpacity, { toValue: 1, duration: 250, useNativeDriver: true })
      ]).start();
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      modalScale.setValue(0.8);
      modalOpacity.setValue(0);
    }
  }, [isPinModalVisible]);

  const handleConfirmPress = () => {
    if (meterNumber.length < 10) {
      Alert.alert('Invalid Meter', 'Please enter a valid meter number.');
      return;
    }
    if (!amount || parseInt(amount) < 500) {
      Alert.alert('Invalid Amount', 'Minimum electricity purchase is ₦500.');
      return;
    }
    setPinModalVisible(true);
  };

  const handlePayment = async (currentPin: string) => {
    if (currentPin.length < 4) return;
    setIsProcessing(true);

    setTimeout(async () => {
      setIsProcessing(false);
      setPinModalVisible(false);
      setPin('');
      
      await saveRecentMeter(meterNumber);

      const selectedProvider = PROVIDERS.find(p => p.id === provider);

      // Trigger the local push notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Token Generated! ⚡",
          body: `You bought ₦${amount} for ${meterNumber} (${selectedProvider?.name}). Token: 4829-1039-4820-1928`,
          sound: true,
        },
        trigger: null, // Null trigger means fire immediately
      });

      Alert.alert(
        'Transaction Successful!', 
        `Token generated for ${meterNumber}.\nAmount: ₦${amount}\nToken: 4829-1039-4820-1928`, 
        [{ text: 'Copy Token & Exit', onPress: () => router.back() }]
      );
    }, 2000);
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View style={[styles.topBar, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#0B2F66'} />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, isDark && styles.textDark]}>Electricity</Text>
        <View style={{ width: 24 }} /> 
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 120 }]}
      >
        <LinearGradient
            colors={isDark ? ['#1e293b', '#0f172a'] : ['#0B2F66', '#1e40af']}
            style={styles.walletCard}
        >
            <View style={styles.walletHeaderRow}>
                <Text style={styles.walletLabel}>Wallet Balance</Text>
                <TouchableOpacity onPress={toggleVisibility} style={styles.eyeBtn}>
                    <Ionicons 
                        name={isBalanceVisible ? "eye-outline" : "eye-off-outline"} 
                        size={20} 
                        color="rgba(255,255,255,0.7)" 
                    />
                </TouchableOpacity>
            </View>
            <View style={styles.walletRow}>
                <Text style={styles.walletBalance}>
                  {isBalanceVisible 
                    ? `₦${walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}` 
                    : "₦ • • • • •"}
                </Text>
            </View>
        </LinearGradient>

        {/* Meter Number Input */}
        <Text style={[styles.sectionLabel, isDark && styles.textDark]}>Meter Number</Text>
        <View style={[styles.inputContainer, isDark && styles.inputContainerDark]}>
            <TextInput
                style={[styles.input, isDark && styles.textDark]}
                placeholder="Enter 11-13 digit meter number"
                placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                keyboardType="numeric"
                value={meterNumber}
                onChangeText={setMeterNumber}
                maxLength={13}
            />
            {/* Added Camera Trigger */}
            <TouchableOpacity onPress={openScanner}>
                <Ionicons name="barcode-outline" size={24} color={isDark ? "#60A5FA" : "#0B2F66"} />
            </TouchableOpacity>
        </View>

        {/* Recent Meters */}
        {recentMeters.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recentScroll}>
            {recentMeters.map((num, idx) => (
              <TouchableOpacity key={idx} style={[styles.recentChip, isDark && styles.recentChipDark]} onPress={() => setMeterNumber(num)}>
                <Ionicons name="flash-outline" size={14} color={isDark ? "#9CA3AF" : "#6B7280"} style={{marginRight: 6}} />
                <Text style={[styles.recentChipText, isDark && styles.textDark]}>{num}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Meter Type Toggle */}
        <Text style={[styles.sectionLabel, isDark && styles.textDark]}>Account Type</Text>
        <View style={[styles.toggleContainer, isDark && styles.toggleContainerDark]}>
            <TouchableOpacity 
                style={[styles.toggleBtn, meterType === 'Prepaid' && styles.activeToggleBtn, meterType === 'Prepaid' && isDark && styles.activeToggleBtnDark]} 
                onPress={() => setMeterType('Prepaid')}
            >
                <Text style={[styles.toggleText, isDark && styles.textDark, meterType === 'Prepaid' && styles.activeToggleText]}>Prepaid</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={[styles.toggleBtn, meterType === 'Postpaid' && styles.activeToggleBtn, meterType === 'Postpaid' && isDark && styles.activeToggleBtnDark]} 
                onPress={() => setMeterType('Postpaid')}
            >
                <Text style={[styles.toggleText, isDark && styles.textDark, meterType === 'Postpaid' && styles.activeToggleText]}>Postpaid</Text>
            </TouchableOpacity>
        </View>

        {/* Provider Selection (Grid) */}
        <Text style={[styles.sectionLabel, isDark && styles.textDark]}>Select DisCo</Text>
        <View style={styles.providerGrid}>
            {PROVIDERS.map((prov) => (
                <TouchableOpacity 
                    key={prov.id} 
                    onPress={() => setProvider(prov.id)}
                    style={[
                        styles.providerCard, 
                        isDark && styles.providerCardDark,
                        provider === prov.id && styles.activeProviderCard,
                        provider === prov.id && isDark && styles.activeProviderCardDark
                    ]}
                >
                    <View style={[styles.providerIconBg, { backgroundColor: provider === prov.id && isDark ? 'rgba(255,255,255,0.2)' : prov.color + '1A' }]}>
                        <Ionicons name="flash" size={20} color={provider === prov.id && isDark ? '#fff' : prov.color} />
                    </View>
                    <Text style={[
                        styles.providerText, 
                        isDark && styles.textDark,
                        provider === prov.id && isDark && {color: '#fff'}
                    ]}>{prov.name}</Text>
                </TouchableOpacity>
            ))}
        </View>

        {/* Amount Input */}
        <Text style={[styles.sectionLabel, isDark && styles.textDark]}>Amount (₦)</Text>
        <View style={[styles.inputContainer, isDark && styles.inputContainerDark]}>
            <Text style={[styles.currencySymbol, isDark && styles.textDark]}>₦</Text>
            <TextInput
                style={[styles.input, isDark && styles.textDark, { fontSize: 18, fontWeight: 'bold' }]}
                placeholder="0.00"
                placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
            />
        </View>

        {/* Quick Amount Chips */}
        <View style={styles.quickAmountGrid}>
            {QUICK_AMOUNTS.map((amt) => (
                <TouchableOpacity 
                    key={amt} 
                    onPress={() => setAmount(amt)}
                    style={[
                        styles.quickAmountChip, 
                        isDark && styles.quickAmountChipDark,
                        amount === amt && styles.activeQuickAmount
                    ]}
                >
                    <Text style={[
                        styles.quickAmountText, 
                        isDark && styles.textDark,
                        amount === amt && styles.activeQuickAmountText
                    ]}>
                        ₦{amt}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>

      </ScrollView>

      {/* Glass Bottom Bar */}
      <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + 15 }]}>
          <BlurView 
            intensity={isDark ? 50 : 80} 
            tint={isDark ? "dark" : "light"} 
            experimentalBlurMethod="dimezisBlurView"
            style={StyleSheet.absoluteFill} 
          />
          <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirmPress}>
              <Text style={styles.confirmBtnText}>Pay {amount ? `₦${amount}` : 'Now'}</Text>
          </TouchableOpacity>
      </View>

      {/* --- FIXED: Barcode Scanner Full-Screen Modal (navigationBarTranslucent added) --- */}
      <Modal 
        visible={isScannerVisible} 
        animationType="slide" 
        transparent={false} 
        statusBarTranslucent 
        navigationBarTranslucent={true}
      >
        <View style={styles.scannerContainer}>
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            onBarcodeScanned={isScannerVisible ? handleBarcodeScanned : undefined}
          />
          <View style={styles.scannerOverlay}>
            <View style={styles.scannerTarget} />
            <Text style={styles.scannerInstructions}>Align barcode inside frame</Text>
          </View>
          <SafeAreaView style={styles.scannerHeader}>
            <TouchableOpacity onPress={() => setScannerVisible(false)} style={styles.scannerCloseBtn}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
          </SafeAreaView>
        </View>
      </Modal>

      {/* --- FIXED: PIN Confirmation Modal (navigationBarTranslucent added) --- */}
      <Modal 
        visible={isPinModalVisible} 
        transparent 
        animationType="none" 
        statusBarTranslucent={true}
        navigationBarTranslucent={true}
        onRequestClose={() => setPinModalVisible(false)}
      >
          <View style={styles.modalOverlay}>
              <Animated.View style={[styles.modalWrapper, { opacity: modalOpacity, transform: [{ scale: modalScale }] }]}>
                  <BlurView intensity={Platform.OS === 'ios' ? 90 : 100} tint={isDark ? "dark" : "light"} style={styles.glassModal}>
                      <LinearGradient
                        colors={isDark ? ['rgba(30, 41, 59, 0.9)', 'rgba(15, 23, 42, 0.95)'] : ['rgba(255, 255, 255, 0.9)', 'rgba(243, 244, 246, 0.95)']}
                        style={styles.modalGradient}
                      >
                        <Text style={[styles.modalTitle, isDark && styles.textDark]}>Enter PIN</Text>
                        <Text style={styles.modalSub}>Authorizing ₦{amount} payment to {provider}</Text>
                        
                        <Pressable style={styles.pinBoxesContainer} onPress={() => inputRef.current?.focus()}>
                          {[0, 1, 2, 3].map((index) => (
                            <View 
                              key={index} 
                              style={[
                                styles.pinBox, 
                                isDark && styles.pinBoxDark,
                                pin.length === index && styles.pinBoxActive 
                              ]}
                            >
                              <Text style={[styles.pinDot, isDark && styles.textDark]}>
                                {pin.length > index ? '•' : ''}
                              </Text>
                            </View>
                          ))}

                          <TextInput
                              ref={inputRef}
                              style={styles.hiddenPinInput}
                              keyboardType="numeric"
                              maxLength={4}
                              value={pin}
                              onChangeText={(val) => {
                                  setPin(val);
                                  if (val.length === 4) handlePayment(val);
                              }}
                              autoFocus={true} 
                          />
                        </Pressable>

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setPinModalVisible(false)}>
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.payBtn} onPress={() => handlePayment(pin)} disabled={isProcessing}>
                                {isProcessing ? <ActivityIndicator color="#fff" /> : <Text style={styles.payBtnText}>Pay Now</Text>}
                            </TouchableOpacity>
                        </View>
                      </LinearGradient>
                  </BlurView>
              </Animated.View>
          </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FB' },
  containerDark: { backgroundColor: '#0B121F' },
  textDark: { color: '#F9FAFB' },
  scrollContent: { paddingHorizontal: 20 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 15 },
  topBarTitle: { fontSize: 18, fontWeight: 'bold', color: '#0B2F66' },

  walletCard: { borderRadius: 20, padding: 25, marginBottom: 25, elevation: 10 },
  walletHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  eyeBtn: { marginLeft: 10, padding: 5 },
  walletLabel: { color: '#E0E7FF', fontSize: 14, opacity: 0.8 },
  walletBalance: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  walletRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 },

  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 12, paddingHorizontal: 15, height: 60, elevation: 2 },
  inputContainerDark: { backgroundColor: '#1F2937', borderColor: '#374151' },
  input: { flex: 1, fontSize: 16, color: '#111827', letterSpacing: 2 },
  currencySymbol: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginRight: 10 },

  recentScroll: { marginTop: 15, flexDirection: 'row' },
  recentChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E0E7FF', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginRight: 10 },
  recentChipDark: { backgroundColor: '#374151' },
  recentChipText: { color: '#0B2F66', fontWeight: 'bold', fontSize: 13, letterSpacing: 1 },

  sectionLabel: { fontSize: 16, fontWeight: 'bold', marginTop: 25, marginBottom: 15 },

  toggleContainer: { flexDirection: 'row', backgroundColor: '#E5E7EB', borderRadius: 12, padding: 4, marginBottom: 10 },
  toggleContainerDark: { backgroundColor: '#374151' },
  toggleBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10 },
  activeToggleBtn: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, elevation: 2 },
  activeToggleBtnDark: { backgroundColor: '#1F2937' },
  toggleText: { fontSize: 14, fontWeight: 'bold', color: '#6B7280' },
  activeToggleText: { color: '#0B2F66' },

  providerGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 5 },
  providerCard: { width: '31%', backgroundColor: '#fff', paddingVertical: 15, borderRadius: 12, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.03, elevation: 1 },
  providerCardDark: { backgroundColor: '#1F2937', borderColor: '#374151' },
  activeProviderCard: { borderColor: '#0B2F66', borderWidth: 2, backgroundColor: '#F0F4FF' },
  activeProviderCardDark: { borderColor: '#60A5FA', backgroundColor: 'rgba(59, 130, 246, 0.1)' },
  providerIconBg: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  providerText: { fontSize: 12, fontWeight: 'bold', color: '#374151', textAlign: 'center' },

  quickAmountGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 15 },
  quickAmountChip: { width: '23%', backgroundColor: '#fff', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#D1D5DB' },
  quickAmountChipDark: { backgroundColor: '#1F2937', borderColor: '#374151' },
  activeQuickAmount: { backgroundColor: '#0B2F66', borderColor: '#0B2F66' },
  quickAmountText: { fontSize: 13, fontWeight: 'bold', color: '#374151' },
  activeQuickAmountText: { color: '#fff' },

  bottomContainer: { 
    position: 'absolute', bottom: 0, left: 0, right: 0, 
    padding: 20, 
    borderTopLeftRadius: 30, borderTopRightRadius: 30, 
    overflow: 'hidden', 
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
  },
  confirmBtn: { backgroundColor: '#0B2F66', height: 60, borderRadius: 15, justifyContent: 'center', alignItems: 'center', zIndex: 2 },
  confirmBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

  // Camera Scanner Styles
  scannerContainer: { flex: 1, backgroundColor: '#000' },
  scannerHeader: { position: 'absolute', top: 0, width: '100%', flexDirection: 'row', paddingHorizontal: 20, paddingTop: 10, zIndex: 10 },
  scannerCloseBtn: { width: 45, height: 45, borderRadius: 25, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  scannerOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scannerTarget: { width: 250, height: 250, borderWidth: 3, borderColor: '#60A5FA', borderRadius: 20, backgroundColor: 'transparent' },
  scannerInstructions: { color: '#fff', marginTop: 20, fontSize: 16, fontWeight: '600', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10 },

  modalOverlay: { 
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', 
    justifyContent: 'center', padding: 20, width: '100%', height: SCREEN_HEIGHT 
  },
  modalWrapper: { borderRadius: 30, overflow: 'hidden', elevation: 20 },
  glassModal: { borderRadius: 30 },
  modalGradient: { padding: 30, alignItems: 'center' },
  modalTitle: { fontSize: 22, fontWeight: 'bold' },
  modalSub: { color: '#6B7280', marginVertical: 10, textAlign: 'center' },

  pinBoxesContainer: { flexDirection: 'row', justifyContent: 'center', gap: 15, marginVertical: 25, position: 'relative', width: '100%' },
  pinBox: { width: 55, height: 65, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  pinBoxDark: { backgroundColor: 'rgba(255,255,255,0.1)' },
  pinBoxActive: { borderColor: '#4A9C9C' },
  pinDot: { fontSize: 28, color: '#111827' },
  hiddenPinInput: { ...StyleSheet.absoluteFillObject, opacity: 0, fontSize: 1 },

  modalActions: { flexDirection: 'row', gap: 15 },
  cancelBtn: { flex: 1, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6' },
  cancelBtnText: { color: '#111827', fontWeight: 'bold' }, // <-- ADDED THIS FIX
  payBtn: { flex: 1, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0B2F66' },
  payBtnText: { color: '#fff', fontWeight: 'bold' },
});