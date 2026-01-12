import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './lib/auth.jsx';
import ProtectedRoute from './routes/ProtectedRoute';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import ProtectedLayout from './layouts/ProtectedLayout';
import Promocion from './pages/Promocion';
import VIP from './pages/VIP';
import Invitar from './pages/Invitar';
import Perfil from './pages/Perfil';
import Admin from './pages/Admin';
import Wallet from './pages/Wallet';
import Withdraw from './pages/Withdraw';
import Tutorial from './pages/Tutorial';
import NotFound from './pages/NotFound';
import AdminRoute from './routes/AdminRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<Admin />} />
            </Route>
            <Route element={<ProtectedLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/promocion" element={<Promocion />} />
              <Route path="/vip" element={<VIP />} />
              <Route path="/invitar" element={<Invitar />} />
              <Route path="/perfil" element={<Perfil />} />
            </Route>
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/retirar" element={<Withdraw />} />
            <Route path="/tutorial" element={<Tutorial />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
