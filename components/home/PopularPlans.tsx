import React, { useState, useRef, useEffect } from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, 
  ImageSourcePropType, TextInput, Modal, Alert, ActivityIndicator, Pressable, Dimensions, PanResponder, Animated, KeyboardAvoidingView, Platform 
} from 'react-native';
import { useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient'; 
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

const PLAN_DATA = {
  MTN: [
    { id: '1', title: 'MTN 20GB + Bonus', validity: '30 Days', price: '₦5,000', colors: ['#FF7A00', '#FF9F40'], btnText: '#FF7A00' },
    { id: '2', title: 'MTN 10GB', validity: '30 Days', price: '₦3,000', colors: ['#4A9C9C', '#61BDBD'], btnText: '#4A9C9C' },
  ],
  AIRTEL: [
    { id: '3', title: 'Airtel 15GB Binge', validity: '30 Days', price: '₦4,000', colors: ['#E60000', '#FF4D4D'], btnText: '#E60000' },
    { id: '4', title: 'Airtel 5GB', validity: '14 Days', price: '₦1,500', colors: ['#4A9C9C', '#61BDBD'], btnText: '#4A9C9C' },
  ],
  GLO: [
    { id: '5', title: 'Glo 22GB Jumbo', validity: '30 Days', price: '₦5,000', colors: ['#009933', '#33CC66'], btnText: '#009933' },
  ],
  '9MOBILE': [
    { id: '6', title: '9mobile 7GB', validity: '30 Days', price: '₦4,000', colors: ['#006600', '#009900'], btnText: '#006600' },
  ]
};

const LOGOS = {
  MTN: require('../../assets/home/mtn.png'),
  AIRTEL: require('../../assets/home/airtel.png'),
  GLO: require('../../assets/home/glo.png'),
  '9MOBILE': require('../../assets/home/9mobile.png'),
};

export default function PopularPlans() {
  const isDark = useSelector((state: RootState) => state.theme.mode) === 'dark';
  const [activeNetwork, setActiveNetwork] = useState<keyof typeof PLAN_DATA>('MTN');

  const [isQuickBuyVisible, setQuickBuyVisible] = useState(false);
  const [quickPhone, setQuickPhone] = useState('');
  const [quickPin, setQuickPin] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedQuickPlan, setSelectedQuickPlan] = useState<any>(null);
  
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

  // THE FIX: Gestures only activate on deliberate vertical downward swipes.
  // We explicitly return false for onStartShouldSetPanResponder so taps go straight to inputs.
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false, 
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only steal gesture if user swipes DOWN firmly (dy > 20)
        return gestureState.dy > 20 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120 || gestureState.vy > 1.0) {
            closeModal(); 
        } else {
            // Snap back up if not dragged far enough
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

  const openModal = (plan: any) => {
      setSelectedQuickPlan(plan);
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

  const handleQuickPayment = (currentPin: string) => {
      let isValid = true;

      if (quickPhone.length < 10) {
          setPhoneError('Please select or enter a valid number.');
          isValid = false;
      } else setPhoneError('');

      if (currentPin.length < 4) {
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

  const NetworkPill = ({ network, imageSource }: { network: keyof typeof PLAN_DATA, imageSource: ImageSourcePropType }) => {
    const isActive = activeNetwork === network;
    return (
        <TouchableOpacity 
            onPress={() => setActiveNetwork(network)} 
            style={[
                styles.simCard, 
                isDark && styles.simCardDark, 
                isActive && styles.activeSimCard 
            ]}
        >
           <Image source={imageSource} style={styles.simLogo} />
        </TouchableOpacity>
    );
  };

  return (
    <View>
      <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Popular Data Plans</Text>
          <TouchableOpacity onPress={() => router.push('/VTU/buy-data')}>
              <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
      </View>
      
      <View style={styles.simContainer}>
           <NetworkPill network="MTN" imageSource={LOGOS.MTN} />
           <NetworkPill network="AIRTEL" imageSource={LOGOS.AIRTEL} />
           <NetworkPill network="GLO" imageSource={LOGOS.GLO} />
           <NetworkPill network="9MOBILE" imageSource={LOGOS['9MOBILE']} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardsScrollContent}>
          {PLAN_DATA[activeNetwork].map((plan) => (
             <LinearGradient 
                key={plan.id}
                colors={plan.colors} 
                start={{ x: 0, y: 0 }} 
                end={{ x: 1, y: 1 }}
                style={styles.planCard}
             >
                  <View style={styles.planCardHeader}>
                      <View style={styles.logoSmContainer}>
                          <Image source={LOGOS[activeNetwork]} style={styles.cardSmallLogo} />
                      </View>
                      <Text style={styles.planCardTitle}>{plan.title}</Text>
                  </View>
                  <Text style={styles.planCardValidity}>{plan.validity}</Text>
                  
                  <View style={styles.planCardFooter}>
                      <Text style={styles.planCardPrice}>{plan.price}</Text>
                      <TouchableOpacity style={styles.buyNowBtn} onPress={() => openModal(plan)}>
                          <Text style={[styles.buyNowText, { color: plan.btnText }]}>Buy Now</Text>
                      </TouchableOpacity>
                  </View>
             </LinearGradient>
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
          {/* Animated Dim Overlay */}
          <Animated.View style={[styles.modalOverlay, { opacity: overlayOpacity }]}>
              <Pressable style={StyleSheet.absoluteFill} onPress={closeModal} />
              
              {/* THE FIX: KeyboardAvoidingView wraps the Animated.View */}
              <KeyboardAvoidingView
                  behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                  style={{ width: '100%', justifyContent: 'flex-end', flex: 1 }}
              >
                  <Animated.View 
                      {...panResponder.panHandlers}
                      style={[
                          styles.modalContent, 
                          isDark && styles.modalContentDark, 
                          { transform: [{ translateY: slideAnim }] }
                      ]}
                  >
                      {/* Drag Handle Area */}
                      <View style={styles.dragArea}>
                          <View style={styles.modalHandlebar} />
                          <Text style={[styles.modalTitle, isDark && styles.textDark]}>Quick Purchase</Text>
                          {selectedQuickPlan && (
                              <Text style={styles.modalSub}>
                                  You are about to buy <Text style={{fontWeight: 'bold', color: isDark ? '#60A5FA' : '#0B2F66'}}>{selectedQuickPlan.title}</Text> for {selectedQuickPlan.price}.
                              </Text>
                          )}
                      </View>
                      
                      {/* Form Container (We stop propagation so taps here don't trigger the close animation) */}
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
                                      if (val.length === 4) handleQuickPayment(val);
                                  }}
                              />
                          </Pressable>
                          {pinError ? <Text style={styles.errorText}>{pinError}</Text> : null}

                          <View style={styles.modalActions}>
                              <TouchableOpacity style={styles.cancelBtn} onPress={closeModal} disabled={isProcessing}>
                                  <Text style={styles.cancelBtnText}>Cancel</Text>
                              </TouchableOpacity>
                              <TouchableOpacity style={styles.payBtn} onPress={() => handleQuickPayment(quickPin)} disabled={isProcessing}>
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
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 25, marginBottom: 15 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  seeAllText: { color: '#0B2F66', fontWeight: 'bold', fontSize: 14 },
  textDark: { color: '#F9FAFB' },
  
  simContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 15 },
  simCard: { width: '22%', height: 60, backgroundColor: '#fff', borderRadius: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  simCardDark: { backgroundColor: '#1F2937', borderColor: '#374151' },
  activeSimCard: { borderColor: '#0B2F66', borderWidth: 2 },
  simLogo: { width: 35, height: 35, resizeMode: 'contain' },
  
  cardsScrollContent: { paddingHorizontal: 20, paddingBottom: 10 },
  
  planCard: { width: 290, borderRadius: 15, padding: 18, marginRight: 15, shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.1, shadowRadius: 5, elevation: 4 },
  planCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  logoSmContainer: { backgroundColor: '#fff', width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center', marginRight: 10, overflow: 'hidden' },
  cardSmallLogo: { width: 16, height: 16, resizeMode: 'contain' },
  planCardTitle: { color: '#fff', fontWeight: 'bold', fontSize: 17 },
  planCardValidity: { color: 'rgba(255, 255, 255, 0.8)', fontSize: 13, marginBottom: 20 },
  planCardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  planCardPrice: { color: '#fff', fontWeight: 'bold', fontSize: 24 },
  buyNowBtn: { backgroundColor: '#fff', paddingVertical: 10, paddingHorizontal: 18, borderRadius: 20 },
  buyNowText: { fontWeight: 'bold', fontSize: 14 },

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