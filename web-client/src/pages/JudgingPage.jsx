import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { eventService } from '../api/services/eventService';
import { submissionService } from '../api/services/submissionService';
// We might not have an endpoint to list all submissions, so we might need to iterate teams or use a workaround.
// Assuming for now we can't easily list them without backend support.
// OR we might check if 'event' object has a list of 'teams', and iterate them to get submissions.

export default function JudgingPage() {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submissions, setSubmissions] = useState([]);

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            const eventData = await eventService.getEventById(id);
            const eventObj = eventData.data || eventData;
            setEvent(eventObj);

            // FEATURE GAP WORKAROUND:
            // The backend doesn't have "GET /events/{id}/submissions".
            // Use placeholder data or try to extract from event if available.
            // If eventObj.teams exists, we can use that.
            // Else, we show a message.
            if (eventObj.teams) {
                const subs = [];
                for (const team of eventObj.teams) {
                    // Fetch submission for each team (inefficient but works for parity check)
                    try {
                        const sub = await submissionService.getSubmission(team.id);
                        if (sub.data) subs.push({ teamName: team.teamName, ...sub.data });
                        else if (sub.submissionUrl) subs.push({ teamName: team.teamName, ...sub });
                    } catch (e) { /* ignore no submission */ }
                }
                setSubmissions(subs);
            } else {
                // Mock for UI display purposes if no teams in event object
                // setSubmissions([{ id: 101, teamName: "Demo Team", submissionUrl: "https://github.com/demo/project" }]);
            }

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleEvaluate = async (subId) => {
        try {
            await submissionService.evaluateSubmission(subId);
            alert("Submission evaluated successfully!");
        } catch (err) {
            alert("Failed to evaluate submission. " + (err.response?.data?.message || err.message));
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="container" style={{ paddingTop: '2rem' }}>
            <h1 style={{ marginBottom: '2rem' }}>Judging: {event?.eventName}</h1>

            <div className="glass" style={{ padding: '2rem', borderRadius: '12px' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>Submissions</h3>

                {submissions.length === 0 ? (
                    <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                        No submissions found or unable to list them.
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {submissions.map((sub, idx) => (
                            <div key={idx} style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: 'bold' }}>{sub.teamName}</div>
                                    <a href={sub.submissionUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontSize: '0.9rem' }}>{sub.submissionUrl}</a>
                                </div>
                                <button onClick={() => handleEvaluate(sub.id)} className="btn-primary-sm">Evaluate</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
