import React, { useState, useEffect } from 'react';
import { 
  View, Text, Image, TouchableOpacity, StyleSheet, 
  Modal, FlatList, Pressable, Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// 1. Mock Notification Data
const MOCK_NOTIFICATIONS = [
  { id: '1', title: 'Wallet Funded! 💸', desc: 'Your wallet has been credited with ₦5,000.', time: '10 mins ago', read: false },
  { id: '2', title: 'Data Purchase Successful', desc: 'You successfully bought 10GB MTN data.', time: '2 hours ago', read: true },
  { id: '3', title: 'Flash Promo! ⚡', desc: 'Get 20% off all Glo data purchases today only.', time: '1 day ago', read: true },
  { id: '4', title: 'Electricity Bill Paid', desc: 'Ikeja Electric token generated successfully.', time: '2 days ago', read: true },
];

export default function Header() {
  const [greeting, setGreeting] = useState('Good Morning,');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  // 2. Dynamic Greeting Logic
  useEffect(() => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      setGreeting('Good Morning,');
    } else if (currentHour < 18) {
      setGreeting('Good Afternoon,');
    } else {
      setGreeting('Good Evening,');
    }
  }, []);

  // Calculate if we have unread notifications to show the badge
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
  };

  return (
    <>
      <LinearGradient 
        colors={['#0B2F66', '#1E6292']} 
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
              <Text style={styles.greetingText}>{greeting}</Text>
              <Text style={styles.userName}>Askiboy! 👋</Text>
            </View>

            {/* Notification Icon triggering the Modal */}
            <TouchableOpacity 
              style={styles.notificationIcon} 
              onPress={() => setShowNotifications(true)}
              activeOpacity={0.7}
            >
               <Ionicons name="notifications-outline" size={24} color="#fff" />
               {unreadCount > 0 && <View style={styles.badge} />}
            </TouchableOpacity>

            <Image 
              source={{ uri: 'https://i.pravatar.cc/150?img=47' }} 
              style={styles.profilePic} 
            />
          </View>
        </View>
      </LinearGradient>

      {/* --- NOTIFICATION MODAL --- */}
      <Modal
        visible={showNotifications}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowNotifications(false)}
        statusBarTranslucent
      >
        <View style={styles.modalOverlay}>
          {/* Pressable background to close modal when clicking outside */}
          <Pressable style={styles.modalBackdrop} onPress={() => setShowNotifications(false)} />
          
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Notifications</Text>
              {unreadCount > 0 && (
                <TouchableOpacity onPress={markAllAsRead}>
                  <Text style={styles.markReadText}>Mark all as read</Text>
                </TouchableOpacity>
              )}
            </View>

            <FlatList
              data={notifications}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
              renderItem={({ item }) => (
                <TouchableOpacity style={[styles.notificationCard, !item.read && styles.unreadCard]}>
                  <View style={[styles.iconWrapper, !item.read && styles.iconWrapperUnread]}>
                    <Ionicons 
                      name={item.title.includes('Promo') ? 'gift' : 'notifications'} 
                      size={20} 
                      color={item.read ? '#9CA3AF' : '#0B2F66'} 
                    />
                  </View>
                  <View style={styles.notificationTextContainer}>
                    <Text style={[styles.notificationTitle, !item.read && styles.unreadText]}>{item.title}</Text>
                    <Text style={styles.notificationDesc}>{item.desc}</Text>
                    <Text style={styles.notificationTime}>{item.time}</Text>
                  </View>
                  {!item.read && <View style={styles.unreadDot} />}
                </TouchableOpacity>
              )}
              ListEmptyComponent={() => (
                <View style={styles.emptyState}>
                  <Ionicons name="notifications-off-outline" size={48} color="#D1D5DB" />
                  <Text style={styles.emptyText}>No notifications right now.</Text>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  headerBackground: {
    height: 190,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 5 : 5, // Adjust top padding for status bar
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  logoContainer: { flexDirection: 'row', alignItems: 'center' },
  headerLogo: { width: 34, height: 34, resizeMode: 'contain' },
  logoText: { color: '#fff', fontWeight: 'bold', fontSize: 18, marginLeft: 8 },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  greetingText: { color: '#D1D5DB', fontSize: 12, textAlign: 'right' },
  userName: { color: '#fff', fontWeight: 'bold', fontSize: 16, textAlign: 'right' },
  
  notificationIcon: { marginRight: 15, position: 'relative' },
  badge: { position: 'absolute', top: 0, right: 2, width: 9, height: 9, borderRadius: 4.5, backgroundColor: '#EF4444', borderWidth: 1.5, borderColor: '#1E6292' },
  profilePic: { width: 45, height: 45, borderRadius: 25, borderWidth: 2, borderColor: '#fff' },

  // Notification Modal Styles
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject },
  modalContent: { 
    backgroundColor: '#fff', 
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30, 
    padding: 25, 
    maxHeight: '80%', 
    minHeight: '50%' 
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  markReadText: { color: '#0B2F66', fontWeight: '600', fontSize: 13 },
  
  notificationCard: { flexDirection: 'row', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', alignItems: 'center' },
  unreadCard: { backgroundColor: '#F8FAFC', borderRadius: 12, paddingHorizontal: 10, borderBottomWidth: 0, marginBottom: 5 },
  
  iconWrapper: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  iconWrapperUnread: { backgroundColor: '#E0E7FF' },
  
  notificationTextContainer: { flex: 1 },
  notificationTitle: { fontSize: 15, fontWeight: '600', color: '#374151', marginBottom: 3 },
  unreadText: { color: '#111827', fontWeight: 'bold' },
  notificationDesc: { fontSize: 13, color: '#6B7280', marginBottom: 5, lineHeight: 18 },
  notificationTime: { fontSize: 11, color: '#9CA3AF', fontWeight: '500' },
  
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#0B2F66', marginLeft: 10 },
  
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  emptyText: { color: '#9CA3AF', marginTop: 10, fontSize: 15 },
});