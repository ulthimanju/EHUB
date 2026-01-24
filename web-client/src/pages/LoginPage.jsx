import React, { useState } from 'react';
import { Mail, Lock } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useLoading } from '../contexts/LoadingContext';
import AuthService from '../services/AuthService';
import Modal from '../components/ui/Modal';
import OTPInput from '../components/ui/OTPInput';

const LoginPage = () => {
    // Login State
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { showLoading, hideLoading } = useLoading();
    const navigate = useNavigate();
    const location = useLocation();

    // Check for success message from registration
    const successMessage = location.state?.message;

    // Forgot Password State
    const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
    const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);

    const [forgotUsername, setForgotUsername] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [modalError, setModalError] = useState('');
    const [modalSuccess, setModalSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        showLoading('Signing in...');

        try {
            await AuthService.login(username, password);
            hideLoading();
            navigate('/profile');
        } catch (error) {
            setError(error.message || 'Login failed. Please check your credentials.');
        } finally {
            hideLoading();
        }
    };

    const handleForgotPasswordClick = (e) => {
        e.preventDefault();
        setModalError('');
        setModalSuccess('');
        setIsForgotModalOpen(true);
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setModalError('');
        showLoading('Sending OTP...');
        try {
            await AuthService.forgotPassword(forgotUsername);
            hideLoading();
            setIsForgotModalOpen(false);
            setIsOtpModalOpen(true);
            setModalSuccess('OTP sent successfully! Check the backend console/logs.');
        } catch (err) {
            hideLoading();
            setModalError(err.message || 'Failed to send OTP');
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setModalError('');
        const otpString = otp.join('');
        if (otpString.length !== 6) {
            setModalError('Please enter a valid 6-digit OTP');
            return;
        }
        showLoading('Verifying OTP...');
        try {
            await AuthService.verifyOtp(forgotUsername, otpString);
            hideLoading();
            setIsOtpModalOpen(false);
            setIsResetModalOpen(true);
            setModalError('');
        } catch (err) {
            hideLoading();
            setModalError(err.message || 'Invalid OTP');
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setModalError('');

        if (newPassword.length < 8) {
            setModalError('Password must be at least 8 characters');
            return;
        }

        if (newPassword !== confirmPassword) {
            setModalError('Passwords do not match');
            return;
        }

        showLoading('Resetting Password...');
        try {
            await AuthService.resetPassword(forgotUsername, newPassword);
            hideLoading();
            setIsResetModalOpen(false);
            setModalSuccess('Password reset successfully! Please login.');

            // Clear state
            setForgotUsername('');
            setOtp(['', '', '', '', '', '']);
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            hideLoading();
            setModalError(err.message || 'Failed to reset password');
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
                    {modalSuccess && !isResetModalOpen && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm font-body">
                            {modalSuccess}
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
                            <button
                                type="button"
                                onClick={handleForgotPasswordClick}
                                className="text-sm font-medium text-orange-500 hover:text-orange-600"
                            >
                                Forgot password?
                            </button>
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

            {/* 1. Enter Username Modal */}
            <Modal
                isOpen={isForgotModalOpen}
                onClose={() => setIsForgotModalOpen(false)}
                title="Forgot Password"
            >
                <form onSubmit={handleSendOtp} className="space-y-4">
                    <p className="text-sm text-gray-500">
                        Enter your username to receive a One-Time Password (OTP) to reset your password.
                    </p>
                    {modalError && <div className="text-sm text-red-500">{modalError}</div>}
                    <Input
                        label="Username"
                        value={forgotUsername}
                        onChange={(e) => setForgotUsername(e.target.value)}
                        required
                        placeholder="Enter your username"
                        icon={Mail}
                    />
                    <Button type="submit" className="w-full">Send OTP</Button>
                </form>
            </Modal>

            {/* 2. OTP Verification Modal */}
            <Modal
                isOpen={isOtpModalOpen}
                onClose={() => setIsOtpModalOpen(false)}
                title="Verify OTP"
            >
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                    <p className="text-sm text-gray-500 text-center">
                        Enter the 6-digit code sent to your registered email/phone.
                    </p>
                    {modalError && <div className="text-sm text-red-500 text-center">{modalError}</div>}
                    {modalSuccess && <div className="text-sm text-green-500 text-center">{modalSuccess}</div>}

                    <div className="flex justify-center">
                        <OTPInput
                            length={6}
                            value={otp}
                            onChange={setOtp}
                        />
                    </div>

                    <Button type="submit" className="w-full">Verify & Proceed</Button>
                </form>
            </Modal>

            {/* 3. Reset Password Modal */}
            <Modal
                isOpen={isResetModalOpen}
                onClose={() => setIsResetModalOpen(false)}
                title="Reset Password"
            >
                <form onSubmit={handleResetPassword} className="space-y-4">
                    <p className="text-sm text-gray-500">
                        Create a new strong password for your account.
                    </p>
                    {modalError && <div className="text-sm text-red-500">{modalError}</div>}
                    <Input
                        label="New Password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        icon={Lock}
                    />
                    <Input
                        label="Confirm Password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        icon={Lock}
                    />
                    <Button type="submit" className="w-full">Update Password</Button>
                </form>
            </Modal>
        </div>
    );
};

export default LoginPage;
