import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Button from './Button'
import { LogOut, User as UserIcon, LayoutDashboard, Globe } from 'lucide-react'

const Navbar = () => {
  const { user, logout } = useAuth()

  return (
    <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 sm:px-8">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white transition-transform group-hover:scale-110">
            <LayoutDashboard size={20} fill="currentColor" />
          </div>
          <span className="text-xl font-black text-slate-900 tracking-tighter">EHUB</span>
        </Link>

        <div className="flex items-center gap-6">
          {user ? (
            <>
              <Link to="/events/browse" className="flex items-center gap-2.5 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">
                <Globe size={16} strokeWidth={2.5} />
                <span className="hidden sm:inline">Explore</span>
              </Link>
              <Link to="/" className="flex items-center gap-2.5 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">
                <LayoutDashboard size={16} strokeWidth={2.5} />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <Link to="/profile" className="flex items-center gap-2.5 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">
                <UserIcon size={16} strokeWidth={2.5} />
                <span className="hidden sm:inline">Portal</span>
              </Link>
              <button 
                onClick={logout}
                className="flex items-center gap-2 px-5 py-2 bg-slate-50 text-slate-600 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all"
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">
                Login
              </Link>
              <Link to="/register">
                <button className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all">
                  Join Community
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar