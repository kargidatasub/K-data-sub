import React from 'react';
import { Stack } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store'; 

export default function TransactionLayout() {
  const isDark = useSelector((state: RootState) => state.theme.mode) === 'dark';

  return (
    <Stack
      screenOptions={{
        headerShown: false, 
        // Smooth horizontal slide when opening a transaction receipt
        animation: 'slide_from_right', 
        contentStyle: {
          backgroundColor: isDark ? '#111827' : '#F4F7FB',
        },
      }}
    >
      {/* The [id] route handles dynamic transaction IDs */}
      <Stack.Screen name="[id]" />
    </Stack>
  );
}