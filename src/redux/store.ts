import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import formReducer from './slices/formSlice';
import authReducer from './slices/authSlice';


const store = configureStore({
  reducer: {
    form: formReducer,
    auth: authReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

export { store };
