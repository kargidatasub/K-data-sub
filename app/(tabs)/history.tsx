import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

// 1. Expanded Mock Data with categories for filtering
const TRANSACTIONS = [
  { id: '1', category: 'Data', type: 'MTN', title: 'MTN Data (10GB)', date: 'Oct 27, 2023 • 10:42 AM', amount: '₦3,000', status: 'Successful', ref: 'REF-839201A' },
  { id: '2', category: 'Airtime', type: 'AIRTEL', title: 'Airtel Airtime', date: 'Oct 26, 2023 • 02:15 PM', amount: '₦1,000', status: 'Successful', ref: 'REF-449208B' },
  { id: '3', category: 'Data', type: 'GLO', title: 'Glo Data (2.5GB)', date: 'Oct 25, 2023 • 09:00 AM', amount: '₦1,200', status: 'Failed', ref: 'REF-119203C' },
  { id: '4', category: 'Utilities', type: 'ELECTRICITY', title: 'Ikeja Electric', date: 'Oct 23, 2023 • 06:30 PM', amount: '₦15,000', status: 'Successful', ref: 'REF-009204D' },
  { id: '5', category: 'Airtime', type: '9MOBILE', title: '9mobile Airtime', date: 'Oct 22, 2023 • 11:20 AM', amount: '₦500', status: 'Successful', ref: 'REF-779205E' },
  { id: '6', category: 'Cable', type: 'CABLE', title: 'DSTV Premium', date: 'Oct 20, 2023 • 08:00 AM', amount: '₦24,500', status: 'Pending', ref: 'REF-339206F' },
  { id: '7', category: 'Data', type: 'MTN', title: 'MTN Data (20GB)', date: 'Oct 18, 2023 • 04:45 PM', amount: '₦5,000', status: 'Successful', ref: 'REF-889207G' },
  { id: '8', category: 'Education', type: 'WAEC', title: 'WAEC Result Pin', date: 'Oct 15, 2023 • 01:15 PM', amount: '₦3,500', status: 'Successful', ref: 'REF-559208H' },
];

const FILTERS = ['All', 'Data', 'Airtime', 'Utilities', 'Cable', 'Education'];

// 2. Helper Functions for UI
const getTransactionIcon = (type: string, isDark: boolean) => {
  switch (type) {
    case 'MTN': return <Image source={require('../../assets/home/mtn.png')} style={styles.networkLogo} />;
    case 'AIRTEL': return <Image source={require('../../assets/home/airtel.png')} style={styles.networkLogo} />;
    case 'GLO': return <Image source={require('../../assets/home/glo.png')} style={styles.networkLogo} />;
    case '9MOBILE': return <Image source={require('../../assets/home/9mobile.png')} style={styles.networkLogo} />;
    case 'ELECTRICITY': return <Ionicons name="bulb-outline" size={20} color={isDark ? "#60A5FA" : "#0B2F66"} />;
    case 'CABLE': return <Ionicons name="tv-outline" size={20} color={isDark ? "#60A5FA" : "#0B2F66"} />;
    case 'WAEC': return <Ionicons name="school-outline" size={20} color={isDark ? "#60A5FA" : "#0B2F66"} />;
    default: return <Ionicons name="receipt-outline" size={20} color={isDark ? "#60A5FA" : "#0B2F66"} />;
  }
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Successful': return '#10B981'; // Green
        case 'Failed': return '#EF4444'; // Red
        case 'Pending': return '#F59E0B'; // Orange
        default: return '#6B7280';
    }
}

