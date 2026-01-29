import { useState } from 'react';
import { userService } from '../api/services/userService';
import { KeyRound, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await userService.forgotPassword(email);
            alert("Password reset OTP sent to your email.");
            navigate('/reset-password', { state: { email } });
        } catch (err) {
            alert(err.response?.data?.message || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card glass">
                <div className="auth-header">
                    <div className="icon-circle">
                        <KeyRound size={32} />
                    </div>
                    <h2>Forgot Password</h2>
                    <p>Enter your email to receive a reset code</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>Email Address</label>
                        <div className="input-wrapper">
                            <input
                                type="email"
                                placeholder="john@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Sending...' : 'Send Reset Code'}
                    </button>

                    <Link to="/" className="btn-link" style={{ textAlign: 'center', display: 'block', color: 'var(--text-secondary)' }}>
                        Back to Login
                    </Link>
                </form>
            </div>
        </div>
    );
}
