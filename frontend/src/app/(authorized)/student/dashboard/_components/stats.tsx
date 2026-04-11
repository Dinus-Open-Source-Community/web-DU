import React from 'react'
import { LucideIcon } from 'lucide-react'

interface StatsProps {
  label: string
  value: number | string
  icon: LucideIcon
  colorClass?: string
  bgClass?: string
}

const Stats = ({ label, value, icon: StatIcon }: StatsProps) => {
  return (
    <div className="bg-white p-6 rounded-2xl flex items-center justify-between border border-slate-100 shadow-2xs">
      <div className="flex flex-col">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
        <h3 className="text-2xl font-bold tracking-tight text-slate-900">{value}</h3>
      </div>
      <div className="w-11 h-11 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
        <StatIcon size={20} strokeWidth={2} />
      </div>
    </div>
  )
}

export default Stats
