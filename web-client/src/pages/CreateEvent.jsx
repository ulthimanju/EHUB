import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import Button from '../components/Button'
import Card from '../components/Card'
import SectionHeader from '../components/SectionHeader'
import { 
  Calendar, 
  Layout, 
  Mail, 
  MapPin, 
  Globe, 
  Trophy, 
  ListChecks, 
  Users, 
  Clock,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Settings,
  Target
} from 'lucide-react'

const CreateEvent = () => {
  const { eventId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [error, setError] = useState('')
  
  const isEditMode = !!eventId

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    theme: '',
    contactEmail: '',
    prizes: [''],
    rules: [''],
    startDate: '',
    endDate: '',
    registrationStartDate: '',
    registrationEndDate: '',
    judging: true,
    resultsDate: '',
    venue: '',
    isVirtual: false,
    location: '',
    maxParticipants: '',
    teamSize: '',
  })

  useEffect(() => {
    if (isEditMode) {
      const fetchEvent = async () => {
        setFetching(true)
        try {
          const res = await api.get(`/events/${eventId}`)
          const event = res.data
          
          const formatDate = (date) => date ? new Date(date).toISOString().slice(0, 16) : ''

          setFormData({
            ...event,
            startDate: formatDate(event.startDate),
            endDate: formatDate(event.endDate),
            registrationStartDate: formatDate(event.registrationStartDate),
            registrationEndDate: formatDate(event.registrationEndDate),
            resultsDate: formatDate(event.resultsDate),
            prizes: event.prizes?.length > 0 ? event.prizes : [''],
            rules: event.rules?.length > 0 ? event.rules : [''],
            maxParticipants: event.maxParticipants || '',
            teamSize: event.teamSize || '',
          })
        } catch (err) {
          setError('Failed to fetch event details')
        } finally {
          setFetching(false)
        }
      }
      fetchEvent()
    }
  }, [eventId, isEditMode])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleListChange = (index, value, field) => {
    const newList = [...formData[field]]
    newList[index] = value
    setFormData({ ...formData, [field]: newList })
  }

  const addListItem = (field) => {
    setFormData({ ...formData, [field]: [...formData[field], ''] })
  }

  const removeListItem = (index, field) => {
    const newList = formData[field].filter((_, i) => i !== index)
    setFormData({ ...formData, [field]: newList })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const submitData = {
        ...formData,
        prizes: formData.prizes.filter(p => p.trim() !== ''),
        rules: formData.rules.filter(r => r.trim() !== ''),
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
        teamSize: formData.teamSize ? parseInt(formData.teamSize) : null,
        organizerId: user.id || user.username
      }

      if (isEditMode) {
        await api.put(`/events/${eventId}`, submitData)
        navigate(`/events/${eventId}`)
      } else {
        const response = await api.post('/events', submitData)
        const newEventId = response.data
        navigate(`/events/${newEventId}/add-problem`)
      }
    } catch (err) {
      setError(err.response?.data || `Failed to ${isEditMode ? 'update' : 'create'} event`)
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return (
    <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
      <Loader2 className="animate-spin text-blue-600" size={48} />
    </div>
  )

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 bg-[#F8FAFC]">
      <div className="mb-10">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors text-xs font-medium mb-6">
          <ArrowLeft size={14} /> Back
        </button>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">{isEditMode ? 'Edit Mission' : 'Deploy New Mission'}</h1>
        <p className="text-slate-500 font-medium mt-1">Configure your hackathon parameters and launch</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-10">
        {/* Progress Sidebar */}
        <aside className="lg:col-span-1 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-slate-100 p-1.5 rounded-lg text-slate-500">
              <Settings size={18} strokeWidth={2.5} />
            </div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Setup Phase</h3>
          </div>
          <Card variant="slate" className="p-6 space-y-6">
            <div className={`flex items-center gap-3 transition-colors ${step === 1 ? 'text-blue-600' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black border-2 ${step === 1 ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-slate-50'}`}>1</div>
              <p className="text-[10px] font-bold uppercase tracking-widest">Identity</p>
            </div>
            <div className={`flex items-center gap-3 transition-colors ${step === 2 ? 'text-blue-600' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black border-2 ${step === 2 ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-slate-50'}`}>2</div>
              <p className="text-[10px] font-bold uppercase tracking-widest">Logistics</p>
            </div>
          </Card>
        </aside>

        {/* Form Area */}
        <Card className="lg:col-span-3 p-10">
          {error && (
            <div className="mb-8 rounded-xl bg-rose-50 p-4 text-xs font-bold text-rose-600 border border-rose-100 uppercase tracking-widest">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-10">
            {step === 1 ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <SectionHeader icon={Globe} title="Core Identity" />
                
                <div className="space-y-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Event Designation</label>
                    <div className="relative">
                      <Layout className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input 
                        name="name" required placeholder="e.g. Global AI Hackathon"
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 focus:bg-white transition-all text-sm text-slate-700"
                        value={formData.name} onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mission Theme</label>
                      <div className="relative">
                        <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input 
                          name="theme" placeholder="e.g. Sustainability"
                          className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 focus:bg-white transition-all text-sm text-slate-700"
                          value={formData.theme} onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input 
                          name="contactEmail" type="email" placeholder="organizer@ehub.com"
                          className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 focus:bg-white transition-all text-sm text-slate-700"
                          value={formData.contactEmail} onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mission Intelligence (Description)</label>
                    <textarea 
                      name="description" rows="5"
                      placeholder="Define the mission objectives and scope..."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 focus:bg-white transition-all text-sm text-slate-700 leading-relaxed"
                      value={formData.description} onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-6">
                  <button 
                    type="button" onClick={() => setStep(2)}
                    className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all"
                  >
                    Next Phase <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                <section>
                  <SectionHeader icon={Clock} title="Time Parameters" iconClassName="bg-blue-50 text-blue-600" />
                  <div className="grid md:grid-cols-2 gap-6 mt-6">
                    {['startDate', 'endDate', 'registrationStartDate', 'registrationEndDate', 'resultsDate'].map((field) => (
                      <div key={field} className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{field.replace(/([A-Z])/g, ' $1')}</label>
                        <input 
                          name={field} type="datetime-local" required={field === 'startDate' || field === 'endDate'}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 focus:bg-white transition-all text-sm text-slate-700"
                          value={formData[field]} onChange={handleChange}
                        />
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <SectionHeader icon={MapPin} title="Deployment Base" iconClassName="bg-rose-50 text-rose-600" />
                  <div className="space-y-6 mt-6">
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 group cursor-pointer hover:border-blue-200 transition-all">
                      <input 
                        type="checkbox" id="isVirtual" name="isVirtual"
                        className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        checked={formData.isVirtual} onChange={handleChange}
                      />
                      <label htmlFor="isVirtual" className="text-sm font-bold text-slate-700 cursor-pointer flex-1">Virtual Deployment (Remote Hackathon)</label>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      {!formData.isVirtual && (
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Venue Name</label>
                          <input 
                            name="venue" placeholder="e.g. Innovation Hub"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 focus:bg-white transition-all text-sm text-slate-700"
                            value={formData.venue} onChange={handleChange}
                          />
                        </div>
                      )}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Location Map</label>
                        <input 
                          name="location" placeholder="e.g. New York, USA"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 focus:bg-white transition-all text-sm text-slate-700"
                          value={formData.location} onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <SectionHeader icon={Users} title="Crowd Configuration" iconClassName="bg-teal-50 text-teal-600" />
                  <div className="grid md:grid-cols-2 gap-6 mt-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Max Capacity</label>
                      <input 
                        name="maxParticipants" type="number" placeholder="No limit"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 focus:bg-white transition-all text-sm text-slate-700"
                        value={formData.maxParticipants} onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Team Unit Size</label>
                      <input 
                        name="teamSize" type="number" placeholder="e.g. 4"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 focus:bg-white transition-all text-sm text-slate-700"
                        value={formData.teamSize} onChange={handleChange}
                      />
                    </div>
                  </div>
                </section>

                <section>
                  <SectionHeader icon={Trophy} title="Incentives & Rules" iconClassName="bg-amber-50 text-amber-600" />
                  <div className="grid md:grid-cols-2 gap-10 mt-6">
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Prizes</p>
                      {formData.prizes.map((prize, index) => (
                        <div key={index} className="flex gap-2">
                          <input 
                            value={prize} onChange={(e) => handleListChange(index, e.target.value, 'prizes')}
                            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 text-xs"
                            placeholder={`Incentive #${index + 1}`}
                          />
                          <button type="button" onClick={() => removeListItem(index, 'prizes')} className="text-slate-300 hover:text-rose-500">✕</button>
                        </div>
                      ))}
                      <button type="button" onClick={() => addListItem('prizes')} className="text-[10px] font-black text-blue-600 uppercase tracking-widest">+ Add Incentive</button>
                    </div>

                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Operating Rules</p>
                      {formData.rules.map((rule, index) => (
                        <div key={index} className="flex gap-2">
                          <input 
                            value={rule} onChange={(e) => handleListChange(index, e.target.value, 'rules')}
                            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 text-xs"
                            placeholder={`Constraint #${index + 1}`}
                          />
                          <button type="button" onClick={() => removeListItem(index, 'rules')} className="text-slate-300 hover:text-rose-500">✕</button>
                        </div>
                      ))}
                      <button type="button" onClick={() => addListItem('rules')} className="text-[10px] font-black text-blue-600 uppercase tracking-widest">+ Add Constraint</button>
                    </div>
                  </div>
                </section>

                <div className="flex gap-4 pt-10 border-t border-slate-100">
                  <button 
                    type="button" onClick={() => setStep(1)}
                    className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                  >
                    Back to Phase 1
                  </button>
                  <button 
                    type="submit" disabled={loading}
                    className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all"
                  >
                    {loading ? 'Processing Mission...' : (isEditMode ? 'Update Mission' : 'Finalize & Launch')}
                  </button>
                </div>
              </div>
            )}
          </form>
        </Card>
      </div>
    </div>
  )
}

export default CreateEvent
