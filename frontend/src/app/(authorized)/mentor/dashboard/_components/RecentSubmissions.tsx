import { ISubmissionItem } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Clock, CheckCircle, AlertCircle } from 'lucide-react'

interface RecentSubmissionsProps {
  submissions: ISubmissionItem[]
}

export default function RecentSubmissions({ submissions }: RecentSubmissionsProps) {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Submitted':
        return 'bg-green-50 text-green-700 border-green-100'
      case 'Late':
        return 'bg-amber-50 text-amber-700 border-amber-100'
      case 'Pending':
        return 'bg-slate-50 text-slate-700 border-slate-100'
      default:
        return 'bg-slate-50 text-slate-700 border-slate-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Submitted':
        return <CheckCircle size={14} />
      case 'Late':
        return <AlertCircle size={14} />
      default:
        return <Clock size={14} />
    }
  }

  return (
    <div className="space-y-3">
      {submissions.map((submission) => (
        <div key={submission.uid} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs hover:shadow-sm transition-shadow">
          <div className="flex items-start gap-3 mb-3">
            {/* Avatar */}
            <img src={submission.studentAvatar} alt={submission.studentName} className="w-8 h-8 rounded-full bg-slate-200 shrink-0" />

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-slate-900 text-sm leading-tight">{submission.studentName}</h4>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{submission.courseName}</p>
            </div>

            {/* Status Badge */}
            <div className={cn('flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border whitespace-nowrap shrink-0', getStatusStyles(submission.status))}>
              {getStatusIcon(submission.status)}
              {submission.status}
              {submission.status === 'Late' && submission.daysLate && <span className="ml-0.5">({submission.daysLate}d)</span>}
            </div>
          </div>

          {/* Assignment Title */}
          <div className="ml-11">
            <p className="text-sm font-semibold text-slate-800 mb-1 line-clamp-1">{submission.assignmentTitle}</p>
            <span className="text-[11px] text-slate-400 font-medium">{submission.submissionDate}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
