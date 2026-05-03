import React, { useState, useRef, useEffect } from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, 
  TextInput, Modal, Alert, ActivityIndicator, Pressable, Dimensions, PanResponder, Animated, KeyboardAvoidingView, Platform 
} from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import * as Contacts from 'expo-contacts'; 
import * as Notifications from 'expo-notifications'; 
import { router } from 'expo-router'; 
import { RootState } from '../../store/store';

const { height: SCREEN_HEIGHT } = Dimensions.get('screen');

// Configure notifications to show as a banner even when the app is open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Mock Data for the dynamic bundles
const BUNDLE_DATA = {
  MTN: [
    { id: '1', network: 'MTN', size: '5GB', price: '₦1,500', oldPrice: '₦1,500', label: 'Benam' },
    { id: '2', network: 'MTN', size: '10GB', price: '₦3,000', oldPrice: '₦3,000', label: 'Bonum' },
    { id: '3', network: 'MTN', size: '20GB', price: '₦5,000', oldPrice: '₦5,500', label: 'Jumbo' },
  ],
  AIRTEL: [
    { id: '4', network: 'Airtel', size: '10GB', price: '₦3,000', oldPrice: '₦3,000', label: 'Bonum' },
    { id: '5', network: 'Airtel', size: '10GB', price: '₦1,500', oldPrice: '₦3,300', label: 'Denam' },
  ],
  GLO: [
    { id: '6', network: 'Glo', size: '7GB', price: '₦1,500', oldPrice: '₦1,500', label: 'Mini' },
  ],
  '9MOBILE': [
    { id: '7', network: '9mobile', size: '15GB', price: '₦4,000', oldPrice: '₦4,500', label: 'Max' },
  ]
};

const NETWORKS = ['MTN', 'AIRTEL', 'GLO', '9MOBILE'] as const;

