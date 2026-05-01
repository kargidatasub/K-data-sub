import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

// 1. Mock Data for Bill Categories
const BILL_CATEGORIES = [
  { id: '1', name: 'Airtime', icon: 'phone-portrait', color: '#EF4444' },
  { id: '2', name: 'Data', icon: 'wifi', color: '#3B82F6' },
  { id: '3', name: 'Electricity', icon: 'bulb', color: '#F59E0B' },
  { id: '4', name: 'Cable TV', icon: 'tv', color: '#10B981' },
  { id: '5', name: 'Internet', icon: 'globe', color: '#8B5CF6' },
  { id: '6', name: 'Education', icon: 'school', color: '#F43F5E' },
  { id: '7', name: 'Betting', icon: 'dice', color: '#14B8A6' },
  { id: '8', name: 'Transport', icon: 'bus', color: '#F97316' },
  { id: '9', name: 'More', icon: 'grid', color: '#6B7280' },
];

// 2. Mock Data for Saved/Favorite Billers
const SAVED_BILLERS = [
  { id: '1', name: 'DSTV Premium', sub: 'Smartcard ••• 4920', icon: 'tv-outline', color: '#10B981' },
  { id: '2', name: 'Ikeja Electric', sub: 'Prepaid ••• 1102', icon: 'bulb-outline', color: '#F59E0B' },
  { id: '3', name: 'Mom MTN', sub: '0803 ••• 8821', icon: 'phone-portrait-outline', color: '#EF4444' },
];

// Calculate grid width (3 columns with gaps)
const { width } = Dimensions.get('window');
const cardWidth = (width - 40 - 30) / 3; // 40 = screen padding, 30 = gaps between 3 cards

export default function BillsScreen() {
  const isDark = useSelector((state: RootState) => state.theme.mode) === 'dark';

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]} edges={['top']}>
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, isDark && styles.textDark]}>Pay Bills</Text>
        <TouchableOpacity style={[styles.scanBtn, isDark && styles.scanBtnDark]}>
          <Ionicons name="qr-code-outline" size={20} color={isDark ? '#F9FAFB' : '#111827'} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        
        {/* Saved Billers - Horizontal Scroll */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Saved Billers</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.savedScroll}>
            {SAVED_BILLERS.map((biller) => (
              <TouchableOpacity key={biller.id} style={[styles.savedCard, isDark && styles.savedCardDark]}>
                <View style={[styles.savedIconBg, { backgroundColor: biller.color + '1A' }]}>
                  <Ionicons name={biller.icon as any} size={22} color={biller.color} />
                </View>
                <Text style={[styles.savedName, isDark && styles.textDark]} numberOfLines={1}>{biller.name}</Text>
                <Text style={styles.savedSub} numberOfLines={1}>{biller.sub}</Text>
              </TouchableOpacity>
            ))}
            
            {/* Add New Biller Button */}
            <TouchableOpacity style={[styles.savedCard, styles.addNewCard, isDark && styles.addNewCardDark]}>
              <View style={[styles.savedIconBg, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}>
                <Ionicons name="add" size={24} color={isDark ? '#9CA3AF' : '#6B7280'} />
              </View>
              <Text style={[styles.savedName, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Add New</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Categories Grid */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Categories</Text>
          <View style={styles.gridContainer}>
            {BILL_CATEGORIES.map((cat) => (
              <TouchableOpacity key={cat.id} style={[styles.gridItem, isDark && styles.gridItemDark, { width: cardWidth }]}>
                <View style={[styles.gridIconBg, isDark && styles.gridIconBgDark]}>
                  {/* The category icon */}
                  <Ionicons name={cat.icon as any} size={28} color={isDark ? cat.color : cat.color} />
                </View>
                <Text style={[styles.gridText, isDark && styles.textDark]}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Promo / Auto-Renew Banner */}
        <View style={[styles.promoBanner, isDark && styles.promoBannerDark]}>
          <View style={styles.promoLeft}>
            <Ionicons name="calendar" size={24} color="#0B2F66" />
            <View style={styles.promoTextContainer}>
              <Text style={styles.promoTitle}>Auto-Renew Bills</Text>
              <Text style={styles.promoSub}>Never miss a payment again. Set up auto-pay today!</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#0B2F66" />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  containerDark: { backgroundColor: '#111827' },
  textDark: { color: '#F9FAFB' },
  
  // Tab Bar Safety Padding
  scrollContent: { paddingBottom: 120 },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, marginBottom: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  scanBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  scanBtnDark: { backgroundColor: '#1F2937' },

  sectionContainer: { marginBottom: 25 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827', paddingHorizontal: 20, marginBottom: 15 },

  // Saved Billers
  savedScroll: { paddingHorizontal: 20 },
  savedCard: { width: 130, backgroundColor: '#fff', borderRadius: 16, padding: 15, marginRight: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2, borderWidth: 1, borderColor: '#F3F4F6' },
  savedCardDark: { backgroundColor: '#1F2937', borderColor: '#374151', shadowOpacity: 0 },
  addNewCard: { borderStyle: 'dashed', borderWidth: 2, backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center' },
  addNewCardDark: { borderColor: '#4B5563' },
  savedIconBg: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  savedName: { fontWeight: 'bold', fontSize: 14, color: '#111827', marginBottom: 4 },
  savedSub: { fontSize: 11, color: '#6B7280' },

  // Grid
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 15 },
  gridItem: { backgroundColor: '#fff', borderRadius: 16, paddingVertical: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 3, elevation: 1, borderWidth: 1, borderColor: '#F3F4F6' },
  gridItemDark: { backgroundColor: '#1F2937', borderColor: '#374151', shadowOpacity: 0 },
  gridIconBg: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#F8F9FA', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  gridIconBgDark: { backgroundColor: '#374151' },
  gridText: { fontWeight: '600', fontSize: 13, color: '#374151' },

  // Promo Banner
  promoBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#E0E7FF', marginHorizontal: 20, padding: 20, borderRadius: 16, marginBottom: 20 },
  promoBannerDark: { backgroundColor: 'rgba(59, 130, 246, 0.15)' },
  promoLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  promoTextContainer: { marginLeft: 15, flex: 1 },
  promoTitle: { fontWeight: 'bold', fontSize: 15, color: '#0B2F66', marginBottom: 4 },
  promoSub: { fontSize: 12, color: '#4B5563', lineHeight: 18 },
});