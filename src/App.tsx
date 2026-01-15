import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { setUser, setLoading, clearAuth } from './store/authSlice';
import { LoginPage, RegisterPage } from './pages';
import { ProtectedRoute, Toaster } from './components';
import { MainApp } from './MainApp';
import apiService from './services/api';

function App() {
  const dispatch = useAppDispatch();
  const { token, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const { user } = await apiService.getProfile();
          dispatch(setUser(user));
        } catch (error) {
          dispatch(clearAuth());
        } finally {
          dispatch(setLoading(false));
        }
      } else {
        dispatch(setLoading(false));
      }
    };

    checkAuth();
  }, [dispatch, token]);

  return (
    <>
      <Toaster />
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />
          }
        />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <MainApp />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
