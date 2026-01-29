import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventService } from '../api/services/eventService';
import EventCard from '../components/EventCard';
import { Plus } from 'lucide-react';
import '../index.css';

export default function MyEventsPage() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadMyEvents();
    }, []);

    const loadMyEvents = async () => {
        try {
            const data = await eventService.getMyEvents();
            setEvents(data.data || data);
        } catch (err) {
            console.error("Failed to load my events", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (eventId) => {
        if (!window.confirm("Are you sure you want to delete this event?")) return;
        try {
            await eventService.deleteEvent(eventId);
            setEvents(events.filter(e => e.eventId !== eventId));
        } catch (err) {
            alert("Failed to delete event");
        }
    };

    const handleEdit = (event) => {
        // Navigate to edit page
        navigate(`/events/edit/${event.eventId}`);
    };

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>My Events</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Manage events you have organized</p>
                </div>

                <button className="btn-primary" onClick={() => navigate('/events/create')}>
                    <Plus size={18} /> Create Event
                </button>
            </div>

            {loading ? (
                <div>Loading your events...</div>
            ) : events.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--bg-card)', borderRadius: '16px' }}>
                    <h3 style={{ marginBottom: '1rem' }}>No events created yet</h3>
                    <button className="btn-primary" onClick={() => alert("Create Event Modal")}>Create your first event</button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                    {events.map(event => (
                        <EventCard
                            key={event.eventId}
                            event={event}
                            showActions={true}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
