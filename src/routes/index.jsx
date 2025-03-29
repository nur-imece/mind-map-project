import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/login';
import Register from '../pages/register';
import MindMap from '../pages/mindmap';
import MindMapList from '../pages/mindmapList';
import TemplateList from '../pages/templateList';
import MindMapShareList from "pages/mindMapShareList";
import Help from "pages/help";

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

    </Routes>
  );
};

export default AppRoutes; 