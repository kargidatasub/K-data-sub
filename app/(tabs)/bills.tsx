import React, { useState, useCallback, useMemo } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, 
  TextInput, RefreshControl, Alert, ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { router } from 'expo-router'; 
import { RootState } from '../../store/store';

// 1. Data with Category Types for filtering
const BILL_CATEGORIES = [
  { id: '1', name: 'Airtime', icon: 'phone-portrait', color: '#EF4444', route: '/VTU/airtime', type: 'Telecom' },
  { id: '2', name: 'Data', icon: 'wifi', color: '#3B82F6', route: '/VTU/buy-data', type: 'Telecom' },
  { id: '3', name: 'Electricity', icon: 'bulb', color: '#F59E0B', route: '/VTU/electricity', type: 'Utility' },
  { id: '4', name: 'Cable TV', icon: 'tv', color: '#10B981', route: '/VTU/cable', type: 'Utility' },
  { id: '5', name: 'Education', icon: 'school', color: '#F43F5E', route: '/VTU/education', type: 'Others' },
  { id: '6', name: 'Betting', icon: 'dice', color: '#14B8A6', route: '/VTU/betting', type: 'Others' },
];

const INITIAL_SAVED = [
  { id: '1', name: 'DSTV Premium', sub: 'Smartcard ••• 4920', icon: 'tv-outline', color: '#10B981', route: '/VTU/cable' },
  { id: '2', name: 'Ikeja Electric', sub: 'Prepaid ••• 1102', icon: 'bulb-outline', color: '#F59E0B', route: '/VTU/electricity' },
  { id: '3', name: 'Mom MTN', sub: '0803 ••• 8821', icon: 'phone-portrait-outline', color: '#EF4444', route: '/VTU/airtime' },
];

const UPCOMING_BILLS = [
  { id: '1', name: 'Netflix', date: 'In 2 days', amount: '₦4,400', icon: 'play-circle' },
  { id: '2', name: 'Glo Data', date: 'In 5 days', amount: '₦3,000', icon: 'wifi' },
];

const FILTER_TABS = ['All', 'Utility', 'Telecom', 'Others'];
const { width } = Dimensions.get('window');
const cardWidth = (width - 40 - 20) / 3; 

