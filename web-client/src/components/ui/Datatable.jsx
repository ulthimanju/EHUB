import React from 'react';
import { Search, Filter, ChevronDown, Edit2, Trash, Eye } from 'lucide-react';

const Datatable = ({ data = [], columns = [], title = "" }) => {
    return (
        <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
            {/* Table Toolbar */}
            <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-orange-500" />
                    <input
                        type="text"
                        placeholder={`Search ${title}...`}
                        className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl font-body text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all text-gray-900 placeholder-gray-400"
                    />
                </div>
                <button className="w-full sm:w-auto px-4 py-2.5 bg-gray-50 text-gray-700 font-medium rounded-2xl text-sm hover:bg-gray-100 border border-gray-200 transition-colors flex items-center justify-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    Filter
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/50">
                            {columns.map((col, idx) => (
                                <th key={idx} className={`p-5 text-xs font-semibold tracking-wide text-gray-500 uppercase font-body ${col.align === 'right' ? 'text-right' : ''}`}>
                                    {col.header}
                                </th>
                            ))}
                            <th className="p-5 text-xs font-semibold tracking-wide text-gray-500 uppercase font-body text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {data.map((row, rowIndex) => (
                            <tr key={row.id || rowIndex} className="hover:bg-gray-50/50 transition-colors group">
                                {columns.map((col, colIndex) => (
                                    <td key={colIndex} className="p-5">
                                        {col.render ? col.render(row) : (
                                            <div className="text-sm text-gray-600 font-body">{row[col.accessor]}</div>
                                        )}
                                    </td>
                                ))}
                                <td className="p-5 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-orange-500 transition-colors">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-red-500 transition-colors">
                                            <Trash className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* Pagination */}
            <div className="flex items-center justify-between p-5 border-t border-gray-100 bg-gray-50/30">
                <span className="text-sm text-gray-500 font-body">Showing {data.length} results</span>
                <div className="flex gap-2">
                    <button className="px-4 py-2 text-sm font-medium rounded-xl border border-orange-500 text-orange-600 hover:bg-orange-50 transition-all disabled:opacity-50 disabled:border-gray-200 disabled:text-gray-400 disabled:hover:bg-transparent">
                        Previous
                    </button>
                    <button className="px-4 py-2 text-sm font-medium rounded-xl border border-orange-500 text-orange-600 hover:bg-orange-50 transition-all">
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Datatable;
