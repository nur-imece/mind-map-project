import React, { createContext, useState, ReactNode } from 'react';
import PropTypes from 'prop-types';

interface ToggleContextType {
  isToggle: boolean;
  setIsToggle: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ToggleContext = createContext<ToggleContextType>({
  isToggle: false,
  setIsToggle: () => null,
});

interface ToggleProviderProps {
  children: ReactNode;
}

export const ToggleProvider = ({ children }: ToggleProviderProps) => {
  const [isToggle, setIsToggle] = useState(false);
  const value = { isToggle, setIsToggle };
  return <ToggleContext.Provider value={value}>{children}</ToggleContext.Provider>;
};

ToggleProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
