import { Link, useLocation } from 'react-router-dom';
import { useAuth } from "react-oidc-context";
import { LogIn, LogOut, Code, User, Calendar, Menu } from 'lucide-react';
import { useState } from 'react';
import './Navbar.css';

export default function Navbar() {
    const auth = useAuth();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <nav className="navbar glass">
            <div className="container navbar-content">
                <Link to="/" className="logo">
                    <Code className="logo-icon" />
                    <span className="logo-text">EventHub</span>
                </Link>

                {/* Desktop Menu */}
                <div className="nav-links">
                    <Link to="/events" className={`nav-link ${isActive('/events')}`}>
                        <Calendar size={18} /> Events
                    </Link>
                    {auth.isAuthenticated && (
                        <>
                            <Link to="/my-events" className={`nav-link ${isActive('/my-events')}`}>
                                My Events
                            </Link>
                            <Link to="/profile" className={`nav-link ${isActive('/profile')}`}>
                                <User size={18} /> Profile
                            </Link>
                        </>
                    )}
                </div>

                <div className="nav-auth">
                    {auth.isAuthenticated ? (
                        <div className="user-menu">
                            <span className="username">{auth.user?.profile.preferred_username}</span>
                            <button onClick={() => auth.removeUser()} className="btn-icon" title="Log out">
                                <LogOut size={20} />
                            </button>
                        </div>
                    ) : (
                        <div className="auth-buttons">
                            <Link to="/register" className="btn-secondary">Register</Link>
                            <button onClick={() => auth.signinRedirect()} className="btn-primary-sm">
                                <LogIn size={16} /> Login
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
