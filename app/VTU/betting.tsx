import React, { useState, useRef } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, 
  TextInput, Modal, Alert, ActivityIndicator, Pressable, Dimensions, PanResponder, Animated, KeyboardAvoidingView, Platform 
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications'; 
import { router } from 'expo-router';
import { RootState } from '../../store/store';

const { height: SCREEN_HEIGHT } = Dimensions.get('screen');

const BOOKMAKERS = [
  { id: '1', name: 'SportyBet', color: '#E91E63' },
  { id: '2', name: 'Bet9ja', color: '#4CAF50' },
  { id: '3', name: '1xBet', color: '#2196F3' },
  { id: '4', name: 'Betway', color: '#000000' },
];

export default function BettingPage() {
  const isDark = useSelector((state: RootState) => state.theme.mode) === 'dark';
  const insets = useSafeAreaInsets();
  
  const [isQuickBuyVisible, setQuickBuyVisible] = useState(false);
  const [customerId, setCustomerId] = useState('');
  const [amount, setAmount] = useState('');
  const [quickPin, setQuickPin] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedBiller, setSelectedBiller] = useState<any>(null);

  const idInputRef = useRef<TextInput>(null);
  const pinInputRef = useRef<TextInput>(null);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => { if (gestureState.dy > 0) slideAnim.setValue(gestureState.dy); },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120) closeModal();
        else Animated.spring(slideAnim, { toValue: 0, friction: 8, useNativeDriver: true }).start();
      },
    })
  ).current;

  const openModal = (biller: any) => {
    setSelectedBiller(biller);
    setQuickBuyVisible(true);
    Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true }).start(() => setTimeout(() => idInputRef.current?.focus(), 150));
  };

  const closeModal = () => {
    Animated.timing(slideAnim, { toValue: SCREEN_HEIGHT, duration: 250, useNativeDriver: true }).start(() => {
        setQuickBuyVisible(false);
        setCustomerId('');
        setAmount('');
        setQuickPin('');
    });
  };

  const handleFundWallet = () => {
    if (!customerId || !amount) { 
        Alert.alert('Error', 'Please enter your Customer ID and Amount'); 
        return; 
    }
    if (quickPin.length < 4) {
        Alert.alert('Error', 'Please enter your 4-digit PIN');
        return;
    }

    setIsProcessing(true);
    setTimeout(async () => {
      setIsProcessing(false);
      await Notifications.scheduleNotificationAsync({
        content: { 
            title: "Wallet Funded! ⚽", 
            body: `You successfully sent ₦${amount} to ${selectedBiller.name} (ID: ${customerId}).`,
            sound: true 
        },
        trigger: null,
      });
      Alert.alert('Success', 'Betting wallet funded successfully!');
      closeModal();
    }, 1500);
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#0B2F66'} /></TouchableOpacity>
        <Text style={[styles.headerTitle, isDark && styles.textDark]}>Betting</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.grid}>
          {BOOKMAKERS.map((b) => (
            <TouchableOpacity key={b.id} style={[styles.betCard, isDark && styles.cardDark]} onPress={() => openModal(b)}>
              <View style={[styles.logoDot, { backgroundColor: b.color }]} />
              <Text style={[styles.betName, isDark && styles.textDark]}>{b.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* FIXED MODAL: Added navigationBarTranslucent to fix bottom white gap */}
      <Modal 
        visible={isQuickBuyVisible} 
        transparent 
        animationType="none" 
        statusBarTranslucent 
        navigationBarTranslucent
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeModal} />
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ width: '100%', justifyContent: 'flex-end', flex: 1 }}>
            
            {/* Added dynamic bottom padding using insets to clear the home indicator */}
            <Animated.View style={[styles.modalContent, isDark && styles.modalContentDark, { transform: [{ translateY: slideAnim }], paddingBottom: insets.bottom + 20 }]}>
              <View {...panResponder.panHandlers} style={styles.dragArea}><View style={styles.modalHandlebar} /></View>
              <Text style={[styles.modalTitle, isDark && styles.textDark]}>Fund {selectedBiller?.name}</Text>
              
              <View style={{ width: '100%', paddingHorizontal: 20, paddingTop: 10 }}>
                <TextInput 
                    ref={idInputRef} 
                    style={[styles.input, isDark && styles.inputDark, isDark && styles.textDark]} 
                    placeholder="Customer ID" 
                    placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                    keyboardType="numeric" 
                    value={customerId} 
                    onChangeText={setCustomerId} 
                />
                <TextInput 
                    style={[styles.input, isDark && styles.inputDark, isDark && styles.textDark, { marginTop: 15 }]} 
                    placeholder="Amount (₦)" 
                    placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                    keyboardType="numeric" 
                    value={amount} 
                    onChangeText={setAmount} 
                />
                
                {/* PROFESSIONAL PIN BOXES */}
                <Text style={[styles.label, { marginTop: 25, alignSelf: 'center' }, isDark && styles.textDark]}>Enter 4-Digit PIN</Text>
                <Pressable style={styles.pinBoxesContainer} onPress={() => pinInputRef.current?.focus()}>
                    {[0, 1, 2, 3].map((index) => (
                    <View 
                        key={index} 
                        style={[
                            styles.pinBox, 
                            isDark && styles.pinBoxDark,
                            quickPin.length === index && styles.pinBoxActive 
                        ]}
                    >
                        <Text style={[styles.pinDot, isDark && styles.textDark]}>
                            {quickPin.length > index ? '•' : ''}
                        </Text>
                    </View>
                    ))}

                    <TextInput
                        ref={pinInputRef}
                        style={styles.hiddenPinInput}
                        keyboardType="numeric"
                        maxLength={4}
                        value={quickPin}
                        onChangeText={(val) => {
                            setQuickPin(val);
                            if (val.length === 4) {
                                // Optional: You could auto-submit here by calling handleFundWallet()
                            }
                        }}
                    />
                </Pressable>

                <TouchableOpacity 
                    style={[styles.payBtn, { backgroundColor: selectedBiller?.color || '#0B2F66' }]} 
                    onPress={handleFundWallet} 
                    disabled={isProcessing}
                >
                  {isProcessing ? <ActivityIndicator color="#fff" /> : <Text style={styles.payBtnText}>Deposit Now</Text>}
                </TouchableOpacity>
              </View>
            </Animated.View>

          </KeyboardAvoidingView>
        </View>
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
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  betCard: { width: '48%', backgroundColor: '#fff', padding: 25, borderRadius: 20, alignItems: 'center', marginBottom: 15, elevation: 2 },
  cardDark: { backgroundColor: '#1F2937' },
  logoDot: { width: 44, height: 44, borderRadius: 22, marginBottom: 12 },
  betName: { fontWeight: 'bold', fontSize: 16 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, alignItems: 'center' },
  modalContentDark: { backgroundColor: '#111827' },
  dragArea: { width: '100%', alignItems: 'center', paddingVertical: 15 },
  modalHandlebar: { width: 50, height: 5, backgroundColor: '#D1D5DB', borderRadius: 10 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  label: { alignSelf: 'flex-start', fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#6B7280' },
  
  input: { height: 55, backgroundColor: '#F3F4F6', borderRadius: 14, paddingHorizontal: 15, fontSize: 16 },
  inputDark: { backgroundColor: '#1F2937' },
  
  // PROFESSIONAL PIN STYLES
  pinBoxesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    marginBottom: 30,
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
    borderColor: '#4A9C9C' // Brand teal/accent to show focus
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

  payBtn: { width: '100%', height: 55, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  payBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});