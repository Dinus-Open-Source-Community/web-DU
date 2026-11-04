import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LogOut, Menu, Settings, X } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
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

/** Menyimpan koordinat X glider terakhir agar transisi antar-halaman tetap meluncur tanpa terpengaruh scroll Y. */
let prevGliderPos: { left: number; width: number } | null = null

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

  if (isMobile) {
    return (
      <div className="flex flex-col gap-2.5 pt-1">
        <Link to={ROUTES.login} onClick={onNavigate} className="w-full">
          <button
            type="button"
            className="flex h-11 w-full items-center justify-center rounded-xl border-2 border-ink-900 bg-paper-white text-sm font-bold text-ink-900 shadow-[2px_2px_0px_#050914] outline-none transition-all hover:bg-paper-panel active:translate-x-[1px] active:translate-y-[1px] active:shadow-none focus-visible:ring-2 focus-visible:ring-brand-blue"
          >
            Masuk
          </button>
        </Link>
        <Link
          to={variant === 'home' ? ROUTES.register : ROUTES.redeem}
          onClick={onNavigate}
          className="w-full"
        >
          <button
            type="button"
            className={cn(
              'flex h-11 w-full items-center justify-center rounded-xl border-2 border-ink-900 text-sm font-bold shadow-[2px_2px_0px_#050914] outline-none transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none focus-visible:ring-2 focus-visible:ring-brand-blue',
              variant === 'home'
                ? 'bg-brand-blue text-ink-900 hover:bg-brand-hover'
                : 'bg-note-yellow text-ink-900 hover:bg-note-yellow/90',
            )}
          >
            {variant === 'home' ? 'Daftar' : 'Tukar Kode'}
          </button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2.5">
      <Link to={ROUTES.login} onClick={onNavigate}>
        <button
          type="button"
          className="inline-flex h-9 items-center justify-center rounded-xl border-2 border-ink-900 bg-paper-white px-4 text-sm font-bold text-ink-900 shadow-[2px_2px_0px_#050914] outline-none transition-all hover:-translate-y-0.5 hover:bg-paper-panel hover:shadow-[2px_3px_0px_#050914] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none focus-visible:ring-2 focus-visible:ring-brand-blue"
        >
          Masuk
        </button>
      </Link>
      <Link to={variant === 'home' ? ROUTES.register : ROUTES.redeem} onClick={onNavigate}>
        <button
          type="button"
          className={cn(
            'inline-flex h-9 items-center justify-center rounded-xl border-2 border-ink-900 px-4.5 text-sm font-bold shadow-[2px_2px_0px_#050914] outline-none transition-all hover:-translate-y-0.5 hover:shadow-[2px_3px_0px_#050914] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none focus-visible:ring-2 focus-visible:ring-brand-blue',
            variant === 'home'
              ? 'bg-brand-blue text-ink-900 hover:bg-brand-hover'
              : 'bg-note-yellow text-ink-900 hover:bg-note-yellow/90',
          )}
        >
          {variant === 'home' ? 'Daftar' : 'Tukar Kode'}
        </button>
      </Link>
    </div>
  )
}

