import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import Register from '@/pages/authentication/Register';
import Login from '@/pages/authentication/Login';
import Home from '@/pages/home/Home';
import { AuthProvider } from '@/context/AuthContext';
import { MessageProvider } from '@/context/MessageContext';
import Navbar from '@/components/navigation/Navbar';
import MessageDisplay from '@/components/messaging/MessageDisplay';
import Dashboard from '@/pages/dashboard/Dashboard';


function App() {
  return (
    <MessageProvider>
      <AuthProvider>
        <Router>
          <Navbar />
          <MessageDisplay />
          <Routes>
            <Route path="/" element={<Navigate to="/home" />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />

          </Routes>
        </Router>
      </AuthProvider>
    </MessageProvider>
  );
}

export default App;
