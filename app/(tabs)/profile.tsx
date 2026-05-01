import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootState } from '../../store/store';
import { setTheme } from '../../store/themeSlice';

export default function ProfileScreen() {
  const isDark = useSelector((state: RootState) => state.theme.mode) === 'dark';
  const dispatch = useDispatch();

  // Handle flipping the Dark Mode switch
  const toggleTheme = async (value: boolean) => {
    const newTheme = value ? 'dark' : 'light';
    dispatch(setTheme(newTheme));
    // Save it so it remembers when they close the app!
    await AsyncStorage.setItem('appTheme', newTheme);
  };

  // A reusable component for the menu rows
  const MenuItem = ({ icon, title, showArrow = true, color }: any) => (
    <TouchableOpacity style={[styles.menuItem, isDark && styles.menuItemDark]}>
      <View style={styles.menuLeft}>
        <View style={[styles.iconBox, isDark && styles.iconBoxDark, color && { backgroundColor: color + '1A' }]}>
          <Ionicons name={icon} size={22} color={color || (isDark ? '#60A5FA' : '#0B2F66')} />
        </View>
        <Text style={[styles.menuText, isDark && styles.textDark]}>{title}</Text>
      </View>
      {showArrow && <Ionicons name="chevron-forward" size={20} color={isDark ? '#6B7280' : '#9CA3AF'} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <Text style={[styles.headerTitle, isDark && styles.textDark]}>Profile</Text>

        {/* User Info Header */}
        <View style={[styles.profileHeader, isDark && styles.profileHeaderDark]}>
          <Image 
            source={{ uri: 'https://i.pravatar.cc/150?img=47' }} 
            style={styles.avatar} 
          />
          <View style={styles.userInfo}>
            <Text style={[styles.userName, isDark && styles.textDark]}>Sarah Jenkins</Text>
            <Text style={styles.userEmail}>sarah.j@example.com</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Verified</Text>
            </View>
          </View>
        </View>

        {/* Preferences Section (Includes your Theme Toggle!) */}
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={[styles.card, isDark && styles.cardDark]}>
          <View style={[styles.menuItem, isDark && styles.menuItemDark, { borderBottomWidth: 0 }]}>
            <View style={styles.menuLeft}>
              <View style={[styles.iconBox, isDark && styles.iconBoxDark]}>
                <Ionicons name={isDark ? "moon" : "sunny"} size={22} color={isDark ? '#60A5FA' : '#FF7A00'} />
              </View>
              <Text style={[styles.menuText, isDark && styles.textDark]}>Dark Mode</Text>
            </View>
            <Switch
              trackColor={{ false: '#D1D5DB', true: '#0B2F66' }}
              thumbColor={isDark ? '#60A5FA' : '#fff'}
              ios_backgroundColor="#D1D5DB"
              onValueChange={toggleTheme}
              value={isDark}
            />
          </View>
        </View>

        {/* Account Section */}
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={[styles.card, isDark && styles.cardDark]}>
          <MenuItem icon="person-outline" title="Personal Details" />
          <MenuItem icon="shield-checkmark-outline" title="Security & PIN" color="#10B981" />
          <MenuItem icon="card-outline" title="Payment Methods" color="#F59E0B" />
          <View style={{ borderBottomWidth: 0 }}><MenuItem icon="notifications-outline" title="Notifications" showArrow={false} /></View>
        </View>

        {/* Support Section */}
        <Text style={styles.sectionTitle}>Support</Text>
        <View style={[styles.card, isDark && styles.cardDark]}>
          <MenuItem icon="chatbubbles-outline" title="Help Center" color="#3B82F6" />
          <View style={{ borderBottomWidth: 0 }}><MenuItem icon="information-circle-outline" title="About k-data sub" /></View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  containerDark: { backgroundColor: '#111827' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 120 }, // Extra padding for your glass tab bar!
  
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 20 },
  textDark: { color: '#F9FAFB' },
  
  // Profile Header Card
  profileHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 20, borderRadius: 20, marginBottom: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 3 },
  profileHeaderDark: { backgroundColor: '#1F2937', shadowOpacity: 0 },
  avatar: { width: 70, height: 70, borderRadius: 35, marginRight: 15, borderWidth: 2, borderColor: '#0B2F66' },
  userInfo: { flex: 1, justifyContent: 'center' },
  userName: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  userEmail: { fontSize: 13, color: '#6B7280', marginBottom: 8 },
  badge: { alignSelf: 'flex-start', backgroundColor: '#D1FAE5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  badgeText: { color: '#10B981', fontSize: 10, fontWeight: 'bold' },

  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#6B7280', marginBottom: 10, marginLeft: 5, textTransform: 'uppercase' },
  
  // Grouped Menu Cards
  card: { backgroundColor: '#fff', borderRadius: 20, marginBottom: 25, paddingHorizontal: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 2 },
  cardDark: { backgroundColor: '#1F2937', shadowOpacity: 0 },
  
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  menuItemDark: { borderBottomColor: '#374151' },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  iconBoxDark: { backgroundColor: '#374151' },
  menuText: { fontSize: 15, fontWeight: '600', color: '#374151' },

  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FEE2E2', paddingVertical: 15, borderRadius: 15, marginTop: 10 },
  logoutText: { color: '#EF4444', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
});