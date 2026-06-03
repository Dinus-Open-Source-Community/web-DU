import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ChevronDown, LayoutDashboard, LogOut, Menu, UserCircle } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Button } from '../ui/button'
import { navLinks } from '../../lib/navigation'
import type { UserRole } from '../../lib/types/user'
import { useAuth } from '../../providers/auth-provider'
import { ROUTES } from '../../lib/routes'

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

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, profile, signOut, user } = useAuth()
  const sessionUser = profile ?? user
  const userName = sessionUser?.name ?? 'User'
  const userEmail = sessionUser?.email ?? ''
  const userRole = sessionUser?.role ?? 'student'
  const userAvatar = sessionUser?.avatar_url ?? ''

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

  const handleLogout = () => {
    setIsMenuOpen(false)
    signOut()
    navigate(ROUTES.login)
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
    <nav className="bg-primary text-popover fixed top-0 left-0 z-50 w-full shadow-md">
      <div className="container mx-auto flex w-full items-center justify-between px-4 py-4 md:px-8 lg:px-20">
        <Link to="/" className="text-2xl font-bold text-white">
          Doscom University
        </Link>

        <div className="hidden items-center lg:flex">
          <div className="flex w-full flex-wrap items-center justify-center gap-2">
            {navLinks.map((navLink) => (
              <Link
                key={navLink.href}
                to={navLink.href}
                className={`flex items-center justify-center rounded-2xl py-2 text-lg font-medium transition-all ${
                  pathname === navLink.href ? 'bg-popover text-primary px-6' : 'px-4 text-white hover:text-white/80'
                }`}>
                {navLink.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="hidden items-center gap-4 lg:flex">
          {isAuthenticated && sessionUser ? (
            <div className="group relative">
              <div className="pb-2">
                <button
                  type="button"
                  className="flex min-h-11 items-center gap-2 rounded-[10px] border border-white/30 bg-white/10 py-1.5 pr-3 pl-1.5 text-white outline-none transition hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white/60"
                  aria-haspopup="menu">
                  <Avatar className="size-9 ring-2 ring-white/35">
                    {userAvatar ? <AvatarImage src={userAvatar} alt={userName} /> : null}
                    <AvatarFallback className="bg-white/25 text-xs font-bold text-white">{userInitials(userName)}</AvatarFallback>
                  </Avatar>
                  <span className="max-w-[140px] truncate text-left text-sm font-semibold">{userName}</span>
                  <ChevronDown className="size-4 shrink-0 opacity-80 transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180" aria-hidden />
                </button>
              </div>

              <div
                role="menu"
                className="pointer-events-none absolute right-0 top-full z-50 w-64 translate-y-1 opacity-0 transition-all duration-150 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100">
                <div className="rounded-[10px] border border-slate-200 bg-white p-2 text-slate-700 shadow-xl shadow-slate-900/10">
                  <div className="px-3 py-2.5">
                    <p className="truncate text-sm font-semibold text-slate-900">{userName}</p>
                    {userEmail ? <p className="truncate text-xs text-slate-500">{userEmail}</p> : null}
                    <p className="mt-1 text-xs font-medium text-primary">{roleLabel[userRole]}</p>
                  </div>
                  <div className="my-1 h-px bg-slate-100" />
                  <Link to={dashboardPath[userRole]} className="flex min-h-10 items-center gap-2 rounded-[10px] px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-primary">
                    <LayoutDashboard className="size-4 opacity-70" />
                    Dashboard
                  </Link>
                  <Link to={ROUTES.profile} className="flex min-h-10 items-center gap-2 rounded-[10px] px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-primary">
                    <UserCircle className="size-4 opacity-70" />
                    Profile
                  </Link>
                  <button type="button" className="flex min-h-10 w-full items-center gap-2 rounded-[10px] px-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50" onClick={handleLogout}>
                    <LogOut className="size-4" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <Link to="/auth/register">
                <Button className="bg-transparent text-white hover:bg-white/10 border-white/30 rounded-2xl px-7" variant="outline">
                  Daftar
                </Button>
              </Link>
              <Link to="/auth/login">
                <Button className="bg-white text-primary hover:bg-white/90 rounded-2xl px-7" variant="secondary">
                  Masuk
                </Button>
              </Link>
            </div>
          )}
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-2xl border border-white/40 px-3 py-2 text-white lg:hidden"
          aria-label="Toggle menu"
          onClick={() => setIsMenuOpen((prev) => !prev)}>
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out lg:hidden ${isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="flex flex-col gap-3 px-6 pb-8 bg-primary">
          {isAuthenticated && sessionUser && (
            <div className="flex items-center gap-3 rounded-2xl border border-white/25 bg-white/10 px-3 py-2">
              <Avatar className="size-10 ring-2 ring-white/35">
                {userAvatar ? <AvatarImage src={userAvatar} alt={userName} /> : null}
                <AvatarFallback className="bg-white/25 text-xs font-bold text-white">{userInitials(userName)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{userName}</p>
                <p className="text-xs text-white/75">{roleLabel[userRole]}</p>
              </div>
            </div>
          )}
          <div className="flex flex-col gap-2">
            {navLinks.map((navLink) => (
              <Link
                key={navLink.href}
                to={navLink.href}
                className={`px-4 py-2 text-base transition ${pathname === navLink.href ? 'bg-white text-primary rounded-2xl font-medium' : 'text-white hover:text-white/80'}`}
                onClick={() => setIsMenuOpen(false)}>
                {navLink.label}
              </Link>
            ))}
          </div>
          {isAuthenticated && sessionUser ? (
            <div className="flex flex-col gap-1 border-t border-white/20 pt-3">
              <p className="px-4 text-xs font-semibold tracking-wide text-white/60 uppercase">Menu akun</p>
              <button type="button" className="flex items-center gap-2 px-4 py-2 text-left text-base text-white hover:text-white/85" onClick={handleDashboard}>
                <LayoutDashboard className="size-4 shrink-0 opacity-80" />
                Dashboard
              </button>
              <button type="button" className="flex items-center gap-2 px-4 py-2 text-left text-base text-white hover:text-white/85" onClick={handleProfile}>
                <UserCircle className="size-4 shrink-0 opacity-80" />
                Profile
              </button>
              <button type="button" className="flex items-center gap-2 px-4 py-2 text-left text-base text-red-200 hover:text-red-100" onClick={handleLogout}>
                <LogOut className="size-4 shrink-0" />
                Logout
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 pt-2">
              <Link to="/auth/register" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full bg-transparent text-white hover:bg-white/10 border-white/30 rounded-2xl" variant="outline">
                  Daftar
                </Button>
              </Link>
              <Link to="/auth/login" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full bg-white text-primary hover:bg-white/90 rounded-2xl" variant="secondary">
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
