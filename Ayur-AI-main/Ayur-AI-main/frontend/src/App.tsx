import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatBot from './components/ChatBot';
import Home from './pages/Home';
import HerbExplorer from './pages/HerbExplorer';
import KnowledgeGraph from './pages/KnowledgeGraph';
import HypothesisGenerator from './pages/HypothesisGenerator';
import About from './pages/About';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';

// Protected route component
const ProtectedRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? element : <Navigate to="/login" />;
};

function AppContent() {
  const { login } = useAuth();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-ayurvedic-50 via-white to-gold-50">
      <Navbar />
      <main className="min-h-screen">
        <Routes>
          <Route path="/login" element={<Login onLogin={login} />} />
          <Route path="/" element={<ProtectedRoute element={<Home />} />} />
          <Route path="/herbs" element={<ProtectedRoute element={<HerbExplorer />} />} />
          <Route path="/graph" element={<ProtectedRoute element={<KnowledgeGraph />} />} />
          <Route path="/hypotheses" element={<ProtectedRoute element={<HypothesisGenerator />} />} />
          <Route path="/about" element={<ProtectedRoute element={<About />} />} />
        </Routes>
      </main>
      <Footer />
      <ChatBot />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'linear-gradient(135deg, #059669, #047857)',
            color: '#fff',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
            },
          }}
        />
      </div>
    );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
