import { configureStore } from '@reduxjs/toolkit';
import schemaReducer from './schemaSlice';
import authReducer from './authSlice';

export const store = configureStore({
  reducer: {
    schema: schemaReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
