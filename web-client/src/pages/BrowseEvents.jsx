import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import Card from '../components/Card'
import Badge from '../components/Badge'
import SectionHeader from '../components/SectionHeader'
import EmptyState from '../components/EmptyState'
import { Calendar, ArrowRight, Loader2, Target, Search } from 'lucide-react'

const BrowseEvents = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get('/events')
        setEvents(response.data)
      } catch (err) {
        setError('Mission sync failed: Unable to fetch global event list.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

  const filteredEvents = events.filter(event => {
    const term = searchTerm.toLowerCase();
    const cleanTerm = term.startsWith('#') ? term.substring(1) : term;
    
    return (
      event.name.toLowerCase().includes(term) ||
      event.theme?.toLowerCase().includes(term) ||
      event.shortCode.toLowerCase().includes(cleanTerm)
    );
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 bg-[#F8FAFC]">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Explore Missions</h1>
          <p className="text-slate-500 font-medium mt-1">Discover and join global hackathons and events</p>
        </div>
        
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input 
            type="text"
            placeholder="Search by name or theme..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-400 shadow-sm transition-all text-sm text-slate-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-8">
        <SectionHeader 
          icon={Target} 
          title="All Available Events" 
          className="mb-6"
        />
        
        {loading ? (
          <Card className="flex h-60 flex-col items-center justify-center gap-4 border-dashed">
            <Loader2 className="animate-spin text-blue-600" size={40} />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Scanning Global Network</p>
          </Card>
        ) : error ? (
          <Card className="flex h-40 items-center justify-center border-rose-100 bg-rose-50 text-rose-600">
            <p className="font-bold">{error}</p>
          </Card>
        ) : filteredEvents.length === 0 ? (
          <EmptyState 
            icon={Calendar} 
            message={searchTerm ? "No missions match your search criteria" : "No global events available at the moment"}
            description={searchTerm ? "Try adjusting your search filters" : "Check back later for new opportunities"}
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="group p-6 hover:border-blue-200 transition-all">
                <div className="mb-5 flex items-start justify-between">
                  <Badge 
                    variant={
                      event.status === 'ONGOING' ? 'emerald' : 
                      event.status === 'REGISTRATION_OPEN' ? 'blue' : 'slate'
                    }
                  >
                    {event.status.replace('_', ' ')}
                  </Badge>
                  <div className="px-2 py-0.5 bg-slate-100 rounded text-[10px] text-slate-600 font-mono font-bold tracking-wider uppercase border border-slate-200">
                    #{event.shortCode}
                  </div>
                </div>
                
                <h3 className="mb-2 text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {event.name}
                </h3>
                <p className="mb-6 line-clamp-2 text-sm text-slate-500 font-medium leading-relaxed">
                  {event.description || 'No description provided'}
                </p>
                
                <div className="flex items-center justify-between border-t border-slate-100 pt-5">
                  <div className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <Calendar size={14} className="mr-1.5" />
                    {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <Link to={`/events/${event.id}`} className="flex items-center text-xs font-black text-blue-600 uppercase tracking-widest hover:translate-x-1 transition-transform">
                    View Details
                    <ArrowRight size={14} className="ml-1.5" />
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default BrowseEvents
