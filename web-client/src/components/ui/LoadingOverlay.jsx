import React from 'react';
import { Loader2 } from 'lucide-react';
import { useLoading } from '../../contexts/LoadingContext';

const LoadingOverlay = () => {
    const { isLoading, loadingMessage } = useLoading();

    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4 min-w-[200px]">
                <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
                <p className="text-gray-700 font-medium text-lg">{loadingMessage}</p>
            </div>
        </div>
    );
};

export default LoadingOverlay;
