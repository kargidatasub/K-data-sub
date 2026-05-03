import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { router } from 'expo-router'; 
import { RootState } from '../../store/store';

const TRANSACTIONS = [
  { id: '1', category: 'Data', type: 'MTN', title: 'MTN Data (10GB)', date: 'Oct 27, 2023 • 10:42 AM', amount: 3000, status: 'Successful', month: 'October', year: '2023' },
  { id: '2', category: 'Airtime', type: 'AIRTEL', title: 'Airtel Airtime', date: 'Oct 26, 2023 • 02:15 PM', amount: 1000, status: 'Successful', month: 'October', year: '2023' },
  { id: '3', category: 'Data', type: 'GLO', title: 'Glo Data (2.5GB)', date: 'Sep 25, 2023 • 09:00 AM', amount: 1200, status: 'Failed', month: 'September', year: '2023' },
  { id: '4', category: 'Utilities', type: 'ELECTRICITY', title: 'Ikeja Electric', date: 'Aug 23, 2023 • 06:30 PM', amount: 15000, status: 'Successful', month: 'August', year: '2023' },
  { id: '5', category: 'Airtime', type: '9MOBILE', title: '9mobile Airtime', date: 'Jan 22, 2026 • 11:20 AM', amount: 500, status: 'Successful', month: 'January', year: '2026' },
  { id: '6', category: 'Cable', type: 'CABLE', title: 'DSTV Premium', date: 'Feb 20, 2026 • 08:00 AM', amount: 24500, status: 'Successful', month: 'February', year: '2026' },
];

