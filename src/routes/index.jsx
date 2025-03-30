import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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

const AppRoutes = () => {
  return (
    <Routes>
      {/* Redirect root to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      {/* Auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected routes */}
      <Route path="/mindmap" element={<MindMap />} />
      <Route path="/mind-map-list" element={<MindMapList />} />
      <Route path="/map" element={<MindMap />} />
      <Route path="/template-list" element={<TemplateList />} />
        <Route path="/mind-map-share-list" element={<MindMapShareList />} />
        <Route path="/help" element={<Help />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/ai-payment" element={<AiPayment />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/subscription-detail" element={<SubscriptionDetail />} />
        <Route path="/subscription-history" element={<SubscriptionHistory />} />
        <Route path="/ai-subscription-detail" element={<SubscriptionAiDetail />} />


    </Routes>
  );
};

export default AppRoutes; 