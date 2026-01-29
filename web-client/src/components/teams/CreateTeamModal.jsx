import { useState } from 'react';
import { teamService } from '../api/services/teamService';
import Modal from './Modal';

export default function CreateTeamModal({ isOpen, onClose, hackathonId, onTeamCreated }) {
    const [teamName, setTeamName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const newTeam = await teamService.createTeam(hackathonId, teamName);
            onTeamCreated(newTeam.data || newTeam);
            onClose();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create team');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New Team">
            <form onSubmit={handleSubmit} className="auth-form" style={{ padding: 0 }}>
                <div className="form-group">
                    <label>Team Name</label>
                    <div className="input-wrapper">
                        <input
                            value={teamName}
                            onChange={e => setTeamName(e.target.value)}
                            placeholder="e.g. Code Wizards"
                            required
                        />
                    </div>
                </div>
                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Team'}
                </button>
            </form>
        </Modal>
    );
}
