import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { RootState } from '../../store/store';

// Imports
import Header from '../../components/home/Header';
import WalletCard from '../../components/WalletCard'; 
import QuickActions from '../../components/home/QuickActions';
import PopularPlans from '../../components/home/PopularPlans';
import QuickBundles from '../../components/home/QuickBundles';
import EducationBills from '../../components/home/EducationBills'; // <-- NEW
import ElectricityBills from '../../components/home/ElectricityBills'; // <-- NEW
import RecentTransactions from '../../components/home/RecentTransactions';

export default function HomeScreen() {
  const isDark = useSelector((state: RootState) => state.theme.mode) === 'dark';

  return (
    <LinearGradient
      colors={['#FF7A00', '#4A9C9C']} 
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientBorderWrapper}
    >
      <LinearGradient
        colors={isDark ? ['#0F172A', '#1E293B'] : ['#ffffff', '#87CEEB']} // Added dark mode gradient background!
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.innerBackground}
      >
          <ScrollView showsVerticalScrollIndicator={false}>
            
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
  );
}

const styles = StyleSheet.create({
  gradientBorderWrapper: {
    flex: 1,
    
  },
  innerBackground: {
    flex: 1,
    
    overflow: 'hidden',
  }
});