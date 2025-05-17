import React, { createContext, useContext, useState } from "react";

interface StepContextType {
  step: number;
  setStep: (step: number) => void;
}

// Create context with default values
const defaultContext: StepContextType = {
  step: 0,
  setStep: () => {},
};

const StepContext = createContext<StepContextType>(defaultContext);

export const StepProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [step, setStep] = useState(0); // 0-based index for the 4 steps

  return (
    <StepContext.Provider value={{ step, setStep }}>
      {children}
    </StepContext.Provider>
  );
};

export const useStep = (): StepContextType => {
  const context = useContext(StepContext);
  return context;
};
