import React, { useState } from 'react';
import { Mail, Lock, User, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useLoading } from '../contexts/LoadingContext';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const { showLoading, hideLoading } = useLoading();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        showLoading('Creating your account...');

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
                hideLoading();
                navigate('/login', { state: { message: 'Registration successful! Please login.' } });
            } else {
                const data = await response.json();
                setError(data.message || "Registration failed. Please try again.");
            }
        } catch (error) {
            console.error('Registration error:', error);
            setError("Network error. Please check your connection.");
        } finally {
            hideLoading();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-heading font-bold text-gray-900 mb-2">Create Account</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
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

                    <Button className="w-full text-lg mt-2">Sign Up</Button>
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
