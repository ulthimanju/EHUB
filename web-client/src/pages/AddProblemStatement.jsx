import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import Button from '../components/Button'
import Card from '../components/Card'
import Badge from '../components/Badge'
import SectionHeader from '../components/SectionHeader'
import { FileCode, Send, Plus, Trash2, ArrowLeft, Target, ShieldCheck, ChevronRight } from 'lucide-react'

const AddProblemStatement = () => {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [statements, setStatements] = useState([{ statement: '' }])

  const handleStatementChange = (index, value) => {
    const newStatements = [...statements]
    newStatements[index].statement = value
    setStatements(newStatements)
  }

  const addField = () => {
    setStatements([...statements, { statement: '' }])
  }

  const removeField = (index) => {
    if (statements.length > 1) {
      setStatements(statements.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const filteredStatements = statements.filter(s => s.statement.trim() !== '')
    if (filteredStatements.length === 0) {
      setError('Intelligence required: Define at least one challenge statement.')
      return
    }

    setLoading(true)
    setError('')

    try {
      await api.post(`/events/${eventId}/problemstatements/bulk`, filteredStatements)
      setSuccess(true)
      setTimeout(() => {
        navigate(`/events/${eventId}`)
      }, 2000)
    } catch (err) {
      setError(err.response?.data || 'Intel sync failed: Unable to upload statements.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 bg-[#F8FAFC]">
      <div className="mb-10 flex items-start justify-between">
        <div>
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors text-xs font-medium mb-6">
            <ArrowLeft size={14} /> Back to Hub
          </button>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Challenge Definitions</h1>
          <p className="text-slate-500 font-medium mt-1">Specify the intelligence parameters for your mission</p>
        </div>
        
        {!success && (
          <button 
            type="button" onClick={addField}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-blue-400 hover:text-blue-600 transition-all shadow-sm"
          >
            <Plus size={16} />
            Append Challenge
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          {success ? (
            <Card className="p-12 text-center border-emerald-100 animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck size={40} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Mission Sync Complete</h2>
              <p className="text-slate-500 font-medium mt-2">Intelligence data successfully uploaded. Redirecting to hub...</p>
            </Card>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-xl bg-rose-50 p-4 text-xs font-bold text-rose-600 border border-rose-100 uppercase tracking-widest">
                  {error}
                </div>
              )}

              <div className="space-y-6">
                {statements.map((s, index) => (
                  <Card key={index} className="p-6 relative group transition-all hover:border-blue-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="blue" size="xs">Module #{index + 1}</Badge>
                      </div>
                      {statements.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeField(index)}
                          className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                    <textarea
                      required
                      rows="5"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 focus:bg-white transition-all text-sm text-slate-700 leading-relaxed"
                      placeholder="Input challenge description and criteria..."
                      value={s.statement}
                      onChange={(e) => handleStatementChange(index, e.target.value)}
                    />
                  </Card>
                ))}
              </div>

              <div className="flex gap-4 pt-6">
                <button 
                  type="submit" disabled={loading}
                  className="flex-1 flex items-center justify-center gap-3 py-4 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all"
                >
                  <Send size={18} />
                  {loading ? 'Transmitting...' : 'Initialize All Challenges'}
                </button>
              </div>
            </form>
          )}
        </div>

        <aside className="lg:col-span-1 space-y-6">
          <SectionHeader icon={Target} title="Guidance" iconClassName="bg-amber-50 text-amber-600" />
          <Card variant="slate" className="p-6 space-y-6">
            <div className="space-y-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Intelligence Protocol</p>
              <ul className="space-y-3">
                {['Be specific about requirements', 'Define clear success metrics', 'Upload multiple paths for variety'].map((tip, i) => (
                  <li key={i} className="flex items-start gap-3 text-[11px] text-slate-600 font-medium leading-relaxed">
                    <ChevronRight size={14} className="text-blue-500 shrink-0 mt-0.5" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </Card>
          
          <div className="p-6 bg-blue-50/30 border border-blue-100 rounded-2xl">
             <p className="text-[11px] text-blue-600 font-medium leading-relaxed">
               Need to modify these later? You can manage challenges from the Event Dashboard.
             </p>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default AddProblemStatement