const FILTERS = ['All', 'Data', 'Airtime', 'Utilities', 'Cable', 'Education'];
const MONTHS = ['All Months', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const YEARS = ['2023', '2024', '2025', '2026'];

export default function HistoryScreen() {
  const isDark = useSelector((state: RootState) => state.theme.mode) === 'dark';
  
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('All Months');
  const [selectedYear, setSelectedYear] = useState('2026');

  // Filtering Logic + Total Spent Calculation
  const { filteredTransactions, totalSpent } = useMemo(() => {
    const filtered = TRANSACTIONS.filter(t => {
      const matchesCategory = activeFilter === 'All' || t.category === activeFilter;
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            t.amount.toString().includes(searchQuery);
      const matchesMonth = selectedMonth === 'All Months' || t.month === selectedMonth;
      const matchesYear = t.year === selectedYear;

      return matchesCategory && matchesSearch && matchesMonth && matchesYear;
    });

    // Sum up amounts of Successful transactions only
    const total = filtered
      .filter(t => t.status === 'Successful')
      .reduce((sum, current) => sum + current.amount, 0);

    return { filteredTransactions: filtered, totalSpent: total };
  }, [activeFilter, searchQuery, selectedMonth, selectedYear]);

  const getTransactionIcon = (type: string, isDark: boolean) => {
    switch (type) {
      case 'MTN': return <Image source={require('../../assets/home/mtn.png')} style={styles.networkLogo} />;
      case 'AIRTEL': return <Image source={require('../../assets/home/airtel.png')} style={styles.networkLogo} />;
      case 'GLO': return <Image source={require('../../assets/home/glo.png')} style={styles.networkLogo} />;
      case '9MOBILE': return <Image source={require('../../assets/home/9mobile.png')} style={styles.networkLogo} />;
      default: return <Ionicons name="receipt-outline" size={20} color={isDark ? "#60A5FA" : "#0B2F66"} />;
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]} edges={['top']}>
        
        {/* Header */}
        <View style={styles.header}>
            {!isSearchVisible ? (
              <>
                <Text style={[styles.headerTitle, isDark && styles.textDark]}>History</Text>
                <TouchableOpacity onPress={() => setIsSearchVisible(true)} style={[styles.searchBtn, isDark && styles.searchBtnDark]}>
                    <Ionicons name="search-outline" size={20} color={isDark ? '#F9FAFB' : '#111827'} />
                </TouchableOpacity>
              </>
            ) : (
              <View style={[styles.searchBarContainer, isDark && styles.searchBarDark]}>
                <Ionicons name="search" size={18} color="#9CA3AF" />
                <TextInput 
                  style={[styles.searchInput, isDark && styles.textDark]}
                  placeholder="Search service or amount..."
                  placeholderTextColor="#9CA3AF"
                  autoFocus
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                <TouchableOpacity onPress={() => {setIsSearchVisible(false); setSearchQuery('');}}>
                  <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            )}
        </View>

        {/* Dynamic Total Spent Summary Card */}
        <View style={styles.summaryPadding}>
            <LinearGradient
                colors={isDark ? ['#1e293b', '#0f172a'] : ['#0B2F66', '#1e40af']}
                style={styles.summaryCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View>
                    <Text style={styles.summaryLabel}>
                        Total Spent ({selectedMonth === 'All Months' ? 'Full Year' : selectedMonth})
                    </Text>
                    <Text style={styles.summaryAmount}>
                        ₦{totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </Text>
                </View>
                <View style={styles.iconBg}>
                    <Ionicons name="stats-chart" size={22} color="#0B2F66" />
                </View>
            </LinearGradient>
        </View>

        {/* Date Filter Selection */}
        <View style={styles.datePickerRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
             <View style={styles.dropdownGroup}>
               {YEARS.map(year => (
                 <TouchableOpacity key={year} onPress={() => setSelectedYear(year)} style={[styles.dateChip, selectedYear === year && styles.dateChipActive]}>
                   <Text style={[styles.dateChipText, selectedYear === year && styles.dateChipTextActive]}>{year}</Text>
                 </TouchableOpacity>
               ))}
             </View>
             <View style={styles.dividerV} />
             <View style={styles.dropdownGroup}>
               {MONTHS.map(month => (
                 <TouchableOpacity key={month} onPress={() => setSelectedMonth(month)} style={[styles.dateChip, selectedMonth === month && styles.dateChipActive]}>
                   <Text style={[styles.dateChipText, selectedMonth === month && styles.dateChipTextActive]}>{month}</Text>
                 </TouchableOpacity>
               ))}
             </View>
          </ScrollView>
        </View>

        {/* Category Filters */}
        <View style={styles.filterWrapper}>
            <FlatList 
                horizontal
                showsHorizontalScrollIndicator={false}
                data={FILTERS}
                keyExtractor={(item) => item}
                contentContainerStyle={styles.filterList}
                renderItem={({ item }) => (
                    <TouchableOpacity 
                        onPress={() => setActiveFilter(item)}
                        style={[styles.filterPill, isDark && styles.filterPillDark, activeFilter === item && styles.filterPillActive]}
                    >
                        <Text style={[styles.filterText, activeFilter === item && styles.filterTextActive]}>{item}</Text>
                    </TouchableOpacity>
                )}
            />
        </View>

        <FlatList
            data={filteredTransactions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <TouchableOpacity onPress={() => router.push(`/transaction/${item.id}`)} style={[styles.transactionCard, isDark && styles.transactionCardDark]}>
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
                        <Text style={[styles.transAmountText, isDark && styles.textDark]}>₦{item.amount.toLocaleString()}</Text>
                        <Text style={[styles.transStatus, { color: item.status === 'Successful' ? '#10B981' : item.status === 'Failed' ? '#EF4444' : '#F59E0B' }]}>{item.status}</Text>
                    </View>
                </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 120 }}
            ListEmptyComponent={() => (
                <View style={styles.emptyState}>
                    <Ionicons name="search-outline" size={60} color="#9CA3AF" />
                    <Text style={[styles.emptyStateText, isDark && styles.textDark]}>
                      No transactions found for {selectedMonth} {selectedYear}
                    </Text>
                </View>
            )}
        />
    </SafeAreaView>
  );
}

// Ensure you import LinearGradient from 'expo-linear-gradient'
import { LinearGradient } from 'expo-linear-gradient';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  containerDark: { backgroundColor: '#0B121F' },
  textDark: { color: '#F9FAFB' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, height: 60 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  searchBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', elevation: 2 },
  searchBtnDark: { backgroundColor: '#1F2937' },
  searchBarContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 15, height: 45, borderWidth: 1, borderColor: '#E5E7EB' },
  searchBarDark: { backgroundColor: '#1F2937', borderColor: '#374151' },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 14, color: '#111827' },

  summaryPadding: { paddingHorizontal: 20, marginVertical: 15 },
  summaryCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 22, borderRadius: 24, elevation: 8, shadowColor: '#0B2F66', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2 },
  summaryLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 5, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  summaryAmount: { fontSize: 28, fontWeight: '900', color: '#fff' },
  iconBg: { width: 46, height: 46, borderRadius: 23, backgroundColor: 'rgba(255,255,255,0.9)', justifyContent: 'center', alignItems: 'center' },

  datePickerRow: { paddingVertical: 5, paddingHorizontal: 20 },
  dropdownGroup: { flexDirection: 'row', alignItems: 'center' },
  dateChip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 12, backgroundColor: '#fff', marginRight: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  dateChipActive: { backgroundColor: '#0B2F66', borderColor: '#0B2F66' },
  dateChipText: { fontSize: 12, color: '#6B7280', fontWeight: 'bold' },
  dateChipTextActive: { color: '#fff' },
  dividerV: { width: 1, height: 20, backgroundColor: '#D1D5DB', marginHorizontal: 10 },

  filterWrapper: { marginVertical: 15 },
  filterList: { paddingHorizontal: 20 },
  filterPill: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 25, backgroundColor: '#fff', marginRight: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  filterPillDark: { backgroundColor: '#1F2937', borderColor: '#374151' },
  filterPillActive: { backgroundColor: '#0B2F66', borderColor: '#0B2F66', elevation: 3 },
  filterText: { color: '#6B7280', fontWeight: 'bold', fontSize: 13 },
  filterTextActive: { color: '#fff' },

  transactionCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 18, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.02 },
  transactionCardDark: { backgroundColor: '#1F2937', elevation: 0 },
  transLeft: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 15, backgroundColor: '#F3F4F6' },
  iconContainerDark: { backgroundColor: '#374151' },
  networkLogo: { width: 26, height: 26, resizeMode: 'contain' },
  transTitle: { fontWeight: 'bold', fontSize: 15, marginBottom: 2 },
  transDate: { color: '#6B7280', fontSize: 11 },
  transRight: { alignItems: 'flex-end' },
  transAmountText: { fontWeight: '900', fontSize: 16, marginBottom: 2 },
  transStatus: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },

  emptyState: { alignItems: 'center', marginTop: 80 },
  emptyStateText: { marginTop: 15, color: '#6B7280', textAlign: 'center', width: '80%', fontWeight: '500' }
});