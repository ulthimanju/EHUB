import { Calendar, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../index.css';

export default function EventCard({ event, showActions = false, onEdit, onDelete }) {
    const startDate = new Date(event.startDate).toLocaleDateString(undefined, {
        month: 'short', day: 'numeric', year: 'numeric'
    });

    return (
        <div className="glass event-card">
            {/* Placeholder Image - could use event.imageUrl if available */}
            <div className="event-image-placeholder">
                <div className="event-type-badge">{event.eventType}</div>
            </div>

            <div className="event-content">
                <h3>{event.eventName}</h3>
                <p className="event-description">{event.description?.substring(0, 100)}...</p>

                <div className="event-meta">
                    <div className="meta-item">
                        <Calendar size={16} /> {startDate}
                    </div>
                    {/* 
                <div className="meta-item">
                    <Users size={16} /> 120 Registered
                </div>
                */}
                </div>

                <div className="event-actions">
                    <Link to={`/events/${event.eventId}`} className="btn-link">
                        View Details
                    </Link>

                    {showActions ? (
                        <div className="action-buttons">
                            <button onClick={() => onEdit(event)} className="btn-secondary-sm">Edit</button>
                            <button onClick={() => onDelete(event.eventId)} className="btn-danger-sm">Delete</button>
                        </div>
                    ) : (
                        <Link to={`/events/${event.eventId}`} className="btn-primary-sm">
                            Join Now <ArrowRight size={16} />
                        </Link>
                    )}
                </div>
            </div>

            <style>{`
            .event-card {
                overflow: hidden;
                border-radius: 12px;
                transition: transform 0.2s;
                display: flex;
                flex-direction: column;
                height: 100%;
            }
            .event-card:hover {
                transform: translateY(-5px);
            }
            .event-image-placeholder {
                height: 140px;
                background: linear-gradient(135deg, var(--bg-secondary), #334155);
                position: relative;
            }
            .event-type-badge {
                position: absolute;
                top: 1rem;
                right: 1rem;
                background: rgba(0,0,0,0.6);
                padding: 0.25rem 0.75rem;
                border-radius: 99px;
                font-size: 0.8rem;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .event-content {
                padding: 1.5rem;
                display: flex;
                flex-direction: column;
                flex: 1;
            }
            .event-content h3 {
                margin-bottom: 0.5rem;
                font-size: 1.25rem;
            }
            .event-description {
                color: var(--text-secondary);
                font-size: 0.9rem;
                margin-bottom: 1rem;
                flex: 1;
            }
            .event-meta {
                display: flex;
                gap: 1rem;
                margin-bottom: 1.5rem;
                color: var(--text-secondary);
                font-size: 0.85rem;
            }
            .meta-item {
                display: flex;
                align-items: center;
                gap: 0.4rem;
            }
            .event-actions {
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-top: 1px solid var(--glass-border);
                padding-top: 1rem;
            }
            .btn-link {
                color: var(--text-secondary);
                font-size: 0.9rem;
            }
            .btn-link:hover {
                color: var(--text-primary);
            }
            .action-buttons {
                display: flex;
                gap: 0.5rem;
            }
            .btn-secondary-sm {
                background: rgba(255,255,255,0.1);
                border: none;
                color: white;
                padding: 0.4rem 0.8rem;
                border-radius: 6px;
                font-size: 0.85rem;
            }
            .btn-danger-sm {
                background: rgba(239, 68, 68, 0.2);
                border: 1px solid rgba(239, 68, 68, 0.3);
                color: #ef4444;
                padding: 0.4rem 0.8rem;
                border-radius: 6px;
                font-size: 0.85rem;
            }
        `}</style>
        </div>
    );
}
