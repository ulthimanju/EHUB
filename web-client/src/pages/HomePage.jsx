import { Link } from 'react-router-dom';
import { useAuth } from "react-oidc-context";
import { ArrowRight, Code, Users, Trophy } from 'lucide-react';
import '../index.css';

export default function HomePage() {
    const auth = useAuth();

    return (
        <div className="home-container">
            <section className="hero">
                <h1 className="hero-title">
                    Unleash Innovation via <span className="text-gradient">Hackathons</span>
                </h1>
                <p className="hero-subtitle">
                    The ultimate platform to organize, collaborate, and compete in world-class coding events.
                </p>
                <div className="hero-actions">
                    {auth.isAuthenticated ? (
                        <Link to="/events" className="btn-primary btn-lg">
                            Explore Events <ArrowRight size={20} />
                        </Link>
                    ) : (
                        <div className="gap-4 flex">
                            <button onClick={() => auth.signinRedirect()} className="btn-primary btn-lg">
                                Get Started <ArrowRight size={20} />
                            </button>
                        </div>
                    )}
                </div>
            </section>

            <section className="features grid-3">
                <div className="feature-card glass">
                    <div className="icon-box"><Trophy /></div>
                    <h3>Compete & Win</h3>
                    <p>Join global hackathons and showcase your skills to win amazing prizes.</p>
                </div>
                <div className="feature-card glass">
                    <div className="icon-box"><Users /></div>
                    <h3>Build Teams</h3>
                    <p>Find teammates, form squads, and collaborate in real-time.</p>
                </div>
                <div className="feature-card glass">
                    <div className="icon-box"><Code /></div>
                    <h3>Learn & Grow</h3>
                    <p>Solve real-world problems and upgrade your developer profile.</p>
                </div>
            </section>

            <style>{`
        .home-container { padding: 4rem 0; }
        .hero { text-align: center; margin-bottom: 6rem; }
        .hero-title { font-size: 3.5rem; font-weight: 800; line-height: 1.2; margin-bottom: 1.5rem; }
        .text-gradient { 
            background: linear-gradient(135deg, var(--primary), #a855f7); 
            -webkit-background-clip: text; 
            -webkit-text-fill-color: transparent; 
        }
        .hero-subtitle { font-size: 1.25rem; color: var(--text-secondary); max-width: 600px; margin: 0 auto 2.5rem; }
        .hero-actions { display: flex; justify-content: center; gap: 1rem; }
        .btn-lg { padding: 1rem 2rem; font-size: 1.1rem; display: flex; align-items: center; gap: 0.5rem; }
        
        .grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; }
        .feature-card { padding: 2rem; border-radius: 16px; transition: transform 0.2s; }
        .feature-card:hover { transform: translateY(-5px); }
        .icon-box { 
            width: 48px; height: 48px; background: rgba(14, 165, 233, 0.1); 
            color: var(--primary); border-radius: 12px; display: flex; 
            align-items: center; justify-content: center; margin-bottom: 1.5rem; 
        }
        .feature-card h3 { font-size: 1.25rem; margin-bottom: 0.5rem; }
        .feature-card p { color: var(--text-secondary); }
      `}</style>
        </div>
    );
}
