import React from 'react';
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authContext';

// Pages
import Login from '../pages/login';
import Register from '../pages/register';
import MindMap from '../pages/mindmap';
import MindMapList from '../pages/mindmapList';
import TemplateList from '../pages/templateList';
import MindMapShareList from "pages/mindMapShareList";
import Help from "pages/help";
import Profile from "pages/profile";
import AiPayment from "pages/payment/aiPayment";
import Payment from "pages/payment/subscriptionPayment";
import Contact from "pages/contact";
import ChangePassword from "pages/changePassword";
import SubscriptionDetail from "pages/SubscriptionDetail";
import SubscriptionHistory from "pages/SubscriptionHistory";
import SubscriptionAiDetail from "pages/subscriptionAiDetail";

// Define PrivateRoute directly here to avoid import/export issues
const PrivateRoute = ({ requiresPayment }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Private routes without payment requirement */}
      <Route element={<PrivateRoute requiresPayment={false} />}>
        <Route path="/help" element={<Help />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/subscription-detail" element={<SubscriptionDetail />} />
        <Route path="/subscription-history" element={<SubscriptionHistory />} />
        <Route path="/ai-subscription-detail" element={<SubscriptionAiDetail />} />
      </Route>
      
      {/* Private routes with payment requirement */}
      <Route element={<PrivateRoute requiresPayment={true} />}>
        <Route path="/mindmap" element={<MindMap />} />
        <Route path="/mind-map-list" element={<MindMapList />} />
        <Route path="/map" element={<MindMap />} />
        <Route path="/template-list" element={<TemplateList />} />
        <Route path="/mind-map-share-list" element={<MindMapShareList />} />
        <Route path="/ai-payment" element={<AiPayment />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes; 