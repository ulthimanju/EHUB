import { Users, Cpu, Trophy, Github, ExternalLink, Loader2 } from 'lucide-react'
import SectionHeader from '../../components/SectionHeader'
import Badge from '../../components/Badge'
import Card from '../../components/Card'
import EmptyState from '../../components/EmptyState'

const OrganizerTeamsList = ({ teams, event, handleAiEvaluate, evaluatingTeamId, handleAiEvaluateEvent, isEvaluatingAll }) => (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <SectionHeader icon={Users} title={`Participating Teams (${teams.length})`} iconClassName="bg-indigo-50 text-indigo-600" className="mb-0" />
      <button
        onClick={handleAiEvaluateEvent}
        disabled={isEvaluatingAll}
        className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
      >
        <Cpu size={16} />
        {isEvaluatingAll ? 'Starting Background Job...' : 'Bulk AI Evaluation'}
      </button>
    </div>

    <div className="grid gap-4">
      {teams.map(team => (
        <Card key={team.id} className="p-6 hover:border-indigo-200 transition-all group">
          <div className="flex flex-col lg:flex-row justify-between gap-6">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <h4 className="text-lg font-bold text-slate-900">{team.name}</h4>
                <Badge variant="slate" size="sm">
                  #{team.shortCode}
                </Badge>
                {team.score !== null && (
                  <Badge variant="emerald" size="sm">
                    <Trophy size={12} className="mr-1" /> SCORE: {team.score}/100
                  </Badge>
                )}
                {team.problemStatementId && (
                  <Badge variant="purple" size="sm">
                    Problem #{event.problemStatements.findIndex(p => p.id === team.problemStatementId) + 1}
                  </Badge>
                )}
              </div>
              
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <Users size={14} className="text-slate-300" />
                  {team.members.filter(m => m.status === 'ACCEPTED').length} Members
                </div>
                {team.repoUrl ? (
                  <a href={team.repoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:underline">
                    <Github size={14} /> Repository
                  </a>
                ) : (
                  <span className="text-xs text-slate-300 italic">No repo submitted</span>
                )}
                {team.demoUrl && (
                  <a href={team.demoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:underline">
                    <ExternalLink size={14} /> Live Demo
                  </a>
                )}
              </div>

              <div className="flex -space-x-2">
                {team.members.filter(m => m.status === 'ACCEPTED').map(m => (
                  <div key={m.id} className="h-8 w-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 shadow-sm" title={m.username}>
                    {m.username?.[0].toUpperCase()}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col justify-center gap-2">
              <button 
                onClick={() => handleAiEvaluate(team.id)}
                disabled={!team.repoUrl || evaluatingTeamId !== null}
                className={`px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap shadow-sm
                  ${team.score !== null 
                    ? 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-400 hover:text-indigo-600' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50'}`}
              >
                {evaluatingTeamId === team.id ? <Loader2 size={14} className="animate-spin" /> : <Cpu size={14} />}
                {team.score !== null ? 'Re-Evaluate with AI' : 'Evaluate with AI'}
              </button>
            </div>
          </div>
        </Card>
      ))}
      {teams.length === 0 && (
        <EmptyState icon={Users} message="No teams have been formed yet" />
      )}
    </div>
  </div>
);

export default OrganizerTeamsList;
