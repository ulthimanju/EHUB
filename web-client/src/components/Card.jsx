import { cn } from '../utils/cn'

const Card = ({ children, className, variant = 'white', ...props }) => {
  const variants = {
    white: 'bg-white border-slate-200',
    slate: 'bg-slate-50/50 border-slate-200',
    blue: 'bg-blue-50/30 border-blue-100',
    indigo: 'bg-indigo-50 border-indigo-100',
  }

  return (
    <div
      className={cn(
        'rounded-2xl border shadow-sm',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export default Card
