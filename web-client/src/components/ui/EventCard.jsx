import React from 'react';
import Card from './Card';
import Badge from './Badge';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';

const EventCard = ({ event, onClick, className = '' }) => {
    const formatDate = (dateString) => {
        if (!dateString) return 'TBD';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Card className={`group cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden !p-0 ${className}`}>
            <div onClick={onClick}>
                <div className="h-48 bg-gradient-to-br from-orange-400 to-orange-600 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-700 opacity-90 group-hover:scale-105 transition-transform duration-500"></div>
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                        <Badge className="!bg-white/20 !text-white !border-white/30 mb-2">
                            {event.eventType}
                        </Badge>
                        <h3 className="text-xl font-bold truncate font-heading">{event.eventName}</h3>
                    </div>
                </div>
                <div className="p-6">
                    <div className="flex items-center text-gray-500 mb-3 text-sm font-body">
                        <Calendar className="w-4 h-4 mr-2 text-orange-500" />
                        <span>{formatDate(event.startDate)}</span>
                    </div>
                    <div className="flex items-center text-gray-500 mb-4 text-sm font-body">
                        <MapPin className="w-4 h-4 mr-2 text-orange-500" />
                        <span className="truncate">{event.venue ? event.venue.name : (event.location || 'Online')}</span>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4 font-body">
                        {event.description}
                    </p>
                    <div className="flex items-center text-orange-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
                        View Details
                        <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default EventCard;
