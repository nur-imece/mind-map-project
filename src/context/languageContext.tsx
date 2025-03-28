import React, { createContext, useState, ReactNode, useContext } from "react";
import PropTypes from "prop-types";

interface LanguageContextType {
  selectedLanguage: string;
  setSelectedLanguage: React.Dispatch<React.SetStateAction<string>>;
}

export const LanguageContext = createContext<LanguageContextType>({
  selectedLanguage: "en",
  setSelectedLanguage: () => null,
});

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const value = { selectedLanguage, setSelectedLanguage };
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

LanguageProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
