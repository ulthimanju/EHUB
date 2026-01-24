import React, { useEffect, useState } from 'react';
import { User, Mail, LogOut, Edit, Phone, MapPin, Save, X, UserCircle, Hash, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useLoading } from '../contexts/LoadingContext';
import AuthService from '../services/AuthService';

const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        address: ''
    });
    const [error, setError] = useState('');
    const { showLoading, hideLoading } = useLoading();
    const navigate = useNavigate();

    // OTP State
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otp, setOtp] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const loadProfile = async () => {
            if (!AuthService.isAuthenticated()) {
                navigate('/login');
                return;
            }

            showLoading('Loading profile...');
            try {
                let userData = AuthService.getUser();

                try {
                    userData = await AuthService.fetchUserFromBackend();
                } catch (err) {
                    console.log('Could not fetch additional user data:', err);
                }

                setUser(userData);
                setFormData({
                    firstName: userData?.firstName || '',
                    lastName: userData?.lastName || '',
                    phoneNumber: userData?.phoneNumber || '',
                    address: userData?.address || ''
                });
            } catch (error) {
                console.error('Error loading profile:', error);
            } finally {
                hideLoading();
            }
        };

        loadProfile();
    }, [navigate, showLoading, hideLoading]);

    const handleLogout = () => {
        AuthService.logout();
        navigate('/login');
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        if (!user?.id) {
            setError('Cannot update profile: User ID not found');
            return;
        }

        showLoading('Saving profile...');
        setError('');

        try {
            const gatewayUrl = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:9092';
            const response = await fetch(`${gatewayUrl}/users/${user.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${AuthService.getAccessToken()}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const updatedUser = await response.json();
                setUser({ ...user, ...updatedUser });
                setIsEditing(false);
            } else {
                const data = await response.json();
                setError(data.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            setError('Network error. Please try again.');
        } finally {
            hideLoading();
        }
    };

    const handleCancel = () => {
        setFormData({
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            phoneNumber: user?.phoneNumber || '',
            address: user?.address || ''
        });
        setIsEditing(false);
        setError('');
    };

    const handleBecomeOrganizer = async () => {
        showLoading('Sending OTP...');
        setError('');
        setSuccessMessage('');
        try {
            await AuthService.sendOtp();
            setShowOtpModal(true);
            setSuccessMessage(`OTP sent to ${user.email}`);
        } catch (err) {
            setError(err.message || 'Failed to send OTP');
        } finally {
            hideLoading();
        }
    };

    const handleSubmitOtp = async () => {
        if (!otp) {
            setError('Please enter OTP');
            return;
        }
        showLoading('Verifying OTP...');
        setError('');
        try {
            const updatedUser = await AuthService.promoteToOrganizer(user.id, otp);
            setUser({ ...user, ...updatedUser });
            setShowOtpModal(false);
            setSuccessMessage('You are now an Organizer!');
            setOtp('');
        } catch (err) {
            setError(err.message || 'Invalid OTP or failed to promote');
        } finally {
            hideLoading();
        }
    };

    if (!user) {
        return null;
    }

    return (
        <div className="flex-1 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg p-8 m-auto relative">
                {/* OTP Modal Overlay - simple implementation inline */}
                {showOtpModal && (
                    <div className="absolute inset-0 bg-white/90 z-10 flex flex-col items-center justify-center p-8 rounded-2xl animate-in fade-in">
                        <h3 className="text-xl font-heading font-bold text-gray-900 mb-4">Enter OTP</h3>
                        <p className="text-sm text-gray-500 mb-6 text-center">We sent a code to your email to verify your request.</p>

                        <div className="w-full max-w-xs space-y-4">
                            <Input
                                placeholder="Enter 6-digit OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="text-center text-lg tracking-widest"
                            />
                            <div className="flex gap-3">
                                <Button className="flex-1" onClick={handleSubmitOtp}>Verify</Button>
                                <Button variant="outline" className="flex-1" onClick={() => { setShowOtpModal(false); setOtp(''); setError(''); }}>Cancel</Button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="text-center mb-8">
                    <h1 className="text-2xl font-heading font-bold text-gray-900 flex items-center justify-center">
                        <Hash className="w-6 h-6 text-orange-500" />
                        {user.username}
                        {user.role === 'ORGANIZER' && <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-600 text-xs rounded-full border border-orange-200">Organizer</span>}
                    </h1>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm font-body">
                        {error}
                    </div>
                )}

                {successMessage && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm font-body">
                        {successMessage}
                    </div>
                )}

                {isEditing ? (
                    <div className="space-y-4 mb-6">
                        <Input
                            label="First Name"
                            name="firstName"
                            placeholder="John"
                            icon={UserCircle}
                            value={formData.firstName}
                            onChange={handleChange}
                        />
                        <Input
                            label="Last Name"
                            name="lastName"
                            placeholder="Doe"
                            icon={UserCircle}
                            value={formData.lastName}
                            onChange={handleChange}
                        />
                        <Input
                            label="Phone Number"
                            name="phoneNumber"
                            placeholder="+1 234 567 8900"
                            icon={Phone}
                            value={formData.phoneNumber}
                            onChange={handleChange}
                        />
                        <Input
                            label="Address"
                            name="address"
                            placeholder="123 Main St, City, Country"
                            icon={MapPin}
                            value={formData.address}
                            onChange={handleChange}
                        />

                        <div className="flex gap-3 pt-2">
                            <Button
                                className="flex-1 flex items-center justify-center gap-2"
                                onClick={handleSave}
                            >
                                <Save className="w-4 h-4" />
                                Save Changes
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1 flex items-center justify-center gap-2"
                                onClick={handleCancel}
                            >
                                <X className="w-4 h-4" />
                                Cancel
                            </Button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="space-y-3 mb-6">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-orange-500" />
                                    <span className="text-sm font-body text-gray-600">Email</span>
                                </div>
                                <span className="text-sm font-semibold font-body text-gray-900">{user.email || 'Not set'}</span>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <UserCircle className="w-5 h-5 text-orange-500" />
                                    <span className="text-sm font-body text-gray-600">Name</span>
                                </div>
                                <span className="text-sm font-semibold font-body text-gray-900">
                                    {user.firstName && user.lastName
                                        ? `${user.firstName} ${user.lastName}`
                                        : user.firstName || user.lastName || 'Not set'}
                                </span>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <Phone className="w-5 h-5 text-orange-500" />
                                    <span className="text-sm font-body text-gray-600">Phone</span>
                                </div>
                                <span className="text-sm font-semibold font-body text-gray-900">{user.phoneNumber || 'Not set'}</span>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <MapPin className="w-5 h-5 text-orange-500" />
                                    <span className="text-sm font-body text-gray-600">Address</span>
                                </div>
                                <span className="text-sm font-semibold font-body text-gray-900 text-right max-w-[200px] truncate">{user.address || 'Not set'}</span>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Button
                                variant="outline"
                                className="flex-1 flex items-center justify-center gap-2"
                                onClick={() => setIsEditing(true)}
                            >
                                <Edit className="w-4 h-4" />
                                Edit Profile
                            </Button>
                            {user.role !== 'ORGANIZER' && (
                                <Button
                                    variant="primary"
                                    className="flex-1 flex items-center justify-center gap-2"
                                    onClick={handleBecomeOrganizer}
                                >
                                    <UserPlus className="w-4 h-4" />
                                    Become Organizer
                                </Button>
                            )}
                        </div>
                    </>
                )}
            </Card>
        </div>
    );
};

export default ProfilePage;
