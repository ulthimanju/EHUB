import { cn } from '../utils/cn'

const Table = ({ headers, children, className, ...props }) => {
  return (
    <div className={cn('overflow-x-auto border border-slate-100 rounded-xl', className)} {...props}>
      <table className="w-full text-left">
        <thead className="bg-slate-50 border-b border-slate-100 text-[9px] uppercase tracking-widest font-bold text-slate-400">
          <tr>
            {headers.map((header, idx) => (
              <th key={idx} className={cn('px-8 py-5', header.className)}>
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {children}
        </tbody>
      </table>
    </div>
  )
}

export default Table
