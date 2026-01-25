import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EventService from '../services/EventService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import EventCard from '../components/ui/EventCard';
import { Plus, Search, Filter } from 'lucide-react';
import Select from '../components/ui/Select';

const EventsPage = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All Types');

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const data = await EventService.getAllEvents();
                setEvents(data);
            } catch (error) {
                console.error('Error fetching events:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    const normalizeEventType = (type) => {
        if (type === 'All Types') return 'ALL';
        return type.toUpperCase();
    };

    const filteredEvents = events.filter(event => {
        const matchesSearch = event.eventName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterType === 'All Types' || event.eventType === normalizeEventType(filterType);
        return matchesSearch && matchesFilter;
    });

    const eventTypes = ['All Types', 'Hackathon'];

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-4xl font-heading font-bold text-gray-900 mb-2">
                            Explore Events
                        </h1>
                        <p className="text-gray-500 font-body">
                            Discover and join amazing events happening around you.
                        </p>
                    </div>
                </div>

                {/* Search and Filter */}
                <Card className="mb-8 !p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <Input
                                type="text"
                                placeholder="Search events..."
                                icon={Search}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="min-w-[200px]">
                            <Select
                                icon={Filter}
                                options={eventTypes}
                                value={filterType}
                                onChange={setFilterType}
                            />
                        </div>
                    </div>
                </Card>

                {/* Events Grid */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredEvents.map((event) => (
                            <EventCard
                                key={event.eventId}
                                event={event}
                                onClick={() => navigate(`/events/${event.eventId}`)}
                            />
                        ))}
                    </div>
                )}

                {!loading && filteredEvents.length === 0 && (
                    <Card className="text-center py-16">
                        <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                            <Search className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 mb-2 font-heading">No events found</h3>
                        <p className="text-gray-500 font-body">
                            Try adjusting your search or filter to find what you're looking for.
                        </p>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default EventsPage;
