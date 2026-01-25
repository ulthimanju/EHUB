import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EventService from '../services/EventService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Calendar, MapPin, ArrowLeft, Trash2, Edit, User, Share2, Loader2 } from 'lucide-react';

const EventDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const data = await EventService.getEventById(id);
                setEvent(data);
            } catch (error) {
                console.error('Error fetching event details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvent();
    }, [id]);

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) return;

        setDeleting(true);
        try {
            await EventService.deleteEvent(id);
            navigate('/events');
        } catch (error) {
            console.error('Error deleting event:', error);
            alert('Failed to delete event.');
            setDeleting(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'TBD';
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 font-heading">Event not found</h2>
                <Button variant="ghost" onClick={() => navigate('/events')} className="flex items-center gap-2">
                    <ArrowLeft className="w-5 h-5" />
                    Back to Events
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Hero Banner */}
            <div className="h-80 relative bg-gradient-to-r from-orange-500 to-orange-600 overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-white opacity-5 mix-blend-overlay"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-orange-300 opacity-10 mix-blend-overlay"></div>

                <div className="absolute top-8 left-4 md:left-8">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/events')}
                        className="!text-white/90 hover:!text-white !bg-black/20 backdrop-blur-sm"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Events
                    </Button>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white">
                    <div className="max-w-7xl mx-auto">
                        <Badge className="!bg-white/20 !text-white !border-white/30 mb-4">
                            {event.eventType}
                        </Badge>
                        <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4">
                            {event.eventName}
                        </h1>
                        <div className="flex flex-wrap items-center gap-6 text-orange-100 font-body">
                            <div className="flex items-center">
                                <Calendar className="w-5 h-5 mr-2" />
                                {formatDate(event.startDate)}
                            </div>
                            <div className="flex items-center">
                                <MapPin className="w-5 h-5 mr-2" />
                                {event.venue ? event.venue.name : (event.location || 'Online')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Description Card */}
                        <Card>
                            <h3 className="text-xl font-bold text-gray-900 mb-4 font-heading border-l-4 border-orange-500 pl-4">About this Event</h3>
                            <div className="prose max-w-none text-gray-600 leading-relaxed font-body whitespace-pre-line">
                                {event.description}
                            </div>
                        </Card>

                        {/* Location Card */}
                        <Card>
                            <h3 className="text-xl font-bold text-gray-900 mb-4 font-heading border-l-4 border-orange-400 pl-4">Location</h3>
                            <div className="flex items-start">
                                <div className="bg-orange-50 p-3 rounded-full mr-4">
                                    <MapPin className="w-6 h-6 text-orange-600" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-900 font-heading">
                                        {event.venue ? event.venue.name : 'Event Location'}
                                    </h4>
                                    <p className="text-gray-500 mt-1 font-body">
                                        {event.location || 'Online Event'}
                                    </p>
                                    {event.venue && event.venue.address && (
                                        <p className="text-gray-500 mt-1 font-body">{event.venue.address}, {event.venue.city}</p>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Action Card */}
                        <Card className="shadow-xl">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 font-heading">Quick Actions</h3>
                            <div className="space-y-3">
                                <Button
                                    className="w-full"
                                    onClick={() => alert('Registration feature coming soon!')}
                                >
                                    Register Now
                                </Button>
                                <Button
                                    variant="secondary"
                                    className="w-full flex items-center justify-center gap-2"
                                >
                                    <Share2 className="w-4 h-4" /> Share Event
                                </Button>
                            </div>
                        </Card>

                        {/* Organizer Info */}
                        <Card>
                            <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 font-heading">Organizer</h3>
                            <div className="flex items-center">
                                <div className="bg-gray-100 p-3 rounded-full mr-3">
                                    <User className="w-6 h-6 text-gray-500" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900 font-body">Organizer ID: {event.organizerId}</p>
                                    <p className="text-xs text-gray-500 font-body">Contact details hidden</p>
                                </div>
                            </div>
                        </Card>

                        {/* Admin Actions */}
                        <Card className="!bg-red-50 !border-red-100">
                            <h3 className="text-lg font-bold text-red-800 mb-4 pb-2 border-b border-red-100 font-heading">Admin Zone</h3>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => navigate(`/events/${id}/edit`)}
                                    className="flex-1 !text-red-600 !border-red-200 hover:!bg-red-50 flex items-center justify-center gap-1"
                                >
                                    <Edit className="w-4 h-4" /> Edit
                                </Button>
                                <Button
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="flex-1 !bg-red-600 hover:!bg-red-700 flex items-center justify-center gap-1"
                                >
                                    {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> :
                                        <>
                                            <Trash2 className="w-4 h-4" /> Delete
                                        </>}
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetailsPage;
