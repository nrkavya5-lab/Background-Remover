import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/common/Toast';
import AuthGuard from './components/AuthGuard';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Editor from './pages/Editor';
import Batch from './pages/Batch';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Admin from './pages/Admin';
import Passport from './pages/Passport';
import Product from './pages/Product';
import Thumbnail from './pages/Thumbnail';

function AdminGuard({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user || user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/editor" element={<Layout><Editor /></Layout>} />
            <Route path="/batch" element={<Layout><AuthGuard><Batch /></AuthGuard></Layout>} />
            <Route path="/dashboard" element={<Layout><AuthGuard><Dashboard /></AuthGuard></Layout>} />
            <Route path="/history" element={<Layout><AuthGuard><History /></AuthGuard></Layout>} />
            <Route path="/admin" element={<Layout><AuthGuard><AdminGuard><Admin /></AdminGuard></AuthGuard></Layout>} />
            <Route path="/passport" element={<Layout><Passport /></Layout>} />
            <Route path="/product" element={<Layout><Product /></Layout>} />
            <Route path="/thumbnail" element={<Layout><Thumbnail /></Layout>} />
            <Route path="/login" element={<Layout><Login /></Layout>} />
            <Route path="/register" element={<Layout><Register /></Layout>} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
