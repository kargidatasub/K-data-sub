import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import { useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient'; // <-- Added for beautiful cards
import { RootState } from '../../store/store';

// 1. Mock Data: This holds the plans for each network dynamically
const PLAN_DATA = {
  MTN: [
    { id: '1', title: 'MTN 20GB + Bonus', validity: '30 Days', price: '₦5,000', colors: ['#FF7A00', '#FF9F40'], btnText: '#FF7A00' },
    { id: '2', title: 'MTN 10GB', validity: '30 Days', price: '₦3,000', colors: ['#4A9C9C', '#61BDBD'], btnText: '#4A9C9C' },
  ],
  AIRTEL: [
    { id: '3', title: 'Airtel 15GB Binge', validity: '30 Days', price: '₦4,000', colors: ['#E60000', '#FF4D4D'], btnText: '#E60000' },
    { id: '4', title: 'Airtel 5GB', validity: '14 Days', price: '₦1,500', colors: ['#4A9C9C', '#61BDBD'], btnText: '#4A9C9C' },
  ],
  GLO: [
    { id: '5', title: 'Glo 22GB Jumbo', validity: '30 Days', price: '₦5,000', colors: ['#009933', '#33CC66'], btnText: '#009933' },
  ],
  '9MOBILE': [
    { id: '6', title: '9mobile 7GB', validity: '30 Days', price: '₦4,000', colors: ['#006600', '#009900'], btnText: '#006600' },
  ]
};

// Map names to image paths so we can load them dynamically
const LOGOS = {
  MTN: require('../../assets/home/mtn.png'),
  AIRTEL: require('../../assets/home/airtel.png'),
  GLO: require('../../assets/home/glo.png'),
  '9MOBILE': require('../../assets/home/9mobile.png'),
};

export default function PopularPlans() {
  const isDark = useSelector((state: RootState) => state.theme.mode) === 'dark';
  
  // 2. State to track which network is currently active (defaults to MTN)
  const [activeNetwork, setActiveNetwork] = useState<keyof typeof PLAN_DATA>('MTN');

  // 3. Updated NetworkPill to be a TouchableOpacity so it responds to taps
  const NetworkPill = ({ network, imageSource }: { network: keyof typeof PLAN_DATA, imageSource: ImageSourcePropType }) => {
    const isActive = activeNetwork === network;
    
    return (
        <TouchableOpacity 
            onPress={() => setActiveNetwork(network)} // Updates the active cards
            style={[
                styles.networkPill, 
                isDark && styles.networkPillDark, 
                isActive && { borderColor: '#0B2F66', borderWidth: 2 } 
            ]}
        >
           <Image source={imageSource} style={styles.pillLogo} />
        </TouchableOpacity>
    );
  };

  return (
    <View>
      <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Popular Data Plans</Text>
          <TouchableOpacity><Text style={styles.seeAllText}>See All</Text></TouchableOpacity>
      </View>
      
      {/* 4. FIX FOR HIDDEN PILL: Use contentContainerStyle instead of style for horizontal padding */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScrollContent}>
           <NetworkPill network="MTN" imageSource={LOGOS.MTN} />
           <NetworkPill network="AIRTEL" imageSource={LOGOS.AIRTEL} />
           <NetworkPill network="GLO" imageSource={LOGOS.GLO} />
           <NetworkPill network="9MOBILE" imageSource={LOGOS['9MOBILE']} />
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardsScrollContent}>
          {/* 5. Dynamically map through the cards based on the active network */}
          {PLAN_DATA[activeNetwork].map((plan) => (
             // 6. Upgraded View to LinearGradient for beautiful styling
             <LinearGradient 
                key={plan.id}
                colors={plan.colors} 
                start={{ x: 0, y: 0 }} 
                end={{ x: 1, y: 1 }}
                style={styles.planCard}
             >
                  <View style={styles.planCardHeader}>
                      <View style={styles.logoSmContainer}>
                          <Image source={LOGOS[activeNetwork]} style={styles.cardSmallLogo} />
                      </View>
                      <Text style={styles.planCardTitle}>{plan.title}</Text>
                  </View>
                  <Text style={styles.planCardValidity}>{plan.validity}</Text>
                  
                  <View style={styles.planCardFooter}>
                      <Text style={styles.planCardPrice}>{plan.price}</Text>
                      <TouchableOpacity style={styles.buyNowBtn}>
                          <Text style={[styles.buyNowText, { color: plan.btnText }]}>Buy Now</Text>
                      </TouchableOpacity>
                  </View>
             </LinearGradient>
          ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 30, marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  seeAllText: { color: '#4A9C9C', fontWeight: '600' },
  textDark: { color: '#F9FAFB' },
  
  // Fixed ScrollView padding
  horizontalScrollContent: { paddingHorizontal: 20, paddingBottom: 15 },
  
  // Pill styles
  networkPill: { backgroundColor: '#fff', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 12, marginRight: 10, borderWidth: 1, borderColor: '#E5E7EB', justifyContent:'center', alignItems: 'center', minWidth: 80, height: 45 },
  networkPillDark: { backgroundColor: '#1F2937', borderColor: '#374151' },
  pillLogo: { width: 45, height: 25, resizeMode: 'contain' },
  
  // Fixed ScrollView padding
  cardsScrollContent: { paddingHorizontal: 20, paddingBottom: 10 },
  
  planCard: { width: 290, borderRadius: 15, padding: 18, marginRight: 15, shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.1, shadowRadius: 5, elevation: 4 },
  planCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  
  // Card Small Logo Styles
  logoSmContainer: { backgroundColor: '#fff', width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center', marginRight: 10, overflow: 'hidden' },
  cardSmallLogo: { width: 16, height: 16, resizeMode: 'contain' },
  
  planCardTitle: { color: '#fff', fontWeight: 'bold', fontSize: 17 },
  planCardValidity: { color: 'rgba(255, 255, 255, 0.8)', fontSize: 13, marginBottom: 20 },
  planCardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  planCardPrice: { color: '#fff', fontWeight: 'bold', fontSize: 24 },
  buyNowBtn: { backgroundColor: '#fff', paddingVertical: 10, paddingHorizontal: 18, borderRadius: 20 },
  buyNowText: { fontWeight: 'bold', fontSize: 14 },
});