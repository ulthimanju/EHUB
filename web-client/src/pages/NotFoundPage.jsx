import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const NotFoundPage = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md p-8 text-center">
                <h1 className="text-6xl font-heading font-bold text-orange-500 mb-4">404</h1>
                <h2 className="text-2xl font-heading font-semibold text-gray-900 mb-2">Page Not Found</h2>
                <p className="text-gray-500 font-body mb-8">
                    The page you are looking for doesn't exist or has been moved.
                </p>
                <Link to="/login">
                    <Button className="w-full">
                        Back to Home
                    </Button>
                </Link>
            </Card>
        </div>
    );
};

export default NotFoundPage;
