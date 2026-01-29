import axiosInstance from '../axiosConfig';

export const userService = {
    getCurrentUser: async () => {
        // Assuming there's an endpoint to get current user details, 
        // often implied by the token or a specific /me endpoint if available.
        // For now, we'll try to fetch a specific user if we have an ID, 
        // or just list users if that's the available endpoint.
        // Based on Gateway config, it routes /users/** to user-service.
        return axiosInstance.get('/users/me').catch(err => {
            console.warn("Simple /me endpoint might not exist, checking specific user flow or ignoring.");
            throw err;
        });
    },

    registerUser: async (userData) => {
        // Updated to match RegistrationController
        const response = await axiosInstance.post('/users/auth/register', userData);
        return response.data;
    },

    verifyRegistration: async (email, otp) => {
        const response = await axiosInstance.post('/users/auth/verify-registration', { email, otp });
        return response.data;
    },

    resendOtp: async (email) => {
        const response = await axiosInstance.post('/users/auth/resend-otp', { email });
        return response.data;
    },

    updateUser: async (id, updates) => {
        const response = await axiosInstance.patch(`/users/${id}`, updates);
        return response.data;
    },

    getUserById: async (id) => {
        const response = await axiosInstance.get(`/users/${id}`);
        return response.data;
    },

    forgotPassword: async (email) => {
        const response = await axiosInstance.post('/auth/forgot-password', { email });
        return response.data;
    },

    verifyOtp: async (email, otp) => {
        const response = await axiosInstance.post('/auth/verify-otp', { email, otp });
        return response.data;
    },

    resetPassword: async (email, password) => {
        const response = await axiosInstance.patch('/auth/reset-password', { email, password });
        return response.data;
    },

    getAllUsers: async () => {
        const response = await axiosInstance.get('/users');
        return response.data;
    },

    searchUsers: async (query) => {
        // query: { email: '...', username: '...' }
        const params = new URLSearchParams(query).toString();
        const response = await axiosInstance.get(`/users/search?${params}`);
        return response.data;
    },

    sendOtpForRole: async () => {
        const response = await axiosInstance.post('/users/send-otp');
        return response.data;
    },

    promoteToOrganizer: async (userId, otp) => {
        const response = await axiosInstance.post(`/users/${userId}/roles/organizer`, { otp });
        return response.data;
    }
};
