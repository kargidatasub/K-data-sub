import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Animated, Text } from 'react-native';
// 1. Import the new Layout Context and MaterialTopTabs
import { withLayoutContext } from 'expo-router';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

// 2. Initialize the Swipeable Navigator
const TopTab = createMaterialTopTabNavigator();
const SwipeTabs = withLayoutContext(TopTab.Navigator);

// 3. Your Custom Tab Bar (No changes needed here!)
function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const isDark = useSelector((state: RootState) => state.theme.mode) === 'dark';
  
  const { width } = Dimensions.get('window');
  const TAB_BAR_WIDTH = width; 
  const TAB_WIDTH = TAB_BAR_WIDTH / state.routes.length;

  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: state.index * TAB_WIDTH,
      useNativeDriver: true,
      bounciness: 4, 
      speed: 14,
    }).start();
  }, [state.index]);

  return (
    <View style={[styles.tabBarWrapper, { paddingBottom: insets.bottom > 0 ? insets.bottom : 0 }]}>
      <BlurView 
        intensity={isDark ? 40 : 80} 
        tint={isDark ? "dark" : "light"} 
        experimentalBlurMethod="dimezisBlurView" 
        style={[styles.blurContainer, isDark && styles.blurContainerDark]}
      >
        <Animated.View 
            style={[
                styles.slidingIndicator, 
                { width: TAB_WIDTH, transform: [{ translateX: slideAnim }] }
            ]} 
        >
            <View style={styles.indicatorPill} />
        </Animated.View>

        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const activeColor = isDark ? '#60A5FA' : '#0B2F66'; 
          const inactiveColor = isDark ? '#9CA3AF' : '#6B7280';
          const iconColor = isFocused ? activeColor : inactiveColor;

          return (
            <TouchableOpacity
              key={index}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              style={styles.tabItem}
            >
              {options.tabBarIcon && options.tabBarIcon({ color: iconColor, focused: isFocused, size: 24 })}
              
              <Text style={[
                  styles.tabLabel, 
                  { color: iconColor },
                  isFocused && { fontWeight: 'bold' } 
              ]}>
                  {options.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </BlurView>
    </View>
  );
}

// 4. Swap <Tabs> for <SwipeTabs>
export default function TabLayout() {
  return (
    <SwipeTabs 
        // Force the "Top" tabs to the bottom of the screen
        tabBarPosition="bottom" 
        tabBar={(props) => <CustomTabBar {...props} />} 
        screenOptions={{ 
            // Swipe is enabled by default, but you can toggle this to false 
            // if you only want the click animation without screen swiping!
            swipeEnabled: true, 
        }}
    >
      <SwipeTabs.Screen 
        name="index" 
        options={{ 
          title: 'Home', 
          tabBarIcon: ({ color }: any) => <Ionicons name="home" size={24} color={color} /> 
        }} 
      />
      <SwipeTabs.Screen 
        name="history" 
        options={{ 
          title: 'History', 
          tabBarIcon: ({ color }: any) => <Ionicons name="time-outline" size={24} color={color} /> 
        }} 
      />
      <SwipeTabs.Screen 
        name="bills" 
        options={{ 
          title: 'Bills', 
          tabBarIcon: ({ color }: any) => <Ionicons name="document-text-outline" size={24} color={color} /> 
        }} 
      />
      <SwipeTabs.Screen 
        name="profile" 
        options={{ 
          title: 'Profile', 
          tabBarIcon: ({ color }: any) => <Ionicons name="person-outline" size={24} color={color} /> 
        }} 
      />
    </SwipeTabs>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  tabBarWrapper: { position: 'absolute', bottom: 0, left: 0, right: 0, elevation: 10, zIndex: 10 },
  blurContainer: { flexDirection: 'row', height: 70, alignItems: 'center', overflow: 'hidden', borderWidth: 0, borderTopWidth: 0 },
  blurContainerDark: { borderTopColor: 'rgba(255, 255, 255, 0.05)', backgroundColor: 'rgba(17, 24, 39, 0.6)' },
  slidingIndicator: { position: 'absolute', height: '100%', justifyContent: 'center', alignItems: 'center' },
  indicatorPill: { width: '65%', height: 45, backgroundColor: 'rgba(11, 47, 102, 0.1)', borderRadius: 22.5 },
  tabItem: { flex: 1, height: '100%', justifyContent: 'center', alignItems: 'center', zIndex: 2 },
  tabLabel: { fontSize: 10, marginTop: 4 }
});