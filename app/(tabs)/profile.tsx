import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, 
  Switch, Modal, Alert, TextInput, KeyboardAvoidingView, Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { RootState } from '../../store/store';
import { setTheme } from '../../store/themeSlice';
import PersonalDetailsModal from '../../components/profile/PersonalDetailsModal';

export default function ProfileScreen() {
  const isDark = useSelector((state: RootState) => state.theme.mode) === 'dark';
  const dispatch = useDispatch();

  // Modal States
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [notifVisible, setNotifVisible] = useState(false);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [contactVisible, setContactVisible] = useState(false);
  const [aboutVisible, setAboutVisible] = useState(false);

  // Form States
  const [feedbackText, setFeedbackText] = useState('');

  // User Data State
  const [user, setUser] = useState({
    firstName: 'Sarah',
    lastName: 'Jenkins',
    username: 'sarah_j',
    email: 'sarah.j@example.com',
    image: 'https://i.pravatar.cc/150?img=47',
    state: 'Lagos',
    lga: 'Ikeja',
    address: '12, Admiralty Way'
  });

  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);

  const toggleTheme = async (value: boolean) => {
    const newTheme = value ? 'dark' : 'light';
    dispatch(setTheme(newTheme));
    await AsyncStorage.setItem('appTheme', newTheme);
  };

  const handleSendFeedback = () => {
    if (!feedbackText.trim()) return;
    Alert.alert("Thank You!", "Your feedback has been submitted successfully.");
    setFeedbackText('');
    setFeedbackVisible(false);
  };

  const MenuItem = ({ icon, title, color, onPress, showArrow = true }: any) => (
    <TouchableOpacity style={[styles.menuItem, isDark && styles.menuItemDark]} onPress={onPress}>
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

        <View style={[styles.profileHeader, isDark && styles.profileHeaderDark]}>
          <Image source={{ uri: user.image }} style={styles.avatar} />
          <View style={styles.userInfo}>
            <Text style={[styles.userName, isDark && styles.textDark]}>{user.firstName} {user.lastName}</Text>
            <Text style={styles.userEmail}>@{user.username}</Text>
            <View style={styles.badge}><Text style={styles.badgeText}>Verified Account</Text></View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Account Settings</Text>
        <View style={[styles.card, isDark && styles.cardDark]}>
          <MenuItem icon="person-outline" title="Personal Details" onPress={() => setDetailsVisible(true)} />
          <MenuItem icon="notifications-outline" title="Notifications" onPress={() => setNotifVisible(true)} />
          {/* Routing for Security */}
          <MenuItem icon="shield-checkmark-outline" title="Security & PIN" color="#10B981" onPress={() => router.push('/settings/security')} />
        </View>

        <Text style={styles.sectionTitle}>Support & Feedback</Text>
        <View style={[styles.card, isDark && styles.cardDark]}>
          {/* Routing for Help Center */}
          <MenuItem icon="help-buoy-outline" title="Help Center" color="#3B82F6" onPress={() => router.push('/settings/help')} />
          {/* Modals for the rest */}
          <MenuItem icon="chatbubble-ellipses-outline" title="Feedback" color="#8B5CF6" onPress={() => setFeedbackVisible(true)} />
          <MenuItem icon="mail-unread-outline" title="Contact Us" color="#F43F5E" onPress={() => setContactVisible(true)} />
          <MenuItem icon="information-circle-outline" title="About k-data sub" onPress={() => setAboutVisible(true)} />
        </View>

        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={[styles.card, isDark && styles.cardDark]}>
          <View style={[styles.menuItem, { borderBottomWidth: 0 }]}>
            <View style={styles.menuLeft}>
              <View style={[styles.iconBox, isDark && styles.iconBoxDark]}>
                <Ionicons name={isDark ? "moon" : "sunny"} size={22} color={isDark ? '#60A5FA' : '#FF7A00'} />
              </View>
              <Text style={[styles.menuText, isDark && styles.textDark]}>Dark Mode</Text>
            </View>
            <Switch trackColor={{ false: '#D1D5DB', true: '#0B2F66' }} thumbColor={isDark ? '#60A5FA' : '#fff'} onValueChange={toggleTheme} value={isDark} />
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* --- PERSONAL DETAILS MODAL --- */}
      <PersonalDetailsModal 
        visible={detailsVisible} 
        onClose={() => setDetailsVisible(false)} 
        isDark={isDark} 
        userData={user}
        onSave={(newData) => setUser({ ...user, ...newData })}
      />

      {/* --- NOTIFICATIONS MODAL --- */}
      <Modal 
        visible={notifVisible} 
        animationType="fade" 
        transparent 
        onRequestClose={() => setNotifVisible(false)}
        statusBarTranslucent
        navigationBarTranslucent
      >
        <View style={styles.modalOverlayCenter}>
          <View style={[styles.genericModal, isDark && styles.cardDark]}>
            <Text style={[styles.modalTitleSmall, isDark && styles.textDark]}>Notifications</Text>
            <NotifRow label="Push Notifications" sub="Transaction alerts" value={pushEnabled} onToggle={setPushEnabled} isDark={isDark} />
            <NotifRow label="Email Alerts" sub="Monthly summaries" value={emailEnabled} onToggle={setEmailEnabled} isDark={isDark} />
            <TouchableOpacity style={styles.doneBtn} onPress={() => setNotifVisible(false)}>
              <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* --- FEEDBACK MODAL --- */}
      <Modal 
        visible={feedbackVisible} 
        animationType="fade" 
        transparent 
        onRequestClose={() => setFeedbackVisible(false)}
        statusBarTranslucent
        navigationBarTranslucent
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <View style={styles.modalOverlayCenter}>
            <View style={[styles.genericModal, isDark && styles.cardDark]}>
              <View style={styles.modalHeaderRow}>
                <Text style={[styles.modalTitleSmall, isDark && styles.textDark, { marginBottom: 0 }]}>Send Feedback</Text>
                <TouchableOpacity onPress={() => setFeedbackVisible(false)}>
                  <Ionicons name="close" size={24} color={isDark ? '#fff' : '#111827'} />
                </TouchableOpacity>
              </View>
              <Text style={styles.modalSubText}>Tell us what you love or what we can improve.</Text>
              
              <TextInput 
                style={[styles.textArea, isDark && styles.textAreaDark, isDark && styles.textDark]}
                placeholder="Write your feedback here..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                value={feedbackText}
                onChangeText={setFeedbackText}
              />
              
              <TouchableOpacity style={styles.doneBtn} onPress={handleSendFeedback}>
                <Text style={styles.doneBtnText}>Submit Feedback</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* --- CONTACT US MODAL --- */}
      <Modal 
        visible={contactVisible} 
        animationType="fade" 
        transparent 
        onRequestClose={() => setContactVisible(false)}
        statusBarTranslucent
        navigationBarTranslucent
      >
        <View style={styles.modalOverlayCenter}>
          <View style={[styles.genericModal, isDark && styles.cardDark]}>
            <View style={styles.modalHeaderRow}>
              <Text style={[styles.modalTitleSmall, isDark && styles.textDark, { marginBottom: 0 }]}>Contact Us</Text>
              <TouchableOpacity onPress={() => setContactVisible(false)}>
                <Ionicons name="close" size={24} color={isDark ? '#fff' : '#111827'} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubText}>We're here to help! Reach out to us via:</Text>

            <ContactRow icon="call" title="Phone Support" sub="+234 800 123 4567" isDark={isDark} />
            <ContactRow icon="mail" title="Email Us" sub="support@kdatasub.com" isDark={isDark} />
            <ContactRow icon="logo-whatsapp" title="WhatsApp" sub="Chat with our bot" isDark={isDark} color="#25D366" />

          </View>
        </View>
      </Modal>

      {/* --- ABOUT MODAL --- */}
      <Modal 
        visible={aboutVisible} 
        animationType="fade" 
        transparent 
        onRequestClose={() => setAboutVisible(false)}
        statusBarTranslucent
        navigationBarTranslucent
      >
        <View style={styles.modalOverlayCenter}>
          <View style={[styles.genericModal, { alignItems: 'center' }, isDark && styles.cardDark]}>
            <View style={[styles.logoPlaceholder, isDark && { backgroundColor: '#374151' }]}>
              <Ionicons name="flash" size={40} color="#0B2F66" />
            </View>
            <Text style={[styles.aboutTitle, isDark && styles.textDark]}>k-data sub</Text>
            <Text style={styles.aboutVersion}>Version 1.0.0</Text>
            <Text style={[styles.aboutDesc, isDark && { color: '#D1D5DB' }]}>
              The most reliable and affordable VTU platform in Nigeria for all your daily bills and data needs.
            </Text>

            <TouchableOpacity style={styles.aboutLink}>
              <Text style={styles.aboutLinkText}>Terms of Service</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.aboutLink}>
              <Text style={styles.aboutLinkText}>Privacy Policy</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.doneBtn, { width: '100%', marginTop: 20 }]} onPress={() => setAboutVisible(false)}>
              <Text style={styles.doneBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const NotifRow = ({ label, sub, value, onToggle, isDark }: any) => (
  <View style={styles.notifRow}>
    <View style={{ flex: 1 }}>
      <Text style={[styles.menuText, isDark && { color: '#fff' }]}>{label}</Text>
      <Text style={styles.savedSub}>{sub}</Text>
    </View>
    <Switch value={value} onValueChange={onToggle} trackColor={{ false: '#D1D5DB', true: '#10B981' }} />
  </View>
);

const ContactRow = ({ icon, title, sub, isDark, color }: any) => (
  <TouchableOpacity style={[styles.contactRow, isDark && { borderBottomColor: '#374151' }]}>
    <View style={[styles.contactIconBg, { backgroundColor: (color || '#0B2F66') + '1A' }]}>
      <Ionicons name={icon} size={20} color={color || '#0B2F66'} />
    </View>
    <View>
      <Text style={[styles.contactTitle, isDark && { color: '#fff' }]}>{title}</Text>
      <Text style={styles.contactSub}>{sub}</Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  containerDark: { backgroundColor: '#111827' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 120 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 20 },
  textDark: { color: '#F9FAFB' },
  profileHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 20, borderRadius: 20, marginBottom: 25, elevation: 3 },
  profileHeaderDark: { backgroundColor: '#1F2937' },
  avatar: { width: 70, height: 70, borderRadius: 35, marginRight: 15, borderWidth: 2, borderColor: '#0B2F66' },
  userInfo: { flex: 1 },
  userName: { fontSize: 18, fontWeight: 'bold' },
  userEmail: { fontSize: 13, color: '#6B7280', marginBottom: 5 },
  badge: { alignSelf: 'flex-start', backgroundColor: '#D1FAE5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  badgeText: { color: '#10B981', fontSize: 10, fontWeight: 'bold' },
  sectionTitle: { fontSize: 11, fontWeight: '800', color: '#9CA3AF', marginBottom: 10, marginLeft: 5, textTransform: 'uppercase', letterSpacing: 1 },
  card: { backgroundColor: '#fff', borderRadius: 20, marginBottom: 25, paddingHorizontal: 15, elevation: 2 },
  cardDark: { backgroundColor: '#1F2937' },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  menuItemDark: { borderBottomColor: '#374151' },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  iconBoxDark: { backgroundColor: '#374151' },
  menuText: { fontSize: 15, fontWeight: '600', color: '#374151' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FEE2E2', paddingVertical: 15, borderRadius: 15 },
  logoutText: { color: '#EF4444', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
  
  // Generic Modal Styles
  modalOverlayCenter: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  genericModal: { backgroundColor: '#fff', borderRadius: 24, padding: 25, elevation: 10 },
  modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  modalTitleSmall: { fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  modalSubText: { fontSize: 14, color: '#6B7280', marginBottom: 20 },
  
  // Feedback
  textArea: { backgroundColor: '#F3F4F6', borderRadius: 12, padding: 15, height: 100, textAlignVertical: 'top', fontSize: 15, marginBottom: 20 },
  textAreaDark: { backgroundColor: '#374151', color: '#fff' },

  // Contact Rows
  contactRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  contactIconBg: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  contactTitle: { fontSize: 15, fontWeight: 'bold', color: '#111827', marginBottom: 2 },
  contactSub: { fontSize: 13, color: '#6B7280' },

  // About 
  logoPlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E0E7FF', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  aboutTitle: { fontSize: 22, fontWeight: '900', color: '#111827', marginBottom: 5 },
  aboutVersion: { fontSize: 14, color: '#9CA3AF', fontWeight: 'bold', marginBottom: 15 },
  aboutDesc: { fontSize: 14, color: '#4B5563', textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  aboutLink: { paddingVertical: 10 },
  aboutLinkText: { color: '#3B82F6', fontWeight: 'bold', fontSize: 14 },

  notifRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  savedSub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  doneBtn: { backgroundColor: '#0B2F66', padding: 16, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  doneBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 }
});