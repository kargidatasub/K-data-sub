import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the shape of our state
interface WalletState {
  balance: number;
}

const initialState: WalletState = {
  balance: 124510.00, // Starting balance from your design
};

export const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    // Action to add money
    topUp: (state, action: PayloadAction<number>) => {
      state.balance += action.payload;
    },
    // Action to spend money (buy data)
    deductBalance: (state, action: PayloadAction<number>) => {
      if (state.balance >= action.payload) {
        state.balance -= action.payload;
      }
    },
  },
});

// Export the actions so we can use them in our buttons
export const { topUp, deductBalance } = walletSlice.actions;

export default walletSlice.reducer;