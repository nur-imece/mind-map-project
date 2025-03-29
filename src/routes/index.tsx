import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/login';
import Register from '../pages/register';
import MindMap from '../pages/mindmap';
import MindMapList from '../pages/mindmapList';
import TemplateList from "@/pages/templateList";
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      {/* Auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

        <Route path="/mind-map-list" element={<MindMapList/>} />
        <Route path="/template-list" element={<TemplateList/>} />


        {/* Protected routes */}
      <Route path="/mindmap" element={<MindMap />} />
    </Routes>
  );
};

export default AppRoutes; 