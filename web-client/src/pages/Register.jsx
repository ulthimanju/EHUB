import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Input from '../components/Input'
import Button from '../components/Button'
import Card from '../components/Card'
import api from '../api/axios'
import { UserPlus, Mail, Lock, User, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react'

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    otp: '',
  })
  const [step, setStep] = useState(1) // 1: Details, 2: OTP
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleRequestOtp = async (e) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setError('')
    setLoading(true)
    try {
      await api.post(`/auth/register/otp?email=${formData.email}`)
      setMessage('A verification code has been dispatched to your email.')
      setStep(2)
    } catch (err) {
      setError(err.response?.data || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        otp: formData.otp,
      })
      navigate('/login')
    } catch (err) {
      setError(err.response?.data || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center p-6 bg-[#F8FAFC]">
      <Card className="w-full max-w-md p-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <UserPlus size={32} strokeWidth={2.5} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Create Identity</h2>
          <p className="mt-2 text-sm text-slate-500 font-medium">Join the EHub collective</p>
        </div>

        {error && (
          <div className="mb-8 rounded-xl bg-rose-50 p-4 text-xs font-bold text-rose-600 border border-rose-100 uppercase tracking-widest">
            {error}
          </div>
        )}
        {message && (
          <div className="mb-8 rounded-xl bg-emerald-50 p-4 text-xs font-bold text-emerald-600 border border-emerald-100 uppercase tracking-widest">
            {message}
          </div>
        )}

        <form onSubmit={step === 1 ? handleRequestOtp : handleRegister} className="space-y-5">
          {step === 1 ? (
            <>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Username</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input
                    required
                    placeholder="Enter unique username"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 focus:bg-white transition-all text-sm text-slate-700"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input
                    required
                    type="email"
                    placeholder="Enter your email"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 focus:bg-white transition-all text-sm text-slate-700"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Security Key</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input
                    required
                    type="password"
                    placeholder="Create a strong password"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 focus:bg-white transition-all text-sm text-slate-700"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Confirm Security Key</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input
                    required
                    type="password"
                    placeholder="Repeat your password"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 focus:bg-white transition-all text-sm text-slate-700"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  />
                </div>
              </div>

              <Button 
                className="w-full bg-slate-900 py-4 rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all mt-4" 
                type="submit" 
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Request Verification'}
              </Button>
            </>
          ) : (
            <>
              <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-2xl mb-6">
                <p className="text-xs text-blue-600 font-medium leading-relaxed">
                  We've sent a 6-digit verification code to <span className="font-bold">{formData.email}</span>. Please enter it below.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Verification Code</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input
                    required
                    maxLength="6"
                    placeholder="000000"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 focus:bg-white transition-all text-center text-lg font-black tracking-[0.5em] text-slate-700"
                    value={formData.otp}
                    onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                  />
                </div>
              </div>

              <Button 
                className="w-full bg-emerald-600 py-4 rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all" 
                type="submit" 
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Finalize Registration'}
              </Button>

              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-slate-600 font-bold text-xs uppercase tracking-widest mt-4"
              >
                <ArrowLeft size={14} /> Back to details
              </button>
            </>
          )}
        </form>

        <div className="mt-10 pt-10 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-500 font-medium">
            Already registered?{' '}
            <Link to="/login" className="inline-flex items-center text-blue-600 font-bold hover:underline">
              Sign in <ArrowRight size={14} className="ml-1" />
            </Link>
          </p>
        </div>
      </Card>
    </div>
  )
}

export default Register