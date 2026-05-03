import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Clipboard, Alert } from 'react-native';
import { useSelector } from 'react-redux';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootState } from '../store/store';

export default function WalletCard() {
  const balance = useSelector((state: RootState) => state.wallet.balance);
  
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [isModalVisible, setModalVisible] = useState(false);

  // 1. Load the visibility preference on mount
  useEffect(() => {
    loadVisibilityPreference();
  }, []);

  const loadVisibilityPreference = async () => {
    try {
      const savedState = await AsyncStorage.getItem('@balance_visible');
      if (savedState !== null) {
        setIsBalanceVisible(JSON.parse(savedState));
      }
    } catch (e) {
      console.error("Failed to load balance visibility", e);
    }
  };

  // 2. Toggle and save to local storage
  const toggleVisibility = async () => {
    try {
      const newState = !isBalanceVisible;
      setIsBalanceVisible(newState);
      await AsyncStorage.setItem('@balance_visible', JSON.stringify(newState));
    } catch (e) {
      console.error("Failed to save balance visibility", e);
    }
  };

  const formattedBalance = `₦${balance.toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const copyToClipboard = (text: string, label: string) => {
    Clipboard.setString(text);
    Alert.alert('Copied!', `${label} account number copied to clipboard.`);
  };

  return (
    <View style={styles.cardWrapper}>
      <LinearGradient
        colors={['#87CEEB', '#0B2F66']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBorder}
      >
        <BlurView 
          intensity={70} 
          tint="light" 
          experimentalBlurMethod="dimezisBlurView" 
          style={styles.blurContainer}
        >
          <LinearGradient
            colors={['rgba(11, 47, 102, 0.7)', 'rgba(135, 206, 235, 0.7)']} 
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.innerContent}
          >
            <View style={styles.labelRow}>
                <Text style={styles.walletLabel}>Wallet Balance</Text>
                <TouchableOpacity onPress={toggleVisibility}>
                    <Ionicons 
                        name={isBalanceVisible ? "eye-outline" : "eye-off-outline"} 
                        size={20} 
                        color="rgba(255,255,255,0.7)" 
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.walletRow}>
              <Text style={styles.walletAmount}>
                {isBalanceVisible ? formattedBalance : "₦ • • • • •"}
              </Text>
              
              <TouchableOpacity style={styles.addBalanceBtn} onPress={() => setModalVisible(true)}>
                <Text style={styles.addBalanceBtnText}>Add Balance</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </BlurView>
      </LinearGradient>

      {/* FIXED MODAL: Added statusBarTranslucent and navigationBarTranslucent */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
        statusBarTranslucent={true}
        navigationBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Fund Wallet</Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                        <Ionicons name="close-circle" size={28} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>
                
                <Text style={styles.modalSubText}>Transfer funds to any of your virtual accounts below to top up your wallet instantly.</Text>

                {/* UPDATED BANK DETAILS */}
                <TouchableOpacity style={styles.accountCard} onPress={() => copyToClipboard('0123456789', 'Kargi-Askiboy')}>
                    <View>
                        <Text style={styles.bankName}>Kargi-Askiboy</Text>
                        <Text style={styles.accName}>Sarah Jenkins / k-data sub</Text>
                        <Text style={styles.accNumber}>0123456789</Text>
                    </View>
                    <Ionicons name="copy-outline" size={20} color="#0B2F66" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.accountCard} onPress={() => copyToClipboard('09012345678', 'Kargi-Askiboy')}>
                    <View>
                        <Text style={styles.bankName}>Kargi-Askiboy</Text>
                        <Text style={styles.accName}>Sarah Jenkins / k-data sub</Text>
                        <Text style={styles.accNumber}>09012345678</Text>
                    </View>
                    <Ionicons name="copy-outline" size={20} color="#0B2F66" />
                </TouchableOpacity>

                <Text style={styles.noticeText}>* Funds reflect within 1-5 minutes of transfer.</Text>
            </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: { marginHorizontal: 20, marginTop: -70, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 8 },
  gradientBorder: { padding: 1.5, borderRadius: 22 },
  blurContainer: { borderRadius: 20, overflow: 'hidden' },
  innerContent: { padding: 20 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  walletLabel: { color: '#E5E7EB', fontSize: 14 },
  walletRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  walletAmount: { color: '#fff', fontSize: 26, fontWeight: 'bold' },
  addBalanceBtn: { backgroundColor: '#FF7A00', paddingVertical: 10, paddingHorizontal: 18, borderRadius: 8 },
  addBalanceBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  modalSubText: { fontSize: 14, color: '#6B7280', marginBottom: 20, lineHeight: 20 },
  accountCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F3F4F6', padding: 18, borderRadius: 15, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  bankName: { fontSize: 12, color: '#6B7280', fontWeight: 'bold', textTransform: 'uppercase' },
  accName: { fontSize: 14, color: '#111827', marginVertical: 2 },
  accNumber: { fontSize: 18, fontWeight: 'bold', color: '#0B2F66', letterSpacing: 1 },
  noticeText: { textAlign: 'center', fontSize: 12, color: '#9CA3AF', marginTop: 10 }
});