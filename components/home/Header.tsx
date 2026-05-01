import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient'; // <-- Import LinearGradient

export default function Header() {
  return (
    // Replace the outer View with LinearGradient
    <LinearGradient 
      colors={['#0B2F66', '#1E6292']} // Dark Blue to lighter Blue gradient
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.headerBackground}
    >
      <View style={styles.headerTop}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/home/HeaderL.png')} 
            style={styles.headerLogo} 
          />
          <Text style={styles.logoText}>k-data{'\n'}sub</Text>
        </View>
        <View style={styles.userInfo}>
          <View style={{ marginRight: 10 }}>
            <Text style={styles.greetingText}>Good Morning,</Text>
            <Text style={styles.userName}>Sarah! 👋</Text>
          </View>
          <TouchableOpacity style={styles.notificationIcon}>
             <Ionicons name="notifications-outline" size={24} color="#fff" />
             <View style={styles.badge} />
          </TouchableOpacity>
          <Image 
            source={{ uri: 'https://i.pravatar.cc/100' }} 
            style={styles.profilePic} 
          />
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  headerBackground: {
    // ❌ REMOVED: backgroundColor: '#0B2F66', (Gradient handles this now)
    height: 190,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  logoContainer: { flexDirection: 'row', alignItems: 'center' },
  
  headerLogo: {
    width: 34,
    height: 34,
    resizeMode: 'contain',
  },
  
  logoText: { color: '#fff', fontWeight: 'bold', fontSize: 18, marginLeft: 8 },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  greetingText: { color: '#D1D5DB', fontSize: 12, textAlign: 'right' },
  userName: { color: '#fff', fontWeight: 'bold', fontSize: 16, textAlign: 'right' },
  notificationIcon: { marginRight: 15, position: 'relative' },
  badge: { position: 'absolute', top: 0, right: 2, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF7A00', borderWidth: 1, borderColor: '#fff' }, // Changed badge border to white so it pops on the gradient
  profilePic: { width: 45, height: 45, borderRadius: 25 },
});
