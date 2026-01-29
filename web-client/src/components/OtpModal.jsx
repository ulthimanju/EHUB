import { useState } from 'react';
import Modal from './Modal';

export default function OtpModal({ isOpen, onClose, onSubmit, title = "Enter OTP" }) {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await onSubmit(otp);
        setLoading(false);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <form onSubmit={handleSubmit} className="auth-form" style={{ padding: 0 }}>
                <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                    Please check your email for the verification code.
                </p>
                <div className="form-group">
                    <label>OTP Code</label>
                    <div className="input-wrapper">
                        <input
                            value={otp}
                            onChange={e => setOtp(e.target.value)}
                            placeholder="123456"
                            required
                        />
                    </div>
                </div>
                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Verifying...' : 'Verify'}
                </button>
            </form>
        </Modal>
    );
}
