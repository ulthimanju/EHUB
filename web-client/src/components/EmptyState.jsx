import { cn } from '../utils/cn'

const EmptyState = ({ icon: Icon, message, description, className, ...props }) => {
  return (
    <div
      className={cn(
        'text-center py-20 bg-slate-50 border border-dashed border-slate-200 rounded-2xl',
        className
      )}
      {...props}
    >
      {Icon && <Icon size={40} className="mx-auto text-slate-200 mb-4" />}
      <p className="text-slate-400 font-medium">{message}</p>
      {description && <p className="text-slate-300 text-xs mt-1">{description}</p>}
    </div>
  )
}

export default EmptyState
