import { Mail } from 'lucide-react'
import { BrandGithubIcon, BrandInstagramIcon, BrandLinkedinIcon, type BrandSocialLink } from '@/lib/navigation'

export type ContactItem = { label: string; href: string; icon: BrandSocialLink['icon'] }

/** Ikon brand asli. Href '#' = placeholder — hindari link generik yang menipu. */
export const CONTACTS: ContactItem[] = [
  // TODO: isi akun resmi DOSCOM (github/linkedin/instagram + email organisasi) sebelum launch.
  { label: 'GitHub', href: '#', icon: BrandGithubIcon },
  { label: 'LinkedIn', href: '#', icon: BrandLinkedinIcon },
  { label: 'Instagram', href: '#', icon: BrandInstagramIcon },
  { label: 'Email', href: '#', icon: Mail },
]
