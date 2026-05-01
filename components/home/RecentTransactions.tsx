import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { RootState } from '../../store/store';

// 1. Mock Data for 7 Transactions
const TRANSACTIONS = [
  { id: '1', type: 'MTN', title: 'MTN Data (10GB)', date: 'Oct 27, 2023 • 10:42 AM', amount: '₦3,000', status: 'Successful' },
  { id: '2', type: 'AIRTEL', title: 'Airtel Airtime', date: 'Oct 26, 2023 • 02:15 PM', amount: '₦1,000', status: 'Successful' },
  { id: '3', type: 'GLO', title: 'Glo Data (2.5GB)', date: 'Oct 25, 2023 • 09:00 AM', amount: '₦1,200', status: 'Failed' },
  { id: '4', type: 'ELECTRICITY', title: 'Ikeja Electric', date: 'Oct 23, 2023 • 06:30 PM', amount: '₦15,000', status: 'Successful' },
  { id: '5', type: '9MOBILE', title: '9mobile Airtime', date: 'Oct 22, 2023 • 11:20 AM', amount: '₦500', status: 'Successful' },
  { id: '6', type: 'CABLE', title: 'DSTV Premium', date: 'Oct 20, 2023 • 08:00 AM', amount: '₦24,500', status: 'Pending' },
  { id: '7', type: 'MTN', title: 'MTN Data (20GB)', date: 'Oct 18, 2023 • 04:45 PM', amount: '₦5,000', status: 'Successful' },
];

// 2. Helper to get the correct icon/logo based on transaction type
const getTransactionIcon = (type: string, isDark: boolean) => {
  switch (type) {
    case 'MTN': return <Image source={require('../../assets/home/mtn.png')} style={styles.networkLogo} />;
    case 'AIRTEL': return <Image source={require('../../assets/home/airtel.png')} style={styles.networkLogo} />;
    case 'GLO': return <Image source={require('../../assets/home/glo.png')} style={styles.networkLogo} />;
    case '9MOBILE': return <Image source={require('../../assets/home/9mobile.png')} style={styles.networkLogo} />;
    case 'ELECTRICITY': return <Ionicons name="bulb-outline" size={24} color={isDark ? "#60A5FA" : "#0B2F66"} />;
    case 'CABLE': return <Ionicons name="tv-outline" size={24} color={isDark ? "#60A5FA" : "#0B2F66"} />;
    default: return <Ionicons name="receipt-outline" size={24} color={isDark ? "#60A5FA" : "#0B2F66"} />;
  }
};

// 3. Helper to get the correct color for the status text
const getStatusColor = (status: string) => {
    switch (status) {
        case 'Successful': return '#10B981'; // Green
        case 'Failed': return '#EF4444'; // Red
        case 'Pending': return '#F59E0B'; // Orange/Amber
        default: return '#6B7280'; // Gray
    }
}

export default function RecentTransactions() {
  const isDark = useSelector((state: RootState) => state.theme.mode) === 'dark';

  return (
    <View style={styles.container}>
        <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Recent Transactions</Text>
        </View>

        {/* 4. Map through the transactions array */}
        {TRANSACTIONS.map((tx) => (
            <TouchableOpacity key={tx.id} style={[styles.transactionItem, isDark && styles.transactionItemDark]}>
                <View style={styles.transLeft}>
                    {/* Render the dynamic logo background */}
                    <View style={[styles.iconContainer, isDark && styles.iconContainerDark]}>
                        {getTransactionIcon(tx.type, isDark)}
                    </View>
                    <View>
                        <Text style={[styles.transTitle, isDark && styles.textDark]}>{tx.title}</Text>
                        <Text style={styles.transDate}>{tx.date}</Text>
                    </View>
                </View>
                <View style={styles.transRight}>
                    <Text style={[styles.transAmount, isDark && styles.textDark]}>{tx.amount}</Text>
                    <Text style={[styles.transStatus, { color: getStatusColor(tx.status) }]}>
                        {tx.status}
                    </Text>
                </View>
            </TouchableOpacity>
        ))}

        {/* 5. The "See More" Button at the bottom */}
        <TouchableOpacity style={styles.seeMoreBtn}>
            <Text style={styles.seeMoreText}>See all transactions</Text>
            <Ionicons name="chevron-forward" size={16} color="#4A9C9C" />
        </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
      marginTop: 25, 
      paddingBottom: 20 
  },
  sectionHeader: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      paddingHorizontal: 20, 
      marginBottom: 15 
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  textDark: { color: '#F9FAFB' },
  
  // Polished Transaction Card
  transactionItem: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      backgroundColor: '#fff', 
      marginHorizontal: 20, 
      padding: 16, 
      borderRadius: 16, 
      marginBottom: 12,
      // Added a subtle shadow to make it pop
      shadowColor: '#000', 
      shadowOffset: { width: 0, height: 2 }, 
      shadowOpacity: 0.04, 
      shadowRadius: 4, 
      elevation: 2,
      borderWidth: 1,
      borderColor: '#F3F4F6'
  },
  transactionItemDark: { backgroundColor: '#1F2937', borderColor: '#374151', shadowOpacity: 0 },
  
  transLeft: { flexDirection: 'row', alignItems: 'center' },
  
  // Dynamic Icon Container
  iconContainer: { 
      backgroundColor: '#F3F4F6', 
      width: 48, 
      height: 48, 
      borderRadius: 24, 
      justifyContent: 'center', 
      alignItems: 'center', 
      marginRight: 15,
      overflow: 'hidden'
  },
  iconContainerDark: { backgroundColor: '#374151' },
  networkLogo: { width: 28, height: 28, resizeMode: 'contain' },
  
  transTitle: { fontWeight: 'bold', color: '#111827', fontSize: 15, marginBottom: 4 },
  transDate: { color: '#6B7280', fontSize: 12 },
  
  transRight: { alignItems: 'flex-end' },
  transAmount: { fontWeight: 'bold', color: '#111827', fontSize: 15, marginBottom: 4 },
  transStatus: { fontSize: 12, fontWeight: '600' },

  // See More Button
  seeMoreBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 10,
      paddingVertical: 12,
  },
  seeMoreText: {
      color: '#4A9C9C', // Using your brand's teal color
      fontWeight: 'bold',
      fontSize: 14,
      marginRight: 4,
  }
});