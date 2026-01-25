import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, Calendar, PlusCircle } from 'lucide-react';
import Button from '../ui/Button';
import AuthService from '../../services/AuthService';

import Drawer from '../ui/Drawer';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState(AuthService.getUser());
    const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsOpen(false);
        setIsProfileDrawerOpen(false); // also close drawer on nav
    }, [location]);

    // Check auth state on mount and update
    // Note: In a real app, use an AuthContext to avoid polling or manual updates
    useEffect(() => {
        const checkUser = () => {
            const currentUser = AuthService.getUser();
            setUser(currentUser);
        };

        checkUser();

        // Simple listener for storage events (if login happens in another tab) 
        // or we could trigger an event. For now, simple check is good enough.
        window.addEventListener('storage', checkUser);
        return () => window.removeEventListener('storage', checkUser);
    }, [location]);

    const handleLogout = () => {
        AuthService.logout();
        setUser(null);
        navigate('/login');
    };



    if (['/login', '/register'].includes(location.pathname)) {
        return null; // Don't show navbar on auth pages
    }

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 w-full">
            <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center transform rotate-3">
                                <Calendar className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-heading font-bold text-xl text-gray-900">EventHub</span>
                        </Link>
                    </div>

                    {/* Main Nav Links */}
                    <div className="hidden md:flex items-center ml-8 gap-6">
                        <Link to="/events" className="text-gray-600 hover:text-orange-600 font-medium font-body transition-colors">
                            Explore Events
                        </Link>
                    </div>

                    {/* Right Side Buttons */}
                    <div className="hidden md:flex items-center gap-4">
                        {user ? (
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-500 font-body">
                                    Hello, <span className="font-semibold text-gray-800">{user.firstName || user.username}</span>
                                </span>
                                <Button variant="ghost" className="!p-2" onClick={() => setIsProfileDrawerOpen(true)}>
                                    <User className="w-5 h-5" />
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link to="/login">
                                    <Button variant="ghost" className="!text-sm text-gray-600 hover:text-orange-600">
                                        Sign In
                                    </Button>
                                </Link>
                                <Link to="/register">
                                    <Button variant="primary" className="!py-2 !px-4 text-sm">
                                        Get Started
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500"
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white border-t border-gray-100">
                    <div className="pt-4 pb-4 border-t border-gray-200 px-4">
                        {user ? (
                            <div className="flex flex-col gap-4">
                                <Link to="/events" className="text-gray-600 font-medium px-2 py-1" onClick={() => setIsOpen(false)}>
                                    Explore Events
                                </Link>
                                <div className="flex items-center justify-between mt-2 pt-4 border-t border-gray-100">
                                    <div className="flex items-center" onClick={() => { setIsOpen(false); setIsProfileDrawerOpen(true); }}>
                                        <div className="flex-shrink-0">
                                            <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-lg">
                                                {user.username?.[0]?.toUpperCase()}
                                            </div>
                                        </div>
                                        <div className="ml-3">
                                            <div className="text-base font-medium text-gray-800">{user.firstName} {user.lastName}</div>
                                            <div className="text-sm font-medium text-gray-500">{user.email}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3 mt-2">
                                <Link to="/events" className="block text-gray-600 font-medium mb-4" onClick={() => setIsOpen(false)}>
                                    Explore Events
                                </Link>
                                <Link to="/login" className="block w-full">
                                    <Button variant="secondary" className="w-full justify-center">Sign In</Button>
                                </Link>
                                <Link to="/register" className="block w-full">
                                    <Button variant="primary" className="w-full justify-center">Get Started</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Profile Drawer */}
            <Drawer
                isOpen={isProfileDrawerOpen}
                onClose={() => setIsProfileDrawerOpen(false)}
                title="Your Profile"
                position="right"
            >
                {user && (
                    <div className="space-y-6">
                        <div className="flex flex-col items-center justify-center p-6 bg-orange-50 rounded-2xl">
                            <div className="h-20 w-20 rounded-full bg-white border-4 border-orange-200 flex items-center justify-center text-orange-600 font-bold text-3xl shadow-sm mb-3">
                                {user.username?.[0]?.toUpperCase()}
                            </div>
                            <h4 className="text-xl font-heading font-bold text-gray-900">{user.firstName} {user.lastName}</h4>
                            <p className="text-gray-500 font-body">{user.email}</p>
                        </div>

                        <div className="space-y-3">
                            <Link to="/profile" onClick={() => setIsProfileDrawerOpen(false)} className="block w-full">
                                <Button variant="secondary" className="w-full flex items-center !justify-start gap-3 !px-4 !py-4 text-base shadow-sm hover:shadow-md transition-all">
                                    <User className="w-5 h-5 text-gray-500" />
                                    View Full Profile
                                </Button>
                            </Link>
                            <Link to="/events/new" onClick={() => setIsProfileDrawerOpen(false)} className="block w-full">
                                <Button variant="secondary" className="w-full flex items-center !justify-start gap-3 !px-4 !py-4 text-base shadow-sm hover:shadow-md transition-all">
                                    <PlusCircle className="w-5 h-5 text-gray-500" />
                                    Create Event
                                </Button>
                            </Link>
                        </div>

                        <div className="border-t border-gray-100 pt-6">
                            <Button variant="outline" onClick={handleLogout} className="w-full flex items-center !justify-start gap-3 !px-4 !py-4 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 text-base">
                                <LogOut className="w-5 h-5" />
                                Sign Out
                            </Button>
                        </div>
                    </div>
                )}
            </Drawer>
        </nav>
    );
};

export default Navbar;
