import { Globe, Mail } from 'lucide-react'

export type ContactItem = { label: string; href: string; icon: typeof Globe }

/** LAUNCH GATE: ganti href generik + mailto kosong dengan kontak DOSCOM asli. */
export const CONTACTS: ContactItem[] = [
  { label: 'GitHub', href: 'https://github.com', icon: Globe },
  { label: 'LinkedIn', href: 'https://linkedin.com', icon: Globe },
  { label: 'Twitter', href: 'https://twitter.com', icon: Globe },
  { label: 'Instagram', href: 'https://instagram.com', icon: Globe },
  { label: 'Email', href: 'mailto: ', icon: Mail },
]
