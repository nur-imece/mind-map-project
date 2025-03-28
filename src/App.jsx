import React from "react";
import { BrowserRouter } from "react-router-dom";
import { ConfigProvider } from 'antd';
import AppRoutes from "./routes";
import { LanguageProvider } from "./context/languageContext";
import './i18n/i18n';

const App = () => {
  return (
    <ConfigProvider>
      <LanguageProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </LanguageProvider>
    </ConfigProvider>
  );
};

export default App; 