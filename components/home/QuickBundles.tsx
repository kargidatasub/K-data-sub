import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

// 1. Mock Data for the dynamic bundles
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
  
  // 2. Add state to make the tabs interactive
  const [activeTab, setActiveTab] = useState<typeof NETWORKS[number]>('MTN');

  const BundleCard = ({ network, size, price, oldPrice, label }: any) => (
    <View style={[styles.bundleCard, isDark && styles.bundleCardDark]}>
        <Text style={[styles.bundleTitle, isDark && styles.textDark]}>{network} {size}</Text>
        <Text style={[styles.bundlePrice, isDark && styles.textDark]}>{price}</Text>
        
        <View style={styles.oldPriceContainer}>
            <Text style={styles.bundleOldPriceLabel}>{label}</Text>
            {/* Added subtle strike-through if the price is discounted */}
            <Text style={[
                styles.bundleOldPrice, 
                isDark && styles.textDark,
                price !== oldPrice && { textDecorationLine: 'line-through', color: '#9CA3AF' }
            ]}>
                {oldPrice}
            </Text>
        </View>

        {/* Improved Button UI */}
        <TouchableOpacity style={styles.selectBtn}>
            <Text style={styles.selectBtnText}>Select</Text>
        </TouchableOpacity>
    </View>
  );

  return (
    <View>
        <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Quick Bundles</Text>
            <TouchableOpacity><Text style={styles.seeAllText}>See All</Text></TouchableOpacity>
        </View>

        {/* 3. Dynamic Tabs with fixed padding */}
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

        {/* 4. Dynamic Cards mapped from the selected tab */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardsScrollContent}>
            {BUNDLE_DATA[activeTab].map((bundle) => (
                <BundleCard 
                    key={bundle.id}
                    network={bundle.network} 
                    size={bundle.size} 
                    price={bundle.price} 
                    oldPrice={bundle.oldPrice} 
                    label={bundle.label} 
                />
            ))}
        </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 30, marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  seeAllText: { color: '#4A9C9C', fontWeight: '600' },
  textDark: { color: '#F9FAFB' },
  
  // Fixed padding to prevent clipping
  horizontalScrollContent: { paddingHorizontal: 20, paddingBottom: 15 },
  
  tabBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#D1D5DB', marginRight: 10 },
  tabBtnDark: { borderColor: '#374151' },
  tabBtnActive: { backgroundColor: '#0B2F66', borderColor: '#0B2F66' },
  tabBtnActiveDark: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
  tabBtnText: { color: '#6B7280', fontWeight: 'bold' },
  tabBtnTextActive: { color: '#fff', fontWeight: 'bold' },
  
  // Fixed padding to prevent clipping
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
      borderColor: '#F3F4F6' // Subtle border for cleaner edges
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
      borderRadius: 20, // Rounded fully like a pill to match the design
      alignItems: 'center' 
  },
  selectBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});