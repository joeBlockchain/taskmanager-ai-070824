import React from "react";
import { Check } from "lucide-react";

const TimelineStepper = ({
  steps,
  currentStep,
  onStepClick,
}: {
  steps: string[];
  currentStep: number;
  onStepClick: (stepIndex: number) => void;
}) => {
  return (
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto">
      <div className="flex justify-between w-full mb-2 relative">
        <div className="absolute top-1/2 left-0 right-0 h-px bg-border -translate-y-1/2" />
        <div
          className="absolute top-1/2 left-0 h-px bg-foreground -translate-y-1/2 transition-all duration-300 ease-in-out"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        />
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <div
              key={index}
              className="flex flex-col items-center relative z-10"
            >
              <button
                onClick={() => onStepClick(index)}
                className={`w-10 h-10 rounded-full flex items-center justify-center 
                  ${
                    isCompleted
                      ? "bg-foreground text-background"
                      : isCurrent
                      ? "bg-background border-2 border-foreground text-foreground"
                      : "bg-background text-gray-400 border border-gray-300"
                  } transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50`}
              >
                {isCompleted ? (
                  <Check className="w-6 h-6" />
                ) : (
                  <span className={isCurrent ? "font-bold" : ""}>
                    {index + 1}
                  </span>
                )}
              </button>
              <span
                className={`mt-2 text-sm text-center ${
                  isCompleted || isCurrent ? "text-foreground" : "text-gray-400"
                }`}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TimelineStepper;
