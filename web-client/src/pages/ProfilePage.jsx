import React, { useEffect, useState } from 'react';
import { User, Mail, LogOut, Edit, Phone, MapPin, Save, X, UserCircle } from 'lucide-react';
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

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg p-8">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="w-10 h-10 text-orange-500" />
                    </div>
                    <h1 className="text-2xl font-heading font-bold text-gray-900">{user.username}</h1>
                    <p className="text-gray-500 font-body">{user.email}</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm font-body">
                        {error}
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
                                    <Mail className="w-5 h-5 text-gray-400" />
                                    <span className="text-sm font-body text-gray-600">Email</span>
                                </div>
                                <span className="text-sm font-semibold font-body text-gray-900">{user.email || 'Not set'}</span>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <UserCircle className="w-5 h-5 text-gray-400" />
                                    <span className="text-sm font-body text-gray-600">First Name</span>
                                </div>
                                <span className="text-sm font-semibold font-body text-gray-900">{user.firstName || 'Not set'}</span>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <UserCircle className="w-5 h-5 text-gray-400" />
                                    <span className="text-sm font-body text-gray-600">Last Name</span>
                                </div>
                                <span className="text-sm font-semibold font-body text-gray-900">{user.lastName || 'Not set'}</span>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <Phone className="w-5 h-5 text-gray-400" />
                                    <span className="text-sm font-body text-gray-600">Phone</span>
                                </div>
                                <span className="text-sm font-semibold font-body text-gray-900">{user.phoneNumber || 'Not set'}</span>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <MapPin className="w-5 h-5 text-gray-400" />
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
                            <Button
                                variant="secondary"
                                className="flex-1 flex items-center justify-center gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={handleLogout}
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </Button>
                        </div>
                    </>
                )}
            </Card>
        </div>
    );
};

export default ProfilePage;
