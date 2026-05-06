import React from 'react';
import { StyleSheet, View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { RootState } from '../../store/store';

// Imports
import Header from '../../components/home/Header';
import WalletCard from '../../components/WalletCard'; 
import QuickActions from '../../components/home/QuickActions';
import PopularPlans from '../../components/home/PopularPlans';
import QuickBundles from '../../components/home/QuickBundles';
import EducationBills from '../../components/home/EducationBills'; 
import ElectricityBills from '../../components/home/ElectricityBills'; 
import RecentTransactions from '../../components/home/RecentTransactions';

export default function HomeScreen() {
  const isDark = useSelector((state: RootState) => state.theme.mode) === 'dark';

  return (
    // 1. Added KeyboardAvoidingView wrapper
    <KeyboardAvoidingView 
      style={styles.keyboardWrapper} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#FF7A00', '#4A9C9C']} 
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBorderWrapper}
      >
        <LinearGradient
          colors={isDark ? ['#0F172A', '#1E293B'] : ['#ffffff', '#ffffff']} 
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.innerBackground}
        >
            {/* 2. Added flexGrow and keyboard handling to ScrollView */}
            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              
              <Header />
              <WalletCard />
              <QuickActions />
              <PopularPlans />
              <QuickBundles />
              
              {/* --- NEW SECTIONS INSERTED HERE --- */}
              <ElectricityBills />
              <EducationBills />
              {/* ---------------------------------- */}
              
              <RecentTransactions />

              <View style={{height: 100}} />
              
            </ScrollView>
        </LinearGradient>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardWrapper: {
    flex: 1,
  },
  gradientBorderWrapper: {
    flex: 1,
  },
  innerBackground: {
    flex: 1,
    overflow: 'hidden',
  },
  scrollContent: {
    flexGrow: 1,
  }
});