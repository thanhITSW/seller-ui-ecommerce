/* eslint-disable */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { StoreStatus } from '@/types/Store';

interface UserState {
  isLoggedIn: boolean;
  details: any | null;
  storeId: string | null;
  storeStatus: StoreStatus | null;
}

const initialState: UserState = {
  isLoggedIn: false,
  details: null,
  storeId: null,
  storeStatus: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserDetails(state, action: PayloadAction<any>) {
      state.details = action.payload;
    },
    setLoginStatus(state, action: PayloadAction<boolean>) {
      state.isLoggedIn = action.payload;
    },
    setStoreInfo(state, action: PayloadAction<{ storeId: string, storeStatus: StoreStatus }>) {
      state.storeId = action.payload.storeId;
      state.storeStatus = action.payload.storeStatus;
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.details = null;
      state.storeId = null;
      state.storeStatus = null;
    },
  },
});

export const { setUserDetails, setLoginStatus, setStoreInfo, logout } = userSlice.actions;

export default userSlice.reducer;