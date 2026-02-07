import { useState } from 'react'
import { Users, Target, Send, Mail, UserPlus, Trash2, LogOut, Copy, Trophy, Crown, Shield, ExternalLink, Link2, Edit, Info, Plus, Search, Check, X, Globe } from 'lucide-react'
import Card from '../../components/Card'
import SectionHeader from '../../components/SectionHeader'
import Badge from '../../components/Badge'
import api from '../../api/axios'

const TeamDashboard = ({ 
  myTeam, 
  user, 
  event, 
  handleDismantleTeam, 
  handleLeaveTeam, 
  handleTransferLeadership,
  handleSelectProblem,
  handleSubmitProject,
  submitForm,
  setSubmitForm,
  submitLoading,
  isEditingSubmit,
  setIsEditingSubmit,
  handleRespondToInvite,
  handleInviteMember,
  registrations,
  teams
}) => {
  const [innerTab, setInnerTab] = useState('members');

  const innerTabs = [
    { id: 'members', label: 'Team Members', icon: Users },
    { id: 'problem', label: 'Challenge', icon: Target },
    ...(myTeam.leaderId === (user.id || user.username) ? [
      { id: 'submit', label: 'Submit Project', icon: Send },
      { id: 'pending', label: 'Invites & Requests', icon: Mail },
      { id: 'recruit', label: 'Recruit', icon: UserPlus }
    ] : [])
  ];

  const activeProblem = event.problemStatements?.find(p => p.id === myTeam.problemStatementId);

  return (
    <Card className="overflow-hidden flex flex-col min-h-[500px] animate-in fade-in duration-500">
      <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900">{myTeam.name}</h2>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(myTeam.shortCode)
                alert('Team code copied!')
              }}
              className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border border-blue-100 flex items-center gap-1.5 hover:bg-blue-100 transition-colors"
            >
              #{myTeam.shortCode}
              <Copy size={10} />
            </button>
            {myTeam.score !== null && (
              <Badge variant="emerald" size="sm">
                <Trophy size={10} className="mr-1" /> {myTeam.score}/100
              </Badge>
            )}
          </div>
          <p className="text-[11px] text-slate-400 font-mono tracking-tight mt-1">Team ID: {myTeam.id.substring(0, 8)}</p>
        </div>
        {myTeam.leaderId === (user.id || user.username) ? (
          <button 
            onClick={handleDismantleTeam}
            className="flex items-center gap-2 px-4 py-2 border border-rose-200 text-rose-500 hover:bg-rose-50 rounded-xl text-xs font-bold transition-all"
          >
            <Trash2 size={14} />
            Dismantle Team
          </button>
        ) : (
          <button 
            onClick={handleLeaveTeam}
            className="flex items-center gap-2 px-4 py-2 border border-orange-200 text-orange-500 hover:bg-orange-50 rounded-xl text-xs font-bold transition-all"
          >
            <LogOut size={14} />
            Leave Team
          </button>
        )}
      </div>

      <nav className="flex bg-slate-50/50 border-b border-slate-200">
        {innerTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setInnerTab(tab.id)}
            className={`flex items-center justify-center gap-2 px-1 py-4 text-[10px] sm:text-xs font-semibold transition-all relative flex-1 whitespace-nowrap
              ${innerTab === tab.id ? 'text-blue-600 bg-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <tab.icon size={14} strokeWidth={innerTab === tab.id ? 2.5 : 2} className="shrink-0" />
            <span className="truncate hidden sm:inline">{tab.label}</span>
            <span className="truncate sm:hidden">{tab.label.split(' ')[0]}</span>
            {innerTab === tab.id && <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-blue-500 z-10" />}
          </button>
        ))}
      </nav>

      <div className="p-8 md:p-10">
        {innerTab === 'members' && (
          <div className="space-y-6">
            <SectionHeader icon={Users} title="Current Members" />
            <div className="grid md:grid-cols-2 gap-4">
              {myTeam.members.filter(m => m.status === 'ACCEPTED').map((m, i) => (
                <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center relative group hover:border-blue-200 transition-colors">
                  {m.role === 'LEADER' && <div className="absolute top-3 right-3 text-amber-400"><Crown size={16} fill="currentColor" fillOpacity={0.2} /></div>}
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mr-4">
                    {m.username?.[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{m.username}</p>
                    <p className="text-xs text-slate-400">{m.userEmail}</p>
                  </div>
                  {myTeam.leaderId === (user.id || user.username) && m.userId !== (user.id || user.username) && (
                    <button 
                      onClick={() => handleTransferLeadership(m.userId)}
                      className="ml-auto px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all text-[10px] font-black uppercase tracking-widest border border-blue-100"
                    >
                      Make Leader
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {innerTab === 'problem' && (
          <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-2 duration-500">
            <SectionHeader icon={Target} title="Challenge Selection" />
            {activeProblem ? (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 space-y-4">
                 <Badge variant="blue" size="sm">
                   Problem #{event.problemStatements.findIndex(p => p.id === activeProblem.id) + 1}
                 </Badge>
                 <p className="text-lg font-medium text-slate-700 leading-relaxed capitalize">{activeProblem.statement}</p>
                 {myTeam.leaderId === (user.id || user.username) && (
                    <button 
                      onClick={() => handleSelectProblem(null)}
                      className="mt-4 text-xs font-bold text-blue-600 hover:underline"
                    >
                      Change Selection
                    </button>
                 )}
              </div>
            ) : (
              <div className="grid gap-4">
                {event.problemStatements?.map((ps, i) => (
                  <div key={ps.id} className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-blue-200 transition-colors">
                    <div className="flex-1">
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Problem #{i + 1}</span>
                      <p className="text-sm font-semibold text-slate-700 mt-1 line-clamp-2">{ps.statement}</p>
                    </div>
                    {myTeam.leaderId === (user.id || user.username) && (
                      <button 
                        onClick={() => handleSelectProblem(ps.id)}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold hover:border-blue-400 transition-all"
                      >
                        Select Challenge
                      </button>
                    )}
                  </div>
                ))}
                {event.problemStatements?.length === 0 && (
                  <p className="text-slate-400 italic text-center py-8">No challenges available yet.</p>
                )}
              </div>
            )}
          </div>
        )}

        {innerTab === 'submit' && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {(!myTeam.repoUrl || isEditingSubmit) ? (
                <form onSubmit={handleSubmitProject} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Repository URL</label>
                      <input 
                        required
                        disabled={myTeam.leaderId !== (user.id || user.username)}
                        placeholder="https://github.com/..."
                        value={submitForm.repoUrl} 
                        onChange={(e)=>setSubmitForm({...submitForm, repoUrl: e.target.value})} 
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 focus:bg-white transition-all text-sm text-slate-700" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Live Demo (Optional)</label>
                      <input 
                        disabled={myTeam.leaderId !== (user.id || user.username)}
                        placeholder="https://..."
                        value={submitForm.demoUrl} 
                        onChange={(e)=>setSubmitForm({...submitForm, demoUrl: e.target.value})} 
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 focus:bg-white transition-all text-sm text-slate-700" 
                      />
                    </div>
                  </div>
                  {myTeam.leaderId === (user.id || user.username) && (
                    <div className="flex gap-3">
                      <button 
                        type="submit"
                        disabled={submitLoading}
                        className="px-8 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all disabled:opacity-50"
                      >
                        {submitLoading ? 'Saving...' : 'Save Submission'}
                      </button>
                      {myTeam.repoUrl && (
                        <button 
                          type="button"
                          onClick={() => setIsEditingSubmit(false)}
                          className="px-8 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  )}
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Active Submission</h3>
                    {myTeam.leaderId === (user.id || user.username) && (
                      <button 
                        onClick={() => setIsEditingSubmit(true)}
                        className="text-xs font-bold text-blue-600 flex items-center gap-1.5 hover:underline"
                      >
                        <Edit size={14} /> Update Links
                      </button>
                    )}
                  </div>
                  <div className="grid gap-4">
                    <a href={myTeam.repoUrl} target="_blank" rel="noopener noreferrer" className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between group hover:border-blue-200 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Link2 size={16} /></div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Repository</p>
                          <p className="text-sm font-semibold text-slate-700 truncate max-w-md">{myTeam.repoUrl}</p>
                        </div>
                      </div>
                      <ExternalLink size={14} className="text-slate-300 group-hover:text-blue-500" />
                    </a>
                    {myTeam.demoUrl && (
                      <a href={myTeam.demoUrl} target="_blank" rel="noopener noreferrer" className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between group hover:border-blue-200 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><Globe size={16} /></div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Live Demo</p>
                            <p className="text-sm font-semibold text-slate-700 truncate max-w-md">{myTeam.demoUrl}</p>
                          </div>
                        </div>
                        <ExternalLink size={14} className="text-slate-300 group-hover:text-blue-500" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
            <Card variant="blue" className="p-6 h-fit self-start">
               <p className="text-[10px] font-bold text-blue-700 uppercase tracking-widest mb-3 flex items-center gap-2"><Info size={14}/> Submission Guide</p>
               <ul className="text-xs text-blue-600 leading-relaxed font-medium space-y-2">
                 <li>• Ensure your repository is public.</li>
                 <li>• Evaluation updates in real-time.</li>
                 <li>• Double-check your links before judging begins.</li>
               </ul>
            </Card>
          </div>
        )}
        
        {innerTab === 'pending' && (
          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100 text-[9px] uppercase tracking-widest font-bold text-slate-400">
                <tr>
                  <th className="px-8 py-4">Participant</th>
                  <th className="px-4 py-4">Type</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {myTeam.members.filter(m => m.status !== 'ACCEPTED').map(m => (
                  <tr key={m.id} className="text-sm group hover:bg-slate-50/50">
                    <td className="px-8 py-5">
                      <p className="font-bold text-slate-700">{m.username}</p>
                      <p className="text-xs text-slate-400">{m.userEmail}</p>
                    </td>
                    <td className="px-4 py-5">
                      <Badge variant={m.status === 'INVITED' ? 'blue' : 'amber'} size="sm">
                        {m.status}
                      </Badge>
                    </td>
                    <td className="px-8 py-5 text-right space-x-2">
                      {m.status === 'REQUESTED' && (
                        <>
                          <button onClick={()=>handleRespondToInvite(myTeam.id, true, m.userId)} className="p-2 text-emerald-400 hover:bg-emerald-50 rounded-lg transition-all" title="Accept"><Check size={18}/></button>
                          <button onClick={()=>handleRespondToInvite(myTeam.id, false, m.userId)} className="p-2 text-rose-400 hover:bg-rose-50 rounded-lg transition-all" title="Reject"><X size={18}/></button>
                        </>
                      )}
                      {m.status === 'INVITED' && (
                        <button onClick={()=>handleRespondToInvite(myTeam.id, false, m.userId)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition-all" title="Cancel"><Trash2 size={18}/></button>
                      )}
                    </td>
                  </tr>
                ))}
                {myTeam.members.filter(m => m.status !== 'ACCEPTED').length === 0 && (
                  <tr><td colSpan="3" className="px-8 py-10 text-center text-slate-400 italic">No pending requests or invites</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {innerTab === 'recruit' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
               <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Available Talent</h3>
               <div className="relative w-full md:w-64">
                 <Search className="absolute left-3 top-2.5 text-slate-300" size={14}/>
                 <input placeholder="Search participants..." className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-400" />
               </div>
            </div>
            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100 text-[9px] uppercase tracking-widest font-bold text-slate-400">
                  <tr><th className="px-8 py-4">Username</th><th className="px-8 py-4 text-right">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {registrations
                    .filter(r => r.status === 'APPROVED' && r.userId !== (user.id || user.username) && !teams.some(t => t.members.some(m => m.userId === r.userId && m.status === 'ACCEPTED')))
                    .map(r => (
                    <tr key={r.id} className="text-sm group hover:bg-slate-50/50">
                      <td className="px-8 py-5">
                        <p className="font-bold text-slate-700">{r.username}</p>
                        <p className="text-xs text-slate-400">{r.userEmail}</p>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button 
                          onClick={()=>handleInviteMember(myTeam.id, r)} 
                          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold hover:border-blue-400 hover:text-blue-600 transition-all"
                        >
                          <Plus size={14}/> Invite
                        </button>
                      </td>
                    </tr>
                  ))}
                  {registrations.filter(r => r.status === 'APPROVED' && r.userId !== (user.id || user.username) && !teams.some(t => t.members.some(m => m.userId === r.userId && m.status === 'ACCEPTED'))).length === 0 && (
                    <tr><td colSpan="2" className="px-8 py-10 text-center text-slate-400 italic">No available participants found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default TeamDashboard;
