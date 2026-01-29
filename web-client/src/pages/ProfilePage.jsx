import { useState, useEffect } from 'react';
import { useAuth } from "react-oidc-context";
import { useParams } from 'react-router-dom';
import { userService } from '../api/services/userService';
import { User, Mail, Save, Edit2, Shield } from 'lucide-react';
import OtpModal from '../components/OtpModal';
import './Auth.css'; // Reusing some auth styles

export default function ProfilePage() {
    const { id } = useParams();
    const auth = useAuth();
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const isOwnProfile = !id || (auth.user?.profile?.sub === id); // 'sub' is usually userId in OIDC, need to verify if backend maps it.
    // Actually backend usually returns a long ID. OIDC sub might be UUID. 
    // Let's assume for now if no ID in URL, it's own profile. 
    // If ID is there, we compare with... wait, we don't know our own numeric ID from token easily unless mapped.
    // But we can check if the fetched profile username matches auth username.

    useEffect(() => {
        loadProfile();
    }, [id, auth.user]);

    const loadProfile = async () => {
        try {
            setLoading(true);
            let data;
            if (id) {
                data = await userService.getUserById(id);
            } else {
                data = await userService.getCurrentUser();
            }
            // The API returns { success: true, data: UserDTO }
            // We need to handle the ApiResponse wrapper if userService doesn't unwrap it.
            // Looking at userService, it returns response.data.
            // So data might be { success: true, data: ... } or just ... depending on how axios works with the wrapper.
            // Actually the backend returns ApiResponse.
            // Let's assume userService returns the raw body.
            setProfile(data.data || data);
            setFormData(data.data || data);
        } catch (err) {
            console.error("Failed to load profile", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            // We only send fields that changed or are allowed
            const updates = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                // Add other fields if backend supports them (e.g. bio)
            };
            const updated = await userService.updateUser(profile.userId, updates);
            setProfile(updated.data || updated);
            setIsEditing(false);
        } catch (err) {
            console.error("Update failed", err);
            alert("Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    const handlePromote = async () => {
        try {
            await userService.sendOtpForRole();
            setShowOtpModal(true);
        } catch (err) {
            alert("Failed to send OTP for role upgrade.");
        }
    };

    const handleOtpSubmit = async (otp) => {
        try {
            // Need user ID. If isOwnProfile, we can use auth.user.profile.sub or profile.id
            const userId = profile.id;
            await userService.promoteToOrganizer(userId, otp);
            alert("Congratulations! You are now an Organizer. Please login again to refresh permissions.");
            loadProfile(); // Refresh
            setShowOtpModal(false);
        } catch (err) {
            alert(err.response?.data?.message || "Failed to upgrade role.");
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="container" style={{ paddingTop: '2rem' }}>
            <div className="glass" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', borderRadius: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>{id ? 'User Profile' : 'My Profile'}</h1>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        {isOwnProfile && !profile?.roles?.includes('ORGANIZER') && (
                            <button onClick={handlePromote} className="btn-secondary-sm">
                                <Shield size={16} style={{ marginRight: '0.5rem' }} /> Become Organizer
                            </button>
                        )}
                        {!isEditing && !id && (
                            <button onClick={() => setIsEditing(true)} className="btn-secondary" style={{ display: 'flex', gap: '0.5rem' }}>
                                <Edit2 size={18} /> Edit
                            </button>
                        )}
                    </div>
                </div>

                <OtpModal
                    isOpen={showOtpModal}
                    onClose={() => setShowOtpModal(false)}
                    onSubmit={handleOtpSubmit}
                    title="Verify for Organizer Logic"
                />

                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                    {/* Avatar Section */}
                    <div style={{ flex: '0 0 200px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '150px', height: '150px', borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--primary)' }}>
                            <User size={64} color="var(--primary)" />
                        </div>
                        <div className="badge" style={{ background: 'rgba(14, 165, 233, 0.1)', color: 'var(--primary)', padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.9rem', fontWeight: '600' }}>
                            {profile?.roles?.includes('ORGANIZER') ? 'Organizer' : 'Participant'}
                        </div>
                    </div>

                    {/* Details Section */}
                    <div style={{ flex: 1, minWidth: '300px' }}>
                        {isEditing ? (
                            <form onSubmit={handleUpdate} className="auth-form">
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="form-group">
                                        <label>First Name</label>
                                        <div className="input-wrapper">
                                            <input value={formData.firstName || ''} onChange={e => setFormData({ ...formData, firstName: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Last Name</label>
                                        <div className="input-wrapper">
                                            <input value={formData.lastName || ''} onChange={e => setFormData({ ...formData, lastName: e.target.value })} />
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                    <button type="submit" className="btn-primary" disabled={saving}>
                                        <Save size={18} style={{ marginRight: '0.5rem' }} /> Save Changes
                                    </button>
                                    <button type="button" className="btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
                                </div>
                            </form>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
                                    <div>
                                        <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Full Name</label>
                                        <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>{profile?.firstName} {profile?.lastName}</div>
                                    </div>
                                    <div>
                                        <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Username</label>
                                        <div style={{ fontSize: '1.1rem' }}>@{profile?.username}</div>
                                    </div>
                                    <div>
                                        <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Email</label>
                                        <div style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Mail size={16} /> {profile?.email}
                                        </div>
                                    </div>
                                </div>

                                {!profile?.roles?.includes('ORGANIZER') && (
                                    <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '1.5rem', borderRadius: '12px', marginTop: '1rem' }}>
                                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Shield size={20} color="var(--text-accent)" /> Become an Organizer
                                        </h3>
                                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.95rem' }}>
                                            Organizers can create and manage hackathons. Upgrade your account today.
                                        </p>
                                        <button className="btn-primary" onClick={() => alert("Feature coming in next update!")}>
                                            Request Upgrade
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