export default function Navbar({ auth, authActionsVariant = 'default' }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navContainerRef = useRef<HTMLDivElement | null>(null)
  const [initialPos] = useState(() => prevGliderPos)
  const [target, setTarget] = useState<{ left: number; width: number } | null>(null)
  const reduceMotion = useReducedMotion()
  const { pathname, hash } = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, userName, userRole, userAvatar, onSignOut } = auth
  const accountNavContext = getAccountMenuNavContext(pathname)
  const accountNavLinks = getAccountMenuNavLinks(accountNavContext, dashboardPath[userRole])
  const showAccountSettings = shouldShowAccountSettingsLink(accountNavContext)

  const isActive = (href: string): boolean => {
    const cleanHref = href.split('#')[0] || '/'
    if (cleanHref === '/') return pathname === '/'
    return pathname === cleanHref || pathname.startsWith(`${cleanHref}/`)
  }

  useLayoutEffect(() => {
    const container = navContainerRef.current
    if (!container) return

    const updateCoords = () => {
      const activeEl = container.querySelector<HTMLElement>('[data-active="true"]')
      if (activeEl) {
        const containerRect = container.getBoundingClientRect()
        const activeRect = activeEl.getBoundingClientRect()
        const left = activeRect.left - containerRect.left
        const width = activeRect.width
        const next = { left, width }
        setTarget(next)
        prevGliderPos = next
      } else {
        setTarget(null)
        prevGliderPos = null
      }
    }

    updateCoords()

    const ro = new ResizeObserver(updateCoords)
    ro.observe(container)
    return () => ro.disconnect()
  }, [pathname])

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

  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname, hash])

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
    <nav className="fixed top-0 left-0 z-50 w-full border-b-2 border-ink-900 bg-paper-white/95 text-ink-900 shadow-[0_2px_0_rgba(5,9,20,0.06)] backdrop-blur-md">
      <div className="container mx-auto flex h-16 w-full items-center justify-between px-4 sm:px-6 md:px-8 lg:px-12">
        {/* Brand Logo Tactile */}
        <div className="flex shrink-0 items-center">
          <Link
            to="/"
            className="group flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
          >
            <span className="flex size-8 items-center justify-center rounded-[6px] border-2 border-ink-900 bg-note-yellow font-mono text-xs font-black tracking-tight text-ink-900 shadow-[2px_2px_0px_#050914] transition-transform duration-200 group-hover:rotate-6 -rotate-2">
              DU
            </span>
            <span className="font-display text-lg font-bold tracking-tight text-ink-900 sm:text-xl">
              Doscom <span className="font-extrabold text-brand-blue">University</span>
            </span>
          </Link>
        </div>

        {/* Desktop & Tablet Links (>= md) with Smooth Glider on Route Change */}
        <div
          ref={navContainerRef}
          className="relative hidden items-center gap-1.5 md:flex lg:gap-2"
        >
          {target && (
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 -z-10"
              initial={
                initialPos
                  ? { x: initialPos.left, width: initialPos.width }
                  : false
              }
              animate={{ x: target.left, width: target.width }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : {
                      type: 'spring',
                      stiffness: 350,
                      damping: 30,
                    }
              }
            >
              <div className="size-full rounded-xl border-2 border-ink-900 bg-note-yellow shadow-[2px_2px_0px_#050914] -rotate-1" />
            </motion.div>
          )}

          {navLinks.map((navLink) => {
            const active = isActive(navLink.href)
            return (
              <Link
                key={navLink.href}
                to={navLink.href}
                data-active={active}
                className={cn(
                  'relative inline-flex h-9 items-center justify-center rounded-xl px-3.5 text-xs font-extrabold uppercase tracking-wider select-none outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-blue lg:text-sm',
                  active
                    ? 'text-ink-900'
                    : 'text-ink-800 hover:text-ink-900 hover:bg-paper-panel/60',
                )}
              >
                <span className="relative z-10">{navLink.label}</span>
              </Link>
            )
          })}
        </div>

        {/* Right Section: Desktop Auth Actions or Mobile Menu Trigger */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="hidden items-center md:flex">
            {isAuthenticated ? (
              <div className="group relative ml-2 cursor-pointer py-2 pl-2">
                <div
                  tabIndex={0}
                  className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-ink-900/15 bg-paper-panel/60 px-3 py-1.5 outline-none transition-colors hover:border-ink-900/40 focus-visible:ring-2 focus-visible:ring-brand-blue"
                  aria-haspopup="menu"
                >
                  <span className="max-w-[8.5rem] min-w-0 text-right sm:max-w-[10rem]">
                    <span className="block truncate text-xs font-extrabold leading-tight text-ink-900 sm:text-sm">
                      {userName}
                    </span>
                    <span className="block truncate font-mono text-[10px] font-bold uppercase tracking-wider text-ink-500">
                      {navbarUserRoleLabel[userRole]}
                    </span>
                  </span>
                  <Avatar className="size-8 shrink-0 border-2 border-ink-900 shadow-xs">
                    {userAvatar ? <AvatarImage src={userAvatar} alt={userName} /> : null}
                    <AvatarFallback className="bg-note-yellow text-xs font-bold text-ink-900">
                      {userInitials(userName)}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div
                  role="menu"
                  className="pointer-events-none invisible absolute right-0 top-full z-50 w-64 pt-2 transition-all group-hover:pointer-events-auto group-hover:visible group-focus-within:pointer-events-auto group-focus-within:visible"
                >
                  <div className="rounded-xl border-2 border-ink-900 bg-paper-white p-2 text-ink-900 shadow-[0_12px_30px_rgba(5,9,20,0.18)] opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
                    <div className="px-3 py-2.5">
                      <p className="text-sm font-extrabold text-ink-900">{greetingForUser(userName)}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-ink-500">
                        Senang bertemu lagi di Doscom University.
                      </p>
                    </div>
                    <div className="my-1 h-px bg-ink-900/10" />
                    {accountNavLinks.map((item) => {
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.to}
                          to={item.to}
                          role="menuitem"
                          className="flex min-h-9 items-center gap-2 rounded-lg px-3 text-xs font-bold text-ink-900 outline-none transition hover:bg-paper-panel hover:text-brand-ink focus-visible:ring-2 focus-visible:ring-brand-blue sm:text-sm"
                        >
                          <Icon className="size-4 opacity-70" aria-hidden />
                          {item.label}
                        </Link>
                      )
                    })}
                    {showAccountSettings && (
                      <Link
                        to={ROUTES.profile}
                        role="menuitem"
                        className="flex min-h-9 items-center gap-2 rounded-lg px-3 text-xs font-bold text-ink-900 outline-none transition hover:bg-paper-panel hover:text-brand-ink focus-visible:ring-2 focus-visible:ring-brand-blue sm:text-sm"
                      >
                        <Settings className="size-4 opacity-70" aria-hidden />
                        Pengaturan
                      </Link>
                    )}
                    <button
                      type="button"
                      className="flex min-h-9 w-full items-center gap-2 rounded-lg px-3 text-left text-xs font-bold text-destructive outline-none transition hover:bg-destructive/10 focus-visible:ring-2 focus-visible:ring-destructive/30 sm:text-sm"
                      onClick={handleLogout}
                    >
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

          {/* Hamburger Button for Mobile & Small Screen (< md) */}
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-xl border-2 border-ink-900 bg-paper-white text-ink-900 shadow-[2px_2px_0px_#050914] outline-none transition-all hover:bg-note-yellow active:translate-y-[1px] active:shadow-none focus-visible:ring-2 focus-visible:ring-brand-blue md:hidden"
            aria-label={isMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            {isMenuOpen ? <X className="size-5 stroke-[2.5]" /> : <Menu className="size-5 stroke-[2.5]" />}
          </button>
        </div>
      </div>

      {/* Backdrop Overlay for Mobile / Drawer */}
      {isMenuOpen && (
        <div
          aria-hidden="true"
          onClick={closeMenu}
          className="fixed inset-0 top-16 z-40 bg-ink-900/40 backdrop-blur-xs transition-opacity duration-200 md:hidden"
        />
      )}

      {/* Mobile & Small Screen Menu Drawer */}
      <div
        id="mobile-menu"
        inert={!isMenuOpen}
        className={cn(
          'fixed inset-x-0 top-16 z-50 max-h-[calc(100dvh-4rem)] overflow-y-auto border-b-3 border-ink-900 bg-paper-white p-5 shadow-[0_20px_40px_rgba(5,9,20,0.18)] transition-all duration-300 ease-out md:hidden',
          isMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 pointer-events-none opacity-0',
        )}
      >
        <div className="flex flex-col gap-4">
          {isAuthenticated && (
            <div className="flex items-center gap-3 rounded-xl border-2 border-ink-900 bg-paper-panel p-3 shadow-[2px_2px_0px_#050914]">
              <Avatar className="size-11 shrink-0 border-2 border-ink-900 ring-2 ring-ink-900/10">
                {userAvatar ? <AvatarImage src={userAvatar} alt={userName} /> : null}
                <AvatarFallback className="bg-note-yellow text-xs font-bold text-ink-900">
                  {userInitials(userName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-extrabold text-ink-900">{userName}</p>
                <span className="mt-0.5 inline-block rounded-sm border border-ink-900/30 bg-note-mint px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-ink-900">
                  {navbarUserRoleLabel[userRole]}
                </span>
              </div>
            </div>
          )}

          {/* Navigasi Links Card List */}
          <div className="flex flex-col gap-2">
            <span className="px-1 font-mono text-[11px] font-bold uppercase tracking-widest text-ink-500">
              Menu Navigasi
            </span>
            {navLinks.map((navLink) => {
              const active = isActive(navLink.href)
              return (
                <Link
                  key={navLink.href}
                  to={navLink.href}
                  onClick={closeMenu}
                  className={cn(
                    'relative flex items-center justify-between rounded-xl px-4 py-3 text-sm font-extrabold uppercase tracking-wider outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-blue',
                    active
                      ? 'text-ink-900'
                      : 'border border-ink-900/15 bg-paper-panel/40 text-ink-800 hover:border-ink-900 hover:bg-paper-panel hover:text-ink-900',
                  )}
                >
                  {active && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 -z-10 rounded-xl border-2 border-ink-900 bg-note-yellow shadow-[3px_3px_0px_#050914] -rotate-0.5"
                    />
                  )}
                  <span className="relative z-10">{navLink.label}</span>
                  {active && <span className="relative z-10 font-mono text-xs">●</span>}
                </Link>
              )
            })}
          </div>

          {/* Account Links or Guest Auth Buttons */}
          {isAuthenticated ? (
            <div className="flex flex-col gap-1.5 border-t-2 border-dashed border-ink-900/20 pt-4">
              <span className="px-1 font-mono text-[11px] font-bold uppercase tracking-widest text-ink-500">
                Menu Akun
              </span>
              {accountNavLinks.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={closeMenu}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-bold text-ink-800 outline-none transition hover:bg-paper-panel hover:text-brand-ink"
                  >
                    <Icon className="size-4 shrink-0 opacity-75" aria-hidden />
                    {item.label}
                  </Link>
                )
              })}
              {showAccountSettings && (
                <button
                  type="button"
                  onClick={handleSettings}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-bold text-ink-800 outline-none transition hover:bg-paper-panel hover:text-brand-ink"
                >
                  <Settings className="size-4 shrink-0 opacity-75" aria-hidden />
                  Pengaturan
                </button>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-bold text-destructive outline-none transition hover:bg-destructive/10"
              >
                <LogOut className="size-4 shrink-0" />
                Keluar
              </button>
            </div>
          ) : (
            <div className="border-t-2 border-dashed border-ink-900/20 pt-3">
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
