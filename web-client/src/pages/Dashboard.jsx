import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import Button from '../components/Button'
import Card from '../components/Card'
import Badge from '../components/Badge'
import SectionHeader from '../components/SectionHeader'
import EmptyState from '../components/EmptyState'
import { Plus, Users, Calendar, Settings, ArrowRight, Loader2, Target } from 'lucide-react'

const Dashboard = () => {
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const isOrganizer = user?.role === 'organizer'

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        let response
        const userId = user.id || user.username
        if (isOrganizer) {
          response = await api.get(`/events/organizer/${userId}`)
        } else {
          response = await api.get(`/events/participant/${userId}`)
        }
        
        // Sort events: ONGOING first
        const sortedEvents = response.data.sort((a, b) => {
          if (a.status === 'ONGOING' && b.status !== 'ONGOING') return -1;
          if (a.status !== 'ONGOING' && b.status === 'ONGOING') return 1;
          return 0;
        });
        
        setEvents(sortedEvents)
      } catch (err) {
        setError('Failed to fetch events')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchEvents()
    }
  }, [user, isOrganizer])

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard</h1>
        </div>
        {isOrganizer && (
          <Link to="/events/create">
            <Button className="bg-slate-900 shadow-lg shadow-slate-200">
              <Plus size={18} className="mr-2" />
              Create Event
            </Button>
          </Link>
        )}
      </div>

      <div className="mt-8">
        <SectionHeader 
          icon={Target} 
          title={isOrganizer ? 'My Managed Events' : 'My Registered Events'} 
          className="mb-6"
        />
        
        {loading ? (
          <Card className="flex h-60 flex-col items-center justify-center gap-4 border-dashed">
            <Loader2 className="animate-spin text-blue-600" size={40} />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Syncing Events</p>
          </Card>
        ) : error ? (
          <Card className="flex h-40 items-center justify-center border-rose-100 bg-rose-50 text-rose-600">
            <p className="font-bold">{error}</p>
          </Card>
        ) : events.length === 0 ? (
          <EmptyState 
            icon={Calendar} 
            message={isOrganizer ? "You haven't created any events yet." : "No events available at the moment."}
            description={isOrganizer ? "Start by creating your first hackathon or event." : "Check back later for new opportunities."}
          >
            {isOrganizer && (
              <Link to="/events/create" className="mt-6 block">
                <Button variant="outline" size="sm">Create your first event</Button>
              </Link>
            )}
          </EmptyState>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
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
                    Enter Event
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

export default Dashboard
