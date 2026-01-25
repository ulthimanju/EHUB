import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import EventService from '../services/EventService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Calendar, MapPin, AlignLeft, Type, ArrowLeft, Loader2 } from 'lucide-react';
import Select from '../components/ui/Select';

const EventEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [formData, setFormData] = useState({
        eventName: '',
        description: '',
        startDate: '',
        endDate: '',
        eventType: 'Conference',
        location: '',
        organizerId: 1
    });

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const data = await EventService.getEventById(id);
                const formatForInput = (dateStr) => {
                    if (!dateStr) return '';
                    return new Date(dateStr).toISOString().slice(0, 16);
                };

                // Convert uppercase backend event type to Title Case for UI
                const titleCaseType = data.eventType
                    ? data.eventType.charAt(0) + data.eventType.slice(1).toLowerCase()
                    : 'Conference';

                setFormData({
                    eventName: data.eventName,
                    description: data.description,
                    startDate: formatForInput(data.startDate),
                    endDate: formatForInput(data.endDate),
                    eventType: titleCaseType,
                    location: data.location,
                    organizerId: data.organizerId
                });
            } catch (error) {
                console.error('Error fetching event:', error);
                alert('Failed to load event data.');
                navigate('/events');
            } finally {
                setInitialLoading(false);
            }
        };

        fetchEvent();
    }, [id, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...formData,
                eventType: formData.eventType.toUpperCase(),
                startDate: new Date(formData.startDate).toISOString(),
                endDate: new Date(formData.endDate).toISOString()
            };
            await EventService.updateEvent(id, payload);
            navigate(`/events/${id}`);
        } catch (error) {
            console.error('Error updating event:', error);
            alert('Failed to update event. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const eventTypes = ['Conference', 'Workshop', 'Concert', 'Sports', 'Hackathon'];

    if (initialLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <Button
                    variant="ghost"
                    onClick={() => navigate(`/events/${id}`)}
                    className="mb-8 !px-0 flex items-center gap-2"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Details
                </Button>

                <Card className="overflow-hidden !p-0">
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-6">
                        <h2 className="text-2xl font-bold text-white font-heading">
                            Edit Event
                        </h2>
                        <p className="text-orange-100 mt-2 font-body">
                            Update the details of your event.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {/* Event Name */}
                        <Input
                            label="Event Name"
                            name="eventName"
                            type="text"
                            required
                            icon={Type}
                            value={formData.eventName}
                            onChange={handleChange}
                        />

                        {/* Event Type */}
                        <div>
                            <Select
                                label="Event Type"
                                options={eventTypes}
                                value={formData.eventType}
                                onChange={(value) => setFormData(prev => ({ ...prev, eventType: value }))}
                            />
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Start Date & Time"
                                name="startDate"
                                type="datetime-local"
                                required
                                icon={Calendar}
                                value={formData.startDate}
                                onChange={handleChange}
                            />
                            <Input
                                label="End Date & Time"
                                name="endDate"
                                type="datetime-local"
                                required
                                icon={Calendar}
                                value={formData.endDate}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Location */}
                        <Input
                            label="Location"
                            name="location"
                            type="text"
                            required
                            icon={MapPin}
                            value={formData.location}
                            onChange={handleChange}
                        />

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-body font-medium mb-2 text-gray-500">Description</label>
                            <div className="relative">
                                <AlignLeft className="absolute left-4 top-4 w-5 h-5 text-orange-500" />
                                <textarea
                                    name="description"
                                    rows="4"
                                    required
                                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl font-body focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all text-gray-900 placeholder-gray-400 shadow-sm resize-none"
                                    value={formData.description}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end gap-4">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => navigate(`/events/${id}`)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-2"
                            >
                                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                                {loading ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default EventEditPage;
