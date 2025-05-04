import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Pages
import Home from './pages/Home';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import LayoutsPage from './pages/LayoutsPage';
import LayoutDetailPage from './pages/LayoutDetailPage';
import AdminHomePage from './pages/admin/AdminHomePage';
import CustomFieldsPage from './pages/admin/CustomFieldsPage';

// Protected route component
const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) => {
  const { user, loading, initialized } = useAuthStore();
  
  if (!initialized || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-700"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (!user.approved) {
    return <Navigate to="/" />;
  }
  
  if (adminOnly && !user.isAdmin) {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
};

const App: React.FC = () => {
  const { checkUser, initialized } = useAuthStore();
  
  useEffect(() => {
    if (!initialized) {
      checkUser();
    }
  }, [checkUser, initialized]);
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        
        <Route path="/layouts" element={
          <ProtectedRoute>
            <LayoutsPage />
          </ProtectedRoute>
        } />
        
        <Route path="/layouts/:id" element={
          <ProtectedRoute>
            <LayoutDetailPage />
          </ProtectedRoute>
        } />
        
        <Route path="/admin" element={
          <ProtectedRoute adminOnly>
            <AdminHomePage />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/fields" element={
          <ProtectedRoute adminOnly>
            <CustomFieldsPage />
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;