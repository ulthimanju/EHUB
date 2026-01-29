import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { eventService } from '../api/services/eventService';
import { useAuth } from "react-oidc-context";
import { Calendar, MapPin, ArrowLeft, Plus } from 'lucide-react';
import TeamDashboard from '../components/teams/TeamDashboard';
import AddProblemStatementModal from '../components/AddProblemStatementModal';
import '../index.css';

export default function EventDetailsPage() {
    const { id } = useParams();
    const auth = useAuth();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [showAddProblem, setShowAddProblem] = useState(false);

    useEffect(() => {
        loadEvent();
        if (auth.user) {
            setCurrentUser(auth.user);
        }
    }, [id, auth.user]);

    const loadEvent = async () => {
        try {
            const data = await eventService.getEventById(id);
            setEvent(data.data || data);
        } catch (err) {
            console.error("Failed to load event", err);
        } finally {
            setLoading(false);
        }
    };

    // Check if current user is organizer
    const isOrganizer = auth.isAuthenticated && (
        currentUser?.profile?.realm_access?.roles?.includes('app-admin') ||
        currentUser?.profile?.roles?.includes('ORGANIZER')
    );

    if (loading) return <div>Loading...</div>;
    if (!event) return <div>Event not found</div>;

    const startDate = new Date(event.startDate).toLocaleDateString(undefined, {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
            <Link to="/events" className="btn-link" style={{ marginBottom: '2rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <ArrowLeft size={18} /> Back to Events
            </Link>

            <div className="glass" style={{ padding: '3rem', borderRadius: '24px' }}>
                <div className="badge" style={{ display: 'inline-block', background: 'var(--primary)', color: 'white', padding: '0.25rem 1rem', borderRadius: '99px', marginBottom: '1rem', fontSize: '0.9rem' }}>
                    {event.eventType}
                </div>

                <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1.5rem', lineHeight: '1.1' }}>{event.eventName}</h1>

                <div style={{ display: 'flex', gap: '2rem', marginBottom: '3rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calendar size={20} className="text-accent" /> {startDate}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MapPin size={20} className="text-accent" /> Online
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '4rem' }}>
                    <div>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>About this Event</h3>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                            {event.description}
                        </p>

                        <div style={{ marginTop: '3rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3 style={{ fontSize: '1.5rem', marginBottom: 0 }}>Problem Statements</h3>
                                {isOrganizer && (
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <button onClick={() => setShowAddProblem(true)} className="btn-secondary-sm" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                            <Plus size={16} /> Add
                                        </button>
                                        <Link to={`/events/${id}/judging`} className="btn-primary-sm" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', textDecoration: 'none' }}>
                                            Judge Submissions
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {event.problemStatements && event.problemStatements.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {event.problemStatements.map((ps, idx) => (
                                        <div key={idx} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                                            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{ps.title}</h4>
                                            <p style={{ color: 'var(--text-secondary)' }}>{ps.description}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ padding: '2rem', border: '1px dashed var(--border)', borderRadius: '12px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                    Problem statements will be released soon.
                                </div>
                            )}
                        </div>

                        <AddProblemStatementModal
                            isOpen={showAddProblem}
                            onClose={() => setShowAddProblem(false)}
                            eventId={id}
                            onAdded={(newPs) => {
                                setEvent({ ...event, problemStatements: [...(event.problemStatements || []), newPs] });
                            }}
                        />
                    </div>

                    <div>
                        <div style={{ position: 'sticky', top: '100px' }}>
                            {auth.isAuthenticated ? (
                                <TeamDashboard
                                    eventId={id}
                                    currentUser={currentUser}
                                    onTeamUpdate={() => { }} // Optional: refresh to show status
                                />
                            ) : (
                                <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '2rem', borderRadius: '16px' }}>
                                    <h3 style={{ marginBottom: '1rem' }}>Join Event</h3>
                                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                                        Login to register and participate.
                                    </p>
                                    <Link to="/register" className="btn-primary" style={{ display: 'block', textAlign: 'center' }}>Register Now</Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
