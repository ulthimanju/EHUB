import { cn } from '../utils/cn'

const Badge = ({ children, className, variant = 'slate', size = 'sm', ...props }) => {
  const variants = {
    slate: 'bg-slate-50 text-slate-500 border-slate-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  }

  const sizes = {
    xs: 'px-2 py-0.5 text-[9px]',
    sm: 'px-2.5 py-1 text-[10px]',
    md: 'px-3 py-1.5 text-xs',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center font-black uppercase tracking-widest border rounded-full transition-all',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export default Badge
