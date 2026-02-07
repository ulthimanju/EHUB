import { Clock, Calendar, MapPin, Users, Mail, Globe, Trophy, ListChecks, CheckCircle2, Info } from 'lucide-react'
import Card from '../../components/Card'
import SectionHeader from '../../components/SectionHeader'

const OverviewSection = ({ event, formatDate }) => {
  const logistics = [
    { label: "Start Date", value: formatDate(event.startDate), icon: Clock, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "End Date", value: formatDate(event.endDate), icon: Clock, color: "text-rose-500", bg: "bg-rose-50" },
    { label: "Registration Opens", value: formatDate(event.registrationStartDate) || 'TBA', icon: Calendar, color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "Registration Closes", value: formatDate(event.registrationEndDate) || 'TBA', icon: Calendar, color: "text-orange-500", bg: "bg-orange-50" },
    { label: "Location", value: event.isVirtual ? 'Virtual Event' : (event.venue || 'TBA'), sub: event.location, icon: MapPin, color: "text-slate-400", bg: "bg-slate-50" },
    { label: "Participation", value: `Team Size: ${event.teamSize || 'Any'}`, sub: `Max Participants: ${event.maxParticipants || 'Unlimited'}`, icon: Users, color: "text-teal-500", bg: "bg-teal-50" },
    { label: "Contact", value: event.contactEmail || 'No email provided', icon: Mail, color: "text-slate-400", bg: "bg-slate-50" },
  ];

  return (
    <div className="grid lg:grid-cols-3 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="lg:col-span-2 space-y-10">
        <section>
          <SectionHeader icon={Globe} title="About the Event" />
          <Card className="p-8">
            <p className="text-base text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">
              {event.description || 'No description provided.'}
            </p>
          </Card>
        </section>

        <div className="grid md:grid-cols-2 gap-8">
          <section>
            <SectionHeader icon={Trophy} title="Prizes" iconClassName="bg-amber-50 text-amber-600" />
            <Card className="p-8 min-h-[160px]">
              {event.prizes?.length > 0 ? (
                <ul className="space-y-3">
                  {event.prizes.map((prize, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                      <p className="text-lg font-light text-slate-900 leading-none tracking-tight">{prize}</p>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-slate-400 italic text-sm">To be announced</p>}
            </Card>
          </section>

          <section>
            <SectionHeader icon={ListChecks} title="Rules" iconClassName="bg-emerald-50 text-emerald-600" />
            <Card className="p-8 min-h-[160px]">
              {event.rules?.length > 0 ? (
                <ul className="space-y-4">
                  {event.rules.map((rule, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-sm font-semibold text-slate-600">
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                      {rule}
                    </li>
                  ))}
                </ul>
              ) : <p className="text-slate-400 italic text-sm">No rules specified</p>}
            </Card>
          </section>
        </div>
      </div>

      <aside className="space-y-4">
        <SectionHeader icon={Info} title="Logistics & Details" iconClassName="bg-slate-100 text-slate-500" />
        <Card variant="slate" className="p-8 space-y-8 sticky top-8">
          {logistics.map((item, idx) => (
            <div key={idx} className="flex gap-4">
              <div className={`w-10 h-10 ${item.bg} ${item.color} rounded-xl flex items-center justify-center shrink-0 shadow-sm`}>
                <item.icon size={18} strokeWidth={2} />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] leading-none">{item.label}</p>
                <p className="text-xs font-bold text-slate-800 leading-tight">{item.value}</p>
                {item.sub && <p className="text-[10px] text-slate-400 font-medium">{item.sub}</p>}
              </div>
            </div>
          ))}
        </Card>
      </aside>
    </div>
  );
};

export default OverviewSection;