export default function QuickBundles() {
  const isDark = useSelector((state: RootState) => state.theme.mode) === 'dark';
  
  // Tab State
  const [activeTab, setActiveTab] = useState<typeof NETWORKS[number]>('MTN');

  // Quick Buy Modal State
  const [isQuickBuyVisible, setQuickBuyVisible] = useState(false);
  const [quickPhone, setQuickPhone] = useState('');
  const [quickPin, setQuickPin] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedQuickPlan, setSelectedQuickPlan] = useState<any>(null);
  
  // Validation Errors
  const [phoneError, setPhoneError] = useState('');
  const [pinError, setPinError] = useState('');

  const inputRef = useRef<TextInput>(null);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  // Request Notification Permissions on load
  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Notification permissions not granted');
      }
    })();
  }, []);

  const overlayOpacity = slideAnim.interpolate({
      inputRange: [0, SCREEN_HEIGHT / 2],
      outputRange: [1, 0],
      extrapolate: 'clamp'
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true, // Always capture touch on the handle area
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120 || gestureState.vy > 1.0) {
            closeModal(); 
        } else {
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 7,
                tension: 50,
                useNativeDriver: true,
            }).start();
        }
      },
    })
  ).current;

  const handleSelectPress = (bundle: any) => {
      setSelectedQuickPlan({ title: `${bundle.network} ${bundle.size}`, price: bundle.price });
      setPhoneError('');
      setPinError('');
      setQuickPhone('');
      setQuickPin('');
      
      slideAnim.setValue(SCREEN_HEIGHT);
      setQuickBuyVisible(true);
      
      Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 60,
          useNativeDriver: true,
      }).start(() => {
          setTimeout(() => inputRef.current?.focus(), 150);
      });
  };

  const closeModal = () => {
      Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
      }).start(() => {
          setQuickBuyVisible(false);
          setPhoneError('');
          setPinError('');
          setQuickPin('');
      });
  };

  const openContactPicker = async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
          const contact = await Contacts.presentContactPickerAsync();
          if (contact && contact.phoneNumbers && contact.phoneNumbers.length > 0) {
              let cleanNumber = contact.phoneNumbers[0].number?.replace(/[\s\-()]/g, '') || '';
              if (cleanNumber.startsWith('+234')) cleanNumber = '0' + cleanNumber.slice(4);
              setQuickPhone(cleanNumber);
              setPhoneError(''); 
          }
      } else {
          Alert.alert('Permission Denied', 'Allow access to contacts to pick a number.');
      }
  };

  const triggerSuccessNotification = async (planTitle: string, phone: string) => {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Payment Successful! 🎉",
          body: `Successfully sent ${planTitle} to ${phone}`,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH, 
        },
        trigger: null, 
      });
  };

  const handleQuickPayment = () => {
      let isValid = true;

      if (quickPhone.length < 10) {
          setPhoneError('Please select or enter a valid number.');
          isValid = false;
      } else setPhoneError('');

      if (quickPin.length < 4) {
          setPinError('Please enter your complete 4-digit PIN.');
          isValid = false;
      } else setPinError('');

      if (!isValid) return;

      setIsProcessing(true);
      setTimeout(() => {
          setIsProcessing(false);
          
          triggerSuccessNotification(selectedQuickPlan?.title || 'Data', quickPhone);
          Alert.alert('Payment Successful!', `Successfully sent ${selectedQuickPlan?.title || 'Data'} to ${quickPhone}`);
          
          closeModal();
      }, 1500);
  };

  const BundleCard = ({ network, size, price, oldPrice, label, onSelect }: any) => (
    <View style={[styles.bundleCard, isDark && styles.bundleCardDark]}>
        <Text style={[styles.bundleTitle, isDark && styles.textDark]}>{network} {size}</Text>
        <Text style={[styles.bundlePrice, isDark && styles.textDark]}>{price}</Text>
        
        <View style={styles.oldPriceContainer}>
            <Text style={styles.bundleOldPriceLabel}>{label}</Text>
            <Text style={[
                styles.bundleOldPrice, 
                isDark && styles.textDark,
                price !== oldPrice && { textDecorationLine: 'line-through', color: '#9CA3AF' }
            ]}>
                {oldPrice}
            </Text>
        </View>

        <TouchableOpacity style={styles.selectBtn} onPress={onSelect}>
            <Text style={styles.selectBtnText}>Select</Text>
        </TouchableOpacity>
    </View>
  );

  return (
    <View>
        <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Quick Bundles</Text>
            <TouchableOpacity onPress={() => router.push('/VTU/buy-data')}>
                <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScrollContent}>
            {NETWORKS.map((network) => {
                const isActive = activeTab === network;
                return (
                    <TouchableOpacity 
                        key={network}
                        onPress={() => setActiveTab(network)}
                        style={[
                            styles.tabBtn, 
                            isDark && styles.tabBtnDark,
                            isActive && styles.tabBtnActive,
                            isActive && isDark && styles.tabBtnActiveDark
                        ]}
                    >
                        <Text style={[
                            styles.tabBtnText, 
                            isActive && styles.tabBtnTextActive
                        ]}>
                            {network}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardsScrollContent}>
            {BUNDLE_DATA[activeTab].map((bundle) => (
                <BundleCard 
                    key={bundle.id}
                    network={bundle.network} 
                    size={bundle.size} 
                    price={bundle.price} 
                    oldPrice={bundle.oldPrice} 
                    label={bundle.label} 
                    onSelect={() => handleSelectPress(bundle)} 
                />
            ))}
        </ScrollView>

        {/* Slide-Up Quick Buy Modal */}
        <Modal
          visible={isQuickBuyVisible}
          transparent={true}
          animationType="none"
          statusBarTranslucent={true}
          navigationBarTranslucent={true}
          onRequestClose={closeModal}
        >
            <Animated.View style={[styles.modalOverlay, { opacity: overlayOpacity }]}>
                <Pressable style={StyleSheet.absoluteFill} onPress={closeModal} />
                
                {/* Keyboard Avoiding View wrapper to push content up when typing */}
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={{ width: '100%', justifyContent: 'flex-end', flex: 1 }}
                >
                    <Animated.View 
                        style={[
                            styles.modalContent, 
                            isDark && styles.modalContentDark, 
                            { transform: [{ translateY: slideAnim }] }
                        ]}
                    >
                        {/* Drag Handle Area */}
                        <View {...panResponder.panHandlers} style={styles.dragArea}>
                            <View style={styles.modalHandlebar} />
                            <Text style={[styles.modalTitle, isDark && styles.textDark]}>Quick Purchase</Text>
                            {selectedQuickPlan && (
                                <Text style={styles.modalSub}>
                                    You are about to buy <Text style={{fontWeight: 'bold', color: isDark ? '#60A5FA' : '#0B2F66'}}>{selectedQuickPlan.title}</Text> for {selectedQuickPlan.price}.
                                </Text>
                            )}
                        </View>
                        
                        {/* Form Body - stops propagation so touches don't close the modal */}
                        <Pressable style={{ width: '100%' }} onPress={(e) => e.stopPropagation()}>
                            <Text style={[styles.inputLabel, isDark && styles.textDark]}>Phone Number</Text>
                            <View style={[styles.inputContainer, isDark && styles.inputContainerDark, phoneError ? styles.inputErrorBorder : null, { marginBottom: phoneError ? 5 : 20 }]}>
                                <TextInput
                                    style={[styles.input, isDark && styles.textDark]}
                                    placeholder="08123456789"
                                    placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                                    keyboardType="phone-pad"
                                    value={quickPhone}
                                    onChangeText={(val) => {
                                        setQuickPhone(val);
                                        if (phoneError) setPhoneError('');
                                    }}
                                    maxLength={11}
                                />
                                <TouchableOpacity onPress={openContactPicker} style={{ padding: 5 }}>
                                    <Ionicons name="journal-outline" size={24} color={isDark ? "#60A5FA" : "#0B2F66"} />
                                </TouchableOpacity>
                            </View>
                            {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}

                            <Text style={[styles.inputLabel, isDark && styles.textDark]}>Transaction PIN</Text>
                            
                            <Pressable style={[styles.pinBoxesContainer, pinError ? { marginBottom: 5 } : null]} onPress={() => inputRef.current?.focus()}>
                                {[0, 1, 2, 3].map((index) => (
                                  <View 
                                    key={index} 
                                    style={[
                                      styles.pinBox, 
                                      isDark && styles.pinBoxDark,
                                      quickPin.length === index && styles.pinBoxActive,
                                      pinError ? styles.inputErrorBorder : null
                                    ]}
                                  >
                                    <Text style={[styles.pinDot, isDark && styles.textDark]}>
                                      {quickPin.length > index ? '•' : ''}
                                    </Text>
                                  </View>
                                ))}

                                <TextInput
                                    ref={inputRef}
                                    style={styles.hiddenPinInput}
                                    keyboardType="numeric"
                                    maxLength={4}
                                    value={quickPin}
                                    onChangeText={(val) => {
                                        setQuickPin(val);
                                        if (pinError) setPinError('');
                                        if (val.length === 4) handleQuickPayment();
                                    }}
                                />
                            </Pressable>
                            {pinError ? <Text style={styles.errorText}>{pinError}</Text> : null}

                            <View style={styles.modalActions}>
                                <TouchableOpacity style={styles.cancelBtn} onPress={closeModal} disabled={isProcessing}>
                                    <Text style={styles.cancelBtnText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.payBtn} onPress={handleQuickPayment} disabled={isProcessing}>
                                    {isProcessing ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.payBtnText}>Pay Now</Text>}
                                </TouchableOpacity>
                            </View>
                        </Pressable>
                    </Animated.View>
                </KeyboardAvoidingView>
            </Animated.View>
        </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 30, marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  seeAllText: { color: '#4A9C9C', fontWeight: '600' },
  textDark: { color: '#F9FAFB' },
  
  horizontalScrollContent: { paddingHorizontal: 20, paddingBottom: 15 },
  
  tabBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#D1D5DB', marginRight: 10 },
  tabBtnDark: { borderColor: '#374151' },
  tabBtnActive: { backgroundColor: '#0B2F66', borderColor: '#0B2F66' },
  tabBtnActiveDark: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
  tabBtnText: { color: '#6B7280', fontWeight: 'bold' },
  tabBtnTextActive: { color: '#fff', fontWeight: 'bold' },
  
  cardsScrollContent: { paddingHorizontal: 20, paddingBottom: 10 },
  
  bundleCard: { 
      backgroundColor: '#fff', 
      borderRadius: 16, 
      padding: 18, 
      marginRight: 15, 
      width: 150, 
      shadowColor: '#000', 
      shadowOffset: { width: 0, height: 4 }, 
      shadowOpacity: 0.06, 
      shadowRadius: 6, 
      elevation: 3,
      borderWidth: 1,
      borderColor: '#F3F4F6'
  },
  bundleCardDark: { backgroundColor: '#1F2937', borderColor: '#374151', shadowOpacity: 0 },
  
  bundleTitle: { fontWeight: 'bold', fontSize: 15, color: '#111827', marginBottom: 4 },
  bundlePrice: { fontWeight: '900', fontSize: 18, color: '#111827', marginBottom: 15 },
  
  oldPriceContainer: { marginBottom: 15 },
  bundleOldPriceLabel: { fontSize: 12, color: '#6B7280', marginBottom: 2 },
  bundleOldPrice: { fontSize: 14, color: '#111827', fontWeight: '700' },
  
  selectBtn: { 
      backgroundColor: '#0B2F66', 
      paddingVertical: 12, 
      borderRadius: 20, 
      alignItems: 'center' 
  },
  selectBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },

  modalOverlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end', height: SCREEN_HEIGHT, width: '100%', zIndex: 100 },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, paddingBottom: 40, alignItems: 'center' },
  modalContentDark: { backgroundColor: '#1F2937' },
  
  dragArea: { width: '100%', alignItems: 'center', paddingBottom: 15, paddingTop: 5, backgroundColor: 'transparent' }, 
  modalHandlebar: { width: 55, height: 6, backgroundColor: '#D1D5DB', borderRadius: 4, marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  modalSub: { textAlign: 'center', color: '#6B7280', fontSize: 14, marginBottom: 5, paddingHorizontal: 10, lineHeight: 22 },
  
  inputLabel: { alignSelf: 'flex-start', fontSize: 13, fontWeight: 'bold', color: '#374151', marginBottom: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 15, height: 55, width: '100%' },
  inputContainerDark: { backgroundColor: '#374151', borderColor: '#4B5563' },
  input: { flex: 1, fontSize: 16, color: '#111827' },
  
  inputErrorBorder: { borderColor: '#EF4444', borderWidth: 1.5 },
  errorText: { alignSelf: 'flex-start', color: '#EF4444', fontSize: 12, marginBottom: 15, fontWeight: '600', marginLeft: 5 },
  
  pinBoxesContainer: { flexDirection: 'row', justifyContent: 'center', gap: 15, marginBottom: 30, width: '100%', position: 'relative' },
  pinBox: { width: 55, height: 65, backgroundColor: '#F9FAFB', borderRadius: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  pinBoxDark: { backgroundColor: '#374151', borderColor: '#4B5563' },
  pinBoxActive: { borderColor: '#4A9C9C', borderWidth: 2 },
  pinDot: { fontSize: 28, color: '#111827' },
  hiddenPinInput: { ...StyleSheet.absoluteFillObject, opacity: 0, fontSize: 1 },
  
  modalActions: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
  cancelBtn: { flex: 1, paddingVertical: 16, borderRadius: 12, backgroundColor: '#F3F4F6', marginRight: 10, alignItems: 'center' },
  cancelBtnText: { color: '#4B5563', fontWeight: 'bold', fontSize: 15 },
  payBtn: { flex: 1, paddingVertical: 16, borderRadius: 12, backgroundColor: '#0B2F66', marginLeft: 10, alignItems: 'center' },
  payBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});