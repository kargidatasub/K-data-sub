import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router'; // <-- Added for navigation
import { RootState } from '../../store/store';

// Mock list of DisCos (Distribution Companies) in Nigeria
const ELECTRICITY_DATA = [
  { id: '1', name: 'Ikeja Electric', short: 'IKEDC', color: '#EF4444' },
  { id: '2', name: 'Eko Electric', short: 'EKEDC', color: '#3B82F6' },
  { id: '3', name: 'Abuja Electric', short: 'AEDC', color: '#F59E0B' },
  { id: '4', name: 'Kano Electric', short: 'KEDCO', color: '#10B981' },
];

export default function ElectricityBills() {
  const isDark = useSelector((state: RootState) => state.theme.mode) === 'dark';

  return (
    <View>
        <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Pay Electricity</Text>
            {/* Added routing to the All DisCos button */}
            <TouchableOpacity onPress={() => router.push('/VTU/electricity')}>
                <Text style={styles.seeAllText}>All DisCos</Text>
            </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardsScrollContent}>
            {ELECTRICITY_DATA.map((provider) => (
                <TouchableOpacity 
                    key={provider.id} 
                    onPress={() => router.push('/VTU/electricity')}
                    style={[styles.providerCard, isDark && styles.providerCardDark]}
                >
                    <View style={[styles.iconBg, { backgroundColor: provider.color + '1A' }]}> 
                        {/* The + '1A' adds 10% opacity to the hex color for a beautiful soft background */}
                        <Ionicons name="bulb" size={28} color={provider.color} />
                    </View>
                    <View style={styles.providerInfo}>
                        <Text style={[styles.providerName, isDark && styles.textDark]}>{provider.short}</Text>
                        <Text style={styles.providerSub}>{provider.name}</Text>
                    </View>
                </TouchableOpacity>
            ))}
        </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 25, marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  seeAllText: { color: '#4A9C9C', fontWeight: '600' },
  textDark: { color: '#F9FAFB' },
  
  cardsScrollContent: { paddingHorizontal: 20, paddingBottom: 10 },
  
  providerCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#fff', 
      borderRadius: 16, 
      padding: 12, 
      marginRight: 15, 
      minWidth: 160,
      shadowColor: '#000', 
      shadowOffset: { width: 0, height: 2 }, 
      shadowOpacity: 0.04, 
      shadowRadius: 4, 
      elevation: 2,
      borderWidth: 1,
      borderColor: '#F3F4F6'
  },
  providerCardDark: { backgroundColor: '#1F2937', borderColor: '#374151', shadowOpacity: 0 },
  
  iconBg: { width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  
  providerInfo: { justifyContent: 'center' },
  providerName: { fontWeight: 'bold', fontSize: 15, color: '#111827' },
  providerSub: { fontSize: 11, color: '#6B7280', marginTop: 2 },
});