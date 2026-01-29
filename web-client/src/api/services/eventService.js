import axiosInstance from '../axiosConfig';

export const eventService = {
  getAllEvents: async () => {
    const response = await axiosInstance.get('/events');
    return response.data;
  },

  createEvent: async (eventData) => {
    const response = await axiosInstance.post('/events', eventData);
    return response.data;
  },

  getEventById: async (id) => {
    const response = await axiosInstance.get(`/events/${id}`);
    return response.data;
  },

  getMyEvents: async () => {
    const response = await axiosInstance.get('/events/my-events');
    return response.data;
  },

  updateEvent: async (id, eventData) => {
    const response = await axiosInstance.put(`/events/${id}`, eventData);
    return response.data;
  },

  deleteEvent: async (id) => {
    const response = await axiosInstance.delete(`/events/${id}`);
    return response.data;
  },

  addProblemStatement: async (eventId, statementData) => {
    const response = await axiosInstance.post(`/events/${eventId}/problem-statements`, statementData);
    return response.data;
  }
};
