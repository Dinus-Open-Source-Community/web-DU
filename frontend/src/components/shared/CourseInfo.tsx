export const CourseInfoCard = ({ label, value }: { label: string; value: string | number }) => (
  <div className="flex items-center justify-between border-b border-border/60 pb-4 last:border-0 last:pb-0">
    <span className="text-xs font-medium text-ink-400">{label}</span>
    <div className="flex flex-col items-end">
      <span className="text-sm font-bold text-ink-900">{value}</span>
    </div>
  </div>
)
