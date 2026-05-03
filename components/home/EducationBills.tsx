import React, { useState, useRef, useEffect } from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, StyleSheet, 
  TextInput, Modal, Alert, ActivityIndicator, Pressable, Dimensions, PanResponder, Animated, KeyboardAvoidingView, Platform 
} from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import * as Contacts from 'expo-contacts'; 
import * as Notifications from 'expo-notifications'; 
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

const EDU_DATA = [
  { id: '1', title: 'WAEC Result Pin', price: '₦3,500', icon: 'school-outline', color: '#0B2F66', bg: '#E0E7FF' },
  { id: '2', title: 'NECO Token', price: '₦1,200', icon: 'document-text-outline', color: '#10B981', bg: '#D1FAE5' },
  { id: '3', title: 'JAMB E-PIN', price: '₦6,200', icon: 'book-outline', color: '#FF7A00', bg: '#FFEDD5' },
];

export default function EducationBills() {
  const isDark = useSelector((state: RootState) => state.theme.mode) === 'dark';

  // Quick Buy Modal State
  const [isQuickBuyVisible, setQuickBuyVisible] = useState(false);
  const [quickPhone, setQuickPhone] = useState('');
  const [quickPin, setQuickPin] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedEduPlan, setSelectedEduPlan] = useState<any>(null);

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

  // Smooth drag-to-close PanResponder
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true, // Instantly capture touches on the handle
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

  const handleBuyPress = (plan: any) => {
      setSelectedEduPlan(plan);
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
          title: "Purchase Successful! 🎉",
          body: `Your ${planTitle} PIN has been sent to ${phone}`,
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
      
      // Simulate API call & PIN generation
      setTimeout(() => {
          setIsProcessing(false);
          
          triggerSuccessNotification(selectedEduPlan?.title || 'PIN', quickPhone);
          
          Alert.alert(
              'Purchase Successful!', 
              `Your ${selectedEduPlan?.title} has been generated.\n\nPIN: 4829-1039-4820-1928\n\nA copy has been sent to ${quickPhone}.`
          );
          
          closeModal();
      }, 1500);
  };

  return (
    <View>
        <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Education Pins</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardsScrollContent}>
            {EDU_DATA.map((item) => (
                <View key={item.id} style={[styles.eduCard, isDark && styles.eduCardDark]}>
                    <View style={styles.cardHeader}>
                        <View style={[styles.iconContainer, { backgroundColor: isDark ? '#374151' : item.bg }]}>
                            <Ionicons name={item.icon as any} size={24} color={isDark ? '#60A5FA' : item.color} />
                        </View>
                        <Text style={[styles.eduTitle, isDark && styles.textDark]}>{item.title}</Text>
                    </View>
                    
                    <View style={styles.cardFooter}>
                        <Text style={[styles.eduPrice, isDark && styles.textDark]}>{item.price}</Text>
                        <TouchableOpacity 
                            style={styles.buyBtn}
                            onPress={() => handleBuyPress(item)}
                        >
                            <Text style={styles.buyBtnText}>Buy Pin</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ))}
        </ScrollView>

        {/* Slide-Up Quick Buy Modal for Education Pins */}
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
                
                {/* Keyboard Avoiding View wrapper */}
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
                            <Text style={[styles.modalTitle, isDark && styles.textDark]}>Purchase PIN</Text>
                            {selectedEduPlan && (
                                <Text style={styles.modalSub}>
                                    You are about to buy a <Text style={{fontWeight: 'bold', color: isDark ? '#60A5FA' : '#0B2F66'}}>{selectedEduPlan.title}</Text> for {selectedEduPlan.price}.
                                </Text>
                            )}
                        </View>
                        
                        {/* Form Body - stops propagation */}
                        <Pressable style={{ width: '100%' }} onPress={(e) => e.stopPropagation()}>
                            
                            <Text style={[styles.inputLabel, isDark && styles.textDark]}>Phone Number (To receive PIN)</Text>
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
                                    <Ionicons name="chatbubble-ellipses-outline" size={24} color={isDark ? "#60A5FA" : "#0B2F66"} />
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
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 20, marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  textDark: { color: '#F9FAFB' },
  
  cardsScrollContent: { paddingHorizontal: 20, paddingBottom: 10 },
  
  eduCard: {
      backgroundColor: '#fff', 
      borderRadius: 16, 
      padding: 16, 
      marginRight: 15, 
      width: 170, 
      shadowColor: '#000', 
      shadowOffset: { width: 0, height: 4 }, 
      shadowOpacity: 0.05, 
      shadowRadius: 5, 
      elevation: 2,
      borderWidth: 1,
      borderColor: '#F3F4F6'
  },
  eduCardDark: { backgroundColor: '#1F2937', borderColor: '#374151', shadowOpacity: 0 },
  
  cardHeader: { marginBottom: 15 },
  iconContainer: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  eduTitle: { fontWeight: '700', fontSize: 14, color: '#374151' },
  
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 },
  eduPrice: { fontWeight: '900', fontSize: 16, color: '#111827' },
  
  buyBtn: { backgroundColor: '#0B2F66', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  buyBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },

  // --- Quick Buy Modal Styles ---
  modalOverlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end', height: SCREEN_HEIGHT, width: '100%', zIndex: 100 },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, paddingBottom: 40, alignItems: 'center' },
  modalContentDark: { backgroundColor: '#1F2937' },
  
  dragArea: { width: '100%', alignItems: 'center', paddingBottom: 15, paddingTop: 5, backgroundColor: 'transparent' }, 
  modalHandlebar: { width: 55, height: 6, backgroundColor: '#D1D5DB', borderRadius: 4, marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  modalSub: { textAlign: 'center', color: '#6B7280', fontSize: 14, marginBottom: 15, paddingHorizontal: 10, lineHeight: 22 },
  
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