export default function HistoryScreen() {
  const isDark = useSelector((state: RootState) => state.theme.mode) === 'dark';
  const [activeFilter, setActiveFilter] = useState('All');

  // Filter the data based on the active tab
  const filteredTransactions = activeFilter === 'All' 
    ? TRANSACTIONS 
    : TRANSACTIONS.filter(t => t.category === activeFilter);

  // Render individual transaction card
  const renderItem = ({ item }: any) => (
    <TouchableOpacity style={[styles.transactionCard, isDark && styles.transactionCardDark]}>
        <View style={styles.transLeft}>
            <View style={[styles.iconContainer, isDark && styles.iconContainerDark]}>
                {getTransactionIcon(item.type, isDark)}
            </View>
            <View>
                <Text style={[styles.transTitle, isDark && styles.textDark]}>{item.title}</Text>
                <Text style={styles.transDate}>{item.date}</Text>
            </View>
        </View>
        <View style={styles.transRight}>
            <Text style={[styles.transAmount, isDark && styles.textDark]}>{item.amount}</Text>
            <Text style={[styles.transStatus, { color: getStatusColor(item.status) }]}>{item.status}</Text>
        </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]} edges={['top']}>
        
        {/* Header */}
        <View style={styles.header}>
            <Text style={[styles.headerTitle, isDark && styles.textDark]}>History</Text>
            <TouchableOpacity style={[styles.searchBtn, isDark && styles.searchBtnDark]}>
                <Ionicons name="search-outline" size={20} color={isDark ? '#F9FAFB' : '#111827'} />
            </TouchableOpacity>
        </View>

        {/* Monthly Summary Card */}
        <View style={styles.summaryPadding}>
            <View style={[styles.summaryCard, isDark && styles.summaryCardDark]}>
                <View>
                    <Text style={[styles.summaryLabel, isDark && { color: '#9CA3AF' }]}>Total Spent (October)</Text>
                    <Text style={[styles.summaryAmount, isDark && styles.textDark]}>₦53,700</Text>
                </View>
                <View style={[styles.iconBg, isDark && styles.iconBgDark]}>
                    <Ionicons name="bar-chart" size={24} color="#0B2F66" />
                </View>
            </View>
        </View>

        {/* Dynamic Filters */}
        <View style={styles.filterWrapper}>
            <FlatList 
                horizontal
                showsHorizontalScrollIndicator={false}
                data={FILTERS}
                keyExtractor={(item) => item}
                contentContainerStyle={styles.filterList}
                renderItem={({ item }) => {
                    const isActive = activeFilter === item;
                    return (
                        <TouchableOpacity 
                            onPress={() => setActiveFilter(item)}
                            style={[
                                styles.filterPill, 
                                isDark && styles.filterPillDark,
                                isActive && styles.filterPillActive,
                                isActive && isDark && styles.filterPillActiveDark
                            ]}
                        >
                            <Text style={[
                                styles.filterText, 
                                isActive && styles.filterTextActive
                            ]}>
                                {item}
                            </Text>
                        </TouchableOpacity>
                    );
                }}
            />
        </View>

        {/* Transaction List */}
        <FlatList
            data={filteredTransactions}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            // Add padding bottom so the floating glass tab bar doesn't block the last item!
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 120 }}
            ListEmptyComponent={() => (
                <View style={styles.emptyState}>
                    <Ionicons name="receipt-outline" size={48} color="#9CA3AF" />
                    <Text style={[styles.emptyStateText, isDark && styles.textDark]}>No transactions found for {activeFilter}.</Text>
                </View>
            )}
        />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  containerDark: { backgroundColor: '#111827' },
  textDark: { color: '#F9FAFB' },
  
  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, marginBottom: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  searchBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  searchBtnDark: { backgroundColor: '#1F2937' },

  // Summary Card
  summaryPadding: { paddingHorizontal: 20, marginBottom: 20 },
  summaryCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#E0E7FF', padding: 20, borderRadius: 20 },
  summaryCardDark: { backgroundColor: 'rgba(59, 130, 246, 0.15)' },
  summaryLabel: { fontSize: 13, color: '#4B5563', marginBottom: 5, fontWeight: '500' },
  summaryAmount: { fontSize: 26, fontWeight: '900', color: '#0B2F66' },
  iconBg: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  iconBgDark: { backgroundColor: '#60A5FA' },

  // Filters
  filterWrapper: { marginBottom: 15 },
  filterList: { paddingHorizontal: 20 },
  filterPill: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', marginRight: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  filterPillDark: { backgroundColor: '#1F2937', borderColor: '#374151' },
  filterPillActive: { backgroundColor: '#0B2F66', borderColor: '#0B2F66' },
  filterPillActiveDark: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
  filterText: { color: '#6B7280', fontWeight: '600', fontSize: 13 },
  filterTextActive: { color: '#fff' },

  // Transaction Cards
  transactionCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1, borderWidth: 1, borderColor: '#F3F4F6' },
  transactionCardDark: { backgroundColor: '#1F2937', borderColor: '#374151', shadowOpacity: 0 },
  transLeft: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: { backgroundColor: '#F3F4F6', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 15, overflow: 'hidden' },
  iconContainerDark: { backgroundColor: '#374151' },
  networkLogo: { width: 24, height: 24, resizeMode: 'contain' },
  transTitle: { fontWeight: 'bold', color: '#111827', fontSize: 15, marginBottom: 4 },
  transDate: { color: '#6B7280', fontSize: 12 },
  transRight: { alignItems: 'flex-end' },
  transAmount: { fontWeight: '900', color: '#111827', fontSize: 15, marginBottom: 4 },
  transStatus: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },

  // Empty State
  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 50 },
  emptyStateText: { marginTop: 15, fontSize: 15, color: '#6B7280', fontWeight: '500' }
});