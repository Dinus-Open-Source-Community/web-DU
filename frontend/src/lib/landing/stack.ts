import type { LucideIcon } from 'lucide-react'
import { Atom, Braces, Container, Database, Paintbrush, Server, HardDrive } from 'lucide-react'

export type StackItem = { name: string; detail: string; icon: LucideIcon }

export const DOSCOM_STACK: StackItem[] = [
  { name: 'React 19', detail: 'Frontend interaktif', icon: Atom },
  { name: 'TypeScript', detail: 'Aman sejak ditulis', icon: Braces },
  { name: 'Tailwind CSS', detail: 'Styling utility', icon: Paintbrush },
  { name: 'Go + Gin', detail: 'Backend cepat', icon: Server },
  { name: 'PostgreSQL', detail: 'Data relasional', icon: Database },
  { name: 'MinIO', detail: 'Object storage', icon: HardDrive },
  { name: 'Docker', detail: 'Deploy konsisten', icon: Container },
]
