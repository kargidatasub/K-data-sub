import React from 'react';
import { Stack } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store'; // Adjust the path if your store is located elsewhere

export default function VTULayout() {
  const isDark = useSelector((state: RootState) => state.theme.mode) === 'dark';

  return (
    <Stack
      screenOptions={{
        // We set this to false because we built our own beautiful custom top bar!
        headerShown: false, 
        
        // This gives it a premium, native feel when navigating to these pages
        animation: 'slide_from_right', 
        
        // Ensure the background color matches the theme before the screen even renders
        contentStyle: {
          backgroundColor: isDark ? '#111827' : '#F4F7FB',
        },
      }}
    >
      {/* 
        Register your screens here. 
        Even if you haven't created airtime, cable, or electricity yet, 
        adding them here prepares your app for when you do!
      */}
      <Stack.Screen name="buy-data" />
      <Stack.Screen name="airtime" />
      <Stack.Screen name="cable" />
      <Stack.Screen name="electricity" />
    </Stack>
  );
}