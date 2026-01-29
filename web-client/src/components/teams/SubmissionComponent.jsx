import { useState, useEffect } from 'react';
import { submissionService } from '../../api/services/submissionService';
import { UploadCloud, Check, ExternalLink } from 'lucide-react';

export default function SubmissionComponent({ teamId }) {
    const [submission, setSubmission] = useState(null);
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        loadSubmission();
    }, [teamId]);

    const loadSubmission = async () => {
        try {
            const data = await submissionService.getSubmission(teamId);
            if (data.data) setSubmission(data.data); // Handle wrapper
            else if (data.submissionUrl) setSubmission(data);
        } catch (err) {
            // 404 is expected if no submission
            console.log("No submission found or error", err);
        } finally {
            setFetching(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await submissionService.submitProject(teamId, { submissionUrl: url });
            setSubmission(result.data || result);
            alert("Project submitted successfully!");
        } catch (err) {
            alert("Failed to submit project");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div>Checking submission status...</div>;

    if (submission) {
        return (
            <div style={{ background: 'rgba(74, 222, 128, 0.1)', border: '1px solid rgba(74, 222, 128, 0.2)', padding: '1.5rem', borderRadius: '12px', marginTop: '2rem' }}>
                <h4 style={{ color: '#4ade80', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <Check size={20} /> Project Submitted
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <a href={submission.submissionUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        View Submission <ExternalLink size={14} />
                    </a>
                    {/* <button className="btn-secondary-sm">Update</button> */}
                </div>
            </div>
        );
    }

    return (
        <div style={{ marginTop: '2rem', borderTop: '1px solid var(--glass-border)', paddingTop: '2rem' }}>
            <h4 style={{ marginBottom: '1rem' }}>Submit Project</h4>
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <UploadCloud size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input
                        value={url}
                        onChange={e => setUrl(e.target.value)}
                        placeholder="https://github.com/my-team/project"
                        required
                        style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '8px', color: 'white' }}
                    />
                </div>
                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit'}
                </button>
            </form>
        </div>
    );
}
