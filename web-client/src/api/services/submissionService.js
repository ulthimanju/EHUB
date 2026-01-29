import axiosInstance from '../axiosConfig';

export const submissionService = {
    submitProject: async (teamId, submissionContent) => {
        // submissionContent: { submissionUrl: "...", description: "..." }
        const response = await axiosInstance.post(`/teams/${teamId}/submission`, submissionContent);
        return response.data;
    },

    getSubmission: async (teamId) => {
        const response = await axiosInstance.get(`/teams/${teamId}/submission`);
        return response.data;
    },

    evaluateSubmission: async (submissionId) => {
        const response = await axiosInstance.post(`/submissions/${submissionId}/evaluate`);
        return response.data;
    }
};
