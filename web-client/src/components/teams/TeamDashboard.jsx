import { useState, useEffect } from 'react';
import { teamService } from '../../api/services/teamService';
import { UserPlus, Users, Copy } from 'lucide-react';
import CreateTeamModal from './CreateTeamModal';
import JoinTeamModal from './JoinTeamModal';
import SubmissionComponent from './SubmissionComponent';

export default function TeamDashboard({ eventId, currentUser, onTeamUpdate }) {
    const [myTeamData, setMyTeamData] = useState(null); // The Team object
    const [currentUserMember, setCurrentUserMember] = useState(null); // My membership
    const [teamMembers, setTeamMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [showJoin, setShowJoin] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');

    useEffect(() => {
        loadTeamStatus();
    }, [eventId]);

    const loadTeamStatus = async () => {
        try {
            const teamsRes = await teamService.getMyTeams();
            const memberships = teamsRes.data || teamsRes;

            // Find membership for this event
            const membership = memberships.find(m =>
                m.team?.event?.id == eventId ||
                m.team?.hackathonId == eventId ||
                m.eventId == eventId
            );

            if (membership) {
                setCurrentUserMember(membership);
                setMyTeamData(membership.team);

                // Fetch all members for this team
                const membersRes = await teamService.getTeamMembers(membership.team.id);
                setTeamMembers(membersRes.data || membersRes);
            } else {
                setMyTeamData(null);
                setCurrentUserMember(null);
                setTeamMembers([]);
            }
        } catch (err) {
            console.error("Failed to load teams", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (memberId, action) => {
        try {
            if (action === 'approve') await teamService.approveRequest(memberId);
            else await teamService.rejectRequest(memberId);
            loadTeamStatus(); // Refresh
        } catch (err) {
            alert("Action failed");
        }
    };

    const handleInvite = async (e) => {
        e.preventDefault();
        try {
            await teamService.inviteUser(myTeamData.id, inviteEmail);
            alert("Invite sent!");
            setInviteEmail('');
        } catch (err) {
            alert("Failed to send invite");
        }
    };

    const copyCode = () => {
        navigator.clipboard.writeText(myTeamData.teamCode);
        alert("Team code copied!");
    };

    if (loading) return <div>Loading team status...</div>;

    if (!myTeamData) {
        return (
            <div className="glass" style={{ padding: '2rem', borderRadius: '12px', textAlign: 'center' }}>
                <h3 style={{ marginBottom: '1rem' }}>Participation</h3>
                <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
                    You need to be part of a team to submit a project.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button onClick={() => setShowCreate(true)} className="btn-primary">Create Team</button>
                    <button onClick={() => setShowJoin(true)} className="btn-secondary">Join Team</button>
                </div>

                <CreateTeamModal
                    isOpen={showCreate}
                    onClose={() => setShowCreate(false)}
                    hackathonId={eventId}
                    onTeamCreated={() => loadTeamStatus()}
                />
                <JoinTeamModal
                    isOpen={showJoin}
                    onClose={() => setShowJoin(false)}
                    onTeamJoined={() => loadTeamStatus()}
                />
            </div>
        );
    }

    const pendingMembers = teamMembers.filter(m => !m.details && (m.status === 'PENDING' || !m.approved)); // Adjust based on actual backend field structure
    // Note: Assuming 'approved' is false or status is PENDING.
    // We need to inspect actual data. Since we can't run, we code defensively.
    // Based on TeamController logic: approveRequest sets approved=true. 
    // So pending is !m.approved.
    const activeMembers = teamMembers.filter(m => m.approved);
    const pendingRequests = teamMembers.filter(m => !m.approved);

    const isLeader = myTeamData.leaderId === currentUser?.profile?.sub || currentUserMember?.role === 'LEADER';

    return (
        <div className="glass" style={{ padding: '2rem', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
                <div>
                    <h3 style={{ fontSize: '1.5rem' }}>{myTeamData.teamName}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', color: 'var(--text-accent)', cursor: 'pointer' }} onClick={copyCode}>
                        <span style={{ fontFamily: 'monospace', background: 'rgba(0,0,0,0.3)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                            {myTeamData.teamCode}
                        </span>
                        <Copy size={14} />
                    </div>
                </div>
                {isLeader && (
                    <div className="badge" style={{ background: 'var(--primary)', padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.8rem' }}>
                        Team Leader
                    </div>
                )}
            </div>

            <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={18} /> Members
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
                {activeMembers.map(m => (
                    <div key={m.id} style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {m.user?.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                        {m.user?.username || 'User'}
                    </div>
                ))}
            </div>

            {isLeader && pendingRequests.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                    <h4 style={{ marginBottom: '1rem', color: 'var(--accent)' }}>Pending Requests</h4>
                    {pendingRequests.map(m => (
                        <div key={m.id} style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>{m.user?.username || 'User'}</span>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={() => handleAction(m.id, 'approve')} className="btn-primary-sm" style={{ padding: '0.25rem 0.5rem' }}>Approve</button>
                                <button onClick={() => handleAction(m.id, 'reject')} className="btn-secondary-sm" style={{ padding: '0.25rem 0.5rem' }}>Reject</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <SubmissionComponent teamId={myTeamData.id} />

            <form onSubmit={handleInvite} style={{ marginTop: '2rem' }}>
                <label style={{ fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>Invite Teammates</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                        placeholder="teammate@example.com"
                        value={inviteEmail}
                        onChange={e => setInviteEmail(e.target.value)}
                        style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                    />
                    <button type="submit" className="btn-secondary-sm"><UserPlus size={16} /></button>
                </div>
            </form>
        </div>
    );
}
