import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EventService from '../services/EventService';
import EventCard from '../components/ui/EventCard';
import Button from '../components/ui/Button';
import { Plus, Calendar, Loader2 } from 'lucide-react';

const MyEventsPage = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyEvents();
    }, []);

    const fetchMyEvents = async () => {
        try {
            const data = await EventService.getMyEvents();
            setEvents(data);
        } catch (error) {
            console.error('Error fetching my events:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 font-heading">My Events</h1>
                        <p className="text-gray-500 mt-2 font-body">Manage the events you have organized.</p>
                    </div>
                    <Button onClick={() => navigate('/events/new')} className="flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        Create Event
                    </Button>
                </div>

                {events.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
                        <div className="bg-orange-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar className="w-8 h-8 text-orange-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 font-heading">No events yet</h3>
                        <p className="text-gray-500 mb-6 font-body">You haven't created any events yet. Start by creating your first one!</p>
                        <Button onClick={() => navigate('/events/new')}>
                            Create Your First Event
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {events.map((event) => (
                            <EventCard
                                key={event.eventId}
                                event={event}
                                onClick={() => navigate(`/events/${event.eventId}`)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyEventsPage;
