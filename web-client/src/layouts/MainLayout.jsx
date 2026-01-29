import Navbar from '../components/Navbar';

export default function MainLayout({ children }) {
    return (
        <div className="app-container">
            <Navbar />
            <main className="main-content container">
                {children}
            </main>
        </div>
    );
}
