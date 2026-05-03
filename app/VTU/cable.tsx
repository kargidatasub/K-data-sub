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
import * as Notifications from 'expo-notifications'; // <-- Make sure this is imported
import { RootState } from '../../store/store'; 

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Mock Data for Cable Providers
const PROVIDERS = [
  { id: 'DSTV', name: 'DStv', color: '#00539F' }, 
  { id: 'GOTV', name: 'GOtv', color: '#E31837' },
  { id: 'STARTIMES', name: 'StarTimes', color: '#F28C00' },
  { id: 'SHOWMAX', name: 'Showmax', color: '#D21A6A' },
];

const CABLE_PLANS: Record<string, { id: string, name: string, price: string, amount: number }[]> = {
  DSTV: [
    { id: 'd1', name: 'Padi', price: '₦2,500', amount: 2500 },
    { id: 'd2', name: 'Yanga', price: '₦3,500', amount: 3500 },
    { id: 'd3', name: 'Confam', price: '₦6,200', amount: 6200 },
    { id: 'd4', name: 'Compact', price: '₦10,500', amount: 10500 },
    { id: 'd5', name: 'Compact Plus', price: '₦17,500', amount: 17500 },
    { id: 'd6', name: 'Premium', price: '₦24,500', amount: 24500 },
  ],
  GOTV: [
    { id: 'g1', name: 'Smallie', price: '₦1,100', amount: 1100 },
    { id: 'g2', name: 'Jinja', price: '₦2,250', amount: 2250 },
    { id: 'g3', name: 'Jolli', price: '₦3,300', amount: 3300 },
    { id: 'g4', name: 'Max', price: '₦4,850', amount: 4850 },
    { id: 'g5', name: 'Supa', price: '₦6,400', amount: 6400 },
  ],
  STARTIMES: [
    { id: 's1', name: 'Nova', price: '₦1,200', amount: 1200 },
    { id: 's2', name: 'Basic', price: '₦2,100', amount: 2100 },
    { id: 's3', name: 'Smart', price: '₦2,800', amount: 2800 },
    { id: 's4', name: 'Classic', price: '₦3,100', amount: 3100 },
  ],
  SHOWMAX: [
    { id: 'sh1', name: 'Mobile', price: '₦1,200', amount: 1200 },
    { id: 'sh2', name: 'Pro Mobile', price: '₦3,200', amount: 3200 },
    { id: 'sh3', name: 'Standard', price: '₦2,900', amount: 2900 },
  ]
};

