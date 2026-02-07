import { cn } from '../utils/cn'

const SectionHeader = ({ icon: Icon, title, className, iconClassName, ...props }) => {
  return (
    <div className={cn('flex items-center gap-2 mb-4', className)} {...props}>
      {Icon && (
        <div className={cn('p-1.5 rounded-lg bg-blue-50 text-blue-600', iconClassName)}>
          <Icon size={18} strokeWidth={2.5} />
        </div>
      )}
      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">{title}</h3>
    </div>
  )
}

export default SectionHeader
