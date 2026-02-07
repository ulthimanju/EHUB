import { cn } from '../utils/cn'

const Input = ({ label, error, className, ...props }) => {
  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        className={cn(
          'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-shadow focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-gray-50 disabled:text-gray-500',
          error && 'border-red-500 focus:ring-red-200',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  )
}

export default Input
