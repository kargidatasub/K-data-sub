// store/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  pin: string | null;
  isAppLocked: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  pin: null,
  isAppLocked: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<any>) => {
      state.isAuthenticated = true;
      state.user = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.pin = null;
      state.isAppLocked = false;
    },
    setPin: (state, action: PayloadAction<string>) => {
      state.pin = action.payload;
    },
    lockApp: (state) => {
      if (state.isAuthenticated && state.pin) {
        state.isAppLocked = true;
      }
    },
    unlockApp: (state) => {
      state.isAppLocked = false;
    },
  },
});

export const { loginSuccess, logout, setPin, lockApp, unlockApp } = authSlice.actions;
export default authSlice.reducer;