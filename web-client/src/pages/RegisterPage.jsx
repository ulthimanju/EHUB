import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, Check, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useLoading } from '../contexts/LoadingContext';

const RegisterPage = () => {
    const [step, setStep] = useState(1); // 1 = form, 2 = OTP verification
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [resendTimer, setResendTimer] = useState(0);
    const { showLoading, hideLoading } = useLoading();
    const navigate = useNavigate();

    useEffect(() => {
        let interval;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendTimer]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmitForm = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        showLoading('Sending verification code...');

        try {
            const gatewayUrl = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:9092';
            const response = await fetch(`${gatewayUrl}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password
                }),
            });

            if (response.ok) {
                setStep(2);
                setResendTimer(120); // 2 minutes
            } else {
                const data = await response.json().catch(() => ({}));
                setError(data.message || "Registration failed. Username or email may already exist.");
            }
        } catch (error) {
            console.error('Registration error:', error);
            setError("Network error. Please check your connection.");
        } finally {
            hideLoading();
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');

        showLoading('Verifying code...');

        try {
            const gatewayUrl = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:9092';
            const response = await fetch(`${gatewayUrl}/users/verify-registration`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    otp: otp
                }),
            });

            if (response.ok) {
                hideLoading();
                navigate('/login', { state: { message: 'Registration successful! Please login.' } });
            } else {
                const data = await response.json().catch(() => ({}));
                setError(data.message || "Invalid or expired verification code.");
            }
        } catch (error) {
            console.error('Verification error:', error);
            setError("Network error. Please check your connection.");
        } finally {
            hideLoading();
        }
    };

    const handleResendOtp = async () => {
        if (resendTimer > 0) return;
        
        setError('');
        showLoading('Resending verification code...');

        try {
            const gatewayUrl = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:9092';
            const response = await fetch(`${gatewayUrl}/users/resend-registration-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email
                }),
            });

            if (response.ok) {
                setResendTimer(120);
            } else {
                setError("Failed to resend code. Please try again.");
            }
        } catch (error) {
            setError("Network error. Please check your connection.");
        } finally {
            hideLoading();
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Step 2: OTP Verification
    if (step === 2) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-lg p-8">
                    <button 
                        onClick={() => setStep(1)} 
                        className="flex items-center text-gray-500 hover:text-gray-700 mb-4 text-sm"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back
                    </button>

                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-heading font-bold text-gray-900 mb-2">Verify Your Email</h1>
                        <p className="text-gray-500 font-body">
                            We sent a verification code to<br />
                            <span className="font-medium text-gray-700">{formData.email}</span>
                        </p>
                    </div>

                    <form onSubmit={handleVerifyOtp} className="space-y-5">
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm font-body">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Verification Code
                            </label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="Enter 6-digit code"
                                className="w-full text-center text-2xl tracking-widest p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                maxLength={6}
                                required
                            />
                        </div>

                        <Button className="w-full text-lg" disabled={otp.length !== 6}>
                            Verify & Create Account
                        </Button>

                        <div className="text-center text-sm text-gray-500">
                            {resendTimer > 0 ? (
                                <p>Resend code in {formatTime(resendTimer)}</p>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleResendOtp}
                                    className="text-orange-500 hover:text-orange-600 font-medium"
                                >
                                    Resend verification code
                                </button>
                            )}
                        </div>
                    </form>
                </Card>
            </div>
        );
    }

    // Step 1: Registration Form
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-heading font-bold text-gray-900 mb-2">Create Account</h1>
                </div>

                <form onSubmit={handleSubmitForm} className="space-y-5">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm font-body">
                            {error}
                        </div>
                    )}
                    <Input
                        label="Username"
                        name="username"
                        placeholder="johndoe"
                        icon={User}
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />

                    <Input
                        label="Email Address"
                        type="email"
                        name="email"
                        placeholder="you@example.com"
                        icon={Mail}
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    <Input
                        label="Password"
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        icon={Lock}
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />

                    <Input
                        label="Confirm Password"
                        type="password"
                        name="confirmPassword"
                        placeholder="••••••••"
                        icon={Lock}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />

                    <div className="flex items-center gap-3 pt-2">
                        <div className="relative flex items-center shrink-0">
                            <input
                                type="checkbox"
                                id="terms"
                                className="peer h-5 w-5 cursor-pointer appearance-none rounded-lg border border-gray-300 bg-white checked:border-orange-500 checked:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all shrink-0"
                                required
                            />
                            <Check className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                        </div>
                        <label htmlFor="terms" className="text-sm text-gray-500 font-body cursor-pointer select-none">
                            I agree to the <Link to="/terms" className="text-orange-500 hover:text-orange-600 font-medium">Terms</Link> and <Link to="/privacy" className="text-orange-500 hover:text-orange-600 font-medium">Privacy Policy</Link>
                        </label>
                    </div>

                    <Button className="w-full text-lg mt-2">Continue</Button>
                </form>

                <div className="mt-6 text-center text-sm font-body text-gray-500">
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold text-orange-500 hover:text-orange-600">
                        Sign in
                    </Link>
                </div>
            </Card>
        </div>
    );
};

export default RegisterPage;