export default function CableScreen() {
  const isDark = useSelector((state: RootState) => state.theme.mode) === 'dark';
  const walletBalance = useSelector((state: RootState) => state.wallet?.balance ?? 0);
  const insets = useSafeAreaInsets();

  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const modalScale = useRef(new Animated.Value(0.8)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);

  const [smartcard, setSmartcard] = useState('');
  const [provider, setProvider] = useState('DSTV');
  const [selectedPlan, setSelectedPlan] = useState(CABLE_PLANS['DSTV'][0]);
  const [recentCards, setRecentCards] = useState<string[]>([]);

  const [isPinModalVisible, setPinModalVisible] = useState(false);
  const [pin, setPin] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Scanner State & Permissions
  const [isScannerVisible, setScannerVisible] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  useEffect(() => {
    setSelectedPlan(CABLE_PLANS[provider][0]);
  }, [provider]);

  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const savedVisibility = await AsyncStorage.getItem('@balance_visible');
        if (savedVisibility !== null) setIsBalanceVisible(JSON.parse(savedVisibility));

        const savedCards = await AsyncStorage.getItem('@recent_smartcards');
        if (savedCards !== null) setRecentCards(JSON.parse(savedCards));
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

  const saveRecentCard = async (cardToSave: string) => {
    try {
      const filtered = recentCards.filter(c => c !== cardToSave);
      const updated = [cardToSave, ...filtered].slice(0, 5); 
      setRecentCards(updated);
      await AsyncStorage.setItem('@recent_smartcards', JSON.stringify(updated));
    } catch (e) { console.error(e); }
  };

  const openScanner = async () => {
    if (!cameraPermission?.granted) {
      const result = await requestCameraPermission();
      if (!result.granted) {
        Alert.alert('Permission Denied', 'You need to grant camera access to scan barcodes.');
        return;
      }
    }
    setScannerVisible(true);
  };

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    setScannerVisible(false);
    const cleanNumber = data.replace(/\D/g, '').slice(0, 12);
    setSmartcard(cleanNumber);
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
    if (smartcard.length < 10) {
      Alert.alert('Invalid Number', 'Please enter a valid Smartcard/IUC number.');
      return;
    }
    if (!selectedPlan) {
      Alert.alert('Select Plan', 'Please select a subscription plan.');
      return;
    }
    setPinModalVisible(true);
  };

  // --- UPDATED PAYMENT HANDLER WITH NOTIFICATIONS ---
  const handlePayment = async (currentPin: string) => {
    if (currentPin.length < 4) return;
    setIsProcessing(true);

    setTimeout(async () => {
      setIsProcessing(false);
      setPinModalVisible(false);
      setPin('');
      
      await saveRecentCard(smartcard);

      // Trigger the local push notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Subscription Successful! 📺",
          body: `You successfully renewed ${provider} ${selectedPlan.name} for ${smartcard}.`,
          sound: true,
        },
        trigger: null,
      });

      Alert.alert('Subscription Successful!', `Successfully renewed ${provider} ${selectedPlan.name} for ${smartcard}`, [
        { text: 'OK', onPress: () => router.back() } 
      ]);
    }, 2000);
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View style={[styles.topBar, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#0B2F66'} />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, isDark && styles.textDark]}>Cable TV</Text>
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

        <Text style={[styles.sectionLabel, isDark && styles.textDark]}>Smartcard / IUC Number</Text>
        <View style={[styles.inputContainer, isDark && styles.inputContainerDark]}>
            <TextInput
                style={[styles.input, isDark && styles.textDark]}
                placeholder="Enter 10-digit number"
                placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                keyboardType="numeric"
                value={smartcard}
                onChangeText={setSmartcard}
                maxLength={12}
            />
            <TouchableOpacity onPress={openScanner}>
                <Ionicons name="barcode-outline" size={24} color={isDark ? "#60A5FA" : "#0B2F66"} />
            </TouchableOpacity>
        </View>

        {recentCards.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recentScroll}>
            {recentCards.map((num, idx) => (
              <TouchableOpacity key={idx} style={[styles.recentChip, isDark && styles.recentChipDark]} onPress={() => setSmartcard(num)}>
                <Ionicons name="tv-outline" size={14} color={isDark ? "#9CA3AF" : "#6B7280"} style={{marginRight: 6}} />
                <Text style={[styles.recentChipText, isDark && styles.textDark]}>{num}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <Text style={[styles.sectionLabel, isDark && styles.textDark]}>Provider</Text>
        <View style={styles.providerContainer}>
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
                    <Text style={[
                        styles.providerText,
                        { color: provider === prov.id ? (isDark ? '#fff' : prov.color) : (isDark ? '#9CA3AF' : '#6B7280') }
                    ]}>
                        {prov.name}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>

        <View style={styles.planHeaderRow}>
            <Text style={[styles.sectionLabel, isDark && styles.textDark, {marginBottom: 0}]}>Select Package</Text>
        </View>

        <View style={styles.planGrid}>
            {CABLE_PLANS[provider].map((plan) => (
                <TouchableOpacity 
                    key={plan.id} 
                    onPress={() => setSelectedPlan(plan)}
                    style={[
                        styles.planCard, 
                        isDark && styles.planCardDark,
                        selectedPlan.id === plan.id && styles.activePlanCard
                    ]}
                >
                    <Text style={[
                      styles.planName, 
                      isDark && styles.textDark, 
                      selectedPlan.id === plan.id && { color: '#0B2F66' }, 
                      selectedPlan.id === plan.id && isDark && { color: '#60A5FA' }
                    ]} numberOfLines={1}>
                        {plan.name}
                    </Text>
                    <Text style={[styles.planPrice, isDark && {color: '#9CA3AF'}]}>{plan.price}</Text>
                </TouchableOpacity>
            ))}
        </View>
      </ScrollView>

      <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + 15 }]}>
          <BlurView 
            intensity={isDark ? 50 : 80} 
            tint={isDark ? "dark" : "light"} 
            experimentalBlurMethod="dimezisBlurView"
            style={StyleSheet.absoluteFill} 
          />
          <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirmPress}>
              <Text style={styles.confirmBtnText}>Pay {selectedPlan ? selectedPlan.price : ''}</Text>
          </TouchableOpacity>
      </View>

      {/* --- ADDED navigationBarTranslucent TO SCANNER MODAL --- */}
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
            <Text style={styles.scannerInstructions}>Align barcode or QR within the frame</Text>
          </View>
          <SafeAreaView style={styles.scannerHeader}>
            <TouchableOpacity onPress={() => setScannerVisible(false)} style={styles.scannerCloseBtn}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
          </SafeAreaView>
        </View>
      </Modal>

      {/* --- ADDED navigationBarTranslucent TO PIN MODAL --- */}
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
                        <Text style={styles.modalSub}>Authorizing {provider} {selectedPlan?.name} payment</Text>
                        
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

  recentScroll: { marginTop: 15, flexDirection: 'row' },
  recentChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E0E7FF', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginRight: 10 },
  recentChipDark: { backgroundColor: '#374151' },
  recentChipText: { color: '#0B2F66', fontWeight: 'bold', fontSize: 13, letterSpacing: 1 },

  sectionLabel: { fontSize: 16, fontWeight: 'bold', marginTop: 25, marginBottom: 15 },
  providerContainer: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 },
  providerCard: { width: '48%', backgroundColor: '#fff', height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#D1D5DB', shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, elevation: 2 },
  providerCardDark: { backgroundColor: '#1F2937', borderColor: '#374151' },
  activeProviderCard: { borderColor: '#0B2F66', backgroundColor: '#F0F4FF', borderWidth: 2 },
  activeProviderCardDark: { borderColor: '#60A5FA', backgroundColor: 'rgba(59, 130, 246, 0.1)' },
  providerText: { fontSize: 15, fontWeight: 'bold' },

  planHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, marginTop: 25 },
  planGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  planCard: { width: '48%', backgroundColor: '#fff', paddingVertical: 18, paddingHorizontal: 10, borderRadius: 12, alignItems: 'center', marginBottom: 15, borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.03, elevation: 1 },
  planCardDark: { backgroundColor: '#1F2937', borderColor: '#374151' },
  activePlanCard: { borderColor: '#0B2F66', borderWidth: 2, backgroundColor: '#F0F4FF' },
  planName: { fontSize: 14, fontWeight: 'bold', color: '#374151', marginBottom: 6, textAlign: 'center' },
  planPrice: { fontSize: 15, fontWeight: '900', color: '#111827' },

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