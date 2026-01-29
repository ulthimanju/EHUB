import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { userService } from '../api/services/userService';
import { ShieldCheck, Mail } from 'lucide-react';
import './Auth.css';

export default function OtpPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [email] = useState(location.state?.email || '');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await userService.verifyRegistration(email, otp);
            setSuccess('Account verified successfully! Redirecting to login...');
            setTimeout(() => {
                // Ideally redirect to Keycloak login or Home
                window.location.href = '/';
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed. Invalid OTP.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        try {
            await userService.resendOtp(email);
            alert("OTP Resent!");
        } catch (err) {
            alert("Failed to resend OTP");
        }
    };

    if (!email) {
        return (
            <div className="auth-container">
                <div className="auth-card glass">
                    <h2>Error</h2>
                    <p>No email provided. Please register first.</p>
                    <button onClick={() => navigate('/register')} className="btn-secondary">Go to Register</button>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-card glass">
                <div className="auth-header">
                    <div className="icon-circle">
                        <ShieldCheck size={32} />
                    </div>
                    <h2>Verify Account</h2>
                    <p>We sent a code to <span className="text-accent">{email}</span></p>
                </div>

                {error && <div className="error-alert">{error}</div>}
                {success && <div className="success-alert" style={{ color: '#4ade80', background: 'rgba(74, 222, 128, 0.1)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>{success}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>One-Time Password</label>
                        <div className="input-wrapper">
                            <input
                                type="text"
                                placeholder="Enter 6-digit code"
                                required
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                style={{ textAlign: 'center', letterSpacing: '0.5rem', fontSize: '1.2rem' }}
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Verifying...' : 'Verify Email'}
                    </button>

                    <button type="button" onClick={handleResend} className="btn-link" style={{ marginTop: '1rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                        Resend Code
                    </button>
                </form>
            </div>
        </div>
    );
}
