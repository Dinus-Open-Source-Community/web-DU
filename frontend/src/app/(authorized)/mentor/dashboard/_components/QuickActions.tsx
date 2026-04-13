import { Button } from '@/components/ui/button'
import { CheckCircle, MessageCircle, Megaphone } from 'lucide-react'

export default function QuickActions() {
  const actions = [
    {
      id: 'grade',
      label: 'Grade Submissions',
      icon: <CheckCircle size={18} />,
      href: '#',
    },
    {
      id: 'qa',
      label: 'Answer Q&A',
      icon: <MessageCircle size={18} />,
      href: '#',
    },
    {
      id: 'announce',
      label: 'Post Announcement',
      icon: <Megaphone size={18} />,
      href: '#',
    },
  ]

  return (
    <div className="flex gap-3 flex-wrap">
      {actions.map((action) => (
        <Button key={action.id} variant="outline" className="gap-2 text-slate-700 border-slate-200 hover:bg-white hover:border-primary hover:text-primary" asChild>
          <a href={action.href}>
            {action.icon}
            <span className="hidden sm:inline">{action.label}</span>
          </a>
        </Button>
      ))}
    </div>
  )
}
