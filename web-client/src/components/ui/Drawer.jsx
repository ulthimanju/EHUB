import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

const Drawer = ({ isOpen, onClose, title, children, position = 'right' }) => {
    const drawerRef = useRef(null);

    // Disable body scroll when drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            if (drawerRef.current) {
                drawerRef.current.focus();
            }
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Handle Escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const positionClasses = {
        left: 'left-0 top-0 bottom-0 border-r',
        right: 'right-0 top-0 bottom-0 border-l',
        top: 'top-0 left-0 right-0 border-b',
        bottom: 'bottom-0 left-0 right-0 border-t'
    };

    const slideClasses = {
        left: 'animate-slide-in-left', // You might need to define these keyframes or use transition classes
        right: 'animate-slide-in-right',
        top: 'animate-slide-in-top',
        bottom: 'animate-slide-in-bottom'
    };

    // Using simple transition transform classes for standard tailwind without custom keyframes if possible,
    // but mounting/unmounting makes transitions tricky without a library like Headless UI.
    // simpler approach: render it and assume it just appears, or use simple fixed positioning.
    // For a simple generic drawer without external animation libraries:

    // We will use standard fixed positioning.

    return createPortal(
        <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Drawer Panel */}
            <div
                ref={drawerRef}
                className={`absolute bg-white shadow-xl flex flex-col ${positionClasses[position]} ${position === 'left' || position === 'right' ? 'w-full max-w-md h-full' : 'w-full h-auto max-h-[80vh]'
                    }`}
                tabIndex="-1"
                role="dialog"
                aria-modal="true"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h3 className="text-lg font-heading font-bold text-gray-900">
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default Drawer;
