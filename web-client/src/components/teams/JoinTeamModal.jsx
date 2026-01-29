import { useState } from 'react';
import { teamService } from '../api/services/teamService';
import Modal from './Modal';

export default function JoinTeamModal({ isOpen, onClose, onTeamJoined }) {
    const [teamCode, setTeamCode] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await teamService.joinTeam(teamCode);
            onTeamJoined(result.data || result);
            onClose();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to join team. Check code.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Join a Team">
            <form onSubmit={handleSubmit} className="auth-form" style={{ padding: 0 }}>
                <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                    Enter the unique team code shared by the team leader.
                </p>
                <div className="form-group">
                    <label>Team Code</label>
                    <div className="input-wrapper">
                        <input
                            value={teamCode}
                            onChange={e => setTeamCode(e.target.value)}
                            placeholder="e.g. TEAM-12345"
                            required
                        />
                    </div>
                </div>
                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Joining...' : 'Join Team'}
                </button>
            </form>
        </Modal>
    );
}
