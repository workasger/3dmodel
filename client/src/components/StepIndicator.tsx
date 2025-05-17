import { useTranslation } from "../lib/i18n";

interface StepIndicatorProps {
  currentStep: number;
}

const StepIndicator = ({ currentStep }: StepIndicatorProps) => {
  const { t } = useTranslation();
  
  // Step labels
  const steps = [
    t("steps.upload"),
    t("steps.preview"),
    t("steps.order"),
    t("steps.model")
  ];

  return (
    <div className="flex justify-center items-center mb-12 max-w-3xl mx-auto flex-wrap">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center">
          {/* Step indicator */}
          <div className="flex flex-col items-center z-10">
            <div 
              className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold shadow-lg ${
                index < currentStep 
                  ? "bg-green-500" // completed step
                  : index === currentStep 
                    ? "bg-primary" // current step
                    : "bg-gray-700" // future step
              }`}
            >
              {index + 1}
            </div>
            <span className="text-sm mt-2 text-center font-medium">{step}</span>
          </div>
          
          {/* Arrow connector (except after the last step) */}
          {index < steps.length - 1 && (
            <div className="relative flex items-center mx-1 md:mx-4">
              <div className={`h-[2px] w-8 md:w-12 ${
                index < currentStep ? "bg-accent" : "bg-accent/30"
              }`} />
              <div className={`absolute right-0 
                ${index < currentStep ? "text-accent" : "text-accent/30"}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default StepIndicator;
