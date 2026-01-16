'use client';

import { ChevronRight } from 'lucide-react';

type Step = 'services' | 'time' | 'confirm';

interface BookingBreadcrumbProps {
  currentStep: Step;
}

const steps: { id: Step; label: string }[] = [
  { id: 'services', label: 'Services' },
  { id: 'time', label: 'Time' },
  { id: 'confirm', label: 'Confirm' },
];

export function BookingBreadcrumb({ currentStep }: BookingBreadcrumbProps) {
  const currentIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="flex items-center gap-2 text-sm">
      {steps.map((step, index) => {
        const isActive = step.id === currentStep;
        const isPast = index < currentIndex;

        return (
          <div key={step.id} className="flex items-center gap-2">
            <span
              className={
                isActive
                  ? 'font-medium text-gray-900'
                  : isPast
                  ? 'text-gray-600'
                  : 'text-gray-400'
              }
            >
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <ChevronRight className="h-4 w-4 text-gray-400" />
            )}
          </div>
        );
      })}
    </div>
  );
}
