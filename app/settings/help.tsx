import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  TextInput, LayoutAnimation, UIManager, Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { router } from 'expo-router';
import { RootState } from '../../store/store';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQS = [
  { id: 1, q: 'How do I fund my wallet?', a: 'You can fund your wallet via Bank Transfer (using your dedicated Monnify account number) or through Paystack using your ATM Card.' },
  { id: 2, q: 'My data purchase failed but I was debited', a: 'Failed transactions are automatically reversed within 5-10 minutes. If the issue persists, contact our support team.' },
  { id: 3, q: 'Are your data plans valid for 30 days?', a: 'Yes, all SME and Corporate Gifting data plans have a standard 30-day validity unless explicitly stated otherwise.' },
  { id: 4, q: 'How do I upgrade to a Reseller account?', a: 'Navigate to Profile -> Account Settings -> Upgrade Account to become a reseller and enjoy cheaper rates.' },
];

export default function HelpCenterScreen() {
  const isDark = useSelector((state: RootState) => state.theme.mode) === 'dark';
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredFaqs = FAQS.filter(faq => faq.q.toLowerCase().includes(search.toLowerCase()));

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#0B2F66'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDark && styles.textDark]}>Help Center</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <Text style={[styles.greeting, isDark && styles.textDark]}>Hi there, how can we help?</Text>
        
        {/* Search Bar */}
        <View style={[styles.searchBar, isDark && styles.searchBarDark]}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput 
            style={[styles.searchInput, isDark && styles.textDark]} 
            placeholder="Search for articles..." 
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <Text style={styles.sectionHeader}>Frequently Asked Questions</Text>
        
        <View style={[styles.faqContainer, isDark && styles.faqContainerDark]}>
          {filteredFaqs.length > 0 ? filteredFaqs.map((faq) => {
            const isExpanded = expandedId === faq.id;
            return (
              <TouchableOpacity 
                key={faq.id} 
                style={[styles.faqRow, isDark && styles.faqRowDark]} 
                onPress={() => toggleExpand(faq.id)}
                activeOpacity={0.7}
              >
                <View style={styles.faqHeader}>
                  <Text style={[styles.faqQuestion, isDark && styles.textDark, isExpanded && { color: '#0B2F66' }]}>
                    {faq.q}
                  </Text>
                  <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                </View>
                {isExpanded && (
                  <Text style={[styles.faqAnswer, isDark && { color: '#D1D5DB' }]}>
                    {faq.a}
                  </Text>
                )}
              </TouchableOpacity>
            )
          }) : (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ color: '#9CA3AF' }}>No articles found for "{search}"</Text>
            </View>
          )}
        </View>

        {/* Contact Support Block */}
        <Text style={styles.sectionHeader}>Still need help?</Text>
        <View style={styles.supportGrid}>
          <TouchableOpacity style={[styles.supportCard, isDark && styles.supportCardDark]}>
            <View style={[styles.supportIconBg, { backgroundColor: '#10B9811A' }]}>
              <Ionicons name="chatbubbles" size={24} color="#10B981" />
            </View>
            <Text style={[styles.supportTitle, isDark && styles.textDark]}>Live Chat</Text>
            <Text style={styles.supportSub}>Typical reply: 5 mins</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.supportCard, isDark && styles.supportCardDark]}>
            <View style={[styles.supportIconBg, { backgroundColor: '#F43F5E1A' }]}>
              <Ionicons name="mail" size={24} color="#F43F5E" />
            </View>
            <Text style={[styles.supportTitle, isDark && styles.textDark]}>Email Us</Text>
            <Text style={styles.supportSub}>support@kdata.com</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  containerDark: { backgroundColor: '#111827' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', elevation: 2 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  textDark: { color: '#fff' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  
  greeting: { fontSize: 28, fontWeight: '900', color: '#111827', marginTop: 10, marginBottom: 20 },
  
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 15, height: 55, elevation: 2, marginBottom: 25 },
  searchBarDark: { backgroundColor: '#1F2937' },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16, color: '#111827' },

  sectionHeader: { fontSize: 14, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 15 },
  
  faqContainer: { backgroundColor: '#fff', borderRadius: 20, elevation: 2, marginBottom: 30, overflow: 'hidden' },
  faqContainerDark: { backgroundColor: '#1F2937' },
  faqRow: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  faqRowDark: { borderBottomColor: '#374151' },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQuestion: { flex: 1, fontSize: 15, fontWeight: '600', color: '#111827', paddingRight: 10 },
  faqAnswer: { marginTop: 12, fontSize: 14, color: '#4B5563', lineHeight: 22 },

  supportGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  supportCard: { flex: 0.48, backgroundColor: '#fff', borderRadius: 20, padding: 20, elevation: 2, alignItems: 'center' },
  supportCardDark: { backgroundColor: '#1F2937' },
  supportIconBg: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  supportTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  supportSub: { fontSize: 12, color: '#6B7280', textAlign: 'center' }
});