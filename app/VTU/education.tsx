import React, { useState, useRef } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, 
  TextInput, Modal, Alert, ActivityIndicator, Pressable, Dimensions, PanResponder, Animated, KeyboardAvoidingView, Platform 
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import * as Contacts from 'expo-contacts'; 
import * as Notifications from 'expo-notifications'; 
import { router } from 'expo-router';
import { RootState } from '../../store/store';

const { height: SCREEN_HEIGHT } = Dimensions.get('screen');

const EDU_BILLERS = [
  { id: '1', name: 'WAEC', title: 'WAEC Result Pin', price: 3500, icon: 'school', color: '#0B2F66' },
  { id: '2', name: 'NECO', title: 'NECO Token', price: 1200, icon: 'document-text', color: '#10B981' },
  { id: '3', name: 'JAMB', title: 'JAMB E-PIN', price: 6200, icon: 'book', color: '#FF7A00' },
  { id: '4', name: 'NABTEB', title: 'NABTEB Result Pin', price: 2500, icon: 'medal', color: '#EF4444' },
];

export default function EducationPage() {
  const isDark = useSelector((state: RootState) => state.theme.mode) === 'dark';
  const insets = useSafeAreaInsets();
  
  const [isQuickBuyVisible, setQuickBuyVisible] = useState(false);
  const [quickPhone, setQuickPhone] = useState('');
  const [quickPin, setQuickPin] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  
  const [phoneError, setPhoneError] = useState('');
  const [pinError, setPinError] = useState('');

  const phoneInputRef = useRef<TextInput>(null);
  const pinInputRef = useRef<TextInput>(null);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const overlayOpacity = slideAnim.interpolate({
      inputRange: [0, SCREEN_HEIGHT / 2],
      outputRange: [1, 0],
      extrapolate: 'clamp'
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) slideAnim.setValue(gestureState.dy);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120 || gestureState.vy > 1.0) closeModal();
        else Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 60, useNativeDriver: true }).start();
      },
    })
  ).current;

  const openModal = (plan: any) => {
      setSelectedPlan(plan);
      setQuickBuyVisible(true);
      Animated.spring(slideAnim, { toValue: 0, friction: 8, useNativeDriver: true }).start(() => {
          setTimeout(() => phoneInputRef.current?.focus(), 150);
      });
  };

  const closeModal = () => {
      Animated.timing(slideAnim, { toValue: SCREEN_HEIGHT, duration: 250, useNativeDriver: true }).start(() => {
          setQuickBuyVisible(false);
          setQuickPhone('');
          setQuickPin('');
      });
  };

  const handlePayment = () => {
      if (quickPhone.length < 10) { setPhoneError('Enter valid phone number'); return; }
      if (quickPin.length < 4) { setPinError('Enter 4-digit PIN'); return; }

      setIsProcessing(true);
      setTimeout(async () => {
          setIsProcessing(false);
          await Notifications.scheduleNotificationAsync({
            content: { title: "PIN Purchased! 🎓", body: `Your ${selectedPlan.name} PIN is ready.`, priority: Notifications.AndroidNotificationPriority.HIGH },
            trigger: null,
          });
          Alert.alert('Success', `PIN: 8829-1039-4820\nSent to ${quickPhone}`, [
            { text: 'OK', onPress: () => { closeModal(); router.back(); } }
          ]);
      }, 1500);
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#0B2F66'} /></TouchableOpacity>
        <Text style={[styles.headerTitle, isDark && styles.textDark]}>Education Bills</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {EDU_BILLERS.map((item) => (
          <TouchableOpacity key={item.id} style={[styles.card, isDark && styles.cardDark]} onPress={() => openModal(item)}>
            <View style={[styles.iconBox, { backgroundColor: item.color + '1A' }]}>
              <Ionicons name={item.icon as any} size={28} color={item.color} />
            </View>
            <View style={styles.cardInfo}>
              <Text style={[styles.cardName, isDark && styles.textDark]}>{item.title}</Text>
              <Text style={styles.cardPrice}>₦{item.price.toLocaleString()}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* FIXED MODAL: Added navigationBarTranslucent */}
      <Modal 
        visible={isQuickBuyVisible} 
        transparent 
        animationType="none" 
        statusBarTranslucent 
        navigationBarTranslucent={true}
        onRequestClose={closeModal}
      >
        <Animated.View style={[styles.modalOverlay, { opacity: overlayOpacity }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeModal} />
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ width: '100%', justifyContent: 'flex-end', flex: 1 }}>
            
            {/* Added dynamic bottom padding using insets */}
            <Animated.View style={[styles.modalContent, isDark && styles.modalContentDark, { transform: [{ translateY: slideAnim }], paddingBottom: insets.bottom + 20 }]}>
              <View {...panResponder.panHandlers} style={styles.dragArea}><View style={styles.modalHandlebar} /></View>
              <Text style={[styles.modalTitle, isDark && styles.textDark]}>Buy {selectedPlan?.name} Pin</Text>
              
              <View style={{ width: '100%', padding: 20 }}>
                <Text style={[styles.label, isDark && styles.textDark]}>Recipient Phone</Text>
                <View style={[styles.inputContainer, isDark && styles.inputDark, phoneError ? styles.errorBorder : null]}>
                  <TextInput 
                    ref={phoneInputRef} 
                    style={[styles.input, isDark && styles.textDark]} 
                    keyboardType="phone-pad" 
                    value={quickPhone} 
                    onChangeText={(v) => {setQuickPhone(v); setPhoneError('');}} 
                    maxLength={11} 
                    placeholder="08012345678" 
                    placeholderTextColor="#9CA3AF" 
                  />
                  <TouchableOpacity onPress={async () => {
                    const { status } = await Contacts.requestPermissionsAsync();
                    if (status === 'granted') {
                      const contact = await Contacts.presentContactPickerAsync();
                      if (contact?.phoneNumbers?.[0]) setQuickPhone(contact.phoneNumbers[0].number?.replace(/[\s-]/g, '') || '');
                    }
                  }}><Ionicons name="person-add-outline" size={20} color="#0B2F66" /></TouchableOpacity>
                </View>

                <Text style={[styles.label, isDark && styles.textDark, { marginTop: 25 }]}>Transaction PIN</Text>
                
                {/* UPGRADED PIN ROW: Wrapped in Pressable for flawless focus logic */}
                <Pressable style={styles.pinRow} onPress={() => pinInputRef.current?.focus()}>
                  {[0, 1, 2, 3].map((i) => (
                    <View 
                        key={i} 
                        style={[
                            styles.pinBox, 
                            isDark && styles.pinBoxDark, 
                            quickPin.length === i && styles.pinActive, 
                            pinError ? styles.errorBorder : null
                        ]}
                    >
                      <Text style={[styles.pinText, isDark && styles.textDark]}>{quickPin.length > i ? '•' : ''}</Text>
                    </View>
                  ))}
                  <TextInput 
                    ref={pinInputRef} 
                    style={styles.hiddenInput} 
                    keyboardType="numeric" 
                    maxLength={4} 
                    value={quickPin} 
                    onChangeText={(v) => {
                        setQuickPin(v); 
                        setPinError(''); 
                        if (v.length === 4) {
                            // Optional: Auto-submit on 4th digit
                            // handlePayment();
                        }
                    }} 
                  />
                </Pressable>

                <TouchableOpacity style={styles.payBtn} onPress={handlePayment} disabled={isProcessing}>
                  {isProcessing ? <ActivityIndicator color="#fff" /> : <Text style={styles.payBtnText}>Pay ₦{selectedPlan?.price.toLocaleString()}</Text>}
                </TouchableOpacity>
              </View>
            </Animated.View>
          </KeyboardAvoidingView>
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  containerDark: { backgroundColor: '#0B121F' },
  textDark: { color: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#0B2F66' },
  scrollContent: { padding: 20 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 16, marginBottom: 15, elevation: 2 },
  cardDark: { backgroundColor: '#1F2937' },
  iconBox: { width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  cardInfo: { flex: 1, marginLeft: 15 },
  cardName: { fontSize: 16, fontWeight: 'bold' },
  cardPrice: { fontSize: 14, color: '#6B7280', marginTop: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  betCard: { width: '48%', backgroundColor: '#fff', padding: 20, borderRadius: 16, alignItems: 'center', marginBottom: 15, elevation: 2 },
  logoDot: { width: 40, height: 40, borderRadius: 20, marginBottom: 10 },
  betName: { fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, alignItems: 'center' },
  modalContentDark: { backgroundColor: '#1F2937' },
  dragArea: { width: '100%', alignItems: 'center', paddingVertical: 15 },
  modalHandlebar: { width: 50, height: 5, backgroundColor: '#D1D5DB', borderRadius: 10 },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  label: { alignSelf: 'flex-start', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 12, paddingHorizontal: 15, height: 55 },
  input: { flex: 1, height: 55, backgroundColor: 'transparent', paddingHorizontal: 15 },
  inputDark: { backgroundColor: '#374151' },
  
  pinRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', position: 'relative' },
  pinBox: { width: '22%', height: 60, backgroundColor: '#F3F4F6', borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  pinBoxDark: { backgroundColor: '#374151' },
  pinActive: { borderColor: '#4A9C9C' }, // Matched to the premium Teal accent
  pinText: { fontSize: 28, color: '#111827' },
  hiddenInput: { ...StyleSheet.absoluteFillObject, opacity: 0, fontSize: 1 },
  
  errorBorder: { borderColor: '#EF4444', borderWidth: 1 },
  payBtn: { backgroundColor: '#0B2F66', width: '100%', height: 55, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginTop: 30 },
  payBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});