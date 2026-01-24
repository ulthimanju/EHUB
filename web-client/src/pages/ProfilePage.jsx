import React, { useEffect, useState } from 'react';
import { User, Mail, LogOut, Edit, Phone, MapPin, Save, X, UserCircle, Hash, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import OTPInput from '../components/ui/OTPInput';
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
    const [otp, setOtp] = useState([]);
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
        const otpString = otp.join('');
        if (otpString.length !== 6) {
            setError('Please enter complete 6-digit OTP');
            return;
        }
        showLoading('Verifying OTP...');
        setError('');
        try {
            const updatedUser = await AuthService.promoteToOrganizer(user.id, otpString);
            setUser({ ...user, ...updatedUser });
            setShowOtpModal(false);
            setSuccessMessage('You are now an Organizer!');
            setOtp([]);
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
        <>
            {/* OTP Modal - Full Screen Overlay */}
            {showOtpModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                                <UserPlus className="w-8 h-8 text-orange-600" />
                            </div>
                            <h3 className="text-2xl font-heading font-bold text-gray-900 mb-2">Verify Your Identity</h3>
                            <p className="text-sm text-gray-500">
                                Enter the 6-digit code sent to<br />
                                <span className="font-semibold text-orange-600">{user.email}</span>
                            </p>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-body text-center">
                                {error}
                            </div>
                        )}

                        <div className="mb-8">
                            <OTPInput length={6} value={otp} onChange={setOtp} />
                        </div>

                        <div className="flex gap-3">
                            <Button className="flex-1 py-3" onClick={handleSubmitOtp}>
                                Verify & Continue
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1 py-3"
                                onClick={() => { setShowOtpModal(false); setOtp([]); setError(''); }}
                            >
                                Cancel
                            </Button>
                        </div>

                        <p className="text-xs text-gray-400 text-center mt-6">
                            Didn't receive the code? Check your spam folder.
                        </p>
                    </Card>
                </div>
            )}

            <div className="flex-1 flex items-center justify-center p-4">
                <Card className="w-full max-w-lg p-8 m-auto">

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
        </>
    );
};

export default ProfilePage;

