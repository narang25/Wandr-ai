import React from 'react';
import { motion } from 'framer-motion';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center w-full max-w-md mx-auto mb-10">
      {Array.from({ length: totalSteps }).map((_, idx) => {
        const step = idx + 1;
        const isCompleted = step < currentStep;
        const isCurrent = step === currentStep;

        return (
          <React.Fragment key={step}>
            {/* Circle */}
            <div className="relative flex items-center justify-center">
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: isCompleted || isCurrent ? 'var(--color-primary)' : 'transparent',
                  borderColor: isCompleted || isCurrent ? 'var(--color-primary)' : 'var(--color-subtle)',
                }}
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors duration-300 z-10 ${
                  isCompleted || isCurrent ? 'text-void' : 'text-muted'
                }`}
              >
                <span className="text-sm font-semibold">{step}</span>
              </motion.div>
              
              {/* Ping effect for current step */}
              {isCurrent && (
                <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20" />
              )}
            </div>

            {/* Connector Line */}
            {step < totalSteps && (
              <div className="flex-1 h-[2px] bg-subtle mx-2 relative overflow-hidden rounded-full">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-primary"
                  initial={{ width: '0%' }}
                  animate={{ width: isCompleted ? '100%' : '0%' }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
