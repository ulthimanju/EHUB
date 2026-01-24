import React, { createContext, useContext, useState, useCallback } from 'react';

const LoadingContext = createContext();

export const useLoading = () => {
    const context = useContext(LoadingContext);
    if (!context) {
        throw new Error('useLoading must be used within a LoadingProvider');
    }
    return context;
};

export const LoadingProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    const showLoading = useCallback((message = 'Loading...') => {
        setLoadingMessage(message);
        setIsLoading(true);
    }, []);

    const hideLoading = useCallback(() => {
        setIsLoading(false);
        setLoadingMessage('');
    }, []);

    const withLoading = useCallback(async (asyncFn, message = 'Loading...') => {
        showLoading(message);
        try {
            return await asyncFn();
        } finally {
            hideLoading();
        }
    }, [showLoading, hideLoading]);

    return (
        <LoadingContext.Provider value={{ isLoading, loadingMessage, showLoading, hideLoading, withLoading }}>
            {children}
        </LoadingContext.Provider>
    );
};

export default LoadingContext;