export default function BillsScreen() {
  const isDark = useSelector((state: RootState) => state.theme.mode) === 'dark';
  
  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const [isManageMode, setIsManageMode] = useState(false);
  const [savedBillers, setSavedBillers] = useState(INITIAL_SAVED);

  // Search and Category Filter Logic
  const filteredCategories = useMemo(() => {
    return BILL_CATEGORIES.filter(cat => {
      const matchesSearch = cat.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab = activeTab === 'All' || cat.type === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [searchQuery, activeTab]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500); // Simulate network fetch
  }, []);

  const handleDeleteSaved = (id: string) => {
    Alert.alert("Remove Biller", "Are you sure you want to remove this saved biller?", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => {
          setSavedBillers(prev => prev.filter(b => b.id !== id));
      }}
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]} edges={['top']}>
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, isDark && styles.textDark]}>Pay Bills</Text>
          <Text style={styles.headerSub}>Quickly settle your utilities</Text>
        </View>
        <TouchableOpacity style={[styles.scanBtn, isDark && styles.scanBtnDark]}>
          <Ionicons name="qr-code-outline" size={20} color={isDark ? '#F9FAFB' : '#111827'} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0B2F66" />}
      >
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchBar, isDark && styles.searchBarDark]}>
            <Ionicons name="search-outline" size={20} color="#9CA3AF" />
            <TextInput 
              placeholder="Search for a biller (e.g. MTN, DSTV)"
              placeholderTextColor="#9CA3AF"
              style={[styles.searchInput, isDark && styles.textDark]}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Upcoming Bills Section */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Upcoming Bills</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.savedScroll}>
            {UPCOMING_BILLS.map((bill) => (
              <View key={bill.id} style={[styles.upcomingCard, isDark && styles.upcomingCardDark]}>
                <Ionicons name={bill.icon as any} size={20} color="#0B2F66" />
                <View style={{ marginLeft: 10 }}>
                   <Text style={[styles.upcomingName, isDark && styles.textDark]}>{bill.name}</Text>
                   <Text style={styles.upcomingDate}>{bill.date} • {bill.amount}</Text>
                </View>
                <TouchableOpacity style={styles.payNowSmall}>
                  <Text style={styles.payNowText}>Pay</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Saved Billers with Manage Mode */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
             <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Saved Billers</Text>
             <TouchableOpacity onPress={() => setIsManageMode(!isManageMode)}>
                <Text style={styles.manageText}>{isManageMode ? 'Done' : 'Manage'}</Text>
             </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.savedScroll}>
            {savedBillers.map((biller) => (
              <View key={biller.id}>
                <TouchableOpacity 
                  style={[styles.savedCard, isDark && styles.savedCardDark]}
                  onPress={() => !isManageMode && router.push(biller.route as any)}
                >
                  <View style={[styles.savedIconBg, { backgroundColor: biller.color + '1A' }]}>
                    <Ionicons name={biller.icon as any} size={22} color={biller.color} />
                  </View>
                  <Text style={[styles.savedName, isDark && styles.textDark]} numberOfLines={1}>{biller.name}</Text>
                  <Text style={styles.savedSub} numberOfLines={1}>{biller.sub}</Text>
                </TouchableOpacity>
                {isManageMode && (
                  <TouchableOpacity style={styles.deleteBadge} onPress={() => handleDeleteSaved(biller.id)}>
                    <Ionicons name="close-circle" size={24} color="#EF4444" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
            <TouchableOpacity style={[styles.savedCard, styles.addNewCard, isDark && styles.addNewCardDark]}>
              <View style={[styles.savedIconBg, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}>
                <Ionicons name="add" size={24} color={isDark ? '#9CA3AF' : '#6B7280'} />
              </View>
              <Text style={[styles.savedName, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Add New</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Categories with Filter Tabs */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Categories</Text>
          
          <View style={styles.tabsContainer}>
            {FILTER_TABS.map(tab => (
              <TouchableOpacity 
                key={tab} 
                style={[styles.tab, activeTab === tab && styles.tabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.gridContainer}>
            {filteredCategories.length > 0 ? (
              filteredCategories.map((cat) => (
                <TouchableOpacity 
                  key={cat.id} 
                  style={[styles.gridItem, isDark && styles.gridItemDark, { width: cardWidth }]}
                  onPress={() => cat.route !== '#' && router.push(cat.route as any)}
                >
                  <View style={[styles.gridIconBg, isDark && styles.gridIconBgDark]}>
                    <Ionicons name={cat.icon as any} size={28} color={cat.color} />
                  </View>
                  <Text style={[styles.gridText, isDark && styles.textDark]}>{cat.name}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.noResults}>
                <Ionicons name="search-outline" size={40} color="#9CA3AF" />
                <Text style={styles.noResultsText}>No bills found matching "{searchQuery}"</Text>
              </View>
            )}
          </View>
        </View>

        {/* Simplified Promo Banner */}
        <TouchableOpacity style={[styles.promoBanner, isDark && styles.promoBannerDark]}>
          <View style={styles.promoLeft}>
            <View style={styles.promoIconContainer}>
               <Ionicons name="notifications" size={20} color="#fff" />
            </View>
            <View style={styles.promoTextContainer}>
              <Text style={styles.promoTitle}>Auto-Renew Bills</Text>
              <Text style={styles.promoSub}>Set up auto-pay and never miss a payment.</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#0B2F66" />
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  containerDark: { backgroundColor: '#0B121F' },
  textDark: { color: '#F9FAFB' },
  scrollContent: { paddingBottom: 120 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, marginBottom: 15 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  headerSub: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  scanBtn: { width: 45, height: 45, borderRadius: 15, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.1 },
  scanBtnDark: { backgroundColor: '#1F2937' },

  searchContainer: { paddingHorizontal: 20, marginBottom: 20 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', height: 50, borderRadius: 15, paddingHorizontal: 15, borderWidth: 1, borderColor: '#E5E7EB' },
  searchBarDark: { backgroundColor: '#1F2937', borderColor: '#374151' },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 14, color: '#111827' },

  sectionContainer: { marginBottom: 25 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827', paddingHorizontal: 20, marginBottom: 15 },
  manageText: { color: '#0B2F66', fontWeight: 'bold', fontSize: 14 },

  upcomingCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 16, marginRight: 15, width: 220, borderWidth: 1, borderColor: '#E5E7EB' },
  upcomingCardDark: { backgroundColor: '#1F2937', borderColor: '#374151' },
  upcomingName: { fontWeight: 'bold', fontSize: 14 },
  upcomingDate: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  payNowSmall: { marginLeft: 'auto', backgroundColor: '#0B2F66', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  payNowText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

  savedScroll: { paddingHorizontal: 20 },
  savedCard: { width: 130, backgroundColor: '#fff', borderRadius: 16, padding: 15, marginRight: 15, elevation: 2, borderWidth: 1, borderColor: '#F3F4F6' },
  savedCardDark: { backgroundColor: '#1F2937', borderColor: '#374151' },
  deleteBadge: { position: 'absolute', top: -10, right: 5, zIndex: 10 },
  addNewCard: { borderStyle: 'dashed', borderWidth: 2, backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center' },
  addNewCardDark: { borderColor: '#4B5563' },
  savedIconBg: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  savedName: { fontWeight: 'bold', fontSize: 14, color: '#111827', marginBottom: 4 },
  savedSub: { fontSize: 11, color: '#6B7280' },

  tabsContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 15 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 10, backgroundColor: '#F3F4F6' },
  tabActive: { backgroundColor: '#0B2F66' },
  tabText: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  tabTextActive: { color: '#fff' },

  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 10 },
  gridItem: { backgroundColor: '#fff', borderRadius: 18, paddingVertical: 20, alignItems: 'center', borderWidth: 1, borderColor: '#F3F4F6' },
  gridItemDark: { backgroundColor: '#1F2937', borderColor: '#374151' },
  gridIconBg: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#F8F9FA', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  gridIconBgDark: { backgroundColor: '#374151' },
  gridText: { fontWeight: '700', fontSize: 12, color: '#374151' },

  noResults: { width: '100%', alignItems: 'center', paddingVertical: 30 },
  noResultsText: { color: '#9CA3AF', marginTop: 10, fontSize: 13 },

  promoBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#E0E7FF', marginHorizontal: 20, padding: 18, borderRadius: 20, marginBottom: 20 },
  promoBannerDark: { backgroundColor: 'rgba(59, 130, 246, 0.1)' },
  promoLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  promoIconContainer: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#0B2F66', justifyContent: 'center', alignItems: 'center' },
  promoTextContainer: { marginLeft: 12, flex: 1 },
  promoTitle: { fontWeight: 'bold', fontSize: 15, color: '#0B2F66', marginBottom: 2 },
  promoSub: { fontSize: 11, color: '#4B5563', lineHeight: 16 },
});