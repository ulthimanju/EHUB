import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EventService from '../services/EventService';
import AuthService from '../services/AuthService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Calendar, MapPin, AlignLeft, Type, ArrowLeft, Loader2 } from 'lucide-react';
import Select from '../components/ui/Select';

const EventCreatePage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        eventName: '',
        description: '',
        startDate: '',
        endDate: '',
        eventType: 'Hackathon',
        location: '',
        organizerId: ''
    });

    useEffect(() => {
        const user = AuthService.getUser();
        if (user) {
            setFormData(prev => ({
                ...prev,
                organizerId: user.userId || user.id || 1
            }));
        }
    }, []);

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
            await EventService.createEvent(payload);
            navigate('/events');
        } catch (error) {
            console.error('Error creating event:', error);
            alert('Failed to create event. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const eventTypes = ['Hackathon'];

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/events')}
                    className="mb-8 !px-0 flex items-center gap-2"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Events
                </Button>

                <Card className="overflow-hidden !p-0">
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-6">
                        <h2 className="text-2xl font-bold text-white font-heading">
                            Create New Event
                        </h2>
                        <p className="text-orange-100 mt-2 font-body">
                            Fill in the details to organize your next big event.
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
                            placeholder="e.g. Annual Tech Conference 2024"
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
                            placeholder="Enter physical location or URL"
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
                                    placeholder="Describe your event..."
                                    value={formData.description}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end gap-4">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => navigate('/events')}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-2"
                            >
                                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                                {loading ? 'Creating...' : 'Create Event'}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default EventCreatePage;
