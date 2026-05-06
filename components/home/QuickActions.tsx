import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import { useSelector } from 'react-redux';
import { router, Href } from 'expo-router'; 
import { RootState } from '../../store/store';

export default function QuickActions() {
  const isDark = useSelector((state: RootState) => state.theme.mode) === 'dark';

  const ActionItem = ({ icon, label, route }: { icon: keyof typeof MaterialCommunityIcons.glyphMap, label: string, route: Href }) => {
    
    // THE FIX: Detach the navigation from the touch event
    const handlePress = () => {
      setTimeout(() => {
        router.push(route);
      }, 50); // A tiny 50ms delay gives the UI thread time to breathe
    };

    return (
      <Pressable style={styles.actionItem} onPress={handlePress}>
        {({ pressed }) => {
          const isActive = pressed;
          const bgColor = isActive ? '#0B2F66' : (isDark ? '#1F2937' : '#fff');
          const iconColor = isActive ? '#fff' : (isDark ? '#60A5FA' : '#0B2F66');

          return (
            <>
              <View style={[
                styles.actionIconBg, 
                { backgroundColor: bgColor },
                !isActive && isDark && styles.actionIconBgDark
              ]}>
                <MaterialCommunityIcons name={icon} size={32} color={iconColor} />
              </View>
              <Text style={[styles.actionLabel, isDark && styles.textDark]}>{label}</Text>
            </>
          );
        }}
      </Pressable>
    );
  };

  return (
    <View style={styles.quickActionsContainer}>
        <ActionItem icon="access-point" label="Buy Data" route="/VTU/buy-data" />
        <ActionItem icon="cellphone" label="Airtime" route="/VTU/airtime" />
        <ActionItem icon="satellite-variant" label="Cable TV" route="/VTU/cable" />
        <ActionItem icon="lightbulb-outline" label="Electricity" route="/VTU/electricity" />
    </View>
  );
}

const styles = StyleSheet.create({
  quickActionsContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 25, marginTop: 25 },
  actionItem: { alignItems: 'center' },
  actionIconBg: { width: 65, height: 65, borderRadius: 18, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 5, elevation: 3, marginBottom: 8 },
  actionIconBgDark: { shadowOpacity: 0 },
  actionLabel: { fontSize: 13, color: '#374151', fontWeight: '600' },
  textDark: { color: '#F3F4F6' },
});