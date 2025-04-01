import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import Register from '@/pages/authentication/Register';
import Login from '@/pages/authentication/Login';
import Logout from "@/pages/authentication/Logout";
import DamageRepairReports from '@/pages/DamageRepairReports';
import Home from '@/pages/Home';
import { AuthProvider } from '@/context/AuthContext';
import { MessageProvider } from '@/context/MessageContext';
import Navbar from '@/components/navigation/Navbar';
import MessageDisplay from '@/components/messaging/MessageDisplay';
import Dashboard from '@/pages/Dashboard';
import OwnersDashboard from '@/pages/OwnersDashboard';
import CashFlows from '@/pages/CashFlows';
import EditProperty from './components/owner/EditProperty';
import OwnedProperties from './components/owner/OwnedProperties';


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
            <Route path="/logout" element={<Logout />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/cash-flows" element={<CashFlows />} />
            <Route path="/owners-dashboard" element={<OwnersDashboard />} />
            <Route path="/owned-properties" element={<OwnedProperties />} />
            <Route path="/edit-property/:id" element={<EditProperty />} />
            <Route path="/damage-repair-reports" element={<DamageRepairReports />} />



          </Routes>
        </Router>
      </AuthProvider>
    </MessageProvider>
  );
}

export default App;
