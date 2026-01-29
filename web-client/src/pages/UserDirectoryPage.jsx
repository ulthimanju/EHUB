import { useState, useEffect } from 'react';
import { userService } from '../api/services/userService';
import { Search, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../index.css';

export default function UserDirectoryPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const response = await userService.getAllUsers();
            setUsers(response.data || response); // Handle ApiResponse
        } catch (err) {
            console.error("Failed to load users", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Simple client-side filter if term is short, or server search
            if (!searchTerm) {
                await loadUsers();
                return;
            }

            // Try server search by username
            try {
                const res = await userService.searchUsers({ username: searchTerm });
                // Search returns single user or list? API says returns UserDTO (single) or 404
                // But usually search might return list. 
                // The Controller code: returns Single UserDTO filtered by stream. findFirst().
                // So it returns 1 user.
                const user = res.data || res;
                setUsers(user ? [user] : []);
            } catch (err) {
                // Fallback to email search
                try {
                    const res = await userService.searchUsers({ email: searchTerm });
                    const user = res.data || res;
                    setUsers(user ? [user] : []);
                } catch (err2) {
                    setUsers([]);
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ paddingTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>User Directory</h1>

                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Search users..."
                            style={{ padding: '0.5rem 1rem 0.5rem 2.5rem', background: 'rgba(255,255,255,0.1)', border: '1px solid var(--border)', borderRadius: '99px', color: 'white' }}
                        />
                    </div>
                    <button type="submit" className="btn-primary-sm">Search</button>
                </form>
            </div>

            {loading ? (
                <div>Loading users...</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {users.map(user => (
                        <Link to={`/users/${user.id}`} key={user.id} className="glass" style={{ textDecoration: 'none', color: 'inherit', padding: '1.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'transform 0.2s', ':hover': { transform: 'translateY(-5px)' } }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}>
                                {user.username?.[0]?.toUpperCase()}
                            </div>
                            <div>
                                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{user.firstName} {user.lastName}</div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>@{user.username}</div>
                                {user.roles?.includes('ORGANIZER') && (
                                    <div className="badge" style={{ marginTop: '0.5rem', display: 'inline-block', fontSize: '0.7rem' }}>Organiser</div>
                                )}
                            </div>
                        </Link>
                    ))}
                    {users.length === 0 && (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                            No users found.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
