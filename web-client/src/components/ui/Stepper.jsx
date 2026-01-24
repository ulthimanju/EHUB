import React from 'react';
import { Check } from 'lucide-react';

const Stepper = ({ steps = [], currentStep, onStepChange }) => {
    return (
        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
            <div className="relative flex justify-between w-full max-w-3xl mx-auto">
                {/* Line background */}
                <div className="absolute left-0 top-5 transform -translate-y-1/2 w-full h-1 bg-gray-100 rounded-full"></div>
                {/* Active Line (dynamic width) */}
                <div
                    className="absolute left-0 top-5 transform -translate-y-1/2 h-1 bg-orange-500 rounded-full transition-all duration-300"
                    style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                ></div>

                {steps.map((label, index) => {
                    const stepNumber = index + 1;
                    return (
                        <div key={stepNumber} className="flex flex-col items-center gap-2 relative z-10">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-heading font-bold transition-all duration-300 border-2 ${stepNumber < currentStep
                                        ? 'bg-orange-500 border-orange-500 text-white'
                                        : stepNumber === currentStep
                                            ? 'bg-white border-orange-500 text-orange-500 shadow-[0_0_0_4px_rgba(249,115,22,0.1)]'
                                            : 'bg-white border-gray-200 text-gray-400'
                                    }`}
                            >
                                {stepNumber < currentStep ? <Check className="w-5 h-5" /> : stepNumber}
                            </div>
                            <div className={`text-xs font-body font-medium ${stepNumber <= currentStep ? 'text-gray-900' : 'text-gray-400'
                                }`}>
                                {label}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-between mt-8 max-w-3xl mx-auto border-t border-gray-100 pt-6">
                <button
                    onClick={() => onStepChange(Math.max(1, currentStep - 1))}
                    disabled={currentStep === 1}
                    className="px-6 py-2 text-sm font-medium rounded-xl border border-orange-500 text-orange-600 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400 disabled:hover:bg-transparent transition-all"
                >
                    Back
                </button>
                <button
                    onClick={() => onStepChange(Math.min(steps.length, currentStep + 1))}
                    disabled={currentStep === steps.length}
                    className="px-6 py-2 text-sm font-medium bg-orange-500 text-white hover:bg-orange-600 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm shadow-orange-500/20"
                >
                    Continue
                </button>
            </div>
        </div>
    );
};

export default Stepper;
