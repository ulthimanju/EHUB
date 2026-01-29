import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { eventService } from '../api/services/eventService';
import { Calendar, Type, FileText } from 'lucide-react';
import '../index.css';

export default function EventFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        eventName: '',
        description: '',
        startDate: '',
        endDate: '',
        eventType: 'ONLINE'
    });
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEdit);

    useEffect(() => {
        if (isEdit) {
            loadEvent();
        }
    }, [id]);

    const loadEvent = async () => {
        try {
            const data = await eventService.getEventById(id);
            const event = data.data || data;
            // Format dates for input type="datetime-local" if needed, 
            // usually requires 'YYYY-MM-DDThh:mm'
            setFormData({
                ...event,
                startDate: event.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : '',
                endDate: event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : ''
            });
        } catch (err) {
            console.error("Failed to load event", err);
            alert("Failed to load event details");
        } finally {
            setFetching(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...formData,
                startDate: new Date(formData.startDate).toISOString(),
                endDate: new Date(formData.endDate).toISOString()
            };

            if (isEdit) {
                await eventService.updateEvent(id, payload);
                alert("Event updated successfully!");
            } else {
                await eventService.createEvent(payload);
                alert("Event created successfully!");
            }
            navigate('/my-events');
        } catch (err) {
            console.error(err);
            alert("Failed to save event");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div>Loading event data...</div>;

    return (
        <div className="container" style={{ paddingTop: '2rem' }}>
            <div className="glass" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', borderRadius: '16px' }}>
                <h1 style={{ marginBottom: '2rem' }}>{isEdit ? 'Edit Event' : 'Create Event'}</h1>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>Event Name</label>
                        <div className="input-wrapper">
                            <Type size={18} className="input-icon" />
                            <input
                                value={formData.eventName}
                                onChange={e => setFormData({ ...formData, eventName: e.target.value })}
                                required
                                placeholder="e.g. AI Hackathon 2026"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <div className="input-wrapper">
                            <FileText size={18} className="input-icon" style={{ top: '1rem' }} />
                            <textarea
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                required
                                placeholder="Describe your event..."
                                style={{
                                    width: '100%',
                                    minHeight: '150px',
                                    background: 'rgba(15, 23, 42, 0.5)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px',
                                    padding: '0.75rem 1rem 0.75rem 2.75rem',
                                    color: 'var(--text-primary)',
                                    fontSize: '1rem',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label>Start Date</label>
                            <div className="input-wrapper">
                                <Calendar size={18} className="input-icon" />
                                <input
                                    type="datetime-local"
                                    value={formData.startDate}
                                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>End Date</label>
                            <div className="input-wrapper">
                                <Calendar size={18} className="input-icon" />
                                <input
                                    type="datetime-local"
                                    value={formData.endDate}
                                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Event Type</label>
                        <div className="input-wrapper">
                            <select
                                value={formData.eventType}
                                onChange={e => setFormData({ ...formData, eventType: e.target.value })}
                                style={{
                                    width: '100%',
                                    background: 'rgba(15, 23, 42, 0.5)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px',
                                    padding: '0.75rem 1rem',
                                    color: 'var(--text-primary)',
                                    fontSize: '1rem'
                                }}
                            >
                                <option value="ONLINE">Online</option>
                                <option value="OFFLINE">Offline</option>
                                <option value="HYBRID">Hybrid</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : (isEdit ? 'Update Event' : 'Create Event')}
                        </button>
                        <button type="button" className="btn-secondary" onClick={() => navigate('/my-events')}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
