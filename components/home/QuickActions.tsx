import React from 'react';

import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useSelector } from 'react-redux';

import { RootState } from '../../store/store';



export default function QuickActions() {

  const isDark = useSelector((state: RootState) => state.theme.mode) === 'dark';



  const ActionItem = ({ icon, label }: { icon: keyof typeof Ionicons.glyphMap, label: string }) => (

    <TouchableOpacity style={styles.actionItem}>

        <View style={[styles.actionIconBg, isDark && styles.actionIconBgDark]}>

            <Ionicons name={icon} size={28} color={isDark ? "#60A5FA" : "#0B2F66"} />

        </View>

        <Text style={[styles.actionLabel, isDark && styles.textDark]}>{label}</Text>

    </TouchableOpacity>

  );



  return (

    <View style={styles.quickActionsContainer}>

        <ActionItem icon="wifi" label="Buy Data" />

        <ActionItem icon="phone-portrait-outline" label="Airtime" />

        <ActionItem icon="tv-outline" label="Cable TV" />

        <ActionItem icon="bulb-outline" label="Electricity" />

    </View>

  );

}



const styles = StyleSheet.create({

  quickActionsContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 25, marginTop: 25 },

  actionItem: { alignItems: 'center' },

  actionIconBg: { backgroundColor: '#fff', width: 60, height: 60, borderRadius: 15, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2, marginBottom: 8 },

  actionIconBgDark: { backgroundColor: '#1F2937', shadowOpacity: 0 },

  actionLabel: { fontSize: 13, color: '#374151', fontWeight: '600' },

  textDark: { color: '#F3F4F6' },

});