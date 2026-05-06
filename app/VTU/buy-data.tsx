import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, 
  Image, Modal, Alert, ActivityIndicator, Animated, Platform, Dimensions, Pressable 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Contacts from 'expo-contacts'; 
import * as Notifications from 'expo-notifications'; // <-- Added Notifications
import { router } from 'expo-router'; 
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { RootState } from '../../store/store'; 

// Configure notifications to show even when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const DATA_PLANS = [
  { id: '1', price: '₦500', size: '1GB' },
  { id: '2', price: '₦1000', size: '2.5GB' },
  { id: '3', price: '₦1500', size: '5GB' },
  { id: '4', price: '₦2500', size: '10GB' },
  { id: '5', price: '₦3500', size: '15GB' },
  { id: '6', price: '₦5000', size: '20GB' },
];

const NETWORKS = [
  { id: 'MTN', logo: require('../../assets/home/mtn.png') }, 
  { id: 'AIRTEL', logo: require('../../assets/home/airtel.png') },
  { id: 'GLO', logo: require('../../assets/home/glo.png') },
  { id: '9MOBILE', logo: require('../../assets/home/9mobile.png') },
];

const VTU_TYPES = ['SME', 'Direct', 'Gifting'];

export default function BuyDataScreen() {
  const isDark = useSelector((state: RootState) => state.theme.mode) === 'dark';
  const walletBalance = useSelector((state: RootState) => state.wallet?.balance ?? 0);
  const insets = useSafeAreaInsets();

  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const modalScale = useRef(new Animated.Value(0.8)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);

  const [phone, setPhone] = useState('');
  const [simType, setSimType] = useState('MTN');
  const [vtuType, setVtuType] = useState('SME');
  const [selectedPlan, setSelectedPlan] = useState('3'); 
  const [recentNumbers, setRecentNumbers] = useState<string[]>([]);

  const [isPinModalVisible, setPinModalVisible] = useState(false);
  const [pin, setPin] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const savedVisibility = await AsyncStorage.getItem('@balance_visible');
        if (savedVisibility !== null) setIsBalanceVisible(JSON.parse(savedVisibility));

        const savedNumbers = await AsyncStorage.getItem('@recent_numbers');
        if (savedNumbers !== null) setRecentNumbers(JSON.parse(savedNumbers));
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

  const openContactPicker = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status === 'granted') {
      const contact = await Contacts.presentContactPickerAsync();
      if (contact && contact.phoneNumbers && contact.phoneNumbers.length > 0) {
        let cleanNumber = contact.phoneNumbers[0].number?.replace(/[\s-]/g, '') || '';
        if (cleanNumber.startsWith('+234')) cleanNumber = '0' + cleanNumber.slice(4);
        setPhone(cleanNumber);
      }
    } else {
      Alert.alert('Permission Denied', 'Allow access to contacts to pick a number.');
    }
  };

  const saveRecentNumber = async (newNumber: string) => {
    try {
      const filtered = recentNumbers.filter(num => num !== newNumber); 
      const updatedList = [newNumber, ...filtered].slice(0, 7); 
      setRecentNumbers(updatedList);
      await AsyncStorage.setItem('@recent_numbers', JSON.stringify(updatedList));
    } catch (e) { console.error(e); }
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
    if (phone.length < 10) {
      Alert.alert('Invalid Number', 'Please enter a valid phone number.');
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
      
      await saveRecentNumber(phone);

      // Find the selected plan details for the dynamic notification message
      const planDetails = DATA_PLANS.find(p => p.id === selectedPlan);
      const planText = planDetails ? `${planDetails.size} for ${planDetails.price}` : 'Data bundle';

      // Trigger the local push notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Purchase Successful! 📶",
          body: `You successfully bought ${planText} for ${phone} on ${simType} network.`,
          sound: true,
        },
        trigger: null, // Null trigger means fire immediately
      });

      // Show standard alert as fallback/confirmation
      Alert.alert('Success', 'Data bundle sent successfully!');
    }, 2000);
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View style={[styles.topBar, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#0B2F66'} />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, isDark && styles.textDark]}>Buy Data</Text>
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

        <Text style={[styles.sectionLabel, isDark && styles.textDark]}>Phone Number</Text>
        <View style={[styles.inputContainer, isDark && styles.inputContainerDark]}>
            <TextInput
                style={[styles.input, isDark && styles.textDark]}
                placeholder="08123456789"
                placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                maxLength={11}
            />
            <TouchableOpacity onPress={openContactPicker}>
              <Ionicons name="journal-outline" size={24} color={isDark ? "#60A5FA" : "#0B2F66"} />
            </TouchableOpacity>
        </View>

        {recentNumbers.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recentScroll}>
            {recentNumbers.map((num, idx) => (
              <TouchableOpacity key={idx} style={[styles.recentChip, isDark && styles.recentChipDark]} onPress={() => setPhone(num)}>
                <Text style={[styles.recentChipText, isDark && styles.textDark]}>{num}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <Text style={[styles.sectionLabel, isDark && styles.textDark]}>SIM Type</Text>
        <View style={styles.simContainer}>
            {NETWORKS.map((net) => (
                <TouchableOpacity 
                    key={net.id} 
                    onPress={() => setSimType(net.id)}
                    style={[styles.simCard, isDark && styles.simCardDark, simType === net.id && styles.activeSimCard]}
                >
                    <Image source={net.logo} style={styles.simLogo} />
                </TouchableOpacity>
            ))}
        </View>

        <Text style={[styles.sectionLabel, isDark && styles.textDark]}>VTU Type</Text>
        <View style={styles.vtuContainer}>
            {VTU_TYPES.map((type) => (
                <TouchableOpacity 
                    key={type} 
                    onPress={() => setVtuType(type)}
                    style={[styles.vtuPill, isDark && styles.vtuPillDark, vtuType === type && styles.activeVtuPill]}
                >
                    <Text style={[styles.vtuText, isDark && styles.vtuTextDark, vtuType === type && styles.activeVtuText]}>{type}</Text>
                </TouchableOpacity>
            ))}
        </View>

        <View style={styles.planGrid}>
            {DATA_PLANS.map((plan) => (
                <TouchableOpacity 
                    key={plan.id} 
                    onPress={() => setSelectedPlan(plan.id)}
                    style={[styles.planCard, isDark && styles.planCardDark, selectedPlan === plan.id && styles.activePlanCard]}
                >
                    <Text style={[styles.planPrice, isDark && styles.textDark, selectedPlan === plan.id && styles.activeVtuText]}>{plan.price}</Text>
                    <Text style={[styles.planSize, selectedPlan === plan.id && { color: '#E0E7FF' }]}>({plan.size})</Text>
                </TouchableOpacity>
            ))}
        </View>
      </ScrollView>

      <BlurView 
        intensity={isDark ? 50 : 80} 
        tint={isDark ? "dark" : "light"} 
        experimentalBlurMethod="dimezisBlurView"
        style={[styles.bottomContainer, { paddingBottom: insets.bottom + 15 }]}
      >
          <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirmPress}>
              <Text style={styles.confirmBtnText}>Confirm and Pay</Text>
          </TouchableOpacity>
      </BlurView>

      <Modal 
        visible={isPinModalVisible} 
        transparent 
        animationType="none" 
        statusBarTranslucent={true}
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
                        <Text style={styles.modalSub}>Authorizing payment for {simType} {vtuType}</Text>
                        
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
  
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 15, paddingHorizontal: 15, height: 60, elevation: 2 },
  inputContainerDark: { backgroundColor: '#1F2937' },
  input: { flex: 1, fontSize: 16 },

  recentScroll: { marginTop: 15, flexDirection: 'row' },
  recentChip: { backgroundColor: '#E0E7FF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 10 },
  recentChipDark: { backgroundColor: '#374151' },
  recentChipText: { color: '#0B2F66', fontWeight: 'bold', fontSize: 13 },

  sectionLabel: { fontSize: 16, fontWeight: 'bold', marginTop: 25, marginBottom: 15 },
  simContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  simCard: { width: '22%', height: 60, backgroundColor: '#fff', borderRadius: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  simCardDark: { backgroundColor: '#1F2937', borderColor: '#374151' },
  activeSimCard: { borderColor: '#0B2F66', borderWidth: 2 },
  simLogo: { width: 35, height: 35, resizeMode: 'contain' },
  
  vtuContainer: { flexDirection: 'row', gap: 10 },
  vtuPill: { flex: 1, height: 45, backgroundColor: '#fff', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  vtuPillDark: { backgroundColor: '#1F2937' },
  activeVtuPill: { backgroundColor: '#0B2F66' },
  activeVtuText: { color: '#fff' },
  vtuTextDark: { color: '#D1D5DB' },
  vtuText: { color: '#111827', fontWeight: '600' },
  
  planGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 20 },
  planCard: { width: '31%', backgroundColor: '#fff', padding: 15, borderRadius: 15, alignItems: 'center', marginBottom: 15, elevation: 1 },
  planCardDark: { backgroundColor: '#1F2937' },
  activePlanCard: { backgroundColor: '#0B2F66' },
  planPrice: { fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
  planSize: { color: '#6B7280', fontSize: 12 },
  
  bottomContainer: { 
    position: 'absolute', bottom: 0, left: 0, right: 0, 
    padding: 20, 
    borderTopLeftRadius: 30, borderTopRightRadius: 30, 
    overflow: 'hidden', 
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
  },
  confirmBtn: { backgroundColor: '#0B2F66', height: 60, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  confirmBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

  modalOverlay: { 
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', 
    justifyContent: 'center', padding: 20, width: '100%', height: SCREEN_HEIGHT 
  },
  modalWrapper: { borderRadius: 30, overflow: 'hidden', elevation: 20 },
  glassModal: { borderRadius: 30 },
  modalGradient: { padding: 30, alignItems: 'center' },
  modalTitle: { fontSize: 22, fontWeight: 'bold' },
  modalSub: { color: '#6B7280', marginVertical: 10, textAlign: 'center' },

  pinBoxesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    marginVertical: 25,
    position: 'relative',
    width: '100%'
  },
  pinBox: {
    width: 55,
    height: 65,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent'
  },
  pinBoxDark: {
    backgroundColor: 'rgba(255,255,255,0.1)'
  },
  pinBoxActive: {
    borderColor: '#4A9C9C' 
  },
  pinDot: {
    fontSize: 28,
    color: '#111827',
  },
  hiddenPinInput: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0,
    fontSize: 1
  },

  modalActions: { flexDirection: 'row', gap: 15 },
  cancelBtn: { flex: 1, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6' },
  cancelBtnText: { color: '#111827', fontWeight: 'bold' },
  payBtn: { flex: 1, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0B2F66' },
  payBtnText: { color: '#fff', fontWeight: 'bold' },
});
