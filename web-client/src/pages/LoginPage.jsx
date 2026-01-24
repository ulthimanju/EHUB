import React, { useState } from 'react';
import { Mail, Lock } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useLoading } from '../contexts/LoadingContext';
import AuthService from '../services/AuthService';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { showLoading, hideLoading } = useLoading();
    const navigate = useNavigate();
    const location = useLocation();

    // Check for success message from registration
    const successMessage = location.state?.message;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        showLoading('Signing in...');

        try {
            await AuthService.login(username, password);
            hideLoading();
            navigate('/profile');
        } catch (error) {
            // Error is handled by displaying it in the UI
            setError(error.message || 'Login failed. Please check your credentials.');
        } finally {
            hideLoading();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-heading font-bold text-gray-900 mb-2">Welcome Back</h1>
                    <p className="text-gray-500 font-body">Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {successMessage && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm font-body">
                            {successMessage}
                        </div>
                    )}
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm font-body">
                            {error}
                        </div>
                    )}
                    <Input
                        label="Username"
                        type="text"
                        placeholder="johndoe"
                        icon={Mail}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />

                    <div className="space-y-1">
                        <Input
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                            icon={Lock}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <div className="flex justify-end">
                            <Link to="/forgot-password" className="text-sm font-medium text-orange-500 hover:text-orange-600">
                                Forgot password?
                            </Link>
                        </div>
                    </div>

                    <Button className="w-full text-lg">Sign In</Button>
                </form>

                <div className="mt-6 text-center text-sm font-body text-gray-500">
                    Don't have an account?{' '}
                    <Link to="/register" className="font-semibold text-orange-500 hover:text-orange-600">
                        Create account
                    </Link>
                </div>
            </Card>
        </div>
    );
};

export default LoginPage;
