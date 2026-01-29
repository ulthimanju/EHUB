import axiosInstance from '../axiosConfig';

export const teamService = {
    createTeam: async (hackathonId, teamName) => {
        const response = await axiosInstance.post(`/hackathons/${hackathonId}/teams`, { teamName });
        return response.data;
    },

    inviteUser: async (teamId, email) => {
        const response = await axiosInstance.post(`/teams/${teamId}/invite`, { email });
        return response.data;
    },

    joinTeam: async (teamCode) => {
        const response = await axiosInstance.post('/teams/join', { teamCode });
        return response.data;
    },

    approveRequest: async (memberId) => {
        const response = await axiosInstance.put(`/teams/members/${memberId}/approve`);
        return response.data;
    },

    rejectRequest: async (memberId) => {
        const response = await axiosInstance.put(`/teams/members/${memberId}/reject`);
        return response.data;
    },

    getTeamMembers: async (teamId) => {
        const response = await axiosInstance.get(`/teams/${teamId}/members`);
        return response.data;
    },

    getMyTeams: async () => {
        const response = await axiosInstance.get('/teams/me');
        return response.data;
    }
};
