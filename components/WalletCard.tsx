import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient'; // <-- Make sure this is imported
import { RootState } from '../store/store';
import { topUp } from '../store/walletSlice';

export default function WalletCard() {
  const balance = useSelector((state: RootState) => state.wallet.balance);
  const dispatch = useDispatch();

  const formattedBalance = `₦${balance.toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const handleTopUp = () => {
    dispatch(topUp(1000));
  };

  return (
    // 1. Position wrapper: Handles the margins and negative top spacing
    <View style={styles.cardWrapper}>
      
      {/* 2. Outer Gradient: This acts as the Gradient Border */}
      <LinearGradient
        colors={['#87CEEB', '#0B2F66']} // Sky Blue to Dark Blue border
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBorder}
      >
        
        {/* 3. BlurView: The native glass engine */}
        <BlurView 
          intensity={70} 
          tint="light" 
          experimentalBlurMethod="dimezisBlurView" 
          style={styles.blurContainer}
        >
          
          {/* 4. Inner Gradient: The blue-to-skyblue translucent background */}
          {/* We use rgba() to keep it semi-transparent so the blur shows through! */}
          <LinearGradient
            colors={['rgba(11, 47, 102, 0.7)', 'rgba(135, 206, 235, 0.7)']} 
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.innerContent}
          >
            <Text style={styles.walletLabel}>Wallet Balance</Text>
            <View style={styles.walletRow}>
              <Text style={styles.walletAmount}>{formattedBalance}</Text>
              
              <TouchableOpacity style={styles.topUpButton} onPress={handleTopUp}>
                <Text style={styles.topUpButtonText}>Top Up</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>

        </BlurView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    marginHorizontal: 20,
    marginTop: -70, // Keeps your overlap effect over the header
    // Add shadow here instead of inside the blur, so it renders cleanly
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  gradientBorder: {
    padding: 1.5, // THIS IS YOUR BORDER THICKNESS
    borderRadius: 22, // Outer radius needs to be slightly larger than inner
  },
  blurContainer: {
    borderRadius: 20, 
    overflow: 'hidden', // REQUIRED so the inner background doesn't bleed out of the rounded corners
  },
  innerContent: {
    padding: 20,
  },
  // Text Styles
  walletLabel: { color: '#E5E7EB', fontSize: 14, textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: {width: 0, height: 1}, textShadowRadius: 2 },
  walletRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  walletAmount: { color: '#fff', fontSize: 28, fontWeight: 'bold', textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: {width: 0, height: 1}, textShadowRadius: 3 },
  topUpButton: { backgroundColor: '#FF7A00', paddingVertical: 10, paddingHorizontal: 22, borderRadius: 8 },
  topUpButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});