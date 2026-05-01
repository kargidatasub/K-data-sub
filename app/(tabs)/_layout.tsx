import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Animated, Text } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

// 1. Create the Custom Tab Bar Component
function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const isDark = useSelector((state: RootState) => state.theme.mode) === 'dark';
  
  // Calculate widths for the sliding animation - NOW FULL WIDTH
  const { width } = Dimensions.get('window');
  const TAB_BAR_WIDTH = width; // Removed the horizontal padding deduction
  const TAB_WIDTH = TAB_BAR_WIDTH / state.routes.length;

  // Animation value
  const slideAnim = useRef(new Animated.Value(0)).current;

  // 2. Animate the indicator whenever the active tab (state.index) changes
  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: state.index * TAB_WIDTH,
      useNativeDriver: true,
      bounciness: 4, 
      speed: 14,
    }).start();
  }, [state.index]);

  return (
    // Removed paddingHorizontal from the wrapper so it touches the edges
    <View style={[styles.tabBarWrapper, { paddingBottom: insets.bottom > 0 ? insets.bottom : 0 }]}>
      {/* 3. The Glass Background */}
      <BlurView 
        intensity={isDark ? 40 : 80} 
        tint={isDark ? "dark" : "light"} 
        experimentalBlurMethod="dimezisBlurView" 
        style={[styles.blurContainer, isDark && styles.blurContainerDark]}
      >
        
        {/* 4. The Sliding Indicator */}
        <Animated.View 
            style={[
                styles.slidingIndicator, 
                { width: TAB_WIDTH, transform: [{ translateX: slideAnim }] }
            ]} 
        >
            {/* The inner pill that creates the background color for the active icon */}
            <View style={styles.indicatorPill} />
        </Animated.View>

        {/* 5. Map through the routes to create the clickable tabs */}
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

// 6. Pass our CustomTabBar into Expo Router's <Tabs>
export default function TabLayout() {
  return (
    <Tabs 
        tabBar={(props) => <CustomTabBar {...props} />} 
        screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Home', 
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} /> 
        }} 
      />
      <Tabs.Screen 
        name="history" 
        options={{ 
          title: 'History', 
          tabBarIcon: ({ color }) => <Ionicons name="time-outline" size={24} color={color} /> 
        }} 
      />
      <Tabs.Screen 
        name="bills" 
        options={{ 
          title: 'Bills', 
          tabBarIcon: ({ color }) => <Ionicons name="document-text-outline" size={24} color={color} /> 
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: 'Profile', 
          tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={24} color={color} /> 
        }} 
      />
    </Tabs>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  tabBarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    // paddingHorizontal: 20, <--- REMOVED
    elevation: 10,
    zIndex: 10,
  },
  blurContainer: {
    flexDirection: 'row',
    height: 70,
    
    alignItems: 'center',
    overflow: 'hidden', 
    borderWidth: 0,
    
    
    // Optional: Add a very subtle top border so it separates from the app content
    borderTopWidth: 0,
    
  },
  blurContainerDark: {
    // borderColor: 'rgba(255, 255, 255, 0.1)', <--- REMOVED
    borderTopColor: 'rgba(255, 255, 255, 0.05)', // Subtle top border for dark mode
    backgroundColor: 'rgba(17, 24, 39, 0.6)', 
  },
  slidingIndicator: {
    position: 'absolute',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicatorPill: {
    width: '65%', 
    height: 45,
    backgroundColor: 'rgba(11, 47, 102, 0.1)', 
    borderRadius: 22.5,
  },
  tabItem: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2, 
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 4,
  }
});