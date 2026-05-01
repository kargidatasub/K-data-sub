import { configureStore } from '@reduxjs/toolkit';
import walletReducer from './walletSlice';
import themeReducer from './themeSlice'; // <-- Import theme slice

export const store = configureStore({
  reducer: {
    wallet: walletReducer,
    theme: themeReducer, // <-- Add to the store
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;