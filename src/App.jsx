import React from "react";
import { BrowserRouter } from "react-router-dom";
import { ConfigProvider } from 'antd';
import AppRoutes from "./routes";
import { LanguageProvider } from "./context/languageContext";
import { AuthProvider } from "./context/authContext";
import './i18n/i18n';
import './index.css'

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ConfigProvider>
          <LanguageProvider>
            <AppRoutes />
          </LanguageProvider>
        </ConfigProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App; 