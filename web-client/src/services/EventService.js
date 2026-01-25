const API_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:9092';

class EventService {
    async request(endpoint, options = {}) {
        const token = localStorage.getItem('accessToken');
        const headers = {
            'Authorization': `Bearer ${token}`,
            ...options.headers
        };

        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers
        });

        if (response.status === 401) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
            throw new Error('Session expired');
        }

        if (!response.ok) {
            throw new Error('API Request Failed');
        }

        if (response.status === 204) return null;

        return await response.json();
    }

    async getAllEvents() {
        return this.request('/events');
    }

    async getEventById(id) {
        return this.request(`/events/${id}`);
    }

    async createEvent(eventData) {
        return this.request('/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventData)
        });
    }

    async updateEvent(id, eventData) {
        return this.request(`/events/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventData)
        });
    }

    async deleteEvent(id) {
        return this.request(`/events/${id}`, {
            method: 'DELETE'
        });
    }
}

export default new EventService();
