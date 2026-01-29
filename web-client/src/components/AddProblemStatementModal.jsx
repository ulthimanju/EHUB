import { useState } from 'react';
import { eventService } from '../api/services/eventService';
import Modal from './Modal';

export default function AddProblemStatementModal({ isOpen, onClose, eventId, onAdded }) {
    const [formData, setFormData] = useState({ title: '', description: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await eventService.addProblemStatement(eventId, formData);
            onAdded(result.data || result);
            setFormData({ title: '', description: '' });
            onClose();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to add problem statement');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add Problem Statement">
            <form onSubmit={handleSubmit} className="auth-form" style={{ padding: 0 }}>
                <div className="form-group">
                    <label>Title</label>
                    <div className="input-wrapper">
                        <input
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g. Sustainable Energy"
                            required
                        />
                    </div>
                </div>
                <div className="form-group">
                    <label>Description</label>
                    <div className="input-wrapper">
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Detailed description..."
                            required
                            style={{
                                width: '100%',
                                minHeight: '100px',
                                background: 'rgba(15, 23, 42, 0.5)',
                                border: '1px solid var(--border)',
                                borderRadius: '8px',
                                padding: '0.75rem',
                                color: 'var(--text-primary)'
                            }}
                        />
                    </div>
                </div>
                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Adding...' : 'Add Problem Statement'}
                </button>
            </form>
        </Modal>
    );
}
