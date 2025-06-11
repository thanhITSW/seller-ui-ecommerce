/* eslint-disable */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  isLoggedIn: boolean;
  details: any | null;
}

const initialState: UserState = {
  isLoggedIn: false,
  details: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserDetails(state, action: PayloadAction<any>) {
      state.details = action.payload;
    },
    setLoginStatus(state, action: PayloadAction<boolean>) {
      state.isLoggedIn = true
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.details = null;
    },
  },
});

export const { setUserDetails, setLoginStatus } = userSlice.actions;

export default userSlice.reducer;