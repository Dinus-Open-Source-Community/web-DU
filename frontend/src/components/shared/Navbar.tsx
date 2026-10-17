import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LogOut, Menu, Settings, X } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Button } from '../ui/button'
import { navLinks } from '../../lib/navigation'
import type { GuestNavbarAuthProps } from '@/lib/layout/navbar-auth-view-model'
import {
  getAccountMenuNavContext,
  getAccountMenuNavLinks,
  shouldShowAccountSettingsLink,
} from '@/lib/layout/account-menu-nav'
import type { UserRole } from '../../lib/types/user'
import { ROUTES } from '../../lib/routes'
import { greetingForUser, navbarUserRoleLabel } from '@/lib/layout/navbar-user-display'
import { cn } from '../../lib/utils'

function userInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const dashboardPath: Record<UserRole, string> = {
  student: ROUTES.dashboard,
  mentor: ROUTES.dashboard,
  admin: ROUTES.dashboard,
  super_admin: ROUTES.dashboard,
}

type NavbarProps = {
  auth: GuestNavbarAuthProps
  authActionsVariant?: 'default' | 'home'
}

function GuestAuthActions({
  variant,
  onNavigate,
  layout,
}: {
  variant: 'default' | 'home'
  onNavigate?: () => void
  layout: 'desktop' | 'mobile'
}) {
  const isMobile = layout === 'mobile'
  const buttonClass = isMobile
    ? 'h-10 w-full rounded-sm border-2 text-sm font-extrabold active:translate-y-[3px]'
    : 'h-10 rounded-sm border-2 px-5 text-sm font-extrabold active:translate-y-[3px]'

  if (variant === 'home') {
    return (
      <div className={cn('flex gap-3', isMobile && 'flex-col')}>
        <Link to={ROUTES.login} onClick={onNavigate}>
          <Button
            variant="neobrutalism"
            className={cn(
              buttonClass,
              'bg-paper-white text-ink-900 hover:bg-paper-paper',
            )}
          >
            Masuk
          </Button>
        </Link>
        <Link to={ROUTES.register} onClick={onNavigate}>
          <Button variant="neobrutalism" className={buttonClass}>
            Daftar
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className={cn('flex gap-3', isMobile && 'flex-col')}>
      <Link to={ROUTES.login} onClick={onNavigate}>
        <Button
          variant="neobrutalism"
          className={cn(
            buttonClass,
            'bg-paper-white hover:bg-paper-paper',
          )}
        >
          Masuk
        </Button>
      </Link>
      <Link to={ROUTES.redeem} onClick={onNavigate}>
        <Button
          variant="neobrutalism"
          className={cn(buttonClass, 'text-primary-foreground')}
        >
          Tukar Kode
        </Button>
      </Link>
    </div>
  )
}

export default function Navbar({ auth, authActionsVariant = 'default' }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<string>('')
  const { pathname, hash } = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, userName, userRole, userAvatar, onSignOut } = auth
  const accountNavContext = getAccountMenuNavContext(pathname)
  const accountNavLinks = getAccountMenuNavLinks(accountNavContext, dashboardPath[userRole])
  const showAccountSettings = shouldShowAccountSettingsLink(accountNavContext)

  // Scrollspy: tandai section yang sedang dikunjungi. Saat user scroll melewati
  // sebuah section (id anchor di halaman home), link navbar-nya jadi aktif —
  // mencerminkan posisi baca, bukan sekadar hash URL.
  useEffect(() => {
    const ids = navLinks
      .map((l) => l.href)
      .filter((h) => h.includes('#'))
      .map((h) => h.slice(h.indexOf('#') + 1))
      .filter((id) => document.getElementById(id))

    if (ids.length === 0) return

    const visible = new Map<string, number>()
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.set(entry.target.id, entry.intersectionRatio)
          else visible.delete(entry.target.id)
        }
        // Section dengan rasio paling besar = paling "sedang dibaca".
        let best: string | null = null
        let bestRatio = 0
        for (const [id, ratio] of visible) {
          if (ratio > bestRatio) {
            best = id
            bestRatio = ratio
          }
        }
        setActiveSection(best ?? '')
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: [0, 0.25, 0.5, 1] },
    )
    for (const id of ids) {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    }
    return () => io.disconnect()
  }, [pathname])

  const isActive = (href: string): boolean => {
    const hashIndex = href.indexOf('#')
    if (hashIndex === -1) return pathname === href
    const id = href.slice(hashIndex + 1)
    // Section aktif hasil scrollspy menang atas hash URL saat sedang dibaca.
    return pathname === (href.slice(0, hashIndex) || '/') && activeSection === id
  }

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMenuOpen])

  // Tutup menu mobile saat rute/hash berubah (setelah klik link navigasi).
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname, hash])

  // Kunci fokus di dalam menu saat terbuka (Esc untuk menutup).
  useEffect(() => {
    if (!isMenuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isMenuOpen])

  const closeMenu = () => setIsMenuOpen(false)

  const handleLogout = () => {
    setIsMenuOpen(false)
    onSignOut()
  }

  const handleSettings = () => {
    setIsMenuOpen(false)
    navigate(ROUTES.profile)
  }

  return (
    <nav className="text-ink-900 bg-paper-white/95 shadow-nav fixed top-0 left-0 z-50 flex h-16 w-full items-center border-b-2 border-ink-900 backdrop-blur">
      <div className="container mx-auto flex h-full w-full items-center px-4 md:px-8 lg:px-16">
        <div className="flex flex-1 justify-start">
          <Link
            to="/"
            className="text-ink-900 font-display text-xl font-bold tracking-tight sm:text-2xl"
          >
            Doscom University
          </Link>
        </div>

        <div className="hidden justify-center lg:flex">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {navLinks.map((navLink) => (
              <Link
                key={navLink.href}
                to={navLink.href}
                className={`inline-flex h-8 shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-xl px-3 text-xs font-extrabold tracking-wider uppercase transition-all outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/30 sm:text-sm sm:px-3.5 ${
                  isActive(navLink.href) ? 'bg-brand-blue px-4 text-ink-900 sm:px-5' : 'text-ink-900 hover:text-brand-ink'
                }`}>
                {navLink.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-1 items-center justify-end gap-3 lg:gap-4">
          <div className="hidden items-center lg:flex">
          {isAuthenticated ? (
            <div className="group relative ml-4 cursor-pointer py-2 pl-4 lg:ml-6 lg:pl-6">
              <div
                tabIndex={0}
                className="flex cursor-pointer items-center gap-3 rounded-sm py-1 outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
                aria-haspopup="menu"
              >
                <span className="max-w-[9rem] min-w-0 text-right sm:max-w-[10rem]">
                  <span className="block truncate text-sm font-semibold leading-5 text-ink-900">
                    {userName}
                  </span>
                  <span className="block truncate text-xs font-medium leading-4 text-ink-500">
                    {navbarUserRoleLabel[userRole]}
                  </span>
                </span>
                <Avatar className="size-9 shrink-0 ring-2 ring-ink-900/15">
                  {userAvatar ? <AvatarImage src={userAvatar} alt={userName} /> : null}
                  <AvatarFallback className="bg-note-yellow text-ink-900 text-xs font-bold">
                    {userInitials(userName)}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div
                role="menu"
                /* Tertutup: visibility-hidden → isi tidak focusable (bukan cuma opacity 0).
                   pt-2 = bridge hover agar mouse bisa turun ke panel tanpa putus.
                   Inner div yang fade/slide (translate + opacity). */
                className="pointer-events-none invisible absolute right-0 top-full z-50 w-64 pt-2 group-hover:visible group-hover:pointer-events-auto group-focus-within:visible group-focus-within:pointer-events-auto">
                <div className="bg-paper-white text-ink-900 shadow-paper rounded-[10px] border-2 border-ink-900 p-2 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
                  <div className="px-3 py-3">
                    <p className="text-sm font-semibold">{greetingForUser(userName)}</p>
                    <p className="text-ink-500 mt-1 text-xs leading-relaxed">
                      Senang bertemu lagi di Doscom University.
                    </p>
                  </div>
                  <div className="bg-ink-900/10 my-1 h-px" />
                  {accountNavLinks.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        role="menuitem"
                        className="text-ink-900 hover:text-brand-ink hover:bg-paper-paper flex min-h-10 items-center gap-2 rounded-[10px] px-3 text-sm font-semibold transition focus-visible:ring-3 focus-visible:ring-ring/30 outline-none"
                      >
                        <Icon className="size-4 opacity-70" aria-hidden />
                        {item.label}
                      </Link>
                    )
                  })}
                  {showAccountSettings ? (
                    <Link
                      to={ROUTES.profile}
                      role="menuitem"
                      className="text-ink-900 hover:text-brand-ink hover:bg-paper-paper flex min-h-10 items-center gap-2 rounded-[10px] px-3 text-sm font-semibold transition focus-visible:ring-3 focus-visible:ring-ring/30 outline-none"
                    >
                      <Settings className="size-4 opacity-70" aria-hidden />
                      Pengaturan
                    </Link>
                  ) : null}
                  <button type="button" className="text-destructive hover:bg-destructive/10 flex min-h-10 w-full items-center gap-2 rounded-[10px] px-3 text-left text-sm font-semibold transition focus-visible:ring-3 focus-visible:ring-destructive/20 outline-none" onClick={handleLogout}>
                    <LogOut className="size-4" />
                    Keluar
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <GuestAuthActions variant={authActionsVariant} layout="desktop" />
          )}
        </div>

        <button
          type="button"
          className="bg-paper-white text-ink-900 shadow-button inline-flex size-10 items-center justify-center rounded-[10px] border-2 border-ink-900 outline-none transition hover:translate-y-0.5 hover:shadow-button-hover active:translate-y-[3px] active:shadow-none focus-visible:ring-3 focus-visible:ring-ring/30 lg:hidden"
          aria-label={isMenuOpen ? 'Tutup menu' : 'Buka menu'}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
          onClick={() => setIsMenuOpen((prev) => !prev)}>
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        </div>
      </div>

      {/* Mobile Menu — inert saat tertutup supaya link tidak focusable. */}
      <div
        id="mobile-menu"
        inert={!isMenuOpen}
        className={cn(
          'overflow-hidden transition-all duration-300 ease-in-out lg:hidden',
          isMenuOpen ? 'max-h-[calc(100dvh-4rem)] overflow-y-auto opacity-100' : 'max-h-0 opacity-0',
        )}>
        <div className="bg-paper-white flex flex-col gap-3 border-t-2 border-ink-900 px-6 pt-8 pb-8">
          {isAuthenticated && (
            <div className="bg-paper-paper flex items-center gap-3 rounded-2xl border border-ink-900/15 px-3 py-2.5">
              <div className="min-w-0 flex-1 text-right">
                <p className="truncate text-sm font-semibold text-ink-900">{userName}</p>
                <p className="truncate text-xs font-medium text-ink-500">
                  {navbarUserRoleLabel[userRole]}
                </p>
              </div>
              <Avatar className="size-10 shrink-0 ring-2 ring-ink-900/15">
                {userAvatar ? <AvatarImage src={userAvatar} alt={userName} /> : null}
                <AvatarFallback className="bg-note-yellow text-ink-900 text-xs font-bold">{userInitials(userName)}</AvatarFallback>
              </Avatar>
            </div>
          )}
          <div className="flex flex-col gap-2">
            {navLinks.map((navLink) => (
              <Link
                key={navLink.href}
                to={navLink.href}
                onClick={closeMenu}
                className={`flex items-center rounded-2xl px-4 py-2.5 text-sm font-extrabold tracking-wider uppercase transition-all outline-none focus-visible:ring-3 focus-visible:ring-ring/30 ${
                  isActive(navLink.href) ? 'bg-brand-blue text-ink-900 font-extrabold' : 'text-ink-900 hover:text-brand-ink'
                }`}>
                {navLink.label}
              </Link>
            ))}
          </div>
          {isAuthenticated ? (
            <div className="flex flex-col gap-1 border-t border-ink-900/15 pt-3">
              <p className="text-ink-500 px-4 text-xs font-extrabold tracking-wider uppercase">Menu akun</p>
              {accountNavLinks.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="text-ink-900 hover:text-brand-ink flex items-center gap-2 px-4 py-2 text-left text-base font-semibold transition outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
                    onClick={closeMenu}
                  >
                    <Icon className="size-4 shrink-0 opacity-80" aria-hidden />
                    {item.label}
                  </Link>
                )
              })}
              {showAccountSettings ? (
                <button
                  type="button"
                  className="text-ink-900 hover:text-brand-ink flex items-center gap-2 px-4 py-2 text-left text-base font-semibold transition outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
                  onClick={handleSettings}
                >
                  <Settings className="size-4 shrink-0 opacity-80" aria-hidden />
                  Pengaturan
                </button>
              ) : null}
              <button type="button" className="text-destructive hover:text-destructive/80 flex items-center gap-2 px-4 py-2 text-left text-base font-semibold transition outline-none focus-visible:ring-3 focus-visible:ring-destructive/20" onClick={handleLogout}>
                <LogOut className="size-4 shrink-0" />
                Keluar
              </button>
            </div>
          ) : (
            <div className="pt-2">
              <GuestAuthActions
                variant={authActionsVariant}
                layout="mobile"
                onNavigate={closeMenu}
              />
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
