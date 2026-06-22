'use client'

import { Search, X } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (val: string) => void
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative w-full">
      <input
        type="text"
        placeholder="Search by product name, chemical formula, or CAS number..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-10 py-3.5 text-xs bg-[#081525] border border-[#00A0C0]/15 hover:border-[#00A0C0]/40 focus:border-[#00A0C0] text-[#F4F7FA] placeholder-[#606060] focus:outline-none transition-all rounded-[2px]"
      />
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#00A0C0]">
        <Search size={16} />
      </div>
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#606060] hover:text-[#00A0C0]"
          type="button"
        >
          <X size={16} />
        </button>
      )}
    </div>
  )
}
