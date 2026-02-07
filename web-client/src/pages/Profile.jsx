import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Button from '../components/Button'
import Card from '../components/Card'
import Badge from '../components/Badge'
import SectionHeader from '../components/SectionHeader'
import api from '../api/axios'
import { User as UserIcon, Shield, Mail, IdCard, CheckCircle, ChevronRight, Zap, ShieldCheck } from 'lucide-react'

const Profile = () => {
  const { user, fetchProfile } = useAuth()
  const [step, setStep] = useState(1) // 1: Default, 2: OTP Entry
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  if (!user) return null

  const handleRequestOtp = async () => {
    setError('')
    setLoading(true)
    try {
      await api.post(`/auth/upgrade-role/otp?email=${user.email}`)
      setStep(2)
      setSuccess('A verification code has been dispatched to your email.')
    } catch (err) {
      setError(err.response?.data || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/upgrade-role', {
        email: user.email,
        otp: otp
      })
      setSuccess('Account elevation successful! You are now an Organizer.')
      setStep(1)
      await fetchProfile()
    } catch (err) {
      setError(err.response?.data || 'Upgrade failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 bg-[#F8FAFC]">
      <div className="flex items-center gap-2 mb-8">
        <div className="bg-slate-100 p-1.5 rounded-lg text-slate-500">
          <UserIcon size={18} strokeWidth={2.5} />
        </div>
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">User Profile</h3>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Identity Card */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-8 text-center flex flex-col items-center">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-6 shadow-inner border-4 border-white">
              <span className="text-3xl font-black">{user.username?.[0].toUpperCase()}</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{user.username}</h1>
            <Badge variant={user.role === 'organizer' ? 'blue' : 'slate'} className="mt-3">
              {user.role}
            </Badge>
            
            <div className="w-full mt-10 space-y-4 pt-8 border-t border-slate-50 text-left">
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 shrink-0">
                  <Mail size={14} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Email</p>
                  <p className="text-xs font-bold text-slate-800 truncate">{user.email}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 shrink-0">
                  <IdCard size={14} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Account ID</p>
                  <p className="text-xs font-mono font-bold text-slate-800 truncate">{user.id.substring(0, 8)}...</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Account Elevation / Permissions */}
        <div className="lg:col-span-2 space-y-10">
          <section>
            <SectionHeader icon={Shield} title="Permissions & Elevation" iconClassName="bg-indigo-50 text-indigo-600" />
            <Card className="p-8">
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900">Current Status</h3>
                  <p className="text-sm text-slate-500 font-medium mt-2 leading-relaxed">
                    {user.role === 'organizer' 
                      ? 'You have administrative privileges. You can create, manage, and evaluate events and team submissions across the platform.' 
                      : 'You are currently a participant. You can join teams and submit projects. Elevate your account to start organizing your own events.'}
                  </p>
                </div>
                
                {user.role === 'participant' && step === 1 && (
                  <button 
                    onClick={handleRequestOtp} 
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all shrink-0"
                  >
                    <Zap size={14} fill="currentColor" />
                    Elevate Role
                  </button>
                )}
              </div>

              {error && (
                <div className="mt-6 rounded-xl bg-rose-50 p-4 text-xs font-bold text-rose-600 border border-rose-100 uppercase tracking-widest animate-in slide-in-from-top-2">
                  {error}
                </div>
              )}
              {success && (
                <div className="mt-6 rounded-xl bg-emerald-50 p-4 text-xs font-bold text-emerald-600 border border-emerald-100 uppercase tracking-widest flex items-center gap-2 animate-in slide-in-from-top-2">
                  <CheckCircle size={16} /> {success}
                </div>
              )}

              {step === 2 && (
                <form onSubmit={handleUpgrade} className="mt-10 pt-10 border-t border-slate-100 space-y-6 animate-in slide-in-from-bottom-4">
                  <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-2xl">
                    <p className="text-xs text-blue-600 font-medium leading-relaxed">
                      Please enter the security code sent to <span className="font-bold">{user.email}</span> to confirm elevation.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Confirmation Code</label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input
                        required
                        maxLength="6"
                        placeholder="000000"
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 focus:bg-white transition-all text-center text-lg font-black tracking-[0.5em] text-slate-700"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      type="submit" 
                      disabled={loading} 
                      className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all"
                    >
                      Confirm Elevation
                    </button>
                    <button 
                      variant="outline" 
                      type="button" 
                      onClick={() => setStep(1)} 
                      disabled={loading}
                      className="px-8 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </Card>
          </section>

          <section>
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
                  <Zap size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Quick Support</p>
                  <p className="text-[11px] text-slate-400 font-medium">Need help with your account?</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-300" />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default Profile