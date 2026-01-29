import { useState, useEffect } from 'react';
import { eventService } from '../api/services/eventService';
import EventCard from '../components/EventCard';
import { Search } from 'lucide-react';
import '../index.css';

export default function EventsPage() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            const data = await eventService.getAllEvents();
            // Assuming ApiResponse wrapper logic is handled or we check here
            setEvents(data.data || data);
        } catch (err) {
            console.error("Failed to load events", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredEvents = events.filter(e =>
        e.eventName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Explore Events</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Find your next challenge</p>
                </div>

                <div className="input-wrapper" style={{ width: '300px' }}>
                    <Search className="input-icon" size={18} />
                    <input
                        placeholder="Search events..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div>Loading events...</div>
            ) : filteredEvents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                    No events found.
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                    {filteredEvents.map(event => (
                        <EventCard key={event.eventId} event={event} />
                    ))}
                </div>
            )}
        </div>
    );
}
