import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { RootState } from '../../store/store';

const EDU_DATA = [
  { id: '1', title: 'WAEC Result Pin', price: '₦3,500', icon: 'school-outline', color: '#0B2F66', bg: '#E0E7FF' },
  { id: '2', title: 'NECO Token', price: '₦1,200', icon: 'document-text-outline', color: '#10B981', bg: '#D1FAE5' },
  { id: '3', title: 'JAMB E-PIN', price: '₦6,200', icon: 'book-outline', color: '#FF7A00', bg: '#FFEDD5' },
];

export default function EducationBills() {
  const isDark = useSelector((state: RootState) => state.theme.mode) === 'dark';

  return (
    <View>
        <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Education Pins</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardsScrollContent}>
            {EDU_DATA.map((item) => (
                <View key={item.id} style={[styles.eduCard, isDark && styles.eduCardDark]}>
                    <View style={styles.cardHeader}>
                        <View style={[styles.iconContainer, { backgroundColor: isDark ? '#374151' : item.bg }]}>
                            <Ionicons name={item.icon as any} size={24} color={isDark ? '#60A5FA' : item.color} />
                        </View>
                        <Text style={[styles.eduTitle, isDark && styles.textDark]}>{item.title}</Text>
                    </View>
                    
                    <View style={styles.cardFooter}>
                        <Text style={[styles.eduPrice, isDark && styles.textDark]}>{item.price}</Text>
                        <TouchableOpacity style={styles.buyBtn}>
                            <Text style={styles.buyBtnText}>Buy Pin</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ))}
        </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 20, marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  textDark: { color: '#F9FAFB' },
  
  cardsScrollContent: { paddingHorizontal: 20, paddingBottom: 10 },
  
  eduCard: {
      backgroundColor: '#fff', 
      borderRadius: 16, 
      padding: 16, 
      marginRight: 15, 
      width: 170, 
      shadowColor: '#000', 
      shadowOffset: { width: 0, height: 4 }, 
      shadowOpacity: 0.05, 
      shadowRadius: 5, 
      elevation: 2,
      borderWidth: 1,
      borderColor: '#F3F4F6'
  },
  eduCardDark: { backgroundColor: '#1F2937', borderColor: '#374151', shadowOpacity: 0 },
  
  cardHeader: { marginBottom: 15 },
  iconContainer: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  eduTitle: { fontWeight: '700', fontSize: 14, color: '#374151' },
  
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 },
  eduPrice: { fontWeight: '900', fontSize: 16, color: '#111827' },
  
  buyBtn: { backgroundColor: '#0B2F66', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  buyBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
});