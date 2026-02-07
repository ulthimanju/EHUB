import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import { cn } from '../utils/cn'
import Button from '../components/Button'
import Card from '../components/Card'
import Badge from '../components/Badge'
import SectionHeader from '../components/SectionHeader'
import EmptyState from '../components/EmptyState'
import Table from '../components/Table'
import { 
  Users, 
  Target, 
  Plus, 
  Search, 
  ArrowLeft, 
  LayoutDashboard, 
  FileText, 
  Check, 
  X, 
  Shield, 
  Edit, 
  Trash, 
  Globe,
  CheckCircle2,
  Loader2 
} from 'lucide-react'

// Sub-components
import OverviewSection from './event-details/OverviewSection'
import TeamDashboard from './event-details/TeamDashboard'
import OrganizerTeamsList from './event-details/OrganizerTeamsList'

const EventDetails = () => {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('Overview')
  
  const [registrations, setRegistrations] = useState([])
  const [isRegistered, setIsRegistered] = useState(false)
  const [registrationStatus, setRegistrationStatus] = useState(null)
  const [registering, setRegistering] = useState(false)
  
  const [teams, setTeams] = useState([])
  const [myTeam, setMyTeam] = useState(null)
  const [teamLoading, setTeamLoading] = useState(false)
  
  const [editingProblemId, setEditingProblemId] = useState(null)
  const [editProblemValue, setEditProblemValue] = useState('')
  const [submitForm, setSubmitForm] = useState({ repoUrl: '', demoUrl: '' })
  const [submitLoading, setSubmitLoading] = useState(false)
  const [evaluatingTeamId, setEvaluatingTeamId] = useState(null)
  const [isEditingSubmit, setIsEditingSubmit] = useState(false)
  const [isEvaluatingAll, setIsEvaluatingAll] = useState(false)
  const [finalizing, setFinalizing] = useState(false)

  const isOrganizer = event && user && (user.id === event.organizerId || user.username === event.organizerId)
  const isApprovedParticipant = registrationStatus === 'APPROVED'

  const formatDate = (dateString) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit'
    })
  }

  const handleAiEvaluateEvent = async () => {
    setIsEvaluatingAll(true);
    try {
      await api.post(`/ai/evaluate-event/${eventId}`);
      alert('Background evaluation started for all teams. Scores will be updated as they are calculated.');
    } catch (err) {
      console.error('Failed to start bulk evaluation:', err);
      alert('Failed to start evaluation.');
    } finally {
      setIsEvaluatingAll(false);
    }
  };

  const handleAiEvaluate = async (teamId) => {
    setEvaluatingTeamId(teamId)
    try {
      const res = await api.post(`/ai/evaluate/${teamId}`)
      alert(`AI Evaluation complete! Score: ${res.data}/100`)
      const teamsRes = await api.get(`/events/teams/${eventId}`)
      setTeams(teamsRes.data)
      if (myTeam && teamId === myTeam.id) {
        setMyTeam(teamsRes.data.find(t => t.id === teamId))
      }
    } catch (err) {
      alert(err.response?.data || 'AI Evaluation failed.')
    } finally {
      setEvaluatingTeamId(null)
    }
  }

  const handleFinalizeResults = async () => {
    if (!window.confirm('Are you sure you want to finalize results? This will end the judging phase and announce final scores.')) return
    setFinalizing(true)
    try {
      await api.patch(`/events/${eventId}/finalize-results?requesterId=${user.id || user.username}`)
      alert('Results finalized and announced!')
      const res = await api.get(`/events/${eventId}`)
      setEvent(res.data)
    } catch (err) {
      alert(err.response?.data || 'Failed to finalize results')
    } finally {
      setFinalizing(false)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventRes, regRes, teamsRes] = await Promise.all([
          api.get(`/events/${eventId}`),
          api.get(`/events/${eventId}/registrations`).catch(() => ({ data: [] })),
          api.get(`/events/teams/${eventId}`).catch(() => ({ data: [] }))
        ])
        
        setEvent(eventRes.data)
        setRegistrations(regRes.data)
        setTeams(teamsRes.data)
        
        if (user) {
          const myReg = regRes.data.find(r => r.userId === user.id || r.userId === user.username)
          if (myReg) {
            setIsRegistered(true)
            setRegistrationStatus(myReg.status)
          }

          const team = teamsRes.data.find(t => 
            t.members.some(m => (m.userId === user.id || m.userId === user.username) && m.status === 'ACCEPTED')
          )
          setMyTeam(team)
          if (team) {
            setSubmitForm({ repoUrl: team.repoUrl || '', demoUrl: team.demoUrl || '' })
          }
        }
      } catch (err) {
        setError('Failed to fetch details')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [eventId, user, registrationStatus])

  const handleCreateTeam = async (teamName) => {
    if (!teamName.trim()) return
    setTeamLoading(true)
    try {
      await api.post(`/events/teams/${eventId}`, {
        name: teamName, userId: user.id || user.username,
        username: user.username, userEmail: user.email
      })
      const teamsRes = await api.get(`/events/teams/${eventId}`)
      setTeams(teamsRes.data)
      setMyTeam(teamsRes.data.find(t => t.members.some(m => (m.userId === user.id || m.userId === user.username) && m.status === 'ACCEPTED')))
    } catch (err) {
      alert(err.response?.data || 'Failed to create team')
    } finally {
      setTeamLoading(false)
    }
  }

  const handleJoinRequest = async (teamId) => {
    try {
      await api.post(`/events/teams/${teamId}/request`, {
        userId: user.id || user.username, username: user.username, userEmail: user.email
      })
      alert('Join request sent!')
      const teamsRes = await api.get(`/events/teams/${eventId}`)
      setTeams(teamsRes.data)
    } catch (err) {
      alert(err.response?.data || 'Failed to send request')
    }
  }

  const handleRespondToInvite = async (teamId, accept, targetUserId = null) => {
    const finalUserId = targetUserId || (user.id || user.username)
    try {
      await api.patch(`/events/teams/${teamId}/respond?userId=${finalUserId}&accept=${accept}`)
      const teamsRes = await api.get(`/events/teams/${eventId}`)
      setTeams(teamsRes.data)
      setMyTeam(teamsRes.data.find(t => t.members.some(m => (m.userId === user.id || m.userId === user.username) && m.status === 'ACCEPTED')))
    } catch (err) {
      alert('Failed to respond to invitation')
    }
  }

  const handleDismantleTeam = async () => {
    if (!window.confirm('Are you sure you want to dismantle the team?')) return
    try {
      await api.delete(`/events/teams/${myTeam.id}?leaderId=${user.id || user.username}`)
      setMyTeam(null)
      const teamsRes = await api.get(`/events/teams/${eventId}`)
      setTeams(teamsRes.data)
    } catch (err) {
      alert('Failed to dismantle team')
    }
  }

  const handleLeaveTeam = async () => {
    if (!window.confirm('Are you sure you want to leave the team?')) return
    try {
      await api.delete(`/events/teams/${myTeam.id}/leave?userId=${user.id || user.username}`)
      setMyTeam(null)
      const teamsRes = await api.get(`/events/teams/${eventId}`)
      setTeams(teamsRes.data)
    } catch (err) {
      alert(err.response?.data || 'Failed to leave team')
    }
  }

  const handleTransferLeadership = async (newLeaderId) => {
    try {
      await api.patch(`/events/teams/${myTeam.id}/transfer?currentLeaderId=${user.id || user.username}&newLeaderId=${newLeaderId}`)
      const teamsRes = await api.get(`/events/teams/${eventId}`)
      setTeams(teamsRes.data)
      setMyTeam(teamsRes.data.find(t => t.id === myTeam.id))
    } catch (err) {
      alert('Failed to transfer leadership')
    }
  }

  const handleSelectProblem = async (problemId) => {
    try {
      await api.patch(`/events/teams/${myTeam.id}/problem-statement?leaderId=${user.id || user.username}&problemId=${problemId}`)
      const teamsRes = await api.get(`/events/teams/${eventId}`)
      setTeams(teamsRes.data)
      setMyTeam(teamsRes.data.find(t => t.id === myTeam.id))
      alert(problemId ? 'Challenge selected!' : 'Selection cleared')
    } catch (err) {
      alert(err.response?.data || 'Failed to select challenge')
    }
  }

  const handleSubmitProject = async (e) => {
    e.preventDefault()
    setSubmitLoading(true)
    try {
      await api.post(`/events/teams/${myTeam.id}/submit?userId=${user.id || user.username}`, submitForm)
      const teamsRes = await api.get(`/events/teams/${eventId}`)
      setTeams(teamsRes.data)
      setMyTeam(teamsRes.data.find(t => t.id === myTeam.id))
      alert('Project submitted successfully!')
      setIsEditingSubmit(false)
    } catch (err) {
      alert(err.response?.data || 'Failed to submit project')
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleInviteMember = async (teamId, targetUser) => {
    try {
      await api.post(`/events/teams/${teamId}/invite?leaderId=${user.id || user.username}`, {
        userId: targetUser.userId, username: targetUser.username, userEmail: targetUser.userEmail
      })
      alert('Invitation sent!')
      const teamsRes = await api.get(`/events/teams/${eventId}`)
      setTeams(teamsRes.data)
    } catch (err) {
      alert(err.response?.data || 'Failed to send invitation')
    }
  }

  const handleRegister = async () => {
    if (!user) { navigate('/login'); return }
    setRegistering(true)
    try {
      await api.post(`/events/${eventId}/register`, {
        userId: user.id || user.username, username: user.username, userEmail: user.email
      })
      setIsRegistered(true); setRegistrationStatus('PENDING');
      const regRes = await api.get(`/events/${eventId}/registrations`); setRegistrations(regRes.data);
    } catch (err) {
      alert(err.response?.data || 'Failed to register')
    } finally {
      setRegistering(false)
    }
  }

  const handleStatusUpdate = async (registrationId, status) => {
    try {
      await api.patch(`/events/registrations/${registrationId}/status?status=${status}&requesterId=${user.id || user.username}`)
      setRegistrations(prev => prev.map(r => r.id === registrationId ? { ...r, status } : r))
    } catch (err) { alert(err.response?.data || 'Failed to update status') }
  }

  const handleDeleteProblem = async (problemId) => {
    if (!window.confirm('Delete this problem statement?')) return
    try {
      await api.delete(`/events/problemstatements/${problemId}?requesterId=${user.id || user.username}`)
      const eventRes = await api.get(`/events/${eventId}`); setEvent(eventRes.data)
    } catch (err) { alert(err.response?.data || 'Failed to delete') }
  }

  const handleUpdateProblem = async (problemId) => {
    if (!editProblemValue.trim()) return
    try {
      await api.put(`/events/problemstatements/${problemId}?requesterId=${user.id || user.username}`, { statement: editProblemValue })
      setEditingProblemId(null)
      const eventRes = await api.get(`/events/${eventId}`); setEvent(eventRes.data)
    } catch (err) { alert(err.response?.data || 'Failed to update') }
  }

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-blue-600" size={48} />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Workspace</p>
      </div>
    </div>
  )

  if (error || !event) return (
    <div className="mx-auto max-w-7xl px-4 py-20 text-center bg-[#F8FAFC] h-screen">
      <Card className="max-w-xl mx-auto p-12 border-rose-100">
        <X className="mx-auto text-rose-500 mb-4" size={48} />
        <p className="text-xl font-bold text-slate-900">{error || 'Event not found'}</p>
        <Button onClick={() => navigate('/')} className="mt-6 bg-slate-900">Return Home</Button>
      </Card>
    </div>
  )

  const showResults = event && !event.judging && (event.status === 'RESULTS_ANNOUNCED' || event.status === 'COMPLETED')

  const mainTabs = [
    { name: 'Overview', icon: LayoutDashboard },
    { name: 'Problem Statements', icon: FileText },
    { name: 'Teams', icon: Users },
    ...(showResults ? [{ name: 'Results', icon: Trophy }] : []),
    ...(user?.role !== 'participant' ? [{ name: 'Participants', icon: Users }] : []),
    ...(isOrganizer ? [{ name: 'Registrations', icon: Shield }] : [])
  ]

  const sortedResults = [...teams].sort((a, b) => {
    // Sort by score descending
    if ((b.score || 0) !== (a.score || 0)) {
      return (b.score || 0) - (a.score || 0);
    }
    // If scores are equal, sort by submission time ascending (earlier is better)
    const timeA = a.submissionTime ? new Date(a.submissionTime).getTime() : Infinity;
    const timeB = b.submissionTime ? new Date(b.submissionTime).getTime() : Infinity;
    return timeA - timeB;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-blue-100 pb-20">
      <div className="max-w-6xl mx-auto px-6 py-8 md:py-12">
        <div className="mb-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors text-xs font-medium">
            <ArrowLeft size={14} /> Back
          </button>
        </div>

        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">{event.name}</h1>
              <span className="text-slate-200 text-2xl font-light">#</span>
              <Badge 
                variant={
                  event.status === 'ONGOING' ? 'emerald' : 
                  event.status === 'REGISTRATION_OPEN' ? 'blue' : 'slate'
                }
                size="sm"
              >
                {event.status === 'ONGOING' && <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse mr-1.5" />}
                {event.status.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-slate-500 text-sm font-medium">{event.theme}</p>
          </div>
          
          <div className="flex gap-3">
            {isOrganizer ? (
              <>
                {event.status === 'JUDGING' && (
                  <Button 
                    onClick={handleFinalizeResults} 
                    disabled={finalizing}
                    className="bg-emerald-600 hover:bg-emerald-700 gap-2"
                  >
                    <CheckCircle2 size={18} />
                    {finalizing ? 'Finalizing...' : 'Finalize Results'}
                  </Button>
                )}
                <Link to={`/events/${eventId}/edit`}>
                  <Button className="bg-slate-900 gap-2">
                    <Edit size={18} /> Manage Event
                  </Button>
                </Link>
              </>
            ) : (
              <Button 
                onClick={handleRegister}
                disabled={isRegistered || registering}
                className={cn(
                  'shadow-lg gap-2',
                  registrationStatus === 'APPROVED' ? 'bg-emerald-500 shadow-emerald-200' :
                  registrationStatus === 'PENDING' ? 'bg-amber-500 shadow-amber-200' :
                  registrationStatus === 'REJECTED' ? 'bg-rose-500 shadow-rose-200' :
                  'bg-blue-600 shadow-blue-200 hover:bg-blue-700'
                )}
              >
                {registrationStatus === 'APPROVED' && <Check size={18} strokeWidth={3} />}
                {registrationStatus === 'APPROVED' ? 'Approved' :
                 registrationStatus === 'PENDING' ? 'Registration Pending' :
                 registrationStatus === 'REJECTED' ? 'Registration Rejected' :
                 'Register Now'}
              </Button>
            )}
          </div>
        </header>

        <div className="border-b border-slate-200 mb-8">
          <nav className="flex gap-8">
            {mainTabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`flex items-center gap-2 py-4 text-sm font-bold transition-all relative whitespace-nowrap
                  ${activeTab === tab.name ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <tab.icon size={16} strokeWidth={activeTab === tab.name ? 2.5 : 2} />
                {tab.name}
                {activeTab === tab.name && (
                  <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="min-h-[60vh]">
          {activeTab === 'Overview' && <OverviewSection event={event} formatDate={formatDate} />}
          
          {activeTab === 'Teams' && (
            isOrganizer ? (
              <OrganizerTeamsList 
                teams={teams} 
                event={event} 
                handleAiEvaluate={handleAiEvaluate}
                evaluatingTeamId={evaluatingTeamId}
                handleAiEvaluateEvent={handleAiEvaluateEvent}
                isEvaluatingAll={isEvaluatingAll}
              />
            ) : !isApprovedParticipant ? (
              <Card className="p-12 text-center">
                <Shield size={48} className="mx-auto text-slate-200 mb-4" />
                <h3 className="text-lg font-bold text-slate-900">Access Restricted</h3>
                <p className="text-slate-500 max-w-sm mx-auto mt-2">You need an approved registration to join or create teams for this event.</p>
              </Card>
            ) : myTeam ? (
              <TeamDashboard 
                myTeam={myTeam}
                user={user}
                event={event}
                handleDismantleTeam={handleDismantleTeam}
                handleLeaveTeam={handleLeaveTeam}
                handleTransferLeadership={handleTransferLeadership}
                handleSelectProblem={handleSelectProblem}
                handleSubmitProject={handleSubmitProject}
                submitForm={submitForm}
                setSubmitForm={setSubmitForm}
                submitLoading={submitLoading}
                isEditingSubmit={isEditingSubmit}
                setIsEditingSubmit={setIsEditingSubmit}
                handleRespondToInvite={handleRespondToInvite}
                handleInviteMember={handleInviteMember}
                registrations={registrations}
                teams={teams}
              />
            ) : (
              <div className="grid md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <Card className="p-10 text-center flex flex-col items-center justify-center hover:border-blue-200 transition-all">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6"><Plus size={32} /></div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Build a Team</h3>
                  <p className="text-sm text-slate-500 mb-8 max-w-xs">Be the leader! Form a new team and invite other participants.</p>
                  <div className="w-full max-w-xs space-y-4">
                    <input id="team-name" placeholder="Enter Team Name" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400" />
                    <Button onClick={() => handleCreateTeam(document.getElementById('team-name').value)} disabled={teamLoading} className="w-full bg-slate-900">
                      {teamLoading ? 'Creating...' : 'Create Team'}
                    </Button>
                  </div>
                </Card>

                <Card className="p-10 flex flex-col">
                  <SectionHeader icon={Users} title="Find a Team" />
                  <Card variant="blue" className="mb-8 p-5">
                    <p className="text-[10px] font-bold text-blue-700 uppercase tracking-widest mb-3">Join by Access Code</p>
                    <div className="flex gap-2">
                      <input id="team-code" placeholder="e.g. #FTMW5RY" className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-400" />
                      <Button onClick={() => {
                        const code = document.getElementById('team-code').value.replace('#', '')
                        api.get(`/events/teams/code/${code}`).then(res => handleJoinRequest(res.data.id)).catch(() => alert('Invalid Code'))
                      }} size="sm" className="bg-blue-600">Join</Button>
                    </div>
                  </Card>
                  <div className="space-y-4 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                    {teams.map(team => {
                      const membership = team.members.find(m => m.userId === (user.id || user.username));
                      const isMember = !!membership;
                      const hasRequested = membership?.status === 'REQUESTED';
                      const hasBeenInvited = membership?.status === 'INVITED';

                      return (
                        <div key={team.id} className="p-4 border border-slate-100 rounded-xl flex items-center justify-between group hover:border-blue-200 transition-all">
                          <div>
                            <p className="text-sm font-bold text-slate-800">{team.name}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{team.members.filter(m => m.status === 'ACCEPTED').length} / {event.teamSize || '∞'} Members</p>
                          </div>
                          {isMember ? (
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={hasRequested ? "amber" : hasBeenInvited ? "blue" : "emerald"} 
                                size="xs"
                              >
                                {hasRequested ? "Requested" : hasBeenInvited ? "Invited" : "Member"}
                              </Badge>
                              {hasBeenInvited && (
                                <div className="flex gap-1 ml-2">
                                  <button 
                                    onClick={() => handleRespondToInvite(team.id, true)}
                                    className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                                    title="Accept Invitation"
                                  >
                                    <Check size={14} strokeWidth={3} />
                                  </button>
                                  <button 
                                    onClick={() => handleRespondToInvite(team.id, false)}
                                    className="p-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors"
                                    title="Decline Invitation"
                                  >
                                    <X size={14} strokeWidth={3} />
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <button onClick={() => handleJoinRequest(team.id)} className="text-xs font-bold text-blue-600 hover:underline">Request to Join</button>
                          )}
                        </div>
                      );
                    })}
                    {teams.length === 0 && <p className="text-center text-slate-300 italic py-10 text-sm">No teams found</p>}
                  </div>
                </Card>
              </div>
            )
          )}

          {activeTab === 'Problem Statements' && (
            <Card className="overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                <SectionHeader icon={Target} title="Challenges" className="mb-0" />
                {isOrganizer && (
                  <Link to={`/events/${eventId}/add-problem`}>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Plus size={14} /> Add Challenge
                    </Button>
                  </Link>
                )}
              </div>
              <Table 
                headers={[
                  { label: 'Index', className: 'w-24' },
                  { label: 'Problem Statement' },
                  ...(isOrganizer ? [{ label: 'Actions', className: 'text-right' }] : [])
                ]}
              >
                {event.problemStatements?.map((ps, idx) => (
                  <tr key={ps.id} className="group hover:bg-slate-50/30">
                    <td className="px-8 py-6">
                      <Badge variant="slate" size="xs">#{idx + 1}</Badge>
                    </td>
                    <td className="px-8 py-6">
                      {editingProblemId === ps.id ? (
                        <div className="flex gap-2">
                          <input 
                            className="flex-1 px-3 py-1 border rounded-lg text-sm outline-none focus:border-blue-400" 
                            value={editProblemValue} 
                            onChange={(e)=>setEditProblemValue(e.target.value)} 
                          />
                          <button onClick={()=>handleUpdateProblem(ps.id)} className="text-emerald-500"><Check size={16}/></button>
                          <button onClick={()=>setEditingProblemId(null)} className="text-rose-500"><X size={16}/></button>
                        </div>
                      ) : (
                        <p className="text-sm font-semibold text-slate-700 leading-relaxed capitalize">{ps.statement}</p>
                      )}
                    </td>
                    {isOrganizer && (
                      <td className="px-8 py-6 text-right space-x-2">
                         <button onClick={()=>{setEditingProblemId(ps.id); setEditProblemValue(ps.statement)}} className="text-slate-300 hover:text-blue-500 p-1 transition-colors"><Edit size={16}/></button>
                         <button onClick={()=>handleDeleteProblem(ps.id)} className="text-slate-300 hover:text-rose-500 p-1 transition-colors"><Trash size={16}/></button>
                      </td>
                    )}
                  </tr>
                ))}
                {event.problemStatements?.length === 0 && (
                  <tr><td colSpan={isOrganizer ? 3 : 2} className="px-8 py-20 text-center text-slate-400 italic">No challenges defined yet</td></tr>
                )}
              </Table>
            </Card>
          )}

          {activeTab === 'Results' && (
            <Card className="overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <SectionHeader icon={Trophy} title="Final Rankings" className="mb-0" iconClassName="bg-amber-50 text-amber-600" />
                <Badge variant="emerald" size="sm">Judging Complete</Badge>
              </div>
              <Table 
                headers={[
                  { label: 'Rank', className: 'w-24' },
                  { label: 'Team' },
                  { label: 'Submission Time' },
                  { label: 'Final Score', className: 'text-right' }
                ]}
              >
                {sortedResults.map((team, idx) => (
                  <tr key={team.id} className={cn(
                    "group transition-colors",
                    idx === 0 ? "bg-amber-50/30 hover:bg-amber-50/50" : "hover:bg-slate-50/30"
                  )}>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        {idx === 0 && <Trophy size={16} className="text-amber-500" />}
                        <span className={cn(
                          "text-sm font-black",
                          idx === 0 ? "text-amber-600" : "text-slate-400"
                        )}>#{idx + 1}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{team.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">#{team.shortCode}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-xs text-slate-500 font-medium">
                      {team.submissionTime ? new Date(team.submissionTime).toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <Badge variant={idx === 0 ? "amber" : "blue"} size="md">
                        {team.score || 0} / 100
                      </Badge>
                    </td>
                  </tr>
                ))}
                {teams.length === 0 && (
                  <tr><td colSpan="4" className="px-8 py-20 text-center text-slate-400 italic">No results data available</td></tr>
                )}
              </Table>
            </Card>
          )}

          {activeTab === 'Participants' && (
            <Card className="overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="p-8 border-b border-slate-100">
                <SectionHeader icon={Users} title="Community" className="mb-0" />
              </div>
              <div className="p-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {registrations.filter(r => r.status === 'APPROVED').map(r => (
                  <Card key={r.id} variant="slate" className="p-4 flex items-center gap-4 hover:border-blue-200 transition-all group">
                    <div className="h-12 w-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-blue-600 font-bold group-hover:scale-110 transition-transform">
                      {r.username?.[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{r.username}</p>
                      <p className="text-[10px] text-slate-400 font-medium">Joined {new Date(r.registrationTime).toLocaleDateString()}</p>
                    </div>
                  </Card>
                ))}
                {registrations.filter(r => r.status === 'APPROVED').length === 0 && (
                  <div className="col-span-full py-20 text-center">
                    <EmptyState icon={Users} message="No approved participants yet" />
                  </div>
                )}
              </div>
            </Card>
          )}

          {activeTab === 'Registrations' && isOrganizer && (
            <Card className="overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="p-8 border-b border-slate-100">
                <SectionHeader icon={Shield} title="Access Requests" className="mb-0" />
              </div>
              <Table 
                headers={[
                  { label: 'Participant' },
                  { label: 'Email' },
                  { label: 'Status' },
                  { label: 'Actions', className: 'text-right' }
                ]}
              >
                {registrations.map(r => (
                  <tr key={r.id} className="group hover:bg-slate-50/30">
                    <td className="px-8 py-6 font-bold text-slate-700">{r.username}</td>
                    <td className="px-8 py-6 text-sm text-slate-500">{r.userEmail}</td>
                    <td className="px-8 py-6">
                       <Badge 
                         variant={
                           r.status === 'APPROVED' ? 'emerald' : 
                           r.status === 'REJECTED' ? 'rose' : 'amber'
                         }
                         size="xs"
                       >
                         {r.status}
                       </Badge>
                    </td>
                    <td className="px-8 py-6 text-right">
                      {r.status === 'PENDING' && (
                        <div className="flex justify-end gap-2">
                          <button onClick={()=>handleStatusUpdate(r.id, 'APPROVED')} className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors"><Check size={18}/></button>
                          <button onClick={()=>handleStatusUpdate(r.id, 'REJECTED')} className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors"><X size={18}/></button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {registrations.length === 0 && (
                  <tr><td colSpan="4" className="px-8 py-20 text-center">
                    <EmptyState icon={Shield} message="No registrations found" />
                  </td></tr>
                )}
              </Table>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default EventDetails
