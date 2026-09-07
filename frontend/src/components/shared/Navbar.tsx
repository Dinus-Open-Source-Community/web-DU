import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ChevronDown, LayoutDashboard, LogOut, Menu, UserCircle, X } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Button } from '../ui/button'
import { navLinks } from '../../lib/navigation'
import type { GuestNavbarAuthProps } from '@/lib/layout/navbar-auth-view-model'
import type { UserRole } from '../../lib/types/user'
import { ROUTES } from '../../lib/routes'
import { cn } from '../../lib/utils'

function userInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const roleLabel: Record<UserRole, string> = {
  student: 'Siswa',
  mentor: 'Mentor',
  admin: 'Admin',
}

const dashboardPath: Record<UserRole, string> = {
  student: ROUTES.student.dashboard,
  mentor: ROUTES.mentor.dashboard,
  admin: ROUTES.admin.dashboard,
}

type NavbarProps = {
  auth: GuestNavbarAuthProps
}

export default function Navbar({ auth }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { pathname, hash } = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, userName, userEmail, userRole, userAvatar, onSignOut } = auth

  const isActive = (href: string): boolean => {
    const hashIndex = href.indexOf('#')
    if (hashIndex === -1) return pathname === href
    return pathname === (href.slice(0, hashIndex) || '/') && hash === href.slice(hashIndex)
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

  const handleProfile = () => {
    setIsMenuOpen(false)
    navigate(ROUTES.profile)
  }

  const handleDashboard = () => {
    setIsMenuOpen(false)
    navigate(dashboardPath[userRole])
  }

  return (
    <nav className="text-ink-900 bg-paper-white/95 shadow-nav fixed top-0 left-0 z-50 min-h-22 w-full border-b-2 border-ink-900 backdrop-blur">
      <div className="container mx-auto flex w-full items-center justify-between px-4 py-4 md:px-8 lg:px-20">
        <Link to="/" className="text-ink-900 font-display text-2xl font-bold tracking-tight">
          Doscom University
        </Link>

        <div className="hidden items-center lg:flex">
          <div className="flex w-full flex-wrap items-center justify-center gap-2">
            {navLinks.map((navLink) => (
              <Link
                key={navLink.href}
                to={navLink.href}
                className={`flex items-center justify-center rounded-2xl py-2 text-sm font-extrabold tracking-wider uppercase transition-all outline-none focus-visible:ring-3 focus-visible:ring-ring/30 ${
                  isActive(navLink.href) ? 'bg-brand-blue px-6 text-ink-900' : 'text-ink-900 px-4 hover:text-brand-ink'
                }`}>
                {navLink.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="hidden items-center gap-4 lg:flex">
          {isAuthenticated ? (
            <div className="group relative">
              <div className="pb-2">
                <button
                  type="button"
                  className="ring-ink-900/20 bg-paper-white shadow-button flex min-h-11 items-center gap-2 rounded-[10px] border-2 border-ink-900 py-1.5 pr-3 pl-1.5 text-ink-900 outline-none transition hover:-translate-y-0.5 hover:shadow-button-hover focus-visible:ring-3"
                  aria-haspopup="menu"
                >
                  <Avatar className="size-9 ring-2 ring-ink-900/20">
                    {userAvatar ? <AvatarImage src={userAvatar} alt={userName} /> : null}
                    <AvatarFallback className="bg-note-yellow text-ink-900 text-xs font-bold">{userInitials(userName)}</AvatarFallback>
                  </Avatar>
                  <span className="max-w-[140px] truncate text-left text-sm font-semibold">{userName}</span>
                  <ChevronDown className="size-4 shrink-0 opacity-80 transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180" aria-hidden />
                </button>
              </div>

              <div
                role="menu"
                /* Tertutup: visibility-hidden → isi tidak focusable (bukan cuma opacity 0). */
                className="pointer-events-none invisible absolute right-0 top-full z-50 w-64 translate-y-1 opacity-0 transition-all duration-150 group-hover:visible group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100">
                <div className="bg-paper-white text-ink-900 shadow-paper rounded-[10px] border-2 border-ink-900 p-2">
                  <div className="px-3 py-2.5">
                    <p className="truncate text-sm font-semibold">{userName}</p>
                    {userEmail ? <p className="text-ink-500 truncate text-xs">{userEmail}</p> : null}
                    <p className="text-brand-ink mt-1 text-xs font-bold">{roleLabel[userRole]}</p>
                  </div>
                  <div className="bg-ink-900/10 my-1 h-px" />
                  <Link to={dashboardPath[userRole]} className="text-ink-900 hover:text-brand-ink hover:bg-paper-paper flex min-h-10 items-center gap-2 rounded-[10px] px-3 text-sm font-semibold transition focus-visible:ring-3 focus-visible:ring-ring/30 outline-none">
                    <LayoutDashboard className="size-4 opacity-70" />
                    Dashboard
                  </Link>
                  <Link to={ROUTES.profile} className="text-ink-900 hover:text-brand-ink hover:bg-paper-paper flex min-h-10 items-center gap-2 rounded-[10px] px-3 text-sm font-semibold transition focus-visible:ring-3 focus-visible:ring-ring/30 outline-none">
                    <UserCircle className="size-4 opacity-70" />
                    Profile
                  </Link>
                  <button type="button" className="text-destructive hover:bg-destructive/10 flex min-h-10 w-full items-center gap-2 rounded-[10px] px-3 text-left text-sm font-semibold transition focus-visible:ring-3 focus-visible:ring-destructive/20 outline-none" onClick={handleLogout}>
                    <LogOut className="size-4" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <Link to="/auth/register">
                <Button variant="outline" className="px-7">
                  Daftar
                </Button>
              </Link>
              <Link to="/auth/login">
                <Button variant="default" className="px-7">
                  Masuk
                </Button>
              </Link>
            </div>
          )}
        </div>

        <button
          type="button"
          className="bg-paper-white text-ink-900 shadow-button inline-flex items-center justify-center rounded-[10px] border-2 border-ink-900 px-3 py-2 outline-none transition hover:-translate-y-0.5 hover:shadow-button-hover focus-visible:ring-3 focus-visible:ring-ring/30 lg:hidden"
          aria-label={isMenuOpen ? 'Tutup menu' : 'Buka menu'}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
          onClick={() => setIsMenuOpen((prev) => !prev)}>
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu — inert saat tertutup supaya link tidak focusable. */}
      <div
        id="mobile-menu"
        inert={!isMenuOpen}
        className={cn(
          'overflow-hidden transition-all duration-300 ease-in-out lg:hidden',
          isMenuOpen ? 'max-h-[calc(100dvh-88px)] overflow-y-auto opacity-100' : 'max-h-0 opacity-0',
        )}>
        <div className="bg-paper-white flex flex-col gap-3 border-t-2 border-ink-900 px-6 pb-8">
          {isAuthenticated && (
            <div className="bg-paper-paper flex items-center gap-3 rounded-2xl border border-ink-900/15 px-3 py-2">
              <Avatar className="size-10 ring-2 ring-ink-900/20">
                {userAvatar ? <AvatarImage src={userAvatar} alt={userName} /> : null}
                <AvatarFallback className="bg-note-yellow text-ink-900 text-xs font-bold">{userInitials(userName)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-ink-900 truncate text-sm font-semibold">{userName}</p>
                <p className="text-ink-500 text-xs">{roleLabel[userRole]}</p>
              </div>
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
              <button type="button" className="text-ink-900 hover:text-brand-ink flex items-center gap-2 px-4 py-2 text-left text-base font-semibold transition outline-none focus-visible:ring-3 focus-visible:ring-ring/30" onClick={handleDashboard}>
                <LayoutDashboard className="size-4 shrink-0 opacity-80" />
                Dashboard
              </button>
              <button type="button" className="text-ink-900 hover:text-brand-ink flex items-center gap-2 px-4 py-2 text-left text-base font-semibold transition outline-none focus-visible:ring-3 focus-visible:ring-ring/30" onClick={handleProfile}>
                <UserCircle className="size-4 shrink-0 opacity-80" />
                Profile
              </button>
              <button type="button" className="text-destructive hover:text-destructive/80 flex items-center gap-2 px-4 py-2 text-left text-base font-semibold transition outline-none focus-visible:ring-3 focus-visible:ring-destructive/20" onClick={handleLogout}>
                <LogOut className="size-4 shrink-0" />
                Logout
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 pt-2">
              <Link to="/auth/register" onClick={closeMenu}>
                <Button variant="outline" className="w-full">
                  Daftar
                </Button>
              </Link>
              <Link to="/auth/login" onClick={closeMenu}>
                <Button variant="default" className="w-full">
                  Masuk
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
