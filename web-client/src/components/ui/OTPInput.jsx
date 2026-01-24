import React, { useRef } from 'react';

const OTPInput = ({ length = 6, value = [], onChange }) => {
    const inputRefs = useRef([]);

    const handleChange = (element, index) => {
        if (isNaN(element.value)) return false;

        const newOtp = [...value];
        newOtp[index] = element.value;
        onChange(newOtp);

        // Focus next input
        if (element.value !== '' && index < length - 1) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        // Focus previous input on Backspace
        if (e.key === 'Backspace' && value[index] === '' && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    return (
        <div className="flex justify-center gap-3">
            {Array.from({ length }).map((_, index) => (
                <input
                    key={index}
                    type="text"
                    maxLength="1"
                    ref={(el) => (inputRefs.current[index] = el)}
                    value={value[index] || ''}
                    onChange={(e) => handleChange(e.target, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onFocus={(e) => e.target.select()}
                    className="w-12 h-14 border border-gray-200 rounded-2xl text-center text-xl font-heading font-semibold text-gray-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all shadow-sm"
                />
            ))}
        </div>
    );
};

export default OTPInput;